# 移动端重移植设计规格与实施计划

- 状态：**DONE（已实施 2026-08-22）** —— commit `cbad417` @ 分支 `feat/mobile-revender-dsh-web-mobile-v2.0.0`（按用户决定本地保留，暂不合入 main、不 push）
- 日期：2026-08-22
- 所有者：kaneve
- 范围：dsh-pocket 内嵌移动端适配（`client/mobile/`）从上游 fork v0.1.8 基线升级到 v2.0.0
- 实施：AgentTeams 团队 `pocket-mobile-revendor`（engineer + verifier），t1→t6 全链闭环；验收 5/5 PASS、48/48 测试绿（flake 为既有问题，见 §12）

---

## 1. 目标与范围

将 dsh-pocket 中内嵌的、移植自 `dsh-web-mobile`（MIT）的移动端适配代码，从当前
**v0.1.8** 基线升级到本地 fork 的 **v2.0.0**（含 phase 2-4 refactor）。

- 必须**保留** dsh-pocket 相对 v0.1.8 的全部 6 处本地自定义修复（已验证上游已包含，零回归）。
- 必须获得上游 v1.0–v2.0 的新功能与修复（全屏预览、设置页适配、iOS 输入缩放修复等）。
- **不改动** dsh-pocket 的插件机制、`client/build.mjs` 打包方式、RPC/代理逻辑。
- 本次仅落盘规格，不执行代码改动。

## 2. 真相源模型（重要约束变更）

自本规格起，**不再跟踪 GitHub 上的 `mexiaosqwq/dsh-web-mobile` 上游仓库**。融合以本地兄弟仓库为唯一源：

| 角色 | 本地路径 | origin |
|---|---|---|
| 移动端源（fork） | `C:\Users\kaneve\Projects\dsh-plugins\dsh-web-mobile` | `github.com/kaneve/dsh-web-mobile.git` |
| 消费方（本插件） | `C:\Users\kaneve\Projects\dsh-plugins\dsh-pocket` | `github.com/kaneve/dsh-pocket.git` |

- 融合 = 读本地 fork `src/client/*` → 写入 dsh-pocket `client/mobile/*`，**全程本地、无网络**。
- 用户会在本地同时推进这两个 fork；融合时直接对 fork 当前 `HEAD` 重新 diff，做增量。
- 旧 `/tmp/dsh-web-mobile` 克隆作废，可删。

## 3. 基线分析（已核实）

- 当前 dsh-pocket `client/mobile/` 是 upstream **v0.1.8**（2026-08-15，commit `15d04f2`）的移植，
  文件集 + base css 31649 B 完全一致；一次后续本地 fix `fc04b20`。
- dsh-pocket 相对 v0.1.8 的 6 处本地自定义修复，**在本地 fork `main` @ `0d10397`（v2.0.0）中全部已含**：

  | # | 本地修复 | 上游位置（已 grep 确认） |
  |---|---|---|
  | 1 | `safe-area-inset-top` 刘海/状态栏适配 | `src/client/styles/` 共 9 处 |
  | 2 | `touch-action:manipulation` + `gesturestart` 双击缩放防护 | `effects/phone-chrome.ts` + `styles/layout.css.ts` |
  | 3 | issue #5 中列 `:nth-child(2){grid-column:1}` | `styles/layout.css.ts` |
  | 4 | plugin-market 搜索 `_tabs` 换行 + `searchInline` 满宽 | `styles/compat.css.ts` |
  | 5 | usage-stats `_statsRow` 列堆叠 | `styles/compat.css.ts` |
  | 6 | pet `body:has([aria-modal])` 隐藏 | `styles/compat.css.ts` |

  ⇒ 重移植**零回归**：本地修复不会被覆盖或丢失。

## 4. 目标结构（本地 fork `main` @ `0d10397`，version 2.0.0）

`src/client/`
```
index.tsx            # 导出 apply(ctx)；inject=['slots','layout','locale','sessionLogDownload']
debug.ts             # ?mobile-nav-debug=1 调试入口
components/          # MobileDrawerFooter.tsx, MobileNavToggle.tsx  （MobileNavOverlay.tsx 已删除）
core/                # reconciler-core.ts
effects/             # aionui-compat, git-chip-reparent, overlay-backdrop-fab,
                     #   phone-chrome, preview-fullscreen, settings-toolbar-reparent, stats-line
i18n/                # locales.ts
styles/              # base.css.ts, compat.css.ts, index.ts, layout.css.ts, misc.css.ts
```
diff v0.1.8→v2.0.0 约 +2530/−1057 行；CSS 拆为 themed 模块、effects 抽出独立模块、
`MobileNavOverlay` 删除（并入 overlay-backdrop-fab）、新增 `debug.ts`。

