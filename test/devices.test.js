// dsh-pocket-k 设备会话注册表 + 代理逐台撤销测试（t13）

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer, request as httpRequest } from 'node:http';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

import { createPocketProxy } from '../lib/proxy.mjs';
import { createDeviceRegistry, tokenIdOf, parseDeviceName } from '../lib/devices.mjs';
import { installPocketRpc } from '../lib/web-rpc.js';
import { POCKET_ENDPOINTS } from '../client/api.js';
import { fakeCtxConnection } from './helpers/fake-rpc-ctx.mjs';

async function tempHome() {
  return mkdtemp(join(tmpdir(), 'dsh-pocket-k-devices-'));
}

test('parseDeviceName：轻量平台解析，不返回完整 UA', () => {
  assert.equal(parseDeviceName('Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15'), 'iPhone');
  assert.equal(parseDeviceName('Mozilla/5.0 (Linux; Android 14; Pixel 8 Build/AP2A.240805.005)'), 'Android · Pixel 8');
  assert.equal(parseDeviceName('Mozilla/5.0 (Linux; Android 13; SM-S918B Build/TP1A.220624.014)'), 'Android · SM-S918B');
  assert.equal(parseDeviceName('Mozilla/5.0 (Linux; Android 10; K)'), 'Android');
  assert.equal(parseDeviceName('Mozilla/5.0 (Windows NT 10.0; Win64; x64)'), 'Windows');
  assert.equal(parseDeviceName('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'), 'macOS');
  assert.equal(parseDeviceName('Mozilla/5.0 (X11; Linux x86_64)'), 'Linux');
  assert.equal(parseDeviceName('unknown-agent'), 'Device');
});

test('devices registry：铸造/校验/列出/撤销/持久化', async () => {
  const home = await tempHome();
  const reg = createDeviceRegistry({ home, flushMs: 60_000 });
  try {
    const ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148';
    const issued = reg.issue('abc.trycloudflare.com', ua);
    assert.match(issued.token, /^[A-Za-z0-9_-]{43}$/, 'token 是 32 字节 base64url');
    assert.equal(tokenIdOf(issued.token), issued.id, 'id 是 token 摘要');

    assert.equal(reg.check('abc.trycloudflare.com', issued.token), true);
    assert.equal(reg.check('other.example', issued.token), false, 'host 隔离');
    assert.equal(reg.check('abc.trycloudflare.com', 'not-a-real-token'), false);

    reg.wsOpen('abc.trycloudflare.com', issued.id); // 模拟远程页面建立 WebSocket
    const list = reg.list('abc.trycloudflare.com');
    assert.equal(list.length, 1);
    assert.equal(list[0].name, 'iPhone', 'UA 只展示轻量平台名');
    assert.equal(list[0].online, true, '有活跃 WS 连接时在线');
    assert.ok(list[0].lastSeenAt >= list[0].createdAt, 'lastSeenAt 不早于 createdAt');

    reg.wsClose('abc.trycloudflare.com', issued.id); // 模拟页面断开
    assert.equal(reg.list('abc.trycloudflare.com')[0].online, false, '断开后立即离线');

    await reg.flush();
    const raw = JSON.parse(await readFile(join(home, 'dsh-pocket-k', 'devices.json'), 'utf8'));
    assert.ok(raw['abc.trycloudflare.com'][issued.id], '文件持久化');
    assert.ok(!('token' in raw['abc.trycloudflare.com'][issued.id]), '原始 token 不落盘');

    // 重新加载后可继续校验（会话不因重启丢）
    const reg2 = createDeviceRegistry({ home, flushMs: 60_000 });
    try {
      assert.equal(reg2.check('abc.trycloudflare.com', issued.token), true, '重启后仍有效');
    } finally {
      await reg2.dispose();
    }

    // 撤销
    assert.equal(reg.revoke(list[0].id), true);
    assert.equal(reg.check('abc.trycloudflare.com', issued.token), false, '撤销后立即失效');
    assert.equal(reg.revoke(list[0].id), false, '重复撤销返回 false');
  } finally {
    await reg.dispose();
    await rm(home, { recursive: true, force: true });
  }
});

