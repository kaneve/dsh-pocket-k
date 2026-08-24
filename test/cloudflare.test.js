// Cloudflare API 辅助单测（纯函数 + 注入 fake fetch，不触网）

import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  tunnelNameFor,
  relativeDnsName,
  createCloudflareApi,
} from '../lib/cloudflare.mjs';

test('tunnelNameFor：域名清洗为小写连字符，保持稳定', () => {
  assert.equal(tunnelNameFor('dsh.Example.COM'), 'dsh-pocket-dsh-example-com');
  assert.equal(tunnelNameFor('a'.repeat(80) + '.com'), tunnelNameFor('a'.repeat(80) + '.com'));
  assert.ok(tunnelNameFor('a'.repeat(80) + '.com').length <= 63, '超长名截断到 63 字符内');
});

test('relativeDnsName：apex 用 @，子域去掉 zone 前缀', () => {
  assert.equal(relativeDnsName('dsh.dslink.cc', 'dslink.cc'), 'dsh');
  assert.equal(relativeDnsName('dslink.cc', 'dslink.cc'), '@');
  assert.equal(relativeDnsName('a.b.example.com', 'example.com'), 'a.b');
});

function fakeStream(records) {
  const calls = [];
  async function fetchImpl(url, init = {}) {
    calls.push({ url, init });
    const u = new URL(url);
    const path = u.pathname.replace(/^\/client\/v4/, ''); // CF API 基址自带 /client/v4
    const method = init.method ?? 'GET';
    const body = init.body ? JSON.parse(init.body) : undefined;

    if (path === '/zones' && u.searchParams.get('name') === 'dsh.dslink.cc') {
      return jsonResponse({ success: true, result: [{ id: 'zone1', name: 'dsh.dslink.cc', account: { id: 'acc1' } }] });
    }
    if (path === '/zones' && u.searchParams.get('name') === 'dslink.cc') {
      return jsonResponse({ success: true, result: [{ id: 'zone2', name: 'dslink.cc', account: { id: 'acc2' } }] });
    }
    if (path === '/zones' && u.searchParams.get('name') === 'nope.invalid') {
      return jsonResponse({ success: true, result: [] });
    }
    if (path === '/zones') {
      return jsonResponse({ success: true, result: [] }); // 未命中的 Zone 查询：空列表让 findZone 继续向上
    }
    if (path === '/accounts/acc1/cfd_tunnel' && method === 'GET') {
      return jsonResponse({ success: true, result: [{ id: 'tun-exist', name: 'dsh-pocket-fixed' }] });
    }
    if (path === '/accounts/acc1/cfd_tunnel' && method === 'POST') {
      return jsonResponse({ success: true, result: { id: 'tun-new', name: 'dsh-pocket-fixed' } });
    }
    if (path === '/accounts/acc1/cfd_tunnel/tun-exist/token') {
      return jsonResponse({ success: true, result: { token: 'tk-exist' } });
    }
    if (path === '/accounts/acc1/cfd_tunnel/tun-new/token') {
      return jsonResponse({ success: true, result: { token: 'tk-new' } });
    }
    if (path === '/zones/zone2/dns_records' && method === 'GET') {
      return jsonResponse({ success: true, result: [{ id: 'rec1', name: 'dsh.dslink.cc', type: 'CNAME', content: 'tun-exist.cfargotunnel.com' }] });
    }
    if (path === '/zones/zone2/dns_records/rec1' && method === 'PATCH') {
      return jsonResponse({ success: true, result: { id: 'rec1' } });
    }
    if (path === '/zones/zone2/dns_records' && method === 'POST') {
      return jsonResponse({ success: true, result: { id: 'rec-new' } });
    }
    return jsonResponse({ success: false, errors: [{ message: `unexpected ${method} ${path}` }] }, 404);
  }

  function jsonResponse(data, status = 200) {
    return {
      ok: status >= 200 && status < 300,
      status,
      async json() { return data; },
    };
  }

  return { fetchImpl, calls };
}

test('createCloudflareApi.findZone：逐级找 Zone，返回 accountId', async () => {
  const { fetchImpl } = fakeStream();
  const api = createCloudflareApi(fetchImpl);
  const zone = await api.findZone('tok', 'dsh.dslink.cc');
  assert.equal(zone.zoneId, 'zone1');
  assert.equal(zone.zoneName, 'dsh.dslink.cc');
  assert.equal(zone.accountId, 'acc1');

  const parent = await api.findZone('tok', 'deep.dslink.cc');
  assert.equal(parent.zoneId, 'zone2');
  assert.equal(parent.accountId, 'acc2');
});

test('createCloudflareApi.findZone：找不到时抛错', async () => {
  const { fetchImpl } = fakeStream();
  const api = createCloudflareApi(fetchImpl);
  await assert.rejects(() => api.findZone('tok', 'nope.invalid'), /Zone/);
});

test('createCloudflareApi.ensureTunnel：已存在直接取 token，不存在则创建', async () => {
  const { fetchImpl, calls } = fakeStream();
  const api = createCloudflareApi(fetchImpl);
  const existing = await api.ensureTunnel('tok', { accountId: 'acc1', tunnelName: 'dsh-pocket-fixed' });
  assert.deepEqual(existing, { tunnelId: 'tun-exist', connectorToken: 'tk-exist' });
  assert.ok(!calls.some((c) => c.init.method === 'POST' && c.url.includes('/cfd_tunnel')));

  const created = await api.ensureTunnel('tok', { accountId: 'acc1', tunnelName: 'dsh-pocket-new' });
  assert.deepEqual(created, { tunnelId: 'tun-new', connectorToken: 'tk-new' });
  assert.ok(calls.some((c) => c.init.method === 'POST' && c.url.includes('/cfd_tunnel')));
});

test('createCloudflareApi.ensureDns：同目标跳过；不同目标更新；缺失创建', async () => {
  const { fetchImpl, calls } = fakeStream();
  const api = createCloudflareApi(fetchImpl);

  const skip = await api.ensureDns('tok', { zoneId: 'zone2', zoneName: 'dslink.cc', host: 'dsh.dslink.cc', tunnelId: 'tun-exist' });
  assert.equal(skip.updated, false);
  assert.equal(skip.created, false);
  assert.ok(!calls.some((c) => c.init.method === 'PATCH' || c.init.method === 'POST'));

  const update = await api.ensureDns('tok', { zoneId: 'zone2', zoneName: 'dslink.cc', host: 'dsh.dslink.cc', tunnelId: 'tun-new' });
  assert.equal(update.updated, true);
  assert.ok(calls.some((c) => c.init.method === 'PATCH'));

  const create = await api.ensureDns('tok', { zoneId: 'zone2', zoneName: 'dslink.cc', host: 'other.dslink.cc', tunnelId: 'tun-new' });
  assert.equal(create.created, true);
  assert.ok(calls.some((c) => c.init.method === 'POST'));
});