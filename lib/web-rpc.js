// dsh-pocket-k Web RPC（loopback-only）：设置页 ⇄ Host 的手机访问通道

import { POCKET_RPC_CHANNEL, POCKET_ENDPOINTS, redactStatus } from '../client/api.js';

function ok(value) {
  return { ok: true, value };
}

/**
 * 构造符合 DSH rpcErrorSchema 的错误（按 code 的 discriminated union，
 * details 必填且分分支定形；'internal' 不在合法 code 集合里）。
 */
function fail(code, message) {
  if (code === 'cancelled') return { ok: false, error: { code: 'cancelled', message, details: {} } };
  // 其余一律归入 bad-request（issues 是自由数组）
  return { ok: false, error: { code: 'bad-request', message, details: { issues: [{ message }] } } };
}

/** 各平台停止 dsh web 进程的命令（Windows 没有 lsof/kill）。 */
export function killHint(port) {
  if (process.platform === 'win32') {
    return `netstat -ano | findstr :${port}（找 LISTENING 的 PID）→ taskkill /PID <PID> /F`;
  }
  return `lsof -ti :${port} | xargs kill -9`;
}

/** 注册 /dsh-pocket-k 逻辑通道（仅本机 loopback 可调）。 */
export function installPocketRpc(ctx, { service, devices = null, log = console, desktop = false, runUpdate = null, restart = null, restartNotice = null, getToken = null, getLanToken = null, refreshLanToken = null, getLanAuthEnabled = null, setLanAuthEnabled = null, getLanEnabled = null, setLanEnabled = null, getLanIpOverride = null, setLanIpOverride = null, getPinCustom = null, setCustomPin = null, getPublicBase = null, setPublicBase = null, clearPublicBase = null, getCfMode = null, setCfMode = null, clearCfMode = null, getCfApiToken = null, setCfApiToken = null, clearCfApiToken = null, getUpstreamLatest = null }) {
  // 自 dsh 0.1.5-rc.1 起，官方 connection.rpc.handle 在注册路由时会读 owner.webServer，
  // 而 dsh-client-connection 已不再静态注入 webServer（0.1.2-rc.1 为 ["webServer","credentials"]，
  // 0.1.5-rc.1 只剩 ["credentials"]）→ 任何第三方插件调用它都会抛
  // `cannot get property "webServer" without inject`（已在真实 0.1.5-rc.1 运行时复现）。
  // 因此这里绕开该 API：用插件自己注入的 ctx.webServer 注册同一前缀路由，
  // 沿用官方 wire 协议（client 端 rpc.call 无需改动），并自行实现 loopback 授权
  // —— 官方 handle 的第三参 { authority: 'loopback' } 实际上早已被忽略。
  const webServer = ctx.webServer;
  if (!webServer?.register) {
    log.warn?.('dsh-pocket-k: webServer unavailable — settings tab disabled | 无 webServer，设置页不可用');
    return () => {};
  }
  const endpointHandler = async (endpoint, payload = {}, signal) => {
    if (signal?.aborted) return fail('cancelled', 'The request was cancelled.');

    // status 响应：服务状态 + 重启提示 + 停止命令 + 桌面端标志 + 公网/局域网访问密码 + 局域网密码开关
    const statusPayload = async () => {
      let notice = null;
      try { notice = (await restartNotice?.()) ?? null; } catch { notice = null; }
      const s = await service.status();
      return ok({
        ...redactStatus(s),
        desktop,
        restartNotice: notice,
        killHint: killHint(s.dshPort ?? 3080),
        accessToken: getToken?.() ?? null,
        lanToken: getLanToken?.() ?? null,
        lanAuthEnabled: getLanAuthEnabled?.() ?? true,
        lanEnabled: getLanEnabled?.() ?? true,
        publicPinCustom: getPinCustom?.('public') ?? false,
        lanPinCustom: getPinCustom?.('lan') ?? false,
        publicBase: getPublicBase?.() ?? null,
        cfMode: getCfMode?.() ?? null,
        cfTokenSet: Boolean(getCfApiToken?.() ?? null),
        upstreamLatest: getUpstreamLatest?.() ?? null,
      });
    };

    try {
      if (endpoint === POCKET_ENDPOINTS.status) {
        return await statusPayload();
      }
      if (endpoint === POCKET_ENDPOINTS.lanTokenRefresh) {
        const fresh = refreshLanToken?.() ?? null;
        if (!fresh) return fail('bad-request', '局域网密码刷新不可用 | LAN PIN refresh unavailable');
        return ok({ lanToken: fresh });
      }
      if (endpoint === POCKET_ENDPOINTS.lanAuthSetEnabled) {
        const enabled = setLanAuthEnabled?.(payload?.on === true);
        if (enabled === undefined) return fail('bad-request', '局域网密码开关不可用 | LAN PIN switch unavailable');
        return ok({ lanAuthEnabled: enabled });
      }
      if (endpoint === POCKET_ENDPOINTS.lanSetEnabled) {
        const on = payload?.on === true;
        const enabled = setLanEnabled?.(on);
        if (enabled === undefined) return fail('bad-request', '局域网访问开关不可用 | LAN access switch unavailable');
        await service.setLanAccessEnabled?.(on);
        return await statusPayload();
      }
      if (endpoint === POCKET_ENDPOINTS.lanSetOverride) {
        // 返回完整 status：前端 setStatus(await call(...)) 直接替换 status 对象，
        // 若只返回 { lanIpOverride } 会丢掉 accessToken/lanToken/tunnelUrl 等字段，
        // 且 lanUrl/二维码不会随新 IP 刷新（PR #47 的客户端写法依赖完整 status）。
        try {
          const ip = setLanIpOverride?.(payload?.ip ?? '');
          if (ip === undefined) return fail('bad-request', '局域网地址设置不可用 | LAN address setting unavailable');
          return await statusPayload();
        } catch (err) {
          return fail('bad-request', err?.message ?? String(err));
        }
      }
      if (endpoint === POCKET_ENDPOINTS.pinSetCustom) {
        const which = payload?.which === 'public' || payload?.which === 'lan' ? payload.which : null;
        if (!which) return fail('bad-request', '未知密码类型 | unknown PIN kind');
        try {
          const pin = setCustomPin?.(which, payload?.value);
          if (pin === undefined) return fail('bad-request', '自定义密码不可用 | custom PIN unavailable');
          return ok({ which, pin, custom: true });
        } catch (err) {
          return fail('bad-request', err?.message ?? String(err));
        }
      }
      if (endpoint === POCKET_ENDPOINTS.publicBaseGet) {
        return ok({ publicBase: getPublicBase?.() ?? null });
      }
      if (endpoint === POCKET_ENDPOINTS.publicBaseSet) {
        try {
          const v = setPublicBase?.(payload?.url ?? '');
          if (v === undefined) return fail('bad-request', '固定地址设置不可用 | fixed address setting unavailable');
          // 返回完整 status：二维码随新地址刷新（同 lanSetOverride 模式）
          return await statusPayload();
        } catch (err) {
          return fail('bad-request', err?.message ?? String(err));
        }
      }
      if (endpoint === POCKET_ENDPOINTS.publicBaseClear) {
        clearPublicBase?.();
        return await statusPayload();
      }
      if (endpoint === POCKET_ENDPOINTS.cfModeSet) {
        try {
          const mode = setCfMode?.(payload?.mode ?? '');
          if (mode === undefined) return fail('bad-request', 'Cloudflare 模式设置不可用 | Cloudflare mode setting unavailable');
          return await statusPayload();
        } catch (err) {
          return fail('bad-request', err?.message ?? String(err));
        }
      }
      if (endpoint === POCKET_ENDPOINTS.cfTokenSet) {
        try {
          const hasToken = setCfApiToken?.(payload?.token ?? '');
          if (hasToken === undefined) return fail('bad-request', 'Cloudflare Token 设置不可用 | Cloudflare token setting unavailable');
          return await statusPayload();
        } catch (err) {
          return fail('bad-request', err?.message ?? String(err));
        }
      }
      if (endpoint === POCKET_ENDPOINTS.cfTokenClear) {
        clearCfApiToken?.();
        return await statusPayload();
      }
      if (endpoint === POCKET_ENDPOINTS.deviceList) {
        if (!devices) return fail('bad-request', '设备注册表不可用 | device registry unavailable');
        return ok(devices.list(typeof payload?.host === 'string' ? payload.host : undefined));
      }
      if (endpoint === POCKET_ENDPOINTS.deviceRevoke) {
        if (!devices) return fail('bad-request', '设备注册表不可用 | device registry unavailable');
        const id = String(payload?.id ?? '');
        if (!id) return fail('bad-request', '缺少设备 id | missing device id');
        return ok({ id, revoked: devices.revoke(id) });
      }
      if (endpoint === POCKET_ENDPOINTS.deviceRevokeAll) {
        if (!devices) return fail('bad-request', '设备注册表不可用 | device registry unavailable');
        const host = String(payload?.host ?? '');
        if (!host) return fail('bad-request', '缺少 host | missing host');
        return ok({ host, revoked: devices.revokeAll(host) });
      }
      if (endpoint === POCKET_ENDPOINTS.tunnelStart) {
        // 安全免责声明（issue #31）：每次开启公网都必须先确认（前端弹框勾选）。
        // 服务端强制校验，防止绕过前端直接调 RPC。
        if (payload?.disclaimer !== true) {
          return fail('bad-request', '开启公网前请先阅读并勾选安全免责声明 | please accept the security disclaimer before enabling public access');
        }
        await service.startTunnel({ quick: payload?.quick === true });
        return await statusPayload();
      }
      if (endpoint === POCKET_ENDPOINTS.tunnelStop) {
        service.stopTunnel();
        return await statusPayload();
      }
      if (endpoint === POCKET_ENDPOINTS.version) {
        return ok({ current: runUpdate?.currentVersion?.() ?? null, loaded: runUpdate?.loadedVersion?.() ?? null });
      }
      if (endpoint === POCKET_ENDPOINTS.update) {
        // 桌面端：更新由 DSH Desktop 管理，这里关闭（不删除，仅禁用）
        if (desktop) return fail('bad-request', '桌面版更新由 DSH Desktop 管理，已在此环境停用 | updates are managed by DSH Desktop here');
        if (!runUpdate) return fail('bad-request', '更新不可用 | update unavailable');
        const result = await runUpdate.perform(payload?.profile ?? 'web');
        // 更新成功 → 自动重启生效（用户只点一次；helper 拉起失败则保持现状，可手动重启）
        if (result?.ok && restart) {
          const rr = restart();
          result.autoRestart = rr?.helperPid != null;
        }
        return ok(result);
      }
      if (endpoint === POCKET_ENDPOINTS.restart) {
        // 桌面端：重启由 DSH Desktop 管理，这里关闭（不删除，仅禁用）
        if (desktop) return fail('bad-request', '桌面版重启由 DSH Desktop 管理，已在此环境停用 | restart is managed by DSH Desktop here');
        if (!restart) return fail('bad-request', '重启不可用 | restart unavailable');
        const result = restart();
        // 重启拉起失败（helper 都没 spawn 出来）→ 如实报错，别让 UI 误报成功
        if (!result || result.helperPid == null) {
          return fail('bad-request', `重启失败：${result?.error ?? '未知'} | restart failed`);
        }
        const dshPort = service.dshPort ?? 3080;
        return ok({ ...result, hint: `重启后进程在后台运行；如需停止：${killHint(dshPort)}` });
      }
      return fail('bad-request', `Unknown endpoint: ${endpoint}`);
    } catch (err) {
      log.error?.('dsh-pocket-k: rpc %s failed | RPC 失败: %s', endpoint, err?.message ?? err);
      return fail('bad-request', err?.message ?? String(err));
    }
  };

  return webServer.register({
    kind: 'prefix',
    path: POCKET_RPC_CHANNEL,
    handler: createChannelHandler(ctx, endpointHandler, log),
  });
}