test('devices registry：每 host 上限与全局上限按 LRU 逐出', async () => {
  const home = await tempHome();
  const reg = createDeviceRegistry({ home, maxPerHost: 2, maxDevices: 3, flushMs: 60_000 });
  try {
    const a1 = reg.issue('host-a', 'A');
    const a2 = reg.issue('host-a', 'B');
    const a3 = reg.issue('host-a', 'C'); // host-a 超 2 → a1 被逐出
    assert.equal(reg.check('host-a', a1.token), false, 'host 内 LRU 逐出最旧');
    assert.equal(reg.check('host-a', a2.token), true);
    assert.equal(reg.check('host-a', a3.token), true);

    const b1 = reg.issue('host-b', 'D');
    reg.issue('host-b', 'E'); // 全局 4 > 3 → 逐出全局最旧（a2 或 b1）
    assert.equal(reg.list().length, 3, '全局上限 3');
    assert.equal(reg.list('host-a').length + reg.list('host-b').length, 3);
  } finally {
    await reg.dispose();
    await rm(home, { recursive: true, force: true });
  }
});

test('代理：登录铸设备会话、cookie 放行、撤销后 403、旧 PIN 透明升级、PIN 轮换不影响已发会话', async () => {
  const home = await tempHome();
  const registry = createDeviceRegistry({ home, flushMs: 60_000 });
  let currentPin = '12345678';

  const up = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok');
  });
  await new Promise((r) => up.listen(0, '127.0.0.1', r));

  const proxy = await createPocketProxy({
    port: 0,
    host: '127.0.0.1',
    upstream: { host: '127.0.0.1', port: up.address().port },
    auth: { getToken: () => currentPin, isProtected: () => true, devices: registry },
  });

  const raw = (headers, method = 'GET', body, path = '/') => new Promise((resolve, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port: proxy.port, path, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });

  try {
    // 1) 正确 PIN 登录 → 302 + 设备会话 cookie（不是 PIN），HttpOnly/SameSite=Lax/Max-Age 30d，无 Secure
    const login = await raw(
      { Host: 'abc.trycloudflare.com', 'Content-Type': 'application/x-www-form-urlencoded' },
      'POST',
      'token=12345678',
      '/pocket-login',
    );
    assert.equal(login.status, 302);
    const sc = (login.headers['set-cookie'] || []).join(';');
    assert.ok(sc.includes('dsh_pocket_token='), '种设备会话 cookie');
    assert.ok(!sc.includes('dsh_pocket_token=12345678'), 'cookie 不是 PIN 本身');
    assert.ok(sc.includes('HttpOnly'), 'HttpOnly');
    assert.ok(sc.includes('SameSite=Lax'), 'SameSite=Lax');
    assert.ok(sc.includes('Max-Age=2592000'), '30 天');
    assert.ok(!sc.includes('Secure'), 'LAN http 不加 Secure');
    const token = sc.match(/dsh_pocket_token=([^;]+)/)[1];
    assert.equal(token.length, 43);

    const list = registry.list('abc.trycloudflare.com');
    assert.equal(list.length, 1);
    assert.equal(registry.check('abc.trycloudflare.com', token), true);

    // 2) 带设备 cookie → 放行
    const ok = await raw({ Host: 'abc.trycloudflare.com', Accept: 'application/json', Cookie: `dsh_pocket_token=${token}` }, 'GET', undefined, '/api/hello');
    assert.equal(ok.status, 200);

    // 3) 撤销该设备 → 下一请求 403（API 路径；携带已撤销 token 与「从未登录」区分）
    assert.equal(registry.revoke(list[0].id), true);
    const denied = await raw({ Host: 'abc.trycloudflare.com', Accept: 'application/json', Cookie: `dsh_pocket_token=${token}` }, 'GET', undefined, '/api/hello');
    assert.equal(denied.status, 403);

    // 4) 透明迁移：cookie === 当前 PIN 仍有效，并自动升级为新设备会话
    const migrated = await raw(
      { Host: 'abc.trycloudflare.com', Accept: 'application/json', Cookie: 'dsh_pocket_token=12345678' },
      'GET',
      undefined,
      '/api/hello',
    );
    assert.equal(migrated.status, 200, '旧 PIN cookie 直接放行');
    const mc = (migrated.headers['set-cookie'] || []).join(';');
    const migratedToken = mc.match(/dsh_pocket_token=([^;]+)/)?.[1];
    assert.ok(migratedToken && migratedToken !== '12345678', '返回新设备会话 cookie');
    assert.equal(registry.check('abc.trycloudflare.com', migratedToken), true, '已登记新设备');

    // 5) PIN 轮换：已发会话是独立 bearer token，不受影响
    currentPin = '87654321';
    const still = await raw({ Host: 'abc.trycloudflare.com', Accept: 'application/json', Cookie: `dsh_pocket_token=${migratedToken}` }, 'GET', undefined, '/api/hello');
    assert.equal(still.status, 200, 'PIN 轮换后已发会话仍有效');

    // 6) 用新 PIN 登录 → 新设备；旧会话仍在（独立）
    const login2 = await raw(
      { Host: 'abc.trycloudflare.com', 'Content-Type': 'application/x-www-form-urlencoded' },
      'POST',
      'token=87654321',
      '/pocket-login',
    );
    assert.equal(login2.status, 302);
    assert.equal(registry.list().length, 2, '旧会话 + 新登录设备都保留');
  } finally {
    await proxy.close();
    await registry.dispose();
    await new Promise((r) => up.close(r));
    await rm(home, { recursive: true, force: true });
  }
});

