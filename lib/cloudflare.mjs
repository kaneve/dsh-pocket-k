// Cloudflare API 辅助（named tunnel 固定域名自动配置，API Token 模式）
//
// 设计：用户只需在设置页粘贴一个 Cloudflare API Token（需要权限：
// Account > Cloudflare Tunnel > Edit，Zone > DNS > Edit），本模块负责：
//   1. 根据固定域名自动找到所属 Zone 与 Account；
//   2. 确保存在一个 named tunnel（按域名派生的稳定名字）；
//   3. 把域名 CNAME 到该 tunnel（<tunnel-id>.cfargotunnel.com）；
// 运行连接器由 lib/tunnel.mjs 用返回的 connector token spawn cloudflared。
//
// 所有函数可注入 fetchImpl 便于单元测试（不引第三方依赖）。

import { createHash } from 'node:crypto';

const CF_API_BASE = 'https://api.cloudflare.com/client/v4';

/** 由固定域名派生稳定的 tunnel 名（cloudflared 名字只允许字母数字连字符）。 */
export function tunnelNameFor(host) {
  const h = String(host ?? '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  const base = `dsh-pocket-${h}`;
  // cloudflared 命名限制 63 字符内；超长时截断加短哈希保持唯一可读。
  if (base.length <= 63) return base;
  const hash = createHash('sha1').update(host).digest('hex').slice(0, 8);
  return `${base.slice(0, 54)}-${hash}`;
}

/** 计算 DNS 记录里的相对名：zone 是 dslink.cc，host 是 dsh.dslink.cc → 'dsh'；apex 用 '@'。 */
export function relativeDnsName(host, zoneName) {
  const h = String(host ?? '').toLowerCase();
  const z = String(zoneName ?? '').toLowerCase();
  if (!h || !z) return '@';
  if (h === z) return '@';
  if (h.endsWith(`.${z}`)) return h.slice(0, -(z.length + 1));
  return h;
}

/**
 * 创建 Cloudflare API 客户端。
 * @param {typeof fetch} [fetchImpl]
 */
export function createCloudflareApi(fetchImpl = fetch) {
  async function api(path, { token, method = 'GET', body } = {}) {
    if (!token) throw new Error('缺少 Cloudflare API Token | missing Cloudflare API token');
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    let res;
    try {
      res = await fetchImpl(`${CF_API_BASE}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch (err) {
      throw new Error(`Cloudflare API 请求失败（${path}）：${err?.message ?? err} | Cloudflare API request failed`);
    }
    let data = null;
    try { data = await res.json(); } catch { /* 非 JSON 响应 */ }
    if (!res.ok || !data?.success) {
      const msg = data?.errors?.map((e) => e?.message).filter(Boolean).join('; ')
        || `HTTP ${res.status}`;
      const hint = /authentication|auth/i.test(msg)
        ? '（请检查 API Token 权限：Account > Cloudflare Tunnel > Edit + Zone > DNS > Edit；Token 无效或未授权该 Account 也会这样）'
        : '';
      throw new Error(`Cloudflare API ${path} 错误：${msg}${hint} | Cloudflare API error: ${msg}`);
    }
    return data;
  }

  /**
   * 从 host 向上逐级找 Zone，返回 { zoneId, zoneName, accountId }。
   * 例如 dsh.dslink.cc.cd → 先试 dsh.dslink.cc.cd，再试 dslink.cc.cd、cc.cd。
   */
  async function findZone(token, host) {
    const labels = String(host ?? '').toLowerCase().split('.').filter(Boolean);
    if (labels.length < 2) throw new Error(`无法从域名推断 Cloudflare Zone：${host}`);
    for (let i = 0; i < labels.length - 1; i++) {
      const name = labels.slice(i).join('.');
      const data = await api(`/zones?name=${encodeURIComponent(name)}&per_page=1`, { token });
      const zone = data?.result?.[0];
      if (zone?.id) {
        return {
          zoneId: zone.id,
          zoneName: zone.name,
          accountId: zone.account?.id ?? null,
        };
      }
    }
    throw new Error(`在 Cloudflare 中找不到域名 ${host} 对应的 Zone（请确认域名已托管在 Cloudflare）| zone not found for ${host}`);
  }

  /** 确保 named tunnel 存在，返回 { tunnelId, connectorToken }。 */
  async function ensureTunnel(token, { accountId, tunnelName }) {
    if (!accountId) throw new Error('Cloudflare 未返回 Account ID，无法创建隧道 | missing Cloudflare account id');
    // 同名已存在 → 直接用；API 的 name 过滤各版本不完全一致，这里拉列表自己匹配。
    const listData = await api(`/accounts/${encodeURIComponent(accountId)}/cfd_tunnel?per_page=50`, { token });
    const existing = (listData?.result ?? []).find((t) => String(t?.name ?? '') === tunnelName);
    let tunnelId;
    if (existing?.id) {
      tunnelId = existing.id;
    } else {
      const created = await api(`/accounts/${encodeURIComponent(accountId)}/cfd_tunnel`, {
        token,
        method: 'POST',
        body: { name: tunnelName },
      });
      tunnelId = created?.result?.id;
      if (!tunnelId) throw new Error('Cloudflare 创建隧道失败：响应中没有 tunnel id | tunnel create response missing id');
    }
    const tokenData = await api(`/accounts/${encodeURIComponent(accountId)}/cfd_tunnel/${encodeURIComponent(tunnelId)}/token`, { token });
    const connectorToken = tokenData?.result?.token;
    if (!connectorToken) throw new Error('Cloudflare 获取隧道连接 Token 失败 | tunnel token missing');
    return { tunnelId, connectorToken };
  }

  /** 确保 DNS CNAME 指向隧道；已存在且指向同一隧道则跳过，否则创建/更新。 */
  async function ensureDns(token, { zoneId, zoneName, host, tunnelId }) {
    if (!zoneId) throw new Error('缺少 Cloudflare Zone ID，无法配置 DNS | missing zone id');
    const target = `${tunnelId}.cfargotunnel.com`;
    const name = relativeDnsName(host, zoneName);
    const listData = await api(`/zones/${encodeURIComponent(zoneId)}/dns_records?type=CNAME&name=${encodeURIComponent(String(host ?? '').toLowerCase())}`, { token });
    const existing = (listData?.result ?? []).find((r) => String(r?.name ?? '').toLowerCase() === String(host ?? '').toLowerCase());
    if (existing) {
      if (String(existing.content ?? '').toLowerCase() === target) return { recordId: existing.id, created: false, updated: false };
      await api(`/zones/${encodeURIComponent(zoneId)}/dns_records/${encodeURIComponent(existing.id)}`, {
        token,
        method: 'PATCH',
        body: { content: target, proxied: true },
      });
      return { recordId: existing.id, created: false, updated: true };
    }
    const created = await api(`/zones/${encodeURIComponent(zoneId)}/dns_records`, {
      token,
      method: 'POST',
      body: {
        type: 'CNAME',
        name,
        content: target,
        proxied: true,
        ttl: 1,
      },
    });
    return { recordId: created?.result?.id ?? null, created: true, updated: false };
  }

  return { api, findZone, ensureTunnel, ensureDns, tunnelNameFor, relativeDnsName };
}