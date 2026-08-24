// 局域网访问密码开关（issue #24）：默认开启、持久化、可关可开
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, existsSync, readFileSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

// 每个测试用独立 DSH_HOME，互不干扰（settings.mjs 每次调用都读磁盘/环境变量）
async function withHome(fn) {
  const home = mkdtempSync(join(tmpdir(), 'dshp-settings-'));
  const prev = process.env.DSH_HOME;
  process.env.DSH_HOME = home;
  try {
    return await fn(home);
  } finally {
    if (prev === undefined) delete process.env.DSH_HOME;
    else process.env.DSH_HOME = prev;
    rmSync(home, { recursive: true, force: true });
  }
}

test('局域网密码开关默认开启（无配置文件）', () => withHome(async () => {
  const { lanAuthEnabled } = await import('../lib/settings.mjs');
  assert.equal(lanAuthEnabled(), true, '默认开启');
}));

test('关闭 → 持久化到 settings.json，重新读取仍为关闭', () => withHome(async () => {
  const { lanAuthEnabled, setLanAuthEnabled, settingsPath } = await import('../lib/settings.mjs');
  assert.equal(setLanAuthEnabled(false), false, '返回关闭状态');
  assert.equal(lanAuthEnabled(), false, '立即生效（每次读磁盘）');
  const raw = JSON.parse(readFileSync(settingsPath(), 'utf8'));
  assert.equal(raw.lanAuthEnabled, false, 'settings.json 内容正确');
}));

test('再开 → true；settings.json 权限 0600', () => withHome(async () => {
  const { lanAuthEnabled, setLanAuthEnabled, settingsPath } = await import('../lib/settings.mjs');
  setLanAuthEnabled(false);
  assert.equal(setLanAuthEnabled(true), true, '重新开启');
  assert.equal(lanAuthEnabled(), true, '开启生效');
  assert.ok(existsSync(settingsPath()), '配置文件已创建');
  if (process.platform !== 'win32') {
    assert.equal(statSync(settingsPath()).mode & 0o777, 0o600, '权限 0600');
  }
}));

test('局域网地址覆盖：默认自动，设置/清除持久化，非法 IPv4 拒绝', () => withHome(async () => {
  const { lanIpOverride, setLanIpOverride, settingsPath } = await import('../lib/settings.mjs');
  assert.equal(lanIpOverride(), '', '默认自动');
  assert.equal(setLanIpOverride('100.119.24.44'), '100.119.24.44', '设置成功');
  assert.equal(lanIpOverride(), '100.119.24.44', '立即生效');
  const raw = JSON.parse(readFileSync(settingsPath(), 'utf8'));
  assert.equal(raw.lanIpOverride, '100.119.24.44', 'settings.json 内容正确');
  assert.throws(() => setLanIpOverride('999.1.1.1'), /IPv4/, '非法地址拒绝');
  assert.equal(setLanIpOverride(''), '', '清除覆盖');
  assert.equal(lanIpOverride(), '', '恢复自动');
}));

test('PIN 自定义标记（issue #33）：默认 false，设置/清除持久化，未知类型 false', () => withHome(async () => {
  const { pinCustom, setPinCustom } = await import('../lib/settings.mjs');
  assert.equal(pinCustom('public'), false, '默认未自定义');
  assert.equal(pinCustom('lan'), false, '默认未自定义');
  assert.equal(pinCustom('other'), false, '未知类型 false');
  setPinCustom('public', true);
  assert.equal(pinCustom('public'), true, '持久化生效');
  setPinCustom('public', false);
  assert.equal(pinCustom('public'), false, '可清除');
  assert.equal(pinCustom('lan'), false, '互不影响');
}));

test('setCustomPin / rotateAccessToken（issue #33）：8 位数字自定义 + 自定义后公网不轮换；非法输入抛错', () => withHome(async () => {
  const { setCustomPin, rotateAccessToken, getAccessToken } = await import('../lib/index.js');
  const { pinCustom } = await import('../lib/settings.mjs');
  // 非法输入
  assert.throws(() => setCustomPin('public', '123'), /8 位数字/, '太短拒绝');
  assert.throws(() => setCustomPin('public', 'abcdefgh'), /8 位数字/, '非数字拒绝');
  assert.throws(() => setCustomPin('other', '12345678'), /未知/, '未知类型拒绝');
  // 合法自定义：公网
  assert.equal(setCustomPin('public', '88886666'), '88886666', '公网自定义成功');
  assert.equal(pinCustom('public'), true, '公网标记自定义');
  assert.equal(getAccessToken(), '88886666', '值已写入');
  // 自定义后 rotateAccessToken 不轮换（值保持）
  assert.equal(rotateAccessToken(), '88886666', '自定义后开启公网不换新');
  assert.equal(getAccessToken(), '88886666', '值未被覆盖');
  // 合法自定义：局域网
  assert.equal(setCustomPin('lan', '77775555'), '77775555', '局域网自定义成功');
  assert.equal(pinCustom('lan'), true, '局域网标记自定义');
}));

// ---------- 公网固定地址 publicBaseUrl（named tunnel 入口） ----------
import { writeFileSync as _wfs12, mkdirSync as _mds12 } from 'node:fs';
import { dirname as _dirname12 } from 'node:path';
function writeSettingsRaw(p, obj) {
  _mds12(_dirname12(p), { recursive: true });
  _wfs12(p, JSON.stringify(obj), 'utf8');
}