test('RPC：device.list / device.revoke / device.revokeAll（仅 loopback handler）', async () => {
  const home = await tempHome();
  const registry = createDeviceRegistry({ home, flushMs: 60_000 });
  try {
    const s1 = registry.issue('abc.trycloudflare.com', 'iPhone');
    registry.issue('abc.trycloudflare.com', 'Android');
    const s2 = registry.issue('lan.local', 'Windows');

    const ctx = fakeCtxConnection();
    const dispose = installPocketRpc(ctx, { devices: registry, service: { status: async () => ({ dshPort: 3080 }) } });

    const listAll = await ctx.handler(POCKET_ENDPOINTS.deviceList, {});
    assert.equal(listAll.ok, true);
    assert.equal(listAll.value.length, 3, '不带 host 列出全部设备');
    assert.ok(listAll.value.every((d) => ['id', 'name', 'online', 'createdAt', 'lastSeenAt'].every((k) => k in d)), '字段完整');

    const listHost = await ctx.handler(POCKET_ENDPOINTS.deviceList, { host: 'abc.trycloudflare.com' });
    assert.equal(listHost.ok, true);
    assert.equal(listHost.value.length, 2);
    assert.deepEqual(new Set(listHost.value.map((d) => d.name)), new Set(['iPhone', 'Android']), '列出该 host 全部设备');

    const revoke = await ctx.handler(POCKET_ENDPOINTS.deviceRevoke, { id: s1.id });
    assert.equal(revoke.ok, true);
    assert.equal(revoke.value.revoked, true);
    assert.equal(registry.check('abc.trycloudflare.com', s1.token), false);

    const revokeAll = await ctx.handler(POCKET_ENDPOINTS.deviceRevokeAll, { host: 'abc.trycloudflare.com' });
    assert.equal(revokeAll.ok, true);
    assert.equal(revokeAll.value.revoked, 1);
    assert.equal(registry.list('abc.trycloudflare.com').length, 0);
    assert.equal(registry.check('lan.local', s2.token), true, '其他 host 不受影响');

    dispose();
  } finally {
    await registry.dispose();
    await rm(home, { recursive: true, force: true });
  }
});
test('devices registry：50 台/host 上限 LRU；30 天无活动 host GC', async () => {
  const home = await tempHome();
  const ttlMs = 200;
  try {
    // 先写一个「lastSeenAt 很旧但 createdAt 很新」的 host，专测 host 整体 GC
    const devicesFile = join(home, 'dsh-pocket-k', 'devices.json');
    mkdirSync(join(home, 'dsh-pocket-k'), { recursive: true });
    const now = Date.now();
    writeFileSync(devicesFile, JSON.stringify({
      'old-host': {
        staleId: { id: 'staleId', name: 'Old', ua: '', createdAt: now, lastSeenAt: now - ttlMs * 2 },
      },
      'fresh-host': {
        freshId: { id: 'freshId', name: 'Fresh', ua: '', createdAt: now, lastSeenAt: now },
      },
    }), 'utf8');

    const reg = createDeviceRegistry({ home, maxDevices: 1000, maxPerHost: 50, ttlMs, flushMs: 60_000 });
    try {
      // 50 台/host 上限：第 51 台挤掉最旧
      const tokens = [];
      for (let i = 0; i < 50; i++) tokens.push(reg.issue('host-a', `UA-${i}`).token);
      assert.equal(reg.list('host-a').length, 50, '前 50 台都在');
      const overflow = reg.issue('host-a', 'UA-overflow').token;
      assert.equal(reg.list('host-a').length, 50, '超限后仍为 50');
      assert.equal(reg.check('host-a', tokens[0]), false, '最旧设备被 LRU 逐出');
      assert.equal(reg.check('host-a', overflow), true, '新设备保留');

      // 触发 runGc：old-host 整体移除，fresh-host 保留
      reg.issue('new-host', 'New');
      assert.equal(reg.list('old-host').length, 0, '超过 30 天（测试用 200ms）无活动 host 被 GC');
      assert.equal(reg.list('fresh-host').length, 1, '有活动 host 保留');
      assert.equal(reg.list('new-host').length, 1);
    } finally {
      await reg.dispose();
    }
  } finally {
    await rm(home, { recursive: true, force: true });
  }
});

