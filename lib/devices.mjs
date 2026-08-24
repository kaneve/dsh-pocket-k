// dsh-pocket 设备会话注册表（t13）：逐台撤销 + 持久化
//
// PIN 只用于「新登录」；登录成功后铸造随机 bearer 会话 token，cookie 只存 token。
// 注册表只存 token 的 sha256 摘要（tokenId），原始 token 不落盘——即使 devices.json
// 泄漏也无法直接冒用已签发会话。
//
// 持久化策略：
//   - 内存 Map 为主，lastSeenAt 变更只标 dirty，不每请求写盘；
//   - 定期 flush（默认 5s）批量落盘到 $DSH_HOME/dsh-pocket/devices.json (0600)；
//   - 容量上限 200 台全局 / 50 台每 host，LRU 逐出；host 超 30 天整体无活动则 GC。

import { createHash, randomBytes } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { homedir } from 'node:os';

const DEFAULT_MAX_DEVICES = 200;
const DEFAULT_MAX_PER_HOST = 50;
const DEFAULT_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 天
const DEFAULT_FLUSH_MS = 5_000;
const ONLINE_WINDOW_MS = 10 * 60 * 1000; // 10 分钟
const UA_MAX_LEN = 120;

export function devicesPath(home) {
  const dshHome = home ?? process.env.DSH_HOME ?? join(homedir(), '.dsh');
  return join(dshHome, 'dsh-pocket', 'devices.json');
}

/** tokenId = sha256(token)。原始 token 永不写入注册表。 */
export function tokenIdOf(token) {
  return createHash('sha256').update(String(token ?? '')).digest('hex');
}

/**
 * 从 User-Agent 轻量解析设备名（仅供 UI 展示；绝不展示完整原始 UA）。
 * 只取平台提示，未识别统一叫 Device。
 */
export function parseDeviceName(ua) {
  const s = String(ua ?? '');
  if (s.includes('iPhone')) return 'iPhone';
  if (s.includes('iPad')) return 'iPad';
  if (s.includes('Android')) return 'Android';
  if (s.includes('Windows')) return 'Windows';
  if (s.includes('Mac OS X') || s.includes('Macintosh')) return 'macOS';
  if (s.includes('Chrome OS') || s.includes('CrOS')) return 'ChromeOS';
  if (s.includes('Linux')) return 'Linux';
  return 'Device';
}

/**
 * 创建设备会话注册表（同步初始化；定期异步 flush）。
 * @param {object} opts
 * @param {string} [opts.home] $DSH_HOME；缺省取 env/用户主目录
 * @param {number} [opts.maxDevices] 全局设备上限（默认 200）
 * @param {number} [opts.maxPerHost] 每 host 上限（默认 50）
 * @param {number} [opts.ttlMs] host 无活动 GC 阈值（默认 30 天）
 * @param {number} [opts.flushMs] 定期刷盘周期（默认 5s）
 * @returns {{
 *   check:(host:string, token:string)=>boolean,
 *   issue:(host:string, ua?:string)=>{token:string,id:string},
 *   revoke:(id:string)=>boolean,
 *   revokeAll:(host:string)=>number,
 *   list:(host?:string)=>Array<object>,
 *   flush:()=>Promise<void>,
 *   dispose:()=>Promise<void>
 * }}
 */
