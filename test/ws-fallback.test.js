// 浏览器侧回落 polyfill 行为测试（vm 里跑 WS_FALLBACK_CODE）：
//   · 非 /api/remote.mux 的 WS 直通原生
//   · 原生 WS 打开失败 → 自动改走 HTTP 桥
//   · 文本帧（含中文）收发、关闭、静态常量与 instanceof 兼容

import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { WS_FALLBACK_CODE } from '../lib/ws-bridge.mjs';

const tick = (ms = 25) => new Promise((r) => setTimeout(r, ms));

/** 搭一个受控环境：假原生 WebSocket（默认一构造就 error，模拟被 RST）+ 假 fetch（可控 SSE 流）。 */
function makeEnv({ search = '' } = {}) {
  const calls = { native: [], fetch: [] };
  const sse = { queue: [], waiters: [] };
  const encoder = new TextEncoder();

  function pushSse(text) {
    const w = sse.waiters.shift();
    if (w) w({ value: encoder.encode(text), done: false });
    else sse.queue.push(text);
  }

  class FakeNative {
    constructor(url, protocols) {
      calls.native.push({ url: String(url), protocols });
      this.url = String(url);
      this.readyState = 0;
      this.protocol = '';
      this.__ls = {};
      this.sent = [];
      setTimeout(() => this.__emit('error'), 0); // 打开前就失败：模拟网络 RST
    }
    addEventListener(t, fn) { (this.__ls[t] = this.__ls[t] || []).push(fn); }
    removeEventListener(t, fn) { this.__ls[t] = (this.__ls[t] || []).filter((f) => f !== fn); }
    __emit(t, ev = {}) { for (const fn of (this.__ls[t] || []).slice()) fn({ type: t, target: this, ...ev }); }
    send() {} close() {}
  }

  const fetchFake = async (url, opts = {}) => {
    calls.fetch.push({ url: String(url), opts });
    if (String(url).includes('act=open')) {
      return {
        ok: true,
        status: 200,
        headers: { get: (k) => (String(k).toLowerCase() === 'x-pocket-ws-bridge' ? 'sid-1' : null) },
        body: {
          getReader: () => ({
            read: () => new Promise((resolve) => {
              const v = sse.queue.shift();
              if (v !== undefined) resolve({ value: encoder.encode(v), done: false });
              else sse.waiters.push(resolve);
            }),
          }),
        },
      };
    }
    return { ok: true, status: 200 };
  };

  const sandbox = {
    window: { WebSocket: FakeNative },
    location: { href: 'https://dsh.example/app' + search, search, host: 'dsh.example', hostname: 'dsh.example', protocol: 'https:', origin: 'https://dsh.example' },
    URL,
    atob,
    btoa,
    TextDecoder,
    TextEncoder,
    Blob,
    fetch: fetchFake,
    setTimeout,
    clearTimeout,
  };
  // 回落脚本读的是 window.WebSocket / window.fetch（浏览器里两者都在 window 上）
  sandbox.window.fetch = fetchFake;
  vm.createContext(sandbox);
  vm.runInContext(WS_FALLBACK_CODE, sandbox);
  return { sandbox, calls, pushSse, Wrapped: sandbox.window.WebSocket, Native: FakeNative };
}

test('回落脚本：只接管 /api/remote.mux，其它 WS 原样直通原生实现', async () => {
  const env = makeEnv();
  assert.equal(env.sandbox.window.__dshPocketWsFallback, 1, '已安装标记');

  const other = new env.Wrapped('wss://dsh.example/other');
  assert.ok(other instanceof env.Native, '非 mux 返回原生实例');
  assert.equal(env.calls.native.length, 1);
  assert.equal(env.calls.fetch.length, 0, '没有走桥');

  const crossOrigin = new env.Wrapped('wss://other.example/api/remote.mux');
  assert.ok(crossOrigin instanceof env.Native, '跨 origin 也走原生');
  assert.equal(env.calls.fetch.length, 0);
});

