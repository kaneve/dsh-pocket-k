// dsh-pocket-k 设置持久化（$DSH_HOME/dsh-pocket-k/settings.json）
//
// 当前项：
//   - lanAuthEnabled    局域网访问密码开关（issue #24），默认开启
//   - publicPinCustom   公网密码是否用户自定义（issue #33），自定义后不自动轮换
//   - lanPinCustom      局域网密码是否用户自定义（issue #33）
//   - publicBaseUrl     公网固定地址（named tunnel 入口；跨重启的公网身份）
//   - cfMode            named tunnel 自动配置方式：'cli'（cloudflared login 证书）
//                       | 'api'（Cloudflare API Token）| null（未选/默认）
//   - cfApiToken        Cloudflare API Token（仅 api 模式；设置页不回显明文）
// 默认**开启**（安全优先）：局域网扫码也要输 8 位密码；
// 用户可关闭——关闭后局域网扫码直连（仅同一网络内的设备能访问），公网不受影响（永远要密码）。

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';
import { isValidIpv4 } from './ip.mjs';

const settingsRel = join('dsh-pocket-k', 'settings.json');
export function settingsPath() {
  return join(process.env.DSH_HOME ?? join(homedir(), '.dsh'), settingsRel);
}

function readSettings() {
  try {
    const raw = JSON.parse(readFileSync(settingsPath(), 'utf8'));
    return raw && typeof raw === 'object' ? raw : {};
  } catch { /* 无文件/损坏 → 默认 */ }
  return {};
}

function writeSettings(s) {
  try {
    mkdirSync(dirname(settingsPath()), { recursive: true });
    writeFileSync(settingsPath(), JSON.stringify(s, null, 2), { mode: 0o600 });
  } catch { /* 忽略 */ }
  return s;
}

/** 局域网访问密码开关：默认开启（文件缺失/损坏都视为开启）。 */
export function lanAuthEnabled() {
  return readSettings().lanAuthEnabled !== false;
}

/** 设置局域网访问密码开关，返回新状态（持久化）。 */
export function setLanAuthEnabled(on) {
  const s = readSettings();
  s.lanAuthEnabled = !!on;
  writeSettings(s);
  return s.lanAuthEnabled;
}

/** 局域网访问总开关：默认开启；关闭后代理只绑 127.0.0.1（局域网不可达，公网隧道不受影响）。 */
export function lanEnabled() {
  return readSettings().lanEnabled !== false;
}

/** 设置局域网访问总开关，返回新状态（持久化）。 */
export function setLanEnabled(on) {
  const s = readSettings();
  s.lanEnabled = !!on;
  writeSettings(s);
  return s.lanEnabled;
}

/** 局域网地址手动覆盖：默认空字符串 = 自动选择。 */
export function lanIpOverride() {
  return readSettings().lanIpOverride ?? '';
}

/** 设置局域网地址覆盖；空字符串清除覆盖，恢复自动选择。非法 IPv4 抛错。 */
export function setLanIpOverride(value) {
  const ip = String(value ?? '').trim();
  if (ip && !isValidIpv4(ip)) {
    throw new Error('局域网地址必须是 IPv4 地址 | LAN address must be an IPv4 address');
  }
  const s = readSettings();
  if (ip) s.lanIpOverride = ip;
  else delete s.lanIpOverride;
  writeSettings(s);
  return ip;
}

// ---------- 访问密码「自定义」标记（issue #33） ----------
// 用户可把公网/局域网密码设成自己固定的 8 位数字（自定义后不再自动轮换）。
// 标记存 settings.json：publicPinCustom / lanPinCustom。
const PIN_CUSTOM_KEYS = { public: 'publicPinCustom', lan: 'lanPinCustom' };

/** 该 PIN（public | lan）是否用户自定义过（自定义后不自动轮换）。 */
export function pinCustom(which) {
  const key = PIN_CUSTOM_KEYS[which];
  if (!key) return false;
  return readSettings()[key] === true;
}

/** 设置自定义标记，返回新状态。 */
export function setPinCustom(which, on) {
  const key = PIN_CUSTOM_KEYS[which];
  if (!key) return false;
  const s = readSettings();
  s[key] = !!on;
  writeSettings(s);
  return !!on;
}