test('固定域名围栏：两次重建 proxy 后 PIN 不变、设备 cookie 仍有效', async () => {
  const home = await tempHome();
  const prev = process.env.DSH_HOME;
  process.env.DSH_HOME = home;
  const { getAccessToken } = await import('../lib/index.js');
  const up = createServer((req, res) => {
    res.writeHead(200, { 'content-type': 'text/plain' });
    res.end('ok');
  });
  const raw = (port, headers, method = 'GET', body, path = '/') => new Promise((resolve, reject) => {
    const req = httpRequest({ host: '127.0.0.1', port, path, method, headers }, (res) => {
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });

  try {
    await new Promise((r) => up.listen(0, '127.0.0.1', r));
    const pinBefore = getAccessToken();
    const reg1 = createDeviceRegistry({ home, flushMs: 60_000 });
    const proxy1 = await createPocketProxy({
      port: 0,
      host: '127.0.0.1',
      upstream: { host: '127.0.0.1', port: up.address().port },
      auth: { getToken: getAccessToken, isProtected: () => true, devices: reg1 },
    });

    const login = await raw(
      proxy1.port,
      { Host: 'fixed.example.com', 'Content-Type': 'application/x-www-form-urlencoded' },
      'POST',
      `token=${pinBefore}`,
      '/pocket-login',
    );
    assert.equal(login.status, 302, '登录成功');
    const sc = (login.headers['set-cookie'] || []).join(';');
    const token = sc.match(/dsh_pocket_token=([^;]+)/)?.[1];
    assert.ok(token && token.length === 43, '已铸造设备会话 token');

    await proxy1.close();
    await reg1.dispose(); // 落盘，模拟进程退出

    // 第二次「重启」：新 registry + 新 proxy，PIN 不变、旧 cookie 仍有效
    assert.equal(getAccessToken(), pinBefore, '固定域名 PIN 存储键稳定（重启不变）');
    const reg2 = createDeviceRegistry({ home, flushMs: 60_000 });
    const proxy2 = await createPocketProxy({
      port: 0,
      host: '127.0.0.1',
      upstream: { host: '127.0.0.1', port: up.address().port },
      auth: { getToken: getAccessToken, isProtected: () => true, devices: reg2 },
    });
    try {
      const ok = await raw(proxy2.port, { Host: 'fixed.example.com', Accept: 'application/json', Cookie: `dsh_pocket_token=${token}` }, 'GET', undefined, '/api/hello');
      assert.equal(ok.status, 200, '重启后设备 cookie 仍有效');
    } finally {
      await proxy2.close();
      await reg2.dispose();
    }
  } finally {
    if (prev === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = prev;
    await new Promise((r) => up.close(r));
    await rm(home, { recursive: true, force: true });
  }
});

test('设备 token 必须 CSPRNG：源码无 Math.random 生成残留', () => {
  const devicesSrc = readFileSync(new URL('../lib/devices.mjs', import.meta.url), 'utf8');
  assert.match(devicesSrc, /randomBytes\(32\)\.toString\('base64url'\)/, 'token 用 crypto.randomBytes(32).toString(base64url)');
  assert.doesNotMatch(devicesSrc, /Math\.random\(\)/, 'devices.mjs 无 Math.random');
  const indexSrc = readFileSync(new URL('../lib/index.js', import.meta.url), 'utf8').replace(/\/\/[^\n]*/g, '');
  assert.doesNotMatch(indexSrc, /Math\.random\(\)/, 'index.js 无实际 Math.random 调用（注释已剥离）');
});

test('RPC：/dsh-pocket-k 通道仅 loopback 可调（非本机来源 403）', async () => {
  const ctx = fakeCtxConnection();
  const dispose = installPocketRpc(ctx, {
    service: { status: async () => ({ dshPort: 3080 }) },
    devices: null,
    getPublicBase: () => null,
    setPublicBase: () => null,
    clearPublicBase: () => null,
  });
  // 旧实现把 loopback 要求写在 connection.rpc.handle 的第三参 { authority: 'loopback' }，
  // 但该参数被官方忽略；现由传输层直接校验来源地址（见 lib/web-rpc.js）。
  const denied = await ctx.handler(POCKET_ENDPOINTS.status, {}, { remoteAddress: '192.168.1.5' });
  assert.equal(denied.status, 403, '非 loopback 来源必须被拒');
  const allowed = await ctx.handler(POCKET_ENDPOINTS.status, {});
  assert.equal(ctx.lastStatus, 200, 'loopback 来源放行');
  assert.equal(allowed.ok, true);
  dispose();
});