// ---------------------------------------------------------------------------
// Connection RPC 传输层（自实现，替代 0.1.5 上已损坏的 connection.rpc.handle）
//
// 官方 wire 协议（与 @deepseek-ai/dsh-client-connection 的 client 端 rpc.call 对齐）：
//   POST <channel>/<endpoint>
//   body  { type: 'client-request', rpcId, method, payload }
//   200   { type: 'server-response', rpcId, result: { ok: true, value } | { ok: false, error } }
//
// 安全栅栏：先要求 loopback 来源（插件声明的 authority），再复用官方
// connection.requestRejection（Host/Origin 可信域 + 浏览器认证 cookie），
// 与官方 register() 注册的路由保持同款语义。
// ---------------------------------------------------------------------------

/** rpcId / endpoint 段允许的字符（与官方 ENDPOINT_SEGMENT_PATTERN 对齐）。 */
const RPC_SEGMENT_PATTERN = /^[A-Za-z0-9_$.-]+$/;

/** 单次 RPC 请求体上限（设置页 RPC 全是小 JSON）。 */
const MAX_RPC_BODY_BYTES = 1024 * 1024;

/** 请求是否来自本机回环（含 IPv6 与 IPv4-mapped 形式）。 */
function isLoopbackRequest(req) {
  const addr = req?.socket?.remoteAddress ?? '';
  return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1';
}