// ---------- 公网固定地址（named tunnel 入口；跨重启的公网身份） ----------
// 用户在 Cloudflare 托管域名并自建 named tunnel 指向本机代理端口后，把
// https:// 域名登记在这里：公网二维码改用此地址、登录态跨重启保持。
// 校验规则（对齐上游竞品「畸形值忽略并告警回落」）：必须是合法 origin、强制
// https://、无路径/尾斜杠/query/hash/用户信息。非法值：读取路径 console.warn
// 并按 null（未配置）处理；写入路径抛错（RPC 层转 bad-request 回显给设置页）。

/**
 * 归一化/校验公网固定地址：合法 → origin 形式（https://host[:port]，无尾斜杠），
 * 非法 → null。
 */
export function normalizePublicOrigin(raw) {
  const s = String(raw ?? '').trim();
  if (!s) return null;
  let u;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== 'https:') return null;
  if (u.pathname !== '/' || /\/$/.test(s) || u.search || u.hash) return null;
  if (u.username || u.password) return null;
  return `${u.protocol}//${u.host}`;
}

/** 公网固定地址；未配置或历史脏数据（告警回落）→ null。 */
export function publicBaseUrl() {
  const raw = readSettings().publicBaseUrl;
  if (raw == null || raw === '') return null;
  const v = normalizePublicOrigin(raw);
  if (v === null) {
    console.warn(`dsh-pocket-k: settings.publicBaseUrl "${raw}" 不是合法 https origin，已忽略并按未配置处理 | invalid https origin in settings, ignored`);
    return null;
  }
  return v;
}

/** 设置公网固定地址；空值清除。非法值抛错（RPC 层回显给设置页）。 */
export function setPublicBaseUrl(value) {
  const raw = String(value ?? '').trim();
  const s = readSettings();
  if (!raw) {
    delete s.publicBaseUrl;
    writeSettings(s);
    return null;
  }
  const v = normalizePublicOrigin(raw);
  if (v === null) {
    throw new Error('公网固定地址必须是 https:// origin（无路径、无 query）| fixed address must be an https:// origin without path or query');
  }
  s.publicBaseUrl = v;
  writeSettings(s);
  return v;
}

/** 清除公网固定地址，返回 null。 */
export function clearPublicBaseUrl() {
  const s = readSettings();
  delete s.publicBaseUrl;
  writeSettings(s);
  return null;
}

// ---------- named tunnel 自动配置方式（CLI login / API Token 双模式） ----------
// cfMode 决定 service.startTunnel 在配置了 publicBaseUrl 时如何确保并启动
// Cloudflare named tunnel：
//   - 'cli'：需要用户先跑一次 `cloudflared tunnel login`（~/.cloudflared/cert.pem），
//     插件用 CLI 自动 create/route dns/run；
//   - 'api'：需要用户在设置页粘贴 Cloudflare API Token，插件用 REST API 自动
//     create/token/route dns，再以 connector token 启动 cloudflared。

const CF_MODES = new Set(['cli', 'api']);

/** 当前 named tunnel 配置方式；未配置返回 null。 */
export function cfMode() {
  const v = readSettings().cfMode;
  return CF_MODES.has(v) ? v : null;
}

/** 设置 named tunnel 配置方式；仅接受 'cli' | 'api'，空值清除。 */
export function setCfMode(value) {
  const v = String(value ?? '').trim();
  const s = readSettings();
  if (!v) {
    delete s.cfMode;
    writeSettings(s);
    return null;
  }
  if (!CF_MODES.has(v)) {
    throw new Error('Cloudflare 模式必须是 cli 或 api | Cloudflare mode must be cli or api');
  }
  s.cfMode = v;
  writeSettings(s);
  return v;
}

/** 清除 named tunnel 配置方式，返回 null。 */
export function clearCfMode() {
  const s = readSettings();
  delete s.cfMode;
  writeSettings(s);
  return null;
}

/** Cloudflare API Token（仅 api 模式使用）；未设置返回 null。 */
export function cfApiToken() {
  const v = readSettings().cfApiToken;
  return typeof v === 'string' && v.trim() ? v : null;
}

/** 设置 Cloudflare API Token；空值清除。返回是否已设置（bool）。 */
export function setCfApiToken(value) {
  const token = String(value ?? '').trim();
  const s = readSettings();
  if (!token) {
    delete s.cfApiToken;
    writeSettings(s);
    return false;
  }
  // 不校验格式（Cloudflare token 是长随机字符串），存原值；绝不回显。
  s.cfApiToken = token;
  writeSettings(s);
  return true;
}

/** 清除 Cloudflare API Token，返回 false。 */
export function clearCfApiToken() {
  const s = readSettings();
  delete s.cfApiToken;
  writeSettings(s);
  return false;
}
