// 测试助手：假 host ctx —— 把 installPocketRpc 注册的前缀路由包装成直调形式。
//
// 背景：dsh 0.1.5-rc.1 起官方 connection.rpc.handle 对第三方插件不可用，插件改为
// 自己用 ctx.webServer 注册 /dsh-pocket-k 前缀路由（见 lib/web-rpc.js）。此助手让既有
// 测试继续用 handler(endpoint, payload) 直调，同时保留对传输层行为的断言能力
// （lastStatus / route / 非 loopback 拒绝）。

import assert from 'node:assert/strict';

import { POCKET_RPC_CHANNEL } from '../../client/api.js';

/**
 * 构造假 ctx：
 * - `webServer.register` 捕获插件注册的前缀路由（并断言路径契约）；
 * - `handler(endpoint, payload, { remoteAddress })` 按官方 client 的 wire 协议驱动一次
 *   请求，返回业务 result（HTTP 200 时）或 `{ ok:false, error:{code:'transport'}, status }`；
 * - `lastStatus` 供安全栅栏断言使用。
 */
export function fakeCtxConnection() {
  let route = null;
  let lastStatus;

  return {
    webServer: {
      register(r) {
        assert.equal(r.kind, 'prefix');
        assert.equal(r.path, POCKET_RPC_CHANNEL);
        route = r;
        return () => { route = null; };
      },
    },
    get route() { return route; },
    get lastStatus() { return lastStatus; },

    async handler(endpoint, payload, { remoteAddress = '127.0.0.1' } = {}) {
      assert.ok(route !== null, 'installPocketRpc 必须先注册路由');
      const body = JSON.stringify({ type: 'client-request', rpcId: 'rpc-test', method: endpoint, payload });
      const req = {
        method: 'POST',
        url: `${POCKET_RPC_CHANNEL}/${endpoint}`,
        headers: { 'content-type': 'application/json' },
        socket: { remoteAddress },
        async *[Symbol.asyncIterator]() { yield Buffer.from(body, 'utf8'); },
        destroy() {},
      };
      const state = {};
      const res = {
        writeHead: (status) => { state.status = status; },
        end: (raw) => { state.raw = raw; },
        on: () => {},
        get writableEnded() { return state.raw !== undefined; },
      };
      await route.handler(req, res);
      lastStatus = state.status;
      if (state.status !== 200) {
        return { ok: false, error: { code: 'transport', message: `HTTP ${state.status}`, details: { issues: [] } }, status: state.status };
      }
      return JSON.parse(state.raw).result;
    },
  };
}