/** 返回 403/401 表示拒绝，undefined 表示放行。 */
function fenceRejection(ctx, req) {
  if (!isLoopbackRequest(req)) return 403;
  const connection = ctx.connection;
  if (typeof connection?.requestRejection !== 'function') return undefined;
  try {
    return connection.requestRejection(req);
  } catch {
    return 403;
  }
}

function sendEnvelope(res, status, body) {
  res.writeHead(status, { 'content-type': 'application/json' });
  res.end(JSON.stringify(body));
}

async function readJsonBody(req, maxBytes = MAX_RPC_BODY_BYTES) {
  const chunks = [];
  let received = 0;
  for await (const chunk of req) {
    received += chunk.length;
    if (received > maxBytes) return { tooLarge: true };
    chunks.push(chunk);
  }
  try {
    return { value: JSON.parse(Buffer.concat(chunks).toString('utf8')) };
  } catch {
    return { invalid: true };
  }
}

/**
 * 构造 `/dsh-pocket-k` 前缀路由的 Node 请求处理器。
 * @param ctx - host 插件上下文（已注入 connection、webServer）。
 * @param handler - 业务处理器 `(endpoint, payload, signal) => result`。
 * @param log - 插件日志。
 * @returns `(req, res) => Promise<void>`。
 */
export function createChannelHandler(ctx, handler, log = console) {
  return async function handleChannelRequest(req, res) {
    const rejection = fenceRejection(ctx, req);
    if (rejection !== undefined) {
      res.writeHead(rejection);
      res.end(rejection === 401 ? 'unauthorized' : 'forbidden');
      return;
    }
    if (req.method !== 'POST') {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const contentType = String(req.headers?.['content-type'] ?? '').split(';', 1)[0].trim().toLowerCase();
    if (contentType !== 'application/json') {
      res.writeHead(415);
      res.end('content type must be application/json');
      return;
    }
    const pathname = new URL(req.url ?? '/', 'http://dsh.internal').pathname;
    const endpoint = pathname.startsWith(`${POCKET_RPC_CHANNEL}/`)
      ? pathname.slice(POCKET_RPC_CHANNEL.length + 1)
      : undefined;
    if (endpoint === undefined || endpoint.split('/').some((s) => s === '' || s === '.' || s === '..' || !RPC_SEGMENT_PATTERN.test(s))) {
      res.writeHead(404);
      res.end('not found');
      return;
    }
    const parsed = await readJsonBody(req);
    if (parsed.tooLarge) {
      res.writeHead(413, { connection: 'close' });
      res.end();
      req.destroy();
      return;
    }
    if (parsed.invalid) {
      res.writeHead(400);
      res.end('body is not JSON');
      return;
    }
    const envelope = parsed.value;
    if (envelope === null || typeof envelope !== 'object' || envelope.type !== 'client-request' || typeof envelope.rpcId !== 'string' || typeof envelope.method !== 'string') {
      res.writeHead(400);
      res.end('invalid client-request envelope');
      return;
    }
    if (envelope.method !== endpoint) {
      sendEnvelope(res, 200, {
        type: 'server-response',
        rpcId: envelope.rpcId,
        result: {
          ok: false,
          error: {
            code: 'gateway/bad-request',
            message: `method ${JSON.stringify(envelope.method)} does not match endpoint ${JSON.stringify(endpoint)}`,
            details: { issues: [] },
          },
        },
      });
      return;
    }
    const abort = new AbortController();
    res.on('close', () => { if (!res.writableEnded) abort.abort(); });
    try {
      const result = await handler(endpoint, envelope.payload, abort.signal);
      sendEnvelope(res, 200, { type: 'server-response', rpcId: envelope.rpcId, result });
    } catch (err) {
      log.error?.('dsh-pocket-k: rpc %s transport failure | RPC 传输层失败: %s', endpoint, err?.message ?? err);
      res.writeHead(500);
      res.end(`handler failure: ${String(err)}`);
    }
  };
}
