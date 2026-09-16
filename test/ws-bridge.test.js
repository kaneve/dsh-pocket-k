// WS 回落通道测试（宿主侧）：HTTP 桥 ↔ 真 WebSocket 双向搬运、门禁共用、注入开关

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request as httpRequest } from 'node:http';
import { WebSocketServer } from 'ws';

import { createPocketProxy } from '../lib/proxy.mjs';
import { WS_BRIDGE_PATH, WS_FALLBACK_MARK, WS_BRIDGE_UPSTREAM_PATH } from '../lib/ws-bridge.mjs';

const b64 = (s) => Buffer.from(s, 'utf8').toString('base64');

/** 假上游 WS：连上先问好，收到文本帧回显 echo:<text>；记录收到的 Host / Cookie。 */
async function fakeWsUpstream() {
  const seen = [];
  const wss = new WebSocketServer({ port: 0 });
  await new Promise((r) => wss.once('listening', r));
  wss.on('connection', (sock, req) => {
    seen.push({ host: req.headers.host, cookie: req.headers.cookie ?? null, url: req.url });
    sock.send('hello-from-server');
    sock.on('message', (d) => sock.send('echo:' + d.toString()));
  });
  return { wss, port: wss.address().port, seen, close: () => new Promise((r) => wss.close(r)) };
}

/** 假上游 HTTP：返回一段 HTML（验证注入）。 */
async function fakeHtmlUpstream() {
  const server = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<html><head><title>t</title></head><body>dsh</body></html>');
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { server, port: server.address().port, close: () => new Promise((r) => server.close(r)) };
}

/** 发起请求并拿到响应对象（body 由调用方消费，SSE 长连接不会挂住）。 */
function open(port, path, opts = {}) {
  return new Promise((resolve, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port, path, method: opts.method ?? 'GET', headers: opts.headers ?? {} }, (res) => resolve({ status: res.statusCode, headers: res.headers, res }));
    req.on('error', reject);
    if (opts.body !== undefined) req.write(opts.body);
    req.end();
  });
}

/** 读完整个 body（普通请求）。 */
async function fetchText(port, path, opts) {
  const r = await open(port, path, opts);
  let text = '';
  r.res.setEncoding('utf8');
  for await (const c of r.res) text += c;
  return { status: r.status, headers: r.headers, body: text };
}

/** 流式读取（SSE）：waitFor 等某个片段出现。 */
function stream(res) {
  let text = '';
  res.setEncoding('utf8');
  res.on('data', (c) => { text += c; });
  return {
    get text() { return text; },
    waitFor(pred, ms = 5000) {
      return new Promise((resolve, reject) => {
        const t0 = Date.now();
        const tick = () => {
          if (pred(text)) return resolve(text);
          if (Date.now() - t0 > ms) return reject(new Error('waitFor 超时，已收到: ' + JSON.stringify(text.slice(-240))));
          setTimeout(tick, 20);
        };
        tick();
      });
    },
  };
}

test('WS 回落通道：HTTP 桥把帧投到真 WS 并回传（开流 / 收帧 / 发帧 / 关流）', async () => {
  const up = await fakeWsUpstream();
  const proxy = await createPocketProxy({ port: 0, host: '127.0.0.1', upstream: { host: '127.0.0.1', port: up.port } });
  try {
    const r = await open(proxy.port, WS_BRIDGE_PATH);
    assert.equal(r.status, 200, '桥开流 200');
    assert.match(String(r.headers['content-type']), /text\/event-stream/, 'SSE 内容类型');
    const sid = r.headers['x-pocket-ws-bridge'];
    assert.ok(sid, '响应头带 sid');

    const s = stream(r.res);
    await s.waitFor((t) => t.includes('"k":"open"'));
    await s.waitFor((t) => t.includes(b64('hello-from-server')));

    // 上行：POST 一帧文本 → 上游回显 → SSE 上收到
    const sendRes = await fetchText(proxy.port, `${WS_BRIDGE_PATH}?act=send&sid=${encodeURIComponent(sid)}`, {
      method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: 'ping',
    });
    assert.equal(sendRes.status, 200, '发送 200');
    await s.waitFor((t) => t.includes(b64('echo:ping')));

    // 上游看到的权威已被改写成 loopback（与普通请求同一条路径）
    assert.equal(up.seen[0].host, `127.0.0.1:${up.port}`, '注入前走 loopback 权威');
    assert.equal(up.seen[0].url, WS_BRIDGE_UPSTREAM_PATH, '连的是 /api/remote.mux');

    // 关流：POST close → 上游关闭 → SSE 收到关闭事件
    const closeRes = await fetchText(proxy.port, `${WS_BRIDGE_PATH}?act=close&sid=${encodeURIComponent(sid)}`, { method: 'POST' });
    assert.equal(closeRes.status, 200, '关闭 200');
    await s.waitFor((t) => t.includes('"k":"c"'));
    r.res.destroy();
  } finally {
    await proxy.close();
    await up.close();
  }
});

test('WS 回落通道：与其它路径共用设备门禁（未认证 401，带会话放行）', async () => {
  const up = await fakeWsUpstream();
  const TOKEN = '12345678';
  const proxy = await createPocketProxy({
    port: 0, host: '127.0.0.1',
    upstream: { host: '127.0.0.1', port: up.port },
    auth: { getToken: () => TOKEN, isProtected: () => true },
  });
  try {
    const r1 = await fetchText(proxy.port, WS_BRIDGE_PATH);
    assert.equal(r1.status, 401, '未认证 401');

    const r2 = await open(proxy.port, WS_BRIDGE_PATH, { headers: { Cookie: 'dsh_pocket_token=' + TOKEN } });
    assert.equal(r2.status, 200, '带会话放行');
    // 会话 cookie 必须透到上游 WS（但握手头不能透，否则 undici 会拒绝连接）
    await new Promise((r) => setTimeout(r, 150));
    assert.match(String(up.seen[0]?.cookie ?? ''), /dsh_pocket_token=12345678/, '上游收到设备 cookie');
    r2.res.destroy();
  } finally {
    await proxy.close();
    await up.close();
  }
});

test('WS 回落脚本注入：默认注入；wsFallback:false 或 injectHtml 为空时不注入', async () => {
  const up = await fakeHtmlUpstream();
  const mk = (opts) => createPocketProxy({ port: 0, host: '127.0.0.1', upstream: { host: '127.0.0.1', port: up.port }, ...opts });
  const p1 = await mk({});
  const p2 = await mk({ wsFallback: false });
  const p3 = await mk({ injectHtml: '' });
  try {
    const r1 = await fetchText(p1.port, '/');
    assert.ok(r1.body.includes('data-dsh-pocket-k-polyfill="1"'), 'polyfill 注入');
    assert.ok(r1.body.includes(WS_FALLBACK_MARK), '回落脚本注入');

    const r2 = await fetchText(p2.port, '/');
    assert.ok(r2.body.includes('data-dsh-pocket-k-polyfill="1"'), 'wsFallback:false 仍注入 polyfill');
    assert.ok(!r2.body.includes(WS_FALLBACK_MARK), 'wsFallback:false 不注入回落脚本');

    const r3 = await fetchText(p3.port, '/');
    assert.ok(!r3.body.includes('data-dsh-pocket-k-polyfill="1"'), 'injectHtml 为空不注入 polyfill');
    assert.ok(!r3.body.includes(WS_FALLBACK_MARK), 'injectHtml 为空不注入回落脚本');
  } finally {
    await p1.close(); await p2.close(); await p3.close();
    await up.close();
  }
});
