// 上游最新 release 检查（注入 fake fetch，不触网）

import { test } from 'node:test';
import assert from 'node:assert/strict';

import { fetchLatestUpstreamVersion } from '../lib/upstream.mjs';

function fakeFetch({ ok = true, body = null, status = 200 } = {}) {
  return async () => ({
    ok,
    status,
    async json() {
      if (body) return body;
      throw new Error('no body');
    },
  });
}

test('fetchLatestUpstreamVersion：正常返回 tag_name', async () => {
  const v = await fetchLatestUpstreamVersion({
    fetchImpl: fakeFetch({ body: { tag_name: 'v1.14.0' } }),
  });
  assert.equal(v, 'v1.14.0');
});

test('fetchLatestUpstreamVersion：无 v 前缀也接受', async () => {
  const v = await fetchLatestUpstreamVersion({
    fetchImpl: fakeFetch({ body: { tag_name: '1.14.0' } }),
  });
  assert.equal(v, '1.14.0');
});

test('fetchLatestUpstreamVersion：非版本 tag / HTTP 失败 / 网络异常都返回 null', async () => {
  assert.equal(await fetchLatestUpstreamVersion({ fetchImpl: fakeFetch({ body: { tag_name: 'random-release' } }) }), null);
  assert.equal(await fetchLatestUpstreamVersion({ fetchImpl: fakeFetch({ ok: false, status: 403, body: {} }) }), null);
  assert.equal(await fetchLatestUpstreamVersion({ fetchImpl: async () => { throw new Error('net'); } }), null);
});