## 5. 已决策项（技术裁定）

1. **源取本地 fork `main` @ `0d10397`**（v2.0.0 + phase 2-4），而非钉死 v2.0.0 tag ——
   获得全部最新修复，回归面可接受（由步骤 7/8 验收兜底）。
2. **入口别名策略：wrapper 处 `import { apply as mobileApply }`，vendored 源码零改动** ——
   使 `client/mobile/` 与 fork 字节一致，便于日后增量 diff；不在 vendored 层改名。
3. **保留 `debug.ts`** —— `?mobile-nav-debug=1` 调试入口，无害，利于排障。

## 6. 约束

- `@dsh-external/dsh-mobile-nav` **未发布到 npm（404）** → 只能内联 vendoring；
  dsh-pocket 须保持**唯一移动端来源**（两插件都适配会冲突）。
- dsh-pocket 自己的 `client/build.mjs`（esbuild → `client/client.js` ModuleLoader bundle）**保留**，不替换。
- 保留 `client/mobile/LICENSE.dsh-web-mobile`（MIT，与 GPL-2.0 兼容）+ README 署名。

## 7. 集成契约（关键差异）

| 项 | v0.1.8（现状） | v2.0.0（目标） |
|---|---|---|
| 入口文件 | `client/mobile/mobile-apply.tsx` | `client/mobile/index.tsx` |
| 导出名 | `mobileApply` | `apply` |
| 自带 inject | — | `['slots','layout','locale','sessionLogDownload']` |

- dsh-pocket `client/index.jsx`：
  - L13 现 `import { mobileApply } from './mobile/mobile-apply.tsx'`
    → 改为 `import { apply as mobileApply } from './mobile'`（解析到新 `index.tsx`）。
  - L319 `mobileApply(ctx)` 不变。
  - L16 `inject = ['slots','connection','layout','locale','sessionLogDownload']`
    含 dsh-pocket 专属 `connection`，**保持不变**；上游模块自带 `inject` 不被 wrapper 消费，无害
    （实施时目测确认 wrapper 不依赖被引入模块的 `inject` 导出）。

## 8. 实施步骤

1. **基线快照**：开 feature 分支 `feat/mobile-revender-dsh-web-mobile-v2.0.0`；
   记录 `client/mobile/` 现有文件 sha、`mobile.css.ts` 36576 B、6 处本地 diff 存档。
2. **取源（本地）**：`cd …/dsh-plugins/dsh-web-mobile && git checkout main && git rev-parse HEAD`
   （记录 commit hash，如 `0d10397`）；读取 `src/client/*`。
   可选：`git diff <v0.1.8-base>..HEAD` 在本地算出完整增量。
3. **替换 `client/mobile/`**：删除 v0.1.8 残留（`mobile-apply.tsx`、`mobile.css.ts`、
   `MobileNavOverlay.tsx`）；写入 fork `src/client/*`（**字节一致**）；核对并保留 `LICENSE.dsh-web-mobile`。
4. **入口重接（仅改 wrapper）**：按 §7 改 L13；L319/L16 不变。
5. **构建外部依赖审计**：grep 整个新 `client/mobile/` 的 `@deepseek-ai/` 导入，
   区分 `import type`（擦除）vs value；把任何 **value 导入**的 host 包补进 `build.mjs` 的
   `external`（当前仅 `['react','react/jsx-runtime','@deepseek-ai/dsh-client-ui-primitives']`）。
   注意上游 `index.tsx` 对 runtime/slots 仅为 `import type`，但子模块若有 value 导入需补齐。
6. **重建 bundle**：`node client/build.mjs` → 重新生成 `client/client.js`。
7. **验收（见 §9）**。
8. **署名/文档**：`client/index.jsx` 头部补 "ported v2.0.0 (from local fork)"；
   更新 README 移动端来源版本标注；`LICENSE.dsh-web-mobile` 与上游对齐。
9. **vendor 来源记录**：在 `client/mobile/` 留 `VENDORED_FROM` 标记
   （fork commit `0d10397` + version `2.0.0` + 日期），便于下次增量融合审计。
10. **提交**：commit 注明 upstream 版本 + MIT 署名。

## 9. 验收清单

- [ ] `npm test`（48 项）全绿。
- [ ] `grep client/client.js` 命中 `safe-area-inset-top` / `touch-action` / `nth-child(2)` /
      `_tabs` / `_statsRow` / `aria-modal`（本地 6 处修复仍在）。
