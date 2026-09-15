// DSH 浏览器认证（dsh-client-connection）自愈
//
// 背景：本代理把 Host/Origin 改写成 loopback 权威（见 proxy.mjs 顶部说明），
// 而 DSH 自己的浏览器认证栅栏（dsh-client-connection 的 authorizeIndex /
// isAuthenticated）要求一枚**按「请求 authority」命名并用持久密钥签名**的 cookie：
//   - authority 随 Host 改写变成 127.0.0.1:<dshPort>，与浏览器在公网域名下
//     可能持有的旧 cookie（authority=dsh.example.com）**不匹配** → 401
//     `dsh web authentication required; reopen the URL printed by dsh web.`
//   - 手工解法是打开带 launch token 的 URL 铸一次 cookie；每个浏览器/设备都要来一次，
//     且 DSH 重启后 token 变化。
//
// 本模块把这一步变成插件自己完成：用官方 connection.authenticatedUrl() 拿本进程
// launch token → 在 loopback 上做一次官方 token 交换 → 缓存 Set-Cookie →
// 之后每个上游请求都带上它。任何浏览器/设备都不再需要手工打开带 token 的 URL。
//
// 说明：DSH 的签名密钥持久化在 credentials 里（跨 dsh web 重启有效），所以铸一次
// 就能长期复用；这里仍在启动时主动铸一次、并在上游 401 时失效重铸，作为自愈兜底。

import { request as httpRequest } from 'node:http';

/** DSH 会话 cookie 名固定前缀（dsh-auth-<authority 摘要>）。 */
export const DSH_COOKIE_PREFIX = 'dsh-auth-';

/** 主动换新周期（cookie 本身有效期 30 天；12h 换一次足够且几乎零成本）。 */
const REFRESH_TTL_MS = 12 * 60 * 60 * 1000;

/** 单次 token 交换超时。 */
const EXCHANGE_TIMEOUT_MS = 5000;

/** 启动预热重试（dsh web 的 server 可能在插件 apply 之后才 listen）。 */
const WARMUP_ATTEMPTS = 40;
const WARMUP_DELAY_MS = 500;

function authorityOf(upstream) {
  return `${upstream?.host ?? '127.0.0.1'}:${upstream?.port ?? 3080}`;
}

/** 在 loopback 上走一次官方 token 交换，返回 'name=value' 或 null。 */
function exchangeLaunchToken(url, authority) {
  return new Promise((resolve) => {
    let settled = false;
    const done = (value) => { if (!settled) { settled = true; resolve(value); } };
    let req;
    try {
      req = httpRequest(url, { method: 'GET', headers: { host: authority } }, (res) => {
        const raw = res.headers['set-cookie'];
        res.resume();
        const first = Array.isArray(raw) ? raw[0] : raw;
        if (res.statusCode !== 303 || !first) return done(null);
        const pair = String(first).split(';')[0].trim();
        return done(pair.startsWith(DSH_COOKIE_PREFIX) ? pair : null);
      });
    } catch {
      return done(null);
    }
    req.on('error', () => done(null));
    req.setTimeout(EXCHANGE_TIMEOUT_MS, () => { try { req.destroy(); } catch { /* 忽略 */ } done(null); });
    req.end();
  });
}

/**
 * 建立 DSH 认证 cookie 自愈 provider。
 * @param {object} opts
 * @param {object} [opts.connection] 注入的 DSH connection 服务（提供 authenticatedUrl）
 * @param {{host:string,port:number}} [opts.upstream] 上游 dsh web 地址（决定 authority）
 * @param {object} [opts.log] 日志（warn/info 可选）
 * @returns {{cookie:()=>string|null, refresh:()=>Promise<string|null>, invalidate:()=>void, start:()=>Promise<boolean>}}
 */
export function createDshCookieProvider({ connection = null, upstream = null, log = null } = {}) {
  const authority = authorityOf(upstream);
  let cookie = null;
  let mintedAt = 0;
  let inflight = null;
  let warned = false;

  const supported = () => typeof connection?.authenticatedUrl === 'function';

  async function mint() {
    if (!supported()) return null;
    let url;
    try {
      url = connection.authenticatedUrl(`http://${authority}/`);
    } catch (err) {
      log?.warn?.('dsh-pocket-k: authenticatedUrl failed | 取 DSH 认证 URL 失败: %s', err?.message ?? err);
      return null;
    }
    const pair = await exchangeLaunchToken(url, authority);
    if (pair) {
      cookie = pair;
      mintedAt = Date.now();
      log?.info?.('dsh-pocket-k: DSH browser-auth cookie acquired | 已自动获取 DSH 认证 cookie（手机/公网无需再手工打开带 token 的 URL）');
    }
    return pair;
  }

  /** 重铸（并发去重）。 */
  function refresh() {
    if (inflight) return inflight;
    inflight = mint().finally(() => { inflight = null; });
    return inflight;
  }

  /** 启动预热：重试到 dsh web 开始监听为止；不可用时静默降级为旧行为。 */
  async function start() {
    if (!supported()) {
      if (!warned) {
        warned = true;
        log?.warn?.('dsh-pocket-k: connection.authenticatedUrl unavailable — DSH auth auto-mint disabled | 当前 DSH 无 authenticatedUrl，自动认证已跳过（仍可用带 token 的 URL 手工登录）');
      }
      return false;
    }
    for (let i = 0; i < WARMUP_ATTEMPTS; i++) {
      if (await refresh()) return true;
      await new Promise((r) => setTimeout(r, WARMUP_DELAY_MS));
    }
    log?.warn?.('dsh-pocket-k: could not acquire DSH browser-auth cookie | 未能自动获取 DSH 认证 cookie（可临时用带 token 的 URL 打开一次）');
    return false;
  }

  return {
    /**
     * 每个代理请求同步取当前 cookie（'name=value'）或 null。
     * 缺失/过期时后台重铸，不阻塞本次请求（下一次请求即带上）。
     */
    cookie() {
      if (!cookie) { void refresh(); return null; }
      if (Date.now() - mintedAt > REFRESH_TTL_MS) void refresh();
      return cookie;
    },
    refresh,
    /** 上游 401（cookie 失效/密钥轮换）→ 丢弃缓存，后台重铸。 */
    invalidate() {
      cookie = null;
      mintedAt = 0;
    },
    start,
  };
}

/**
 * 把 DSH 认证 cookie 注入上游请求头：**剥掉**浏览器带来的同名/旧 `dsh-auth-*`
 * （它们可能是按旧 authority 铸的、或已失效），只保留本代理铸的那一枚，
 * 避免 DSH 解析到错误的那一条。
 * @param {object} headers 即将发给上游的请求头（原地修改）
 * @param {string|null} dshCookie 'name=value' 或 null
 * @returns {object} headers
 */
export function applyDshCookie(headers, dshCookie) {
  const current = headers.cookie;
  if (!dshCookie && current === undefined) return headers;
  const kept = String(current ?? '')
    .split(';')
    .map((part) => part.trim())
    .filter((part) => part.length > 0 && !part.startsWith(DSH_COOKIE_PREFIX));
  if (dshCookie) kept.push(dshCookie);
  if (kept.length) headers.cookie = kept.join('; ');
  else delete headers.cookie;
  return headers;
}
