// dsh-pocket-k Web RPC 传输层单测
//
// 背景（详见 lib/web-rpc.js 的 installPocketRpc 注释）：dsh 0.1.5-rc.1 起官方
// connection.rpc.handle 对第三方插件不可用（注册路由时读 owner.webServer，而官方
// 已不再静态注入 webServer）。本文件锁定自实现传输层的线协议与安全栅栏行为：
//   POST <channel>/<endpoint>，body { type:'client-request', rpcId, method, payload }
//   → 200 { type:'server-response', rpcId, result: { ok:true, value } | { ok:false, error } }

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createChannelHandler } from '../lib/web-rpc.js';

const CHANNEL = '/dsh-pocket-k';
const envelope = (method, payload = {}, rpcId = 'rpc-1') => ({ type: 'client-request', rpcId, method, payload });

function makeReq({ method = 'POST', url = `${CHANNEL}/pocket.status`, body, remoteAddress = '127.0.0.1', contentType = 'application/json' } = {}) {
  const chunks = body === undefined ? [] : [Buffer.from(typeof body === 'string' ? body : JSON.stringify(body), 'utf8')];
  return {
    method,
    url,
    headers: contentType === undefined ? {} : { 'content-type': contentType },
    socket: { remoteAddress },
    async *[Symbol.asyncIterator]() { for (const chunk of chunks) yield chunk; },
    destroy() {},
  };
}

function makeRes() {
  const state = { status: undefined, headers: undefined, raw: undefined };
  return {
    state,
    writeHead(status, headers) { state.status = status; state.headers = headers; },
    end(raw) { state.raw = raw; },
    on() {},
    get writableEnded() { return state.raw !== undefined; },
  };
}

/** connection 缺省表示 requestRejection 不可用（走 loopback-only 回退）。 */
function makeCtx(requestRejection) {
  return requestRejection === undefined ? {} : { connection: { requestRejection } };
}

test('合法请求 → server-response 信封且 rpcId 透传', async () => {
  const seen = [];
  const handler = createChannelHandler(makeCtx(() => undefined), async (endpoint, payload) => {
    seen.push([endpoint, payload]);
    return { ok: true, value: { pong: true } };
  });
  const res = makeRes();
  await handler(makeReq({ body: envelope('pocket.status', { a: 1 }) }), res);

  assert.equal(res.state.status, 200);
  assert.equal(res.state.headers['content-type'], 'application/json');
  assert.deepEqual(JSON.parse(res.state.raw), {
    type: 'server-response',
    rpcId: 'rpc-1',
    result: { ok: true, value: { pong: true } },
  });
  assert.deepEqual(seen, [['pocket.status', { a: 1 }]]);
});

test('业务失败结果原样透传（ok:false + error）', async () => {
  const failure = { ok: false, error: { code: 'bad-request', message: 'nope', details: { issues: [] } } };
  const handler = createChannelHandler(makeCtx(() => undefined), async () => failure);
  const res = makeRes();
  await handler(makeReq({ body: envelope('pocket.status') }), res);
  assert.deepEqual(JSON.parse(res.state.raw).result, failure);
});

test('非 loopback 来源 → 403，且不进入业务处理器', async () => {
  let called = false;
  const handler = createChannelHandler(makeCtx(() => undefined), async () => { called = true; return { ok: true, value: null }; });
  const res = makeRes();
  await handler(makeReq({ body: envelope('pocket.status'), remoteAddress: '192.168.1.5' }), res);

  assert.equal(res.state.status, 403);
  assert.equal(res.state.raw, 'forbidden');
  assert.equal(called, false);
});

test('官方 requestRejection 裁决被采用（401）', async () => {
  const handler = createChannelHandler(makeCtx(() => 401), async () => ({ ok: true, value: null }));
  const res = makeRes();
  await handler(makeReq({ body: envelope('pocket.status') }), res);
  assert.equal(res.state.status, 401);
  assert.equal(res.state.raw, 'unauthorized');
});

test('method 与 endpoint 不匹配 → 200 + gateway/bad-request 信封', async () => {
  const handler = createChannelHandler(makeCtx(() => undefined), async () => ({ ok: true, value: null }));
  const res = makeRes();
  await handler(makeReq({ body: envelope('pocket.other') }), res);

  assert.equal(res.state.status, 200);
  const parsed = JSON.parse(res.state.raw);
  assert.equal(parsed.type, 'server-response');
  assert.equal(parsed.rpcId, 'rpc-1');
  assert.equal(parsed.result.ok, false);
  assert.equal(parsed.result.error.code, 'gateway/bad-request');
});

test('协议违规：非 POST → 404；错误 content-type → 415；非法 JSON → 400；坏信封 → 400', async () => {
  const handler = createChannelHandler(makeCtx(() => undefined), async () => ({ ok: true, value: null }));

  const badMethod = makeRes();
  await handler(makeReq({ method: 'GET', body: envelope('pocket.status') }), badMethod);
  assert.equal(badMethod.state.status, 404);

  const badType = makeRes();
  await handler(makeReq({ body: envelope('pocket.status'), contentType: 'text/plain' }), badType);
  assert.equal(badType.state.status, 415);

  const badJson = makeRes();
  await handler(makeReq({ body: 'not json' }), badJson);
  assert.equal(badJson.state.status, 400);

  const badEnvelope = makeRes();
  await handler(makeReq({ body: { type: 'client-request', method: 'pocket.status' } }), badEnvelope);
  assert.equal(badEnvelope.state.status, 400);
});

test('通道外的路径 → 404（前缀路由不吞其它路径）', async () => {
  const handler = createChannelHandler(makeCtx(() => undefined), async () => ({ ok: true, value: null }));
  const res = makeRes();
  await handler(makeReq({ url: '/dsh-pocket-k-other/x', body: envelope('pocket.status') }), res);
  assert.equal(res.state.status, 404);
});

test('业务处理器抛错 → 500 且不泄漏为未处理拒绝', async () => {
  const handler = createChannelHandler(makeCtx(() => undefined), async () => { throw new Error('boom'); });
  const res = makeRes();
  await handler(makeReq({ body: envelope('pocket.status') }), res);
  assert.equal(res.state.status, 500);
  assert.match(String(res.state.raw), /boom/);
});