test('normalizePublicOrigin：合法 https origin 通过；http/路径/尾斜杠/query 拒绝', async () => {
  const { normalizePublicOrigin } = await import('../lib/settings.mjs');
  assert.equal(normalizePublicOrigin('https://dsh.example.com'), 'https://dsh.example.com');
  assert.equal(normalizePublicOrigin('https://dsh.example.com/'), null, '尾斜杠拒绝');
  assert.equal(normalizePublicOrigin('  https://dsh.example.com  '), 'https://dsh.example.com', '首尾空白容忍');
  assert.equal(normalizePublicOrigin('https://dsh.example.com:8443'), 'https://dsh.example.com:8443', '非默认端口保留');
  assert.equal(normalizePublicOrigin('http://dsh.example.com'), null, 'http 强制拒绝');
  assert.equal(normalizePublicOrigin('ftp://dsh.example.com'), null);
  assert.equal(normalizePublicOrigin('dsh.example.com'), null, '无协议拒绝');
  assert.equal(normalizePublicOrigin('https://dsh.example.com/app'), null, '带路径拒绝');
  assert.equal(normalizePublicOrigin('https://dsh.example.com/?x=1'), null, '带 query 拒绝');
  assert.equal(normalizePublicOrigin('https://dsh.example.com/#frag'), null, '带 hash 拒绝');
  assert.equal(normalizePublicOrigin('https://u:p@dsh.example.com'), null, '带用户信息拒绝');
  assert.equal(normalizePublicOrigin(''), null);
  assert.equal(normalizePublicOrigin(null), null);
});

test('publicBaseUrl：未配置 → null；脏数据 → warn 回落 null；set/clear 持久化', () => withHome(async () => {
  const { publicBaseUrl, setPublicBaseUrl, clearPublicBaseUrl, settingsPath } = await import('../lib/settings.mjs');
  const warns = [];
  const origWarn = console.warn;
  console.warn = (...a) => warns.push(a.join(' '));
  try {
    assert.equal(publicBaseUrl(), null, '未配置');
    writeSettingsRaw(settingsPath(), { lanAuthEnabled: true, publicBaseUrl: 'http://bad.example.com/path' });
    assert.equal(publicBaseUrl(), null, '脏数据按未配置处理（畸形值忽略回落）');
    assert.ok(warns.some((w) => w.includes('publicBaseUrl')), '有告警留痕');
    assert.equal(setPublicBaseUrl('https://dsh.example.com'), 'https://dsh.example.com', '合法保存');
    assert.throws(() => setPublicBaseUrl('https://dsh.example.com/'), /https/, '尾斜杠写入拒绝');
    assert.equal(publicBaseUrl(), 'https://dsh.example.com', '拒绝后原值不变');
    assert.equal(JSON.parse(readFileSync(settingsPath(), 'utf8')).publicBaseUrl, 'https://dsh.example.com', '已持久化');
    assert.throws(() => setPublicBaseUrl('http://nope.example.com'), /https/, '非法写入抛错');
    assert.equal(publicBaseUrl(), 'https://dsh.example.com', '抛错后原值不变');
    assert.equal(clearPublicBaseUrl(), null);
    assert.equal(publicBaseUrl(), null);
    assert.equal(JSON.parse(readFileSync(settingsPath(), 'utf8')).publicBaseUrl, undefined, '清除后文件无此键');
    setPublicBaseUrl('https://x.example.com');
    setPublicBaseUrl('');
    assert.equal(publicBaseUrl(), null, '空串设置 = 清除');
  } finally {
    console.warn = origWarn;
  }
}));

test('cfMode：默认 null；set cli/api 持久化；非法值拒绝；clear 清除', () => withHome(async () => {
  const { cfMode, setCfMode, clearCfMode, settingsPath } = await import('../lib/settings.mjs');
  assert.equal(cfMode(), null, '未配置');
  assert.equal(setCfMode('cli'), 'cli');
  assert.equal(cfMode(), 'cli');
  assert.equal(setCfMode('api'), 'api');
  assert.equal(cfMode(), 'api');
  assert.throws(() => setCfMode('foo'), /cli 或 api/, '非法模式拒绝');
  assert.equal(cfMode(), 'api', '拒绝后原值不变');
  assert.equal(clearCfMode(), null);
  assert.equal(cfMode(), null);
  assert.equal(JSON.parse(readFileSync(settingsPath(), 'utf8')).cfMode, undefined, '清除后文件无此键');
}));

test('cfApiToken：默认 null；set 持久化不校验格式；clear 清除；空值清除', () => withHome(async () => {
  const { cfApiToken, setCfApiToken, clearCfApiToken, settingsPath } = await import('../lib/settings.mjs');
  assert.equal(cfApiToken(), null);
  assert.equal(setCfApiToken('sk-abc-123'), true);
  assert.equal(cfApiToken(), 'sk-abc-123');
  assert.equal(JSON.parse(readFileSync(settingsPath(), 'utf8')).cfApiToken, 'sk-abc-123', '已持久化');
  assert.equal(setCfApiToken('  '), false, '空白视为清除');
  assert.equal(cfApiToken(), null);
  setCfApiToken('tok');
  assert.equal(clearCfApiToken(), false);
  assert.equal(cfApiToken(), null);
  assert.equal(JSON.parse(readFileSync(settingsPath(), 'utf8')).cfApiToken, undefined, '清除后文件无此键');
}));