- [ ] 新模块存在：`preview-fullscreen.ts` / `settings-toolbar-reparent.ts` / `overlay-backdrop-fab.ts`。
- [ ] `MobileNavOverlay.tsx` 已从 `client/mobile/` 移除。
- [ ] `client/client.js` 未把 `@deepseek-ai/*` host 包打进 bundle（体积合理）。
- [ ] （可选）dev 实例 headless 冒烟：窄屏抽屉布局、全屏预览、设置页适配正常。

## 10. 风险登记

| 风险 | 缓解 |
|---|---|
| `build.mjs` 外部依赖漏配 → esbuild 打包 host 包失败/体积膨胀 | 步骤 5 grep 审计全部 `@deepseek-ai/` value 导入 |
| 浏览器端真实渲染无法靠 `node --test` 覆盖 | 步骤 6 产物 grep + 可选 dev headless 冒烟 |
| 取 `main` @8-22 含 refactor，相对 v2.0.0 tag 回归面略大 | 由 §9 验收兜底；求稳可改钉 v2.0.0 tag |

## 11. 工作量

纯文件替换 + 1 行 wrapper 改动 + 外部依赖审计 + 重建 + 测试 ≈ 半天；
瓶颈在步骤 5 审计与构建联调。

---

## 附录：核实证据（本地 fork `main` @ `0d10397`）

```
safe-area-inset-top         styles/ 共 9 处
touch-action / gesturestart effects/phone-chrome.ts + styles/layout.css.ts
:nth-child(2)               styles/layout.css.ts
_tabs / searchInline        styles/compat.css.ts
_statsRow                   styles/compat.css.ts
aria-modal                  styles/compat.css.ts
入口导出                    src/client/index.tsx → export function apply(ctx)
inject                      ['slots','layout','locale','sessionLogDownload']
已删                        src/client/components/MobileNavOverlay.tsx（不在列表中）
```

---

## 12. 实施期决策记录

- **2026-08-22（t1–t4 完成后）**：v0.1.8 扁平布局残留共 **6** 个代码文件，§8 步骤3 原清单
  仅枚举 3 个（mobile-apply.tsx / mobile.css.ts / MobileNavOverlay.tsx），系规格疏漏。
  其余 3 个根级死代码（locales.ts / MobileDrawerFooter.tsx / MobileNavToggle.tsx，
  仅被彼此引用、不入 bundle、新树已由 i18n/ 与 components/ 取代）经 captain 裁定**一并删除**。
  验证：删除前 grep 引用检查干净；删除后 `diff -r client/mobile <fork>/src/client` 完全镜像
  （仅多 LICENSE.dsh-web-mobile）；重建 bundle 字节数不变（125591B），证实死代码未入包。
- **t3 审计结论**：@deepseek-ai value 导入仅 dsh-client-ui-primitives（新 components/ 图标，
  已在 external），build.mjs **零改动**；其余 14 处均为 import type / declare module（擦除）。
- **t4 冒烟**：bundle 75070B → 125591B；17 个新模块全部入包；debug.ts 不入包
  （独立调试入口，与 fork 原始接线一致）。
- fork vendoring 基准 HEAD：`0d103973c624d2add832b8b96c498ecc45e458a0`（main @ v2.0.0+phase2-4）。
- **t5 验收结果（2026-08-22）**：5/5 全 PASS（对最终产物 bundle@125591B 核验）。
  48/48 全绿；6 处本地修复标记全命中（safe-area×9 / touch-action×3 / nth-child(2)×6 /
  _tabs×1 / _statsRow×1 / aria-modal×39）；结构/bundle 卫生/wrapper 三项核对通过。
