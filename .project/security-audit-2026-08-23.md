# dsh-pocket 安全扫描报告（2026-08-23）

- 状态：**已归档 · 整改完成并已合入 main**（SEC-1/2/3 处置完毕，见文末跟踪表；合并点 `a163274`，fix/security-hardening 分支已删，t9 备份于 tag `backup/t9-login-backoff`）
- 范围：lib/ 七模块、bin/、client/（含 vendored mobile）、test/、package.json、CI 工作流（约 9100 行）
- 方法：静态审计工具（plugin_audit 权限画像）+ 全量危险模式 grep + 关键文件逐行精读 + 依赖漏洞库比对

## 总体结论

**未发现恶意代码**：无后门、无数据外传、无混淆、无 eval/动态执行、无 postinstall 钩子；
依赖仅 qrcode×2（npm audit 官方库：0 漏洞）；PIN/设置文件 0600；代理上游硬编码
127.0.0.1:3080（无 SSRF）；外联端点全部可解释（cloudflared 官方+镜像、npm registry、127.0.0.1）。

## 发现清单

| # | 编号 | 严重度 | 位置 | 问题 | 处置 |
|---|---|---|---|---|---|
| 1 | SEC-1 | 🟠 中高 | lib/tunnel.mjs | 下载即执行、零完整性校验：cloudflared 从 GitHub + 第三方镜像（ghproxy.net/gh.ddlc.top/gh-proxy.com）+ TUNA bottle 下载，无 sha256/签名验证即 spawn 执行；镜像投毒 = 用户机器 RCE | ✅ 已修复 `c32fac5`（原 `24c9936`，上游同步变基后重写） |
| 2 | SEC-2 | 🟡 中 | lib/index.js:63 | PIN 用 Math.random() 生成（非 CSPRNG）却作网络认证凭据 | ✅ 已修复 `22cae48`（原 `12b54bf`，变基后重写；上游 #33 重写该区域后 newPin 仍用 Math.random，本修复依然必要且与 randomBytes 共存） |
| 3 | SEC-3 | 🟡 中 | lib/proxy.mjs:155 | /pocket-login 无速率限制/锁定/延迟，10⁸ 空间可在线慢爆 | ✅ **采用上游方案**：v1.12.x #40 自带 createRateLimiter（窗口 5 次/IP 锁 60s + 全局 50 次锁 30s，信任 cf-connecting-ip）。我方退避实现有隧道盲区（socket.remoteAddress 对隧道访客恒为 127.0.0.1 → 全体连坐/互相清零），同步时弃用；原实现备份于 tag **backup/t9-login-backoff**(`38fbd29`)，如需「立即退避堵阈值旁路」增强可基于上游限流器二次开发 |
| 4 | — | 🟡 中·架构 | lib/proxy.mjs | 回环提权设计：手机客户端经代理在 DSH 眼里即 loopback，8 位 PIN 是整个回环信任面（含 update/restart RPC）唯一门禁；LAN 密码关闭时同网段任意设备获完整 loopback 权限 | 既定设计，文档化 |
| 5 | — | 低 | proxy.mjs:121-123 | token 比较 === 非 timing-safe | 加固 backlog |
| 6 | — | 低 | proxy.mjs:122,190 | 支持 ?token= 查询传参 → PIN 泄入代理日志与浏览器历史 | 加固 backlog |
| 7 | — | 低 | proxy.mjs:163 | cookie 直接存 PIN 原值（HttpOnly+SameSite ✓）；建议改随机 session id | 加固 backlog |
| 8 | — | 信息 | 设计固有 | LAN 段明文 HTTP（PIN 可嗅探）；公网段走 cloudflared TLS ✓ | 文档化 |

## 清白确认（逐项核实）

- eval/new Function/setTimeout 字符串形式：运行时零命中（vm 仅 test/service.test.js:207 做语法检查）
- 混淆特征（fromCharCode/atob/超长 base64）：零命中
- package.json scripts：仅 build:client 与 test，无生命周期钩子；npm audit（官方 registry）：0 vulnerabilities
- HTML 注入内容全部为静态脚本串；desktopEnvPatchScript 的 platform 经白名单过滤（darwin/win32/linux），无注入面
- WS upgrade 同样过认证（401+destroy）✓；登录 body 限长 1024 ✓；cookie HttpOnly+SameSite=Lax ✓
- RPC handler `{ authority: 'loopback' }`；redactStatus 白名单输出，token 不经 status 泄露
- 写盘面收敛：$DSH_HOME/dsh-pocket/{token,token-lan,restarted.json,tunnel-auto.json}（0600）+ tmpdir 日志
- bin/dsh-pocket.mjs 为常规 CLI 入口；CI 工作流规范（release 触发、幂等发布）

## 附带发现

- proxy.mjs:66 注释「局域网免密码」已过时（#18/#24 接线后 LAN 默认有密码）——待顺手修正
- CI actions 引用主版本 tag 而非 commit SHA 锁定——通用供应链加固项

## 整改跟踪

| 任务 | 内容 | 分支 | 状态 |
|---|---|---|---|
| t7 | SEC-1：下载工件 sha256 校验（镜像产物强制验证，验证失败删除并换源） | fix/security-hardening | ✅ `24c9936`（lib/tunnel.mjs +85−6、test/download.test.js +149−1；fail-closed：镜像无 checksums 必跳过；官方/TUNA 无校验放行 warn 留痕） |
| t8 | SEC-2：PIN 生成改 crypto.randomInt | fix/security-hardening | ✅ `12b54bf`（randomInt(10⁷,10⁸) 严格 8 位；Math.random 零残留；三调用点同源受益） |
| t9 | SEC-3：登录渐进退避（滚动窗口失败计数，成功清零，内存封顶） | fix/security-hardening | ✅ `38fbd29`（createLoginTracker：立即指数退避 500ms→封顶 8s、窗口 10min、maxIps=10000 FIFO、成功清零。⚠️ 参数与原任务示例值有偏差，captain 裁定接受：原「≥5 次才延迟」存在阈值旁路洞——攻击者每窗口只错 4 次即永远零延迟；立即退避堵死该通道，单 IP 强度严格更高） |
| t10 | 回归验收：全量测试 + 三修复项针对性核验 | — | ✅ 6/6 PASS（53/53 全绿跑通；flake 协议走完 #11 定性既有问题；卫生=恰好 3 提交、改动面仅 lib×3+test×2 共 +367/−10、package.json 零变化、client/.project 零触碰。备注：t8/t9 commit 信息与约定字符串有措辞出入，语义一致，裁定不 amend） |
