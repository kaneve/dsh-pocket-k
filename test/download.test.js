// downloadFile 多线程分块下载测试：本地起一个支持 Range 的服务器，
// 验证分块并发下载 + 合并后字节与源完全一致；以及不支持 Range 时回退单线程。

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtemp, rm, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { downloadFile } from '../lib/tunnel.mjs';

/** 假二进制内容：4MB 可预测字节（> MIN_PARALLEL_SIZE，触发分块）。 */
function makePayload(size) {
  const buf = Buffer.allocUnsafe(size);
  for (let i = 0; i < size; i++) buf[i] = (i * 31 + 7) & 0xff;
  return buf;
}

/** 支持/不支持 Range 的服务器。 */
async function rangeServer(payload, { supportRange }) {
  const server = createServer((req, res) => {
    const range = req.headers.range;
    if (supportRange && range) {
      const m = /bytes=(\d+)-(\d+)/.exec(range);
      const start = Number(m[1]);
      const end = Number(m[2]);
      res.writeHead(206, {
        'content-type': 'application/octet-stream',
        'content-range': `bytes ${start}-${end}/${payload.length}`,
        'content-length': end - start + 1,
        'accept-ranges': 'bytes',
      });
      res.end(payload.subarray(start, end + 1));
    } else {
      res.writeHead(200, {
        'content-type': 'application/octet-stream',
        'content-length': payload.length,
        ...(supportRange ? { 'accept-ranges': 'bytes' } : {}),
      });
      res.end(payload);
    }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { port: server.address().port, server };
}

test('downloadFile：支持 Range 时多线程分块，合并后字节与源一致', async () => {
  const payload = makePayload(4 * 1024 * 1024);
  const { port, server } = await rangeServer(payload, { supportRange: true });
  const dir = await mkdtemp(join(tmpdir(), 'dl-par-'));
  try {
    const dest = join(dir, 'out.bin');
    const len = await downloadFile(`http://127.0.0.1:${port}/cf`, dest, { segments: 8 });
    assert.equal(len, payload.length, '返回总字节数');
    const got = await readFile(dest);
    assert.equal(got.length, payload.length, '合并后长度一致');
    assert.ok(got.equals(payload), '合并后字节完全一致');
  } finally {
    await rm(dir, { recursive: true, force: true });
    await new Promise((r) => server.close(r));
  }
});

test('downloadFile：不支持 Range 时回退单线程，字节一致', async () => {
  const payload = makePayload(3 * 1024 * 1024);
  const { port, server } = await rangeServer(payload, { supportRange: false });
  const dir = await mkdtemp(join(tmpdir(), 'dl-single-'));
  try {
    const dest = join(dir, 'out.bin');
    const len = await downloadFile(`http://127.0.0.1:${port}/cf`, dest, { segments: 8 });
    assert.equal(len, payload.length);
    const got = await readFile(dest);
    assert.ok(got.equals(payload), '单线程回退字节一致');
  } finally {
    await rm(dir, { recursive: true, force: true });
    await new Promise((r) => server.close(r));
  }
});

test('resolveCloudflared：手动放置的资产名文件也能命中缓存（issue #15）', async () => {
  const fsp = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const { resolveCloudflared } = await import('../lib/tunnel.mjs');
  const home = await fsp.mkdtemp(path.join(os.tmpdir(), 'dshp-manual-'));
  const { platform } = await import('node:process');
  const archMap = { x64: 'amd64', arm64: 'arm64' };
  const osName = platform === 'darwin' ? 'darwin' : platform === 'win32' ? 'windows' : 'linux';
  const arch = archMap[process.arch] ?? process.arch;
  const assetName = `cloudflared-${osName}-${arch}${osName === 'windows' ? '.exe' : ''}`;

  // 只放资产名文件（不是 bin 名）→ 应命中，不触发下载
  const binDir = path.join(home, 'dsh-pocket-k', 'bin');
  await fsp.mkdir(binDir, { recursive: true });
  await fsp.writeFile(path.join(binDir, assetName), 'fake-binary');
  let downloading = false;
  const bin = await resolveCloudflared({ home, onPhase: (p) => { if (p === 'downloading') downloading = true; } });
  assert.equal(downloading, false, '未触发下载');
  assert.ok(bin.includes(assetName), '命中资产名文件: ' + bin);
  await fsp.rm(home, { recursive: true, force: true });
});

test('resolveCloudflared：Linux 上丢弃 Homebrew bottle 坏缓存（issue #22）', async (t) => {
  // SEC-1 后下载前会先拉 checksums（真实网络可能每渠道挂 20s）——mock 全部 fetch 立即失败，保持离线确定性
  t.mock.method(globalThis, 'fetch', async () => { throw new Error('offline (mock)'); });
  const fsp = await import('node:fs/promises');
  const os = await import('node:os');
  const path = await import('node:path');
  const { resolveCloudflared } = await import('../lib/tunnel.mjs');
  const home = await fsp.mkdtemp(path.join(os.tmpdir(), 'dshp-homebrew-'));
  const binDir = path.join(home, 'dsh-pocket-k', 'bin');
  await fsp.mkdir(binDir, { recursive: true });
  // 模拟 Linux Homebrew bottle 坏缓存：文件含 @@HOMEBREW_PREFIX@@ 占位符
  await fsp.writeFile(path.join(binDir, 'cloudflared'), '@@HOMEBREW_PREFIX@@/lib/ld.so\x00fake-binary');
  let downloading = false;
  // 在 Linux 上会触发删除 + 重新下载（下载会失败因网络，但我们只验证"不命中坏缓存"）
  try {
    await resolveCloudflared({ home, onPhase: (p) => { if (p === 'downloading') downloading = true; } });
  } catch { /* 下载失败可接受 */ }
  // 坏缓存应已被删除（不再被当成可用二进制）
  const stillThere = await fsp.readFile(path.join(binDir, 'cloudflared'), 'utf8').catch(() => null);
  // 若系统是 Linux 且触发了下载流程 → 文件被删/被覆盖；macOS 上本测试不适用（无 Homebrew 检查）
  if (process.platform === 'linux') {
    assert.ok(stillThere === null || !stillThere.includes('@@HOMEBREW_PREFIX@@'), '坏缓存被丢弃');
  }
  await fsp.rm(home, { recursive: true, force: true });
});

test('隧道 URL 解析（issue #32）：排除 api.trycloudflare.com 保留子域', async () => {
  const { QUICK_TUNNEL_URL_RE } = await import('../lib/tunnel.mjs');
  // 正常隧道 URL 匹配
  assert.match('https://abc123-def.trycloudflare.com', QUICK_TUNNEL_URL_RE);
  // 保留子域 api 不匹配（扫码打开 api 端点会返回 code 10005 Method Not Allowed）
  assert.doesNotMatch('https://api.trycloudflare.com', QUICK_TUNNEL_URL_RE);
  // cloudflared 输出里 api 地址先出现时，第一个匹配必须是隧道 URL
  const output = 'INF registering tunnel at https://api.trycloudflare.com/...\nYour quick tunnel: https://xyz789.trycloudflare.com\n';
  const m = output.match(QUICK_TUNNEL_URL_RE);
  assert.ok(m && m[0] === 'https://xyz789.trycloudflare.com', '不误匹配 api 地址: ' + (m && m[0]));
});

// ==================== SEC-1：cloudflared 下载 sha256 完整性校验（t7） ====================
// 沿用本文件「本地 http fixture」模式，另加全局 fetch mock 把官方/镜像硬编码 URL
// 重写到本地服务器。覆盖三例：
//   1) 工件哈希与官方 checksums.txt 匹配 → 放行；
//   2) 不匹配 → 删除该工件并回退下一源；
//   3) checksums 全渠道不可达 → 第三方镜像一律跳过（fail-closed），官方源无校验放行。

import { mock } from 'node:test';
import { gzipSync } from 'node:zlib';
import { randomBytes, createHash } from 'node:crypto';

import { downloadCloudflared } from '../lib/tunnel.mjs';

/** 最小 ustar 单文件打包 + gzip：POSIX 下载产物是 .tgz，须能被系统 tar -xzf 解开。 */
function tarGzOne(name, data) {
  const header = Buffer.alloc(512);
  header.write(name, 0);
  header.write('0000644\0', 100); // mode
  header.write('0000000\0', 108); // uid
  header.write('0000000\0', 116); // gid
  header.write(data.length.toString(8).padStart(11, '0') + '\0', 124); // size
  header.write('\0'.repeat(12), 136); // mtime
  header.write('        ', 148); // checksum 占位（空格）
  header.write('0', 156); // typeflag: regular file
  header.write('ustar\0', 257);
  header.write('00', 263);
  let sum = 0;
  for (const b of header) sum += b;
  header.write(sum.toString(8).padStart(6, '0') + '\0 ', 148);
  const pad = (512 - (data.length % 512)) % 512;
  return gzipSync(Buffer.concat([header, data, Buffer.alloc(pad), Buffer.alloc(1024)]));
}

/** 按当前平台构造"发布工件"字节与解压后期望内容（随机字节 ⇒ 不可压缩，tgz 也 >1MB 尺寸哨兵）。 */
function makeArtifact() {
  const archMap = { x64: 'amd64', arm64: 'arm64' };
  const osName = process.platform === 'darwin' ? 'darwin' : process.platform === 'win32' ? 'windows' : 'linux';
  const arch = archMap[process.arch] ?? process.arch;
  const asset = osName === 'windows'
    ? `cloudflared-windows-${arch}.exe`
    : `cloudflared-${osName}-${arch}.tgz`;
  const inner = randomBytes(1200 * 1024);
  const payload = osName === 'windows' ? inner : tarGzOne('cloudflared', inner);
  return { asset, payload, extracted: inner };
}

/** SEC-1 fixture：按 tag 提供工件字节（null=模拟该源挂掉），/checksums 提供清单或 500；记录请求路径。 */
async function sec1Server({ serve, checksums }) {
  const hits = [];
  const server = createServer((req, res) => {
    hits.push(req.url);
    if (req.url === '/checksums') {
      if (checksums == null) { res.writeHead(500); res.end('no checksums'); return; }
      res.writeHead(200, { 'content-type': 'text/plain' });
      res.end(checksums);
      return;
    }
    const m = /^[/]artifact[/]([a-z0-9]+)$/.exec(req.url);
    const body = m ? serve[m[1]] : null;
    if (!body) { res.writeHead(500); res.end('source down'); return; }
    res.writeHead(200, { 'content-type': 'application/octet-stream', 'content-length': body.length });
    if (req.method === 'HEAD') { res.end(); return; }
    res.end(body);
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { port: server.address().port, hits, close: () => new Promise((r) => server.close(r)) };
}

/** 全局 fetch mock：官方/镜像 URL → 本地 fixture；checksums 可选模拟全渠道不可达。测试结束自动还原。 */
function mockFetchTo(t, port, { checksumsFail = false } = {}) {
  const real = globalThis.fetch;
  t.mock.method(globalThis, 'fetch', async (url, init) => {
    const u = String(url);
    if (u.includes('checksums.txt')) {
      if (checksumsFail) throw new Error('checksums unreachable (mock)');
      return real(`http://127.0.0.1:${port}/checksums`, init);
    }
    let tag = null;
    if (u.startsWith('https://github.com/')) tag = 'official';
    else if (u.includes('ghproxy.net')) tag = 'm1';
    else if (u.includes('gh.ddlc.top')) tag = 'm2';
    else if (u.includes('gh-proxy.com')) tag = 'm3';
    else throw new Error('unexpected fetch in test: ' + u); // 含 TUNA 目录页（本组用例不涉及）
    return real(`http://127.0.0.1:${port}/artifact/${tag}`, init);
  });
}

test('SEC-1：工件 sha256 与官方 checksums 匹配 → 校验通过放行', async (t) => {
  const { asset, payload, extracted } = makeArtifact();
  const good = createHash('sha256').update(payload).digest('hex');
  const checksums = `${good}  ${asset}\n${'0'.repeat(64)}  cloudflared-other-platform.tgz\n`;
  // 官方源故意挂掉：第一个成功源是镜像 m1 —— 证明「第三方镜像 + 哈希匹配」可放行
  const srv = await sec1Server({ serve: { official: null, m1: payload }, checksums });
  const dir = await mkdtemp(join(tmpdir(), 'sec1-ok-'));
  try {
    mockFetchTo(t, srv.port);
    const out = await downloadCloudflared(join(dir, 'cloudflared-any'));
    assert.ok((await readFile(out)).equals(extracted), '落盘二进制与 fixture 一致');
    assert.ok(srv.hits.includes('/artifact/m1'), '使用了经校验的镜像 m1');
    assert.ok(!srv.hits.includes('/artifact/m2'), '成功后不再尝试后续源');
  } finally {
    await rm(dir, { recursive: true, force: true });
    await srv.close();
  }
});

test('SEC-1：工件 sha256 不匹配 → 删除并回退下一源', async (t) => {
  const { asset, payload, extracted } = makeArtifact();
  const good = createHash('sha256').update(payload).digest('hex');
  const corrupt = randomBytes(payload.length); // 同尺寸但哈希不同的投毒工件
  const checksums = `${good}  ${asset}\n`;
  const srv = await sec1Server({ serve: { official: null, m1: corrupt, m2: payload }, checksums });
  const dir = await mkdtemp(join(tmpdir(), 'sec1-bad-'));
  try {
    mockFetchTo(t, srv.port);
    const out = await downloadCloudflared(join(dir, 'cloudflared-any'));
    assert.ok((await readFile(out)).equals(extracted), '最终产物来自通过校验的 m2');
    const i1 = srv.hits.indexOf('/artifact/m1');
    const i2 = srv.hits.indexOf('/artifact/m2');
    assert.ok(i1 !== -1 && i2 !== -1 && i1 < i2, 'm1 校验失败后按序尝试 m2');
    assert.ok(!srv.hits.includes('/artifact/m3'), 'm2 成功后不再尝试 m3');
  } finally {
    await rm(dir, { recursive: true, force: true });
    await srv.close();
  }
});

test('SEC-1：checksums 全渠道不可达 → 第三方镜像跳过，官方源无校验放行', async (t) => {
  const { payload, extracted } = makeArtifact();
  const srv = await sec1Server({ serve: { official: payload }, checksums: null });
  const dir = await mkdtemp(join(tmpdir(), 'sec1-nock-'));
  try {
    mockFetchTo(t, srv.port, { checksumsFail: true });
    const out = await downloadCloudflared(join(dir, 'cloudflared-any'));
    assert.ok((await readFile(out)).equals(extracted), '官方源放行且产物正确');
    assert.ok(srv.hits.includes('/artifact/official'), '官方源被使用');
    for (const tag of ['m1', 'm2', 'm3']) {
      assert.ok(!srv.hits.includes(`/artifact/${tag}`), `第三方镜像 ${tag} 被跳过（拒绝无校验执行）`);
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
    await srv.close();
  }
});