export function createDeviceRegistry({
  home,
  maxDevices = DEFAULT_MAX_DEVICES,
  maxPerHost = DEFAULT_MAX_PER_HOST,
  ttlMs = DEFAULT_TTL_MS,
  flushMs = DEFAULT_FLUSH_MS,
} = {}) {
  const file = devicesPath(home);
  const hosts = new Map(); // host -> Map<tokenId, record>
  let dirty = false;

  function load() {
    try {
      const raw = JSON.parse(readFileSync(file, 'utf8'));
      if (raw && typeof raw === 'object') {
        for (const [host, map] of Object.entries(raw)) {
          if (!map || typeof map !== 'object') continue;
          const inner = new Map();
          for (const [tokenId, rec] of Object.entries(map)) {
            if (!rec || typeof rec !== 'object') continue;
            inner.set(tokenId, {
              id: String(rec.id ?? tokenId),
              name: String(rec.name ?? 'Device'),
              ua: String(rec.ua ?? '').slice(0, UA_MAX_LEN),
              createdAt: Number(rec.createdAt) || Date.now(),
              lastSeenAt: Number(rec.lastSeenAt) || Date.now(),
            });
          }
          if (inner.size) hosts.set(host, inner);
        }
      }
    } catch { /* 无文件/损坏 → 空注册表 */ }
    runGc(Date.now());
  }

  /** 删除超过 ttlMs 无活动的整个 host。 */
  function gcHosts(now) {
    for (const [host, map] of hosts) {
      let newest = 0;
      for (const rec of map.values()) newest = Math.max(newest, rec.lastSeenAt);
      if (now - newest > ttlMs) {
        hosts.delete(host);
        dirty = true;
      }
    }
  }

  /** 删除已超过 30 天签发期的设备会话（token 固定 30 天过期）。 */
  function gcExpired(now) {
    for (const [host, map] of hosts) {
      for (const [id, rec] of map) {
        if (now - rec.createdAt > ttlMs) {
          map.delete(id);
          dirty = true;
        }
      }
      if (!map.size) hosts.delete(host);
    }
  }

  function runGc(now = Date.now()) {
    gcExpired(now);
    gcHosts(now);
    evictGlobal();
  }

  /** 全局超限时逐出最久未用的设备（跨 host 扫描）。 */
  function evictGlobal() {
    while (totalDevices() > maxDevices) {
      let oldestHost = null;
      let oldestId = null;
      let oldestAt = Infinity;
      for (const [host, map] of hosts) {
        for (const [id, rec] of map) {
          if (rec.lastSeenAt < oldestAt) {
            oldestAt = rec.lastSeenAt;
            oldestHost = host;
            oldestId = id;
          }
        }
      }
      if (!oldestHost) break;
      const map = hosts.get(oldestHost);
      map.delete(oldestId);
      if (!map.size) hosts.delete(oldestHost);
      dirty = true;
    }
  }

  function totalDevices() {
    let total = 0;
    for (const map of hosts.values()) total += map.size;
    return total;
  }

  function flush() {
    if (!dirty) return Promise.resolve();
    const payload = {};
    for (const [host, map] of hosts) {
      payload[host] = Object.fromEntries(map);
    }
    try {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, JSON.stringify(payload, null, 2), { mode: 0o600 });
      dirty = false;
    } catch (err) {
      console.warn(`dsh-pocket: devices.json flush failed | 设备注册表刷盘失败: ${err?.message ?? err}`);
    }
    return Promise.resolve();
  }

  const timer = setInterval(() => {
    runGc();
    flush().catch(() => {});
  }, flushMs);
  timer.unref?.();

  load();

  return {
    /** 校验设备会话 token；命中则更新 lastSeenAt（内存批量，不写盘）。 */
    check(host, token) {
      if (!token) return false;
      const id = tokenIdOf(token);
      const map = hosts.get(String(host ?? ''));
      const rec = map?.get(id);
      if (!rec) return false;
      const now = Date.now();
      // 会话 token 固定 30 天过期（从签发 createdAt 算起，与是否活跃无关）
      if (now - rec.createdAt > ttlMs) {
        map.delete(id);
        if (!map.size) hosts.delete(String(host ?? ''));
        dirty = true;
        return false;
      }
      rec.lastSeenAt = now;
      // 移到 Map 末尾 = 最近使用（LRU）
      map.delete(id);
      map.set(id, rec);
      dirty = true;
      return true;
    },

    /** 铸造新设备会话并登记；返回明文 token（仅响应 Set-Cookie 用）与 id。 */
    issue(host, ua) {
      const hostKey = String(host ?? '');
      const now = Date.now();
      runGc(now);
      let map = hosts.get(hostKey);
      if (!map) {
        map = new Map();
        hosts.set(hostKey, map);
      }
      const token = randomBytes(32).toString('base64url');
      const id = tokenIdOf(token);
      const record = {
        id,
        name: parseDeviceName(ua),
        ua: String(ua ?? '').slice(0, UA_MAX_LEN),
        createdAt: now,
        lastSeenAt: now,
      };
      map.set(id, record);
      // 每 host 超限 → LRU 逐出（Map 头 = 最久未用）
      while (map.size > maxPerHost) {
        const oldest = map.keys().next().value;
        if (!oldest) break;
        map.delete(oldest);
        dirty = true;
      }
      if (!map.size) hosts.delete(hostKey);
      dirty = true;
      evictGlobal();
      return { token, id };
    },

    /** 撤销指定设备（全局查找）；返回是否找到并删除。 */
    revoke(id) {
      const target = String(id ?? '');
      for (const [host, map] of hosts) {
        if (map.has(target)) {
          map.delete(target);
          if (!map.size) hosts.delete(host);
          dirty = true;
          return true;
        }
        // 兼容 id 字段与 key 不一致的情况
        for (const [key, rec] of map) {
          if (rec.id === target) {
            map.delete(key);
            if (!map.size) hosts.delete(host);
            dirty = true;
            return true;
          }
        }
      }
      return false;
    },

    /** 撤销某 host 的全部设备；返回删除数量。 */
    revokeAll(host) {
      const map = hosts.get(String(host ?? ''));
      if (!map) return 0;
      const count = map.size;
      hosts.delete(String(host ?? ''));
      if (count > 0) dirty = true;
      return count;
    },

    /** 列出设备；不传 host 则列出全部。online = lastSeenAt 距今 < 10 分钟。 */
    list(host) {
      const now = Date.now();
      const out = [];
      if (host != null) {
        const map = hosts.get(String(host));
        if (map) {
          for (const rec of map.values()) {
            out.push({
              id: rec.id,
              name: rec.name,
              online: now - rec.lastSeenAt < ONLINE_WINDOW_MS,
              createdAt: rec.createdAt,
              lastSeenAt: rec.lastSeenAt,
            });
          }
        }
      } else {
        for (const map of hosts.values()) {
          for (const rec of map.values()) {
            out.push({
              id: rec.id,
              name: rec.name,
              online: now - rec.lastSeenAt < ONLINE_WINDOW_MS,
              createdAt: rec.createdAt,
              lastSeenAt: rec.lastSeenAt,
            });
          }
        }
      }
      return out.sort((a, b) => b.lastSeenAt - a.lastSeenAt);
    },

    async flush() {
      await flush();
    },

    async dispose() {
      clearInterval(timer);
      await flush();
    },
  };
}