- **遗留跟进项·测试 flake（与本分支无关，另行处理；2026-08-22 终态树 4 跑实证）**：
  终态树上 `npm test` 4 跑 = 1 绿 + 3 flake。两个不稳定点：
  ① issue #11「公网隧道自动恢复」`test/service.test.js:547`（期望标记删除后为 null，
     实际残留 `{"at":…}`，两次复现）；
  ② issue #22 `download.test.js:104` 30s 超时（1 次，伴生 1 个 cancelled）。
  **非回归证据链**：本分支 git 改动仅 client/*（+.gitignore 两行）；两 flaky 测试的导入面
  （lib/service.mjs、lib/tunnel.mjs、node 内建等）不触及 client/mobile 或 bundle；
  所有 mobile/bundle 相关断言 4 跑全绿。
  推测根因：node --test 多文件并行 + 真实文件系统标记 + 模块级副作用 → 跨文件状态竞争。
  候选修法（择一）：a) test script 加 `--test-concurrency=1`（快速止血，需确认本机 Node 支持）；
  b) fixture 路径隔离（每测试文件独立临时目录，根治）；c) `--test-isolation`（Node ≥ 22）。
  建议独立小任务处理，不混入本特性分支。

- **翻牌率追踪补充（2026-08-23，安全整改分支 fix/security-hardening 验收期）**：
  - engineer 开发期 4 跑翻 3（#11 同签名 service.test.js:547）；#22 已被 t7 的
    checksums 预取 mock 离线化修复（`24c9936` 内，非密封时序问题消除）。
  - verifier t10 验收期：全量 3 跑 = 翻 2 + 全绿 1（本会话翻牌率 2/3）；
    #11 隔离复跑 PASS → 加严判据双条件齐备（隔离 PASS ✓ + 全量全绿 ✓），PASS 判定成立。
  - 非回归证据链同上且更强：三提交 diffstat 不触及 lib/service 与该测试导入面；
    失败签名与在案记录逐字节一致；零改动下隔离与全量均可绿。
  - 结论：#11 波动率较 08-22 观察升高但定性不变（跨文件状态竞争，机器负载/时序敏感），
    仍按用户指示「以后再说」，候选修法 a/b/c 维持。

## 13. 上游同步记录（2026-08-23）

**拓扑变更**：用户在 GitHub 网页 Sync fork（kaneve/dsh-pocket = 上游 shaobeichen v1.12.3 `52b5c94`）；
本地 main ff-only 快进（无自有提交，纯快进非 rebase）。上游 remote 走 ghproxy 镜像 fetch
（本机直连 GitHub 443 不通；git 对象 SHA 自校验，只读检查安全）。push 待网络恢复。

**变基结果**：
- fix/security-hardening：t7→`c32fac5`、t8→`22cae48`；**t9 弃用**（备份 tag
  `backup/t9-login-backoff`=38fbd29）。弃用理由：上游 #40 createRateLimiter 已实现限流
  （窗口 5 次/IP 锁 + 全局锁），且信任 cf-connecting-ip——我方 socket.remoteAddress 方案
  在隧道场景把所有访客视为 127.0.0.1，会连坐+互相清零，架构上劣于上游。
- feat/mobile-revender-dsh-web-mobile-v2.0.0：re-vendor 重放为 `ba7ada4` + 新提交
  `79eae47`。冲突处理：MobileNavOverlay.tsx/mobile.css.ts 为 modify/delete → 保留删除；
  client/index.jsx 合并双方 import（我方 `apply as mobileApply` 新入口 + 上游 pocket-locales
  i18n）；client/client.js 构建产物不手工合，解完源码后 node client/build.mjs 重生成。

**上游移动端测试契约适配（79eae47）**：上游新增 smoke 测试对 bundle 做契约断言
（pointer-events:none / contains(target)≥2 / z-index 600），耦合其 v1.x 扁平实现。
v2.0.0 架构差异：backdrop 为临时元素（drawer 开启才创建、点击即关，生命周期规避抢点击），
无需 pointer-events:none。移植 PR#42 时成对抬层：drawer 40→600 !important
（layout.css.ts）、backdrop 30→590（base.css.ts，保持背板<抽屉次序、均高于第三方抬升的
500、低于 toast 9999）；smoke 断言改写为 v2.0.0 等价契约（dataset.mobileNav 挂载/
contains(target)≥1/z600+z590/无40!important）。教训：bundle 契约断言的正则须锚定 CSS 规则形态
（选择器后跟 ` {`）——querySelector 的 JS 字符串同形会截取错区域。

**上游测试缺陷（非本仓库问题，已留证）**：
- WSL #39（test/service.test.js）：断言 detectWsl()===false，但 lib/service.mjs:85 兜底
  检查 WSLENV——Windows Terminal 恒置 `WSLENV=WT_SESSION:WT_PROFILE_ID`（与 WSL 无关）
  → Windows 上必挂。作者注释自证只在 macOS 测过。纯上游 main 同样失败。
- #11 波动率进一步升高（隔离跑也翻）；service.test.js 导入面（node 内建 only）与本仓库
  改动零模块图交集，非回归结构性坐实。

**分支终态**（待 verifier t11 回归确认后 push）：
main=`52b5c94` / fix/security-hardening=`22cae48`(2 commits) /
feat/mobile-revender-dsh-web-mobile-v2.0.0=`79eae47`(2 commits)。
工作区常态恢复：M .gitignore（+.npm-cache/+.agent-teams/，曾被 reset --hard 吞掉已重建）、
?? .project/ —— 均有意不提交。
