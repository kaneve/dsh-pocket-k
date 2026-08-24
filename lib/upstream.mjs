// 上游 shaobeichen/dsh-pocket 最新 release 版本检查
//
// 设置页头部「上游 vX.Y.Z」不再写死：每次 dsh web 启动时异步请求 GitHub
// Releases API，拿到最新 tag 后通过 RPC status 暴露给前端显示。
// 网络失败/限流/非 release tag 一律静默回落 null（前端显示本地默认值），不阻塞启动。

const UPSTREAM_REPO = 'shaobeichen/dsh-pocket';
const RELEASES_LATEST_API = `https://api.github.com/repos/${UPSTREAM_REPO}/releases/latest`;
export const UPSTREAM_RELEASES_URL = `https://github.com/${UPSTREAM_REPO}/releases`;

/**
 * 获取上游最新 release 版本号（如 v1.13.4）；失败返回 null。
 * @param {object} [opts]
 * @param {typeof fetch} [opts.fetchImpl] 测试注入
 * @param {number} [opts.timeoutMs] 超时（默认 8000ms）
 * @param {AbortSignal} [opts.signal]
 */
export async function fetchLatestUpstreamVersion({ fetchImpl = fetch, timeoutMs = 8000, signal } = {}) {
  const sig = signal
    ? AbortSignal.any([signal, AbortSignal.timeout(timeoutMs)])
    : AbortSignal.timeout(timeoutMs);
  try {
    const res = await fetchImpl(RELEASES_LATEST_API, {
      headers: {
        Accept: 'application/vnd.github+json',
        'User-Agent': 'dsh-pocket',
      },
      signal: sig,
    });
    if (!res.ok) return null;
    const data = await res.json();
    const tag = String(data?.tag_name ?? '').trim();
    // 只接受看起来像版本号的 tag（v1.2.3 / 1.2.3），避免草稿/乱 tag
    return /^v?\d+\.\d+\.\d+/.test(tag) ? tag : null;
  } catch {
    return null;
  }
}