test('回落脚本：原生打开失败 → 改走 HTTP 桥，收发帧与关闭都正常', async () => {
  const env = makeEnv();
  const sock = new env.Wrapped('wss://dsh.example/api/remote.mux');
  const events = [];
  sock.addEventListener('open', () => events.push('open'));
  sock.addEventListener('message', (e) => events.push('msg:' + e.data));
  sock.addEventListener('close', (e) => events.push('close:' + e.code));

  await tick(40); // 原生 error → fetch(act=open) 落地
  assert.ok(env.calls.fetch.some((c) => c.url.includes('act=open')), '发起了 act=open');
  assert.equal(sock.readyState, 0, '桥已开流但上游未就绪 → 仍 CONNECTING（不提前派发 open）');

  // 服务端事件：上游就绪(open) + 一帧中文文本 + 一帧二进制
  env.pushSse('data: {"k":"open"}\n\n');
  await tick(20);
  assert.equal(sock.readyState, 1, '上游就绪 → OPEN');
  env.pushSse('data: ' + JSON.stringify({ k: 'm', b: Buffer.from('你好，世界', 'utf8').toString('base64'), bin: 0 }) + '\n\n');
  env.pushSse('data: ' + JSON.stringify({ k: 'm', b: Buffer.from([1, 2, 3]).toString('base64'), bin: 1 }) + '\n\n');
  await tick(40);

  assert.deepEqual(events.slice(0, 2), ['open', 'msg:你好，世界'], 'open + 中文文本帧');

  // 上行：文本帧 → POST act=send（content-type 文本）
  sock.send('ping');
  await tick(40);
  const sendCall = env.calls.fetch.find((c) => c.url.includes('act=send'));
  assert.ok(sendCall, 'POST 了 act=send');
  assert.equal(sendCall.opts.body, 'ping');
  assert.match(String(sendCall.opts.headers['content-type']), /^text\/plain/);

  // 关闭 → POST act=close + close 事件
  sock.close();
  await tick(30);
  assert.ok(env.calls.fetch.some((c) => c.url.includes('act=close')), 'POST 了 act=close');
  assert.equal(sock.readyState, 3, 'CLOSED');
  assert.ok(events.some((e) => e.startsWith('close:')), '派发了 close');
});

test('回落脚本：?__pocket_ws=bridge 强制走桥（诊断开关，不做原生尝试）', async () => {
  const env = makeEnv({ search: '?__pocket_ws=bridge' });
  const sock = new env.Wrapped('wss://dsh.example/api/remote.mux');
  await tick(30);
  assert.equal(env.calls.native.length, 0, '完全没尝试原生 WS');
  assert.ok(env.calls.fetch.some((c) => c.url.includes('act=open')), '直接开桥');
  env.pushSse('data: {"k":"open"}\n\n');
  await tick(20);
  assert.equal(sock.readyState, 1, '上游就绪后 OPEN');
});

test('回落脚本：保留 WebSocket 静态常量与 instanceof 兼容', () => {
  const env = makeEnv();
  assert.equal(env.Wrapped.CONNECTING, 0);
  assert.equal(env.Wrapped.OPEN, 1);
  assert.equal(env.Wrapped.CLOSING, 2);
  assert.equal(env.Wrapped.CLOSED, 3);
  const sock = new env.Wrapped('wss://dsh.example/api/remote.mux');
  // mux 连接返回包装对象：用 Symbol.hasInstance 兜底 instanceof（DSH 只用 readyState + WebSocket.OPEN）
  assert.ok(sock instanceof env.Wrapped, 'instanceof 包装后的 WebSocket');
  assert.equal(sock.readyState, 0, '初始 CONNECTING');
  assert.equal(typeof sock.send, 'function');
  assert.equal(typeof sock.close, 'function');
  assert.equal(typeof sock.addEventListener, 'function');
  // 非 mux 返回真原生实例（完全透明）
  assert.ok(new env.Wrapped('wss://dsh.example/other') instanceof env.Native);
});
