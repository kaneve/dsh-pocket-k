window.__ModuleLoader__.load({
  id: "dsh-pocket-k",
  factory: (require) => {
    var module = { exports: {} };
    var exports = module.exports;
    // The DSH client module system provides react as a module, never as a
    // global. esbuild keeps react external (see the build config above) and
    // its classic JSX transform emits bare React.createElement calls for the
    // mobile components (which import only named hooks, not React itself), so
    // the bundle must bind React itself - otherwise every mobile component
    // crashes at render time with "ReferenceError: React is not defined".
    var React = require("react");
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// client/index.jsx
var index_exports = {};
__export(index_exports, {
  apply: () => apply2,
  inject: () => inject,
  name: () => name,
  redactStatus: () => redactStatus
});
module.exports = __toCommonJS(index_exports);
var import_react = require("react");

// client/api.js
var POCKET_RPC_CHANNEL = "/dsh-pocket-k";
var POCKET_ENDPOINTS = Object.freeze({
  status: "pocket.status",
  tunnelStart: "tunnel.start",
  tunnelStop: "tunnel.stop",
  version: "pocket.version",
  update: "pocket.update",
  restart: "pocket.restart",
  lanTokenRefresh: "token.lanRefresh",
  lanAuthSetEnabled: "lanAuth.setEnabled",
  lanSetEnabled: "lan.setEnabled",
  lanSetOverride: "lan.setOverride",
  pinSetCustom: "pin.setCustom",
  publicBaseGet: "pocket.publicBase.get",
  publicBaseSet: "pocket.publicBase.set",
  publicBaseClear: "pocket.publicBase.clear",
  cfModeSet: "pocket.cf.mode.set",
  cfTokenSet: "pocket.cf.token.set",
  cfTokenClear: "pocket.cf.token.clear",
  deviceList: "device.list",
  deviceRevoke: "device.revoke",
  deviceRevokeAll: "device.revokeAll"
});
function compareVersions(a, b) {
  const pa = String(a).replace(/^[vV]/, "").split(".");
  const pb = String(b).replace(/^[vV]/, "").split(".");
  for (let i = 0; i < 3; i++) {
    const x = parseInt(pa[i], 10) || 0;
    const y = parseInt(pb[i], 10) || 0;
    if (x !== y) return x - y;
  }
  const aPre = String(a).replace(/^[vV]/, "").match(/-.*$/)?.[0] ?? "";
  const bPre = String(b).replace(/^[vV]/, "").match(/-.*$/)?.[0] ?? "";
  if (!aPre && !bPre) return 0;
  if (!aPre) return 1;
  if (!bPre) return -1;
  const aParts = aPre.slice(1).split(".");
  const bParts = bPre.slice(1).split(".");
  const len = Math.max(aParts.length, bParts.length);
  for (let i = 0; i < len; i++) {
    const ax = aParts[i] ?? "";
    const bx = bParts[i] ?? "";
    if (ax === bx) continue;
    const aNum = /^\d+$/.test(ax);
    const bNum = /^\d+$/.test(bx);
    if (aNum && bNum) return Number(ax) - Number(bx);
    if (aNum) return 1;
    if (bNum) return -1;
    return ax < bx ? -1 : 1;
  }
  return 0;
}
function redactStatus(s) {
  return {
    proxyRunning: s?.proxyRunning === true,
    proxyPort: s?.proxyPort ?? null,
    lanEnabled: s?.lanEnabled !== false,
    lanUrl: s?.lanUrl ?? null,
    lanQr: s?.lanQr ?? null,
    lanCandidates: Array.isArray(s?.lanCandidates) ? s.lanCandidates : [],
    lanIpOverride: s?.lanIpOverride ?? "",
    tunnelRunning: s?.tunnelRunning === true,
    tunnelUrl: s?.tunnelUrl ?? null,
    tunnelQr: s?.tunnelQr ?? null,
    tunnelState: s?.tunnelState ?? { phase: "idle" },
    tunnelMode: s?.tunnelMode ?? null,
    publicBase: s?.publicBase ?? null,
    dshPort: s?.dshPort ?? null
  };
}

// client/mobile/components/MobileNavToggle.tsx
var import_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
function MobileNavToggle({ toggleSidebar, t }) {
  return /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "data-mobile-nav": "toggle",
      "aria-label": t("open"),
      title: t("open"),
      onClick: () => toggleSidebar()
    },
    /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives.IconPanelLeftOutline16, { size: 16 })
  );
}

// client/mobile/components/MobileDrawerFooter.tsx
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
function MobileDrawerFooter({ useSessions, downloadSessionLog, t }) {
  const sessionId = useSessions((state) => state.current);
  return /* @__PURE__ */ React.createElement("div", { "data-mobile-nav": "drawer-actions" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "data-mobile-nav": "session-log",
      "aria-label": t("sessionLog"),
      title: t("sessionLog"),
      disabled: sessionId === void 0,
      onClick: () => {
        if (sessionId !== void 0) downloadSessionLog(sessionId);
      }
    },
    /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives2.IconDownloadOutline16, { size: 14 }),
    /* @__PURE__ */ React.createElement("span", null, t("sessionLog"))
  ));
}

// client/mobile/styles/base.css.ts
var BASE_CSS = `
/* ---------- base control styles (rendered at any width, hidden where unused) ---------- */

[data-mobile-nav="toggle"],
[data-mobile-nav="files"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  flex: none;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--dsw-alias-label-secondary, inherit);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="toggle"]:hover,
[data-mobile-nav="files"]:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06));
}
[data-mobile-nav="toggle"]:focus-visible,
[data-mobile-nav="files"]:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
  outline-offset: 1px;
}

/* Drawer footer actions: the relocated Session log download plus the Files
   action that opens the dsh-web-ui explorer sheet. */
[data-mobile-nav="drawer-actions"] {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
[data-mobile-nav="session-log"],
[data-mobile-nav="explorer"] {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 34px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12));
  border-radius: 12px;
  background: transparent;
  color: var(--dsw-alias-label-primary, inherit);
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="session-log"]:hover:not(:disabled),
[data-mobile-nav="explorer"]:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06));
}
[data-mobile-nav="session-log"]:disabled {
  color: var(--dsw-alias-label-dimmed, rgba(0, 0, 0, .35));
  cursor: default;
}

/* Session-delete confirm / error cards (shown as a bottom overlay, see the
   delete-dialog wrapper below). Danger-tinted card with a description and
   two actions. */
[data-mobile-nav="delete-confirm"] {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  box-sizing: border-box;
  padding: 8px 10px;
  border: 1px solid var(--dsw-alias-state-error-secondary, rgba(220, 38, 38, .35));
  border-radius: 12px;
  background: var(--dsw-alias-interactive-bg-hover-danger, rgba(220, 38, 38, .06));
}
[data-mobile-nav="delete-confirm-title"] {
  font-size: 13px;
  font-weight: 600;
  line-height: 18px;
  color: var(--dsw-alias-state-error-primary, #b91c1c);
}
[data-mobile-nav="delete-confirm-desc"] {
  font-size: 12px;
  line-height: 17px;
  color: var(--dsw-alias-label-secondary, inherit);
}
[data-mobile-nav="delete-confirm-actions"] {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 2px;
}
[data-mobile-nav="delete-confirm-actions"] > button {
  height: 30px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12));
  border-radius: 10px;
  background: transparent;
  color: var(--dsw-alias-label-primary, inherit);
  font-family: inherit;
  font-size: 13px;
  line-height: 20px;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="delete-confirm-yes"] {
  border-color: var(--dsw-alias-state-error-secondary, rgba(220, 38, 38, .5)) !important;
  background: var(--dsw-alias-state-error-primary, #dc2626) !important;
  color: #ffffff !important;
}
[data-mobile-nav="delete-confirm-actions"] > button:disabled {
  opacity: .55;
  cursor: default;
}
[data-mobile-nav="delete-error"] {
  width: 100%;
  font-size: 12px;
  line-height: 17px;
  color: var(--dsw-alias-state-error-primary, #b91c1c);
}

/* Bottom overlay for the delete confirm / error card: dimmed backdrop plus a
   viewport-anchored card above the drawer. [hidden] keeps the error line out
   of layout until a failure lands. */
[data-mobile-nav="delete-dialog-backdrop"] {
  position: fixed;
  inset: 0;
  z-index: 55;
  background: rgba(0, 0, 0, .45);
  animation: dsh-web-mobile-fade .2s var(--ds-ease-in-out, ease-in-out);
}
[data-mobile-nav="delete-dialog"] {
  position: fixed;
  left: 8px;
  right: 8px;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  z-index: 56;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px;
  border-radius: 14px;
  background: var(--dsw-alias-bg-base, #ffffff);
  box-shadow: 0 8px 30px rgba(0, 0, 0, .22);
  animation: dsh-web-mobile-sheet-in .22s var(--ds-ease-out, ease-in-out);
}
/* Wide touch (tablet landscape \u22651024px, pointer coarse): the card would
   otherwise span the full desktop viewport. Cap and center it with margins
   (not transform, which the entry animation would override mid-play). */
@media (min-width: 1024px) and (pointer: coarse) {
  [data-mobile-nav="delete-dialog"] {
    left: 0;
    right: 0;
    width: 420px;
    margin-inline: auto;
  }
}
@media (prefers-reduced-motion: reduce) {
  [data-mobile-nav="delete-dialog-backdrop"],
  [data-mobile-nav="delete-dialog"] {
    animation: none !important;
  }
}

/* Floating fallback button (hero / blank phases without a session header).
   Top aligns with the session header's toggle row (that row sits 12px below
   the frame's safe-area padding); when the client has set viewport-fit=cover
   the safe-area inset moves it below the notch too. */
[data-mobile-nav="fab"] {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  left: 10px;
  z-index: 21;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12));
  border-radius: 50%;
  background: var(--dsw-alias-button-floating-fill, #ffffff);
  color: var(--dsw-alias-label-primary, inherit);
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, .18);
  -webkit-tap-highlight-color: transparent;
}
[data-mobile-nav="fab"]:hover {
  background: var(--dsw-alias-button-floating-hover, rgba(0, 0, 0, .08));
}
[data-mobile-nav="fab"]:focus-visible {
  outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
  outline-offset: 2px;
}

/* Dimmed backdrop under the open drawer; above every column, below the drawer. */
[data-mobile-nav="backdrop"] {
  position: absolute;
  inset: 0;
  /* dsh-pocket \u79FB\u690D\u4E0A\u6E38 PR#42 \u914D\u5957\uFF1A\u62BD\u5C49\u5DF2\u62AC\u81F3 600\uFF08\u9AD8\u4E8E\u7B2C\u4E09\u65B9 !important \u62AC\u5347\u7684
     shell overlay z500\uFF09\uFF0C\u80CC\u677F\u987B\u540C\u6B65\u4FDD\u6301\u5728\u62BD\u5C49\u4E4B\u4E0B\u3001\u62AC\u5347 overlay \u4E4B\u4E0A\uFF0C\u5426\u5219\u5916\u4FA7
   * \u70B9\u51FB\u4F1A\u88AB\u76D6\u4F4F\u7684\u63D2\u4EF6\u5C42\u622A\u80E1\u3001\u538B\u6697\u5C42\u4E5F\u4F1A\u88AB\u7A7F\u5E2E\u3002590 = (500,600) \u533A\u95F4\u3002 */
  z-index: 590;
  background: rgba(0, 0, 0, .45);
  cursor: pointer;
  animation: dsh-web-mobile-fade .2s var(--ds-ease-in-out, ease-in-out);
  /* Fade-out twin of the mount animation: the task eases the dimming away
     (inline opacity 0 + pointer-events none) and removes the element after
     the fade. Also used by the gesture layer so the backdrop fades in step
     with a close-follow commit's slide-out. */
  transition: opacity .2s var(--ds-ease-in-out, ease-in-out);
  -webkit-tap-highlight-color: transparent;
}
@keyframes dsh-web-mobile-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  [data-mobile-nav="backdrop"] {
    animation: none !important;
    transition: none !important;
  }
}
/* Settings sheet entrance: the official dialog mounts with no animation at
   all, so it snaps in. Fade + slight rise/scale reads as a proper sheet. */
@keyframes dsh-web-mobile-sheet-in {
  from {
    opacity: 0;
    transform: translateY(14px) scale(.98);
  }
  to {
    opacity: 1;
    transform: none;
  }
}
/* Preview sheet rise: the aionui preview column opens as a bottom sheet. */
@keyframes dsh-web-mobile-sheet-up {
  from {
    opacity: 0;
    transform: translateY(28px);
  }
  to {
    opacity: 1;
    transform: none;
  }
}

`;

// client/mobile/styles/layout.css.ts
var LAYOUT_CSS = `/* ---------- mobile-only layout (narrow viewport AND touch-primary pointer) ---------- */

@media (max-width: 1023px) and (pointer: coarse) {
  /* --- Phone chrome ---
     The system status bar stays visible (no fullscreen). Three adjustments
     make it behave:
     - touch-action: pan-y pinch-zoom kills double-tap-to-zoom (and the 300ms
       tap delay) while keeping vertical pan. Omitting pan-x (i.e. not using
       the manipulation alias) forbids HORIZONTAL pan on the root: a
       left-edge horizontal drag would otherwise be claimed by the browser as
       a pan (firing pointercancel) before the sidebar swipe layer can
       classify it. touch-action does not inherit and the behavior
       intersection stops at the first scroll container, so only touches
       landing directly on the root background are affected \u2014 inner
       horizontal scrolling of content containers is untouched. pinch-zoom is
       listed on purpose (#45): a bare pan-y also drops pinch, and then a
       zoom the browser applied by itself \u2014 iOS enlarges the viewport when a
       field under 16px takes focus \u2014 can no longer be undone by the user,
       so the app stays magnified until it is reopened or rotated. Two-finger
       zoom is also the WCAG 1.4.4 escape hatch and costs the gesture layer
       nothing: pinch is not a horizontal pan.
     - overscroll-behavior-x: none suppresses the browser's edge history
       navigation on the root scroller \u2014 Android Chrome claims a horizontal
       stroke that STARTS within its edge band (EDGE_WIDTH_DP=48dp,
       NavigationHandler.java) and navigates BACK, the exact gesture that
       opens the drawer ("\u9875\u9762\u76F4\u63A5\u8FD4\u56DE\u4E0A\u4E00\u9875", 2026-08-29 user report). Only
       html/body count for this (Chromium issue 41483088: inner containers
       are ignored by the navigation path). iOS Safari's edge back-swipe has
       no CSS opt-out (WebKit bug 240183) \u2014 there the widened gesture start
       zone (96px, beyond every browser's edge-claim strip) is the
       mitigation.
     - With the client's viewport-fit=cover, env(safe-area-inset-top) is the
       status bar / notch height; the rules below push the app content below
       it so the status bar never covers anything. Off notched phones (or in
       a normal browser tab where the layout viewport already sits below the
       status bar) the inset is 0 and nothing shifts. */
  html,
  body {
    touch-action: pan-y pinch-zoom !important;
    overscroll-behavior-x: none !important;
  }

  /* AppFrame: the drawer takes the sidebar column out of grid flow, so the
     remaining in-flow items (center, details) land in tracks 1..2: give the
     center every pixel and keep the details track at zero. The top padding
     clears the status bar / notch for every in-flow surface (session header,
     messages, composer); the absolutely-positioned drawer is unaffected (its
     containing block is the frame's padding box, i.e. still the frame top).
     box-sizing MUST be border-box: the official frame is height:100% of a
     100%-height body, and it is content-box by default, so the safe-area
     padding is ADDED on top of the full viewport height. The frame then grows
     to 100% + inset, the document itself becomes scrollable by exactly the
     inset, and the sticky composer seat (bottom:0 of the scroll body) lands
     below the visual viewport. Symptoms on a notched phone: the whole UI can
     be swiped up, the composer lifts off the bottom leaving a blank strip,
     and the newest message sits under the composer because the host's
     at-bottom follow scrolls its own scroll body, not the document. With
     border-box the padding is taken out of the 100% height instead, so the
     frame is exactly one viewport tall and the document never scrolls. */
  [data-mobile-nav="frame"] {
    box-sizing: border-box !important;
    position: relative !important;
    grid-template-columns: minmax(0, 1fr) 0 0 !important;
    padding-top: env(safe-area-inset-top, 0px) !important;
  }

  /* The sidebar column (first grid child) becomes a left drawer. The drawer
     hugs the sidebar content exactly (the wide sidebar carries an inline
     width, ~280px): a fixed 92vw box would leave a white strip where the
     container background shows beside the content.
     Closed state: translateX(-110%) \u2014 more than -100% of the max-content
     width \u2014 guarantees the whole drawer (and its shadow, had it one) leaves
     the viewport. A mere -100% leaves a sliver on screen; -105% (as used
     before) left 14px of the drawer plus a long 32px-blur shadow gradient
     visible along the left edge of the main UI. No box-shadow at all: the
     dimmed backdrop already separates drawer from content. */
  [data-mobile-nav="frame"] > :first-child {
    position: absolute !important;
    inset: 0 auto 0 0 !important;
    width: max-content;
    max-width: 92vw;
    /* dsh-pocket \u79FB\u690D\u4E0A\u6E38 PR#42\uFF08dsh-pocket issue #42\uFF09\uFF1A\u7B2C\u4E09\u65B9\u63D2\u4EF6\uFF08\u5982
       dsh-update-checker\uFF09\u7528 !important \u628A shell overlay \u62AC\u5230 z500\uFF0Cdrawer 40
       \u4F1A\u88AB\u76D6\u4F4F\u70B9\u4E0D\u5230\u4F1A\u8BDD\u3002\u63D0\u5230 600 \u2014\u2014 \u9AD8\u4E8E 500\u3001\u4F4E\u4E8E\u89C6\u53E3\u7EA7\u6A2A\u5E45/toast 9999\u3002 */
    z-index: 600 !important;
    transform: translateX(-110%);
    transition: transform .28s var(--ds-ease-in-out, ease-in-out);
    background: var(--dsw-alias-bg-base, #ffffff);
    /* Keep the drawer's own content below the status bar / notch: the drawer
       spans the full frame height (its absolute containing block is the
       frame's padding box, so the frame's own safe-area padding does NOT
       reach it). The drawer background paints the status-bar strip, which
       the client's theme-color meta matches, so the strip reads seamless. */
    padding-top: env(safe-area-inset-top, 0px) !important;
    /* Kill the official sidebarCol right border: with the backdrop the edge
       reads cleanly, and the settings dialog (width:100% of this box) stays
       pixel-flush with the drawer. */
    border-right: none !important;
  }

  /* Expanded state (frame without data-sidebar-collapsed) slides the drawer in.
     The open state must be transform:none \u2014 NOT translateX(0): an identity
     transform still makes the drawer the containing block for fixed-position
     descendants (the settings dialog's .VOzbGW_overlay is portaled into the
     sidebar DOM). With the identity transform the wide settings sheet
     (100vw-16) overflows the 280px drawer, the dialog's focus scrolls the
     overflow:hidden drawer to scrollLeft=102, and every static child (plus the
     fixed overlay) shifts 102px off-screen. With transform:none the overlay is
     viewport-anchored: it dims the full screen and the sheet sits at left:8. */
  [data-mobile-nav="frame"]:not([data-sidebar-collapsed]) > :first-child {
    transform: none !important;
  }

  /* Drawer swipe gestures (edge swipe-in / content swipe-out, see
     docs/specs/2026-08-27-sidebar-swipe-gestures.md).
     One rule is load-bearing for the gesture layer: dropping pan-x on the
     drawer lets horizontal pointermove events reach the gesture code \u2014
     WITHOUT it the browser treats a horizontal stroke as a pan, fires
     pointercancel and the gesture never classifies (vertical panning stays
     intact). Start-hit is decided purely by geometry on the document
     capture listener (START_ZONE_PX = 48px); there is no hotspot element
     (removed per audit C2, 2026-08-27). pinch-zoom rides along with the
     root value so a browser-applied zoom stays undoable inside the drawer
     too (#45); touch-action intersects down the ancestor chain, so a bare
     pan-y here would cancel the root's pinch permission. */
  [data-mobile-nav="frame"] > :first-child {
    touch-action: pan-y pinch-zoom !important;
  }

  /* prefers-reduced-motion: the drawer's .28s slide is motion; drop it
     (audit S2 2026-08-27 \u2014 the old reduce block only covered the settings
     sheet and its mask). Same idiom as the animation:none blocks below. */
  @media (prefers-reduced-motion: reduce) {
    [data-mobile-nav="frame"] > :first-child {
      transition: none !important;
    }
  }

  /* Drag handles are useless on touch and would float over the drawer. */
  [data-side="sidebar"],
  [data-side="details"] {
    display: none !important;
  }

  /* --- Conversation text on mobile ---
     The official message flow keeps desktop's 32px side gutters and 16px
     type. On a phone: shrink the type a notch and widen the lines by
     trimming the gutters (the sidebar drawer list keeps its size). The
     flow's scroll container holds the markdown <p> paragraphs; since
     DSH 0.1.2-rc.1 the composer is a Lexical contenteditable that also
     renders real <p> paragraphs inside its own _scroll container, so the
     composer must be excluded explicitly via
     :not(:has([data-composer-input])). */
  /* The official main scroll body reserves scrollbar-gutter for desktop
     scrollbars (8px), which shoves every column off-center on a phone.
     Classic desktop scrollbars (Edge/Chrome) also occupy ~8-17px in a
     phone-sized viewport, shifting the column further. Mobile scrolling
     is touch/wheel, so remove the scrollbar entirely on phones: the
     column is then exactly centered in every browser. */
  [data-phase] [class*="_scrollBody"] {
    scrollbar-gutter: auto !important;
    scrollbar-width: none;
  }
  [data-phase] [class*="_scrollBody"]::-webkit-scrollbar {
    display: none !important;
    width: 0;
    height: 0;
  }
  /* Message action rows (copy / run-time badges) can overflow the right
     edge on narrow screens \u2014 keep them inside the message width. */
  [data-phase] [class*="_actions"] {
    overflow: hidden;
  }
  [data-phase] [class*="_actions"] [class*="_timeEnd"] {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }

  /* Message tooltip bubbles (copy / feedback labels, message-row hover
     bubbles) are redundant on touch: the icon already flips to a checkmark.
     Suppress only inside the actions row \u2014 the fork's original scope. On
     this host (0.1.1-rc.2) NO tooltip renders as a visible bubble: the copy
     label is a visuallyHidden span and no client-ui package emits
     role="tooltip". The user message bubble (gdEzaW_bubble) and the goal
     bubble (oRe1gG_bubble) live in _userStack/_row, NOT in _actions \u2014 the
     previously unscoped selector hid every user message on touch devices
     (2026-09-06 live regression). role="tooltip" stays globally suppressed:
     genuine ARIA tooltips are exactly what the sticky-residue fix targets,
     and nothing legitimate carries the role today. The actions-row arm
     re-activates by itself when a host version renders tooltip labels
     inline in the actions row (DSH 0.1.2 shape). */
  @media (hover: none), (pointer: coarse) {
    [data-phase] [role="tooltip"],
    [data-phase] [class*="_actions"] [class*="_bubble"] {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      pointer-events: none !important;
    }
  }

  [data-phase]
    [class*="_scroll"]:not([class*="_scrollBody"]):not(:has([data-composer-input])):has(p) {
    padding-left: 20px;
    padding-right: 20px;
    font-size: 15px !important;
  }
  /* The official markdown styles set an explicit 16px on paragraphs and
     list items, so the container's inherited 15px is not enough. User
     messages render their text in a div whose class carries _text_
     (16px too) \u2014 cover it as well. */
  [data-phase]
    [class*="_scroll"]:not([class*="_scrollBody"]):not(:has([data-composer-input])):has(p) p,
  [data-phase]
    [class*="_scroll"]:not([class*="_scrollBody"]):not(:has([data-composer-input])):has(p) li,
  [data-phase]
    [class*="_scroll"]:not([class*="_scrollBody"]):not(:has([data-composer-input])):has(p) [
      class*="_text_"
    ] {
    font-size: 15px !important;
  }

  /* Markdown tables: the official table uses width:max-content, so on a phone
     it hugs the content and leaves dead space beside/inside the table. Force
     the table to fill the message column and let the table wrapper handle
     overflow if a cell is genuinely too wide. */
  [data-phase] table {
    width: 100%;
    max-width: 100%;
  }
  [data-phase] th,
  [data-phase] td {
    max-width: none;
    min-width: 0;
  }

  /* Markdown images: the official rule often forces width:100%, which
     upscales small square images to the full message column. Show small
     images at their intrinsic size; large / very wide images still scale
     down to fit the column (max-width:100% keeps horizontal panoramas
     adaptive without overflowing). */
  [data-phase] [class*="_scroll"]:not([class*="_scrollBody"]) img {
    width: auto !important;
    max-width: 100% !important;
    height: auto !important;
    /* Cap square / tall images so a big sticker does not dominate the
       narrow column; landscape images stay governed by max-width only.
       The plain px line is the fallback for engines without dvh. */
    max-height: 220px !important;
    max-height: min(40dvh, 220px) !important;
  }

  /* User bubbles: the official stack is capped at min(525px, 82%), which on a
     phone leaves a large blank strip on the left and pushes the bubble high.
     On mobile let the user message fill the same full width as assistant
     messages (the bubble background then spans the whole message column). */
  [data-phase] [class*="_userStack"],
  [data-phase] [class*="_userStack"] [class*="_bubble"] {
    box-sizing: border-box;
    width: fit-content;
    max-width: 100%;
  }

  /* --- Composer bottom row on mobile ---
     The official row contains two lanes: tools (plus + permission/mode
     controls) and trailing (model + context + send). The previous rules made
     the modes lane flex:none, so its full intrinsic width collided with the
     model selector on narrow phones. Keep fixed hit targets fixed, but let
     text-bearing controls shrink and ellipsize before they paint over the
     trailing lane. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) {
    box-sizing: border-box;
    container-type: inline-size;
    container-name: dsh-mobile-composer;
    flex-wrap: nowrap;
    gap: 6px;
    padding-left: 6px;
    padding-right: 6px;
    /* The dropdown menu is absolutely positioned inside this row; any
       overflow: hidden here would clip it. Inner lanes keep their own
       overflow clipping, so the row itself can stay visible. */
    overflow: visible;
  }
  /* Dual-primary form (subagent view: stop + send). The four-control
     cluster [model][meter][stop][send] overflows the single-row lane the
     nowrap rule above enforces; the model pill is the only shrinkable
     item, so it collapses to zero and the fixed trio loses its auto
     margin (all hug the lane's left edge, send may even paint off-view).
     Restore the official wrap for this form only: the trailing lane
     drops to a second full-width row where the four controls always
     fit. Main-session three-control form keeps single-row layout. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]):has([class*="_primary"] ~ [class*="_primary"]) {
    flex-wrap: wrap;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > :first-child {
    flex: 0 1 auto;
    min-width: 0;
    gap: 6px;
    /* The permission dropdown (Menu, side: top) pops upward from inside the
       tools lane; overflow hidden here would crop it, same as the row. Text
       ellipsis is handled by the trigger label itself. */
    overflow: visible;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > [class*="_trailing"] {
    flex: 1 1 auto;
    min-width: 0;
    gap: 6px;
    /* Must not clip the model dropdown; the model trigger clips its own label. */
    overflow: visible;
  }
  /* PermissionSelect / plan controls share the tools lane. Let the
     permission label use the remaining tools width, while the lower-priority
     plan slot keeps an icon-sized target instead of stealing model width. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > :first-child > :nth-child(2) {
    flex: 0 1 auto;
    min-width: 0;
    max-width: none;
    gap: 4px;
    /* The permission Menu list (side: top) pops upward out of this lane;
       overflow hidden crops it. The trigger label clips its own text. */
    overflow: visible;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > :first-child > :nth-child(2) > [class*="_trigger"] {
    flex: 1 1 auto;
    min-width: 28px;
    max-width: 100%;
    display: flex !important;
    overflow: hidden;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > :first-child > :nth-child(2) > [class*="_trigger"] > [class*="_triggerLabel"] {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }
  /* Slot wrappers such as the live plan chip are not trigger elements. Do
     not force them into an icon-sized box: their child button would overflow
     that wrapper and paint over PermissionSelect. Keep the wrapper intrinsic;
     the model lane below is the one that sacrifices width. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > :first-child > :nth-child(2) > :not([class*="_trigger"]) {
    flex: 0 1 auto;
    min-width: 34px;
    max-width: max-content;
    overflow: visible;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > :first-child > :nth-child(2) > [class*="_wrap"] > [class*="_chip"] {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }
  @container dsh-mobile-composer (max-width: 359px) {
    [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > :first-child > :nth-child(2) > [class*="_trigger"] > [class*="_triggerLabel"] {
      display: none !important;
    }
  }
  /* Model selector: flexible and shrinkable, but never clipped.
     The root must be overflow:visible so the dropdown menu can render.
     The trigger itself clips the label text. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_root"]:has(> [class*="_trigger"][aria-haspopup="menu"]) {
    flex: 0 1 auto;
    min-width: 0;
    overflow: visible;
  }
  @container dsh-mobile-composer (max-width: 359px) {
    [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_root"]:has(> [class*="_trigger"][aria-haspopup="menu"]) {
      flex-basis: auto;
    }
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_root"]:has(> [class*="_trigger"][aria-haspopup="menu"]) > [class*="_trigger"] {
    display: flex !important;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_root"]:has(> [class*="_trigger"][aria-haspopup="menu"]) > [class*="_trigger"] > [class*="_triggerLabel"] {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_root"]:has(> [class*="_trigger"]):not(:has(> [class*="_trigger"][aria-haspopup="menu"])) {
    flex: 0 0 auto;
  }

  /* Model switcher menu: center the dropdown on the now-shrinkable trigger,
     but never let it exceed the viewport on narrow phones. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_root"]:has(> [class*="_trigger"]) > [class*="_menu"] {
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
    max-width: min(320px, calc(100vw - 16px));
    box-sizing: border-box;
  }

  /* --- Fix composer row overflow at narrow widths (320px-360px) ---
     Force every direct child of the tools and trailing lanes to shrink,
     so they can fit within the available space without causing horizontal
     overflow. The fixed-size icon buttons are exempt: officially both are
     flex:none at a fixed size (plus 28x28, send 34x34) and must stay put,
     not participate in adaptation. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > :first-child > :not([class*="_add"]) {
    flex-shrink: 1;
    min-width: 0;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > [class*="_trailing"] > :not([class*="_primary"]) {
    flex-shrink: 1;
    min-width: 0;
  }
  /* Pin the plus button at the left edge of the tools lane: official
     flex:none 28x28, never squeezed by narrower viewports. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > :first-child > [class*="_add"] {
    flex: none;
  }
  /* The context meter in the trailing lane is another fixed-size icon
     control: its trigger is officially width:28px flex:none, but the root
     itself is shrinkable, so a squeezed root lets the trigger paint over
     the pinned send button. Keep the whole meter at its natural size; its
     trigger uses aria-haspopup="dialog", so the model-selector menu rules
     (keyed on "menu") still do not apply. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > [class*="_trailing"] > [class*="_root"] {
    flex: none;
    min-width: 0;
  }
  /* ContextMeter (JObwrW_ hash family) right-cluster pinning: keep the meter
     at its official size (28x28 trigger, 14px ring -- enlarging the ring made
     it steal attention) and glue it to the send button. A small negative
     right margin trims the 6px lane gap to 2px against send. Anchor on the
     unique aria-haspopup="dialog" trigger (no other composer control uses
     it), not the hashed class, so an upstream hash bump cannot silently
     unhook us. Knob: margin-right trim (-4px). */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > [class*="_trailing"] > [class*="_root"]:has(> [class*="_trigger"][aria-haspopup="dialog"]) {
    margin-right: -4px;
  }
  /* The model pill joins the same right cluster: its margin-left:auto absorbs
     ALL trailing slack, so the adaptive void sits between the tools lane and
     the pill (visible on wide phones/tablets), while [pill][meter][send] stay
     welded together at the right edge on every width. Descendant combinator
     on purpose: the pill root sits behind a display:contents wrapper, so a
     direct-child combinator silently misses (probe-verified). Within the
     trailing lane aria-haspopup="menu" belongs to the model trigger alone. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > [class*="_trailing"] [class*="_root"]:has(> [class*="_trigger"][aria-haspopup="menu"]) {
    margin-left: auto;
    margin-right: -4px;
  }
  /* Shrink only the trigger BOX (28 -> 24, padding zeroed) while the ring
     ink stays at its official 14px: the dead inset per side drops from 7px
     to 5px so the small ring no longer floats in its own button. 24x24 keeps
     the WCAG 2.2 minimum target size. Ring size itself is intentionally
     untouched -- enlarging it was rejected as attention-grabbing. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > [class*="_trailing"] > [class*="_root"]:has(> [class*="_trigger"][aria-haspopup="dialog"]) > [class*="_trigger"] {
    width: 24px;
    height: 24px;
    padding: 0;
  }
  /* Slack-absorber priority in the trailing lane: model pill > meter > send.
     Exactly one element carries margin-left:auto so the adaptive void always
     sits BEFORE the welded right cluster, never inside it. The meter itself
     never had an auto before 2026-09-06: in subagent sessions the model seat
     is officially absent (the parent pins the model), and zeroing the send's
     auto on the meter's aria-haspopup="dialog" then left NOTHING to absorb
     slack -- the whole right cluster hugged the lane's left edge (user
     screenshot). Fix: when no model pill renders, the meter root becomes the
     absorber, welding [meter][send] at the right edge like the main view's
     [pill][meter][send]; the send's auto only survives when neither renders. */
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > [class*="_trailing"]:not(:has([class*="_trigger"][aria-haspopup="menu"])) > [class*="_root"]:has(> [class*="_trigger"][aria-haspopup="dialog"]) {
    margin-left: auto;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > [class*="_trailing"] > [class*="_primary"] {
    flex: none;
    margin-left: auto;
  }
  [data-phase] [class*="_card"]:has(textarea, [data-composer-input]) [class*="_row"]:has([class*="_trailing"]) > [class*="_trailing"]:has([class*="_trigger"][aria-haspopup="menu"], > [class*="_root"] > [class*="_trigger"][aria-haspopup="dialog"]) > [class*="_primary"] {
    margin-left: 0;
  }

  /* --- Session header on mobile ---
     Keep the host-owned metadata in one responsive row. The conversation
     title and running/subagent status keep their lanes; the mode text is the
     first to ellipsize when space runs out, while Files keeps its hit area. */
  [data-mobile-nav="frame"] [data-phase] header {
    padding-left: 16px;
    padding-right: 8px;
  }
  [data-mobile-nav="frame"] [data-phase] header > :first-child {
    display: flex !important;
    align-items: center;
    box-sizing: border-box;
    width: 100%;
    min-width: 0;
    gap: 2px;
    padding-left: 20px;
  }
  [data-mobile-nav="frame"] [data-phase] header > :first-child > :first-child {
    display: flex !important;
    align-items: center;
    flex: 1 1 auto;
    min-width: 0;
    gap: 2px;
  }
  /* The directory toggle stays at the far left of the header. */
  [data-mobile-nav="toggle"] {
    position: absolute !important;
    left: 8px !important;
    top: 12px !important;
    z-index: 2 !important;
  }
  /* Files remains in flow and is ordered as the rightmost plugin action. */
  [data-mobile-nav="files"] {
    position: static !important;
    left: auto !important;
    right: auto !important;
    top: auto !important;
    z-index: auto !important;
  }
  [data-mobile-nav="frame"] [data-phase] header [class*="_headerActions"] {
    display: flex !important;
    align-items: center;
    box-sizing: border-box;
    flex: 0 1 auto;
    min-width: 0;
    max-width: calc(100% - 32px);
    margin-left: auto;
    justify-content: flex-end;
    gap: 2px;
  }
  /* The title takes the remaining width and never paints outside it; the
     metadata lane's mode text is what shrinks first. */
  [data-mobile-nav="frame"] [data-phase] header [class*="_crumbs"] {
    flex: 1 1 0;
    min-width: 0;
    max-width: none;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }
  /* Mode label: preserve its icon and scale with the viewport \u2014 it yields
     space to the title and subagent status first, but can use more width on
     wider screens up to 220px before ellipsizing. */
  [data-mobile-nav="frame"] [data-phase] header [class*="_label"]:has(> svg) {
    order: 1;
    flex: 0 1 auto;
    min-width: 0;
    max-width: min(22vw, 220px);
    display: block;
    position: relative;
    box-sizing: border-box;
    padding-left: 18px;
    padding-right: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }
  [data-mobile-nav="frame"] [data-phase] header [class*="_label"]:has(> svg) > svg {
    position: absolute !important;
    left: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
  }
  /* Running/subagent controls keep their full status text and hit area; they
     do not give up width to the mode label. NOTE: the real subagent lineage
     root has class="ZKlsPq_root " \u2014 a TRAILING SPACE from the plugin's
     template-literal className \u2014 so [class*="_root"] never matches it. Use
     [class*="_root"] and exclude the switcher root ([class*="_switcherRoot"])
     so only the count/job roots get pinned (the switcher must stay shrinkable
     so its own title can ellipsize). */
  [data-mobile-nav="frame"] [data-phase] header [class*="_root"]:not([class*="_switcherRoot"]):has(> button[class*="_trigger"]) {
    order: 2;
    flex: 0 0 auto;
    min-width: max-content;
    max-width: max-content;
    white-space: nowrap !important;
    position: static;
  }
  [data-mobile-nav="frame"] [data-phase] header [class*="_root"]:not([class*="_switcherRoot"]):has(> button[class*="_trigger"]) > button,
  [data-mobile-nav="frame"] [data-phase] header [class*="_root"]:not([class*="_switcherRoot"]):has(> button[class*="_trigger"]) > button * {
    white-space: nowrap !important;
  }
  /* The lineage count's leading "/" (ZKlsPq_separator \u2014 official desktop
     chrome rendered only for a root session inside the crumbs) looks like a
     stray extra breadcrumb level on small screens; hide it. The crumbSep "/"
     between ancestry segments (subagent sessions) is a real separator and
     stays. */
  [data-mobile-nav="frame"] [data-phase] header [class*="_crumbs"] [class*="_separator"] {
    display: none !important;
  }
  [data-mobile-nav="frame"] [data-phase] header [data-mobile-nav="files"] {
    order: 3;
    flex: 0 0 28px;
    width: 28px;
  }
  /* Session log download: gone from the header row on mobile (the utilities
     seat holds only the session-log-export capsule). */
  [data-mobile-nav="frame"] [data-phase] header > :first-child > :last-child {
    display: none !important;
  }
  /* View tabs strip (official [role="tablist"] under the crumbs row).
     Desktop ships a single flex row (gap: 36) sized for the two stock tabs
     (\u5BF9\u8BDD/\u8F68\u8FF9). Plugins register further views (memory / skill / todo
     panels, per-plugin settings pages), and once the count passes two the
     shrinkable buttons collapse to their min-content: CJK labels stack one
     glyph per line (staircase), latin labels break word-per-line \u2014 the
     strip eats a screenful of vertical space (#41, 8 tabs, HarmonyOS
     browser). Scroll the strip horizontally instead \u2014 the standard mobile
     tab-bar pattern \u2014 with every label kept whole (flex-shrink: 0 +
     nowrap). Affordance is the peek: the naturally cut-off tab at the right
     edge says "more this way" (unlike the settings navList, whose buttons
     nearly fit and would show no cut edge), which is why this strip scrolls
     while that one wraps. touch-action: pan-x opts the strip into
     horizontal panning \u2014 the root's pan-y intersection stops at this first
     scroll container (same mechanism as the drawer's pan-y), so the page
     never scrolls sideways. overscroll-behavior-x: contain stops a flick
     from chaining past the ends; snap keeps tabs edge-aligned after a
     fling; the scrollbar stays hidden like every native tab bar. */
  [data-mobile-nav="frame"] [data-phase] header [role="tablist"] {
    flex-wrap: nowrap;
    gap: 0 16px;
    overflow-x: auto;
    overscroll-behavior-x: contain;
    scroll-snap-type: x proximity;
    touch-action: pan-x;
    scrollbar-width: none;
  }
  [data-mobile-nav="frame"] [data-phase] header [role="tablist"]::-webkit-scrollbar {
    display: none;
  }
  [data-mobile-nav="frame"] [data-phase] header [role="tablist"] > button {
    flex-shrink: 0;
    white-space: nowrap;
    scroll-snap-align: start;
  }
  /* Header crowding on narrow phones.
     A background-job trigger in the header actions, or the subagent lineage
     count ("N \u4E2A\u5B50\u4EE3\u7406") living inside the crumbs nav, consumes the width the
     mode label would otherwise use. This squeezes the crumbs nav so hard that
     the subagent count is clipped by the nav's overflow:hidden \u2014 the text
     looks overwritten and the trigger's right edge stops being reliably
     tappable. Mode text is the lowest-priority item, so it is compressed
     first. The lineage root (dsh-client-ui-subagent) sits in the crumbs for
     BOTH running and idle descendants, so we key the guards on that root
     rather than the transient running-state dot \u2014 otherwise the count gets
     clipped again the moment agents go idle. Match roots with
     [class*="_root"] (the real class carries a trailing space; [class*="_root"]
     matches nothing). */
  @media (max-width: 440px) {
    [data-mobile-nav="frame"] [data-phase] header [class*="_crumbs"] {
      padding-right: 8px;
    }
    [data-mobile-nav="frame"] [data-phase] header [class*="_headerActions"]:has([class*="_root"]) [class*="_label"]:has(> svg),
    [data-mobile-nav="frame"] [data-phase] header:has([class*="_crumbs"] [class*="_root"]) [class*="_label"]:has(> svg) {
      max-width: 18px;
      min-width: 18px;
      padding-left: 18px;
      padding-right: 0 !important;
    }
  }
  /* When the subagent lineage (any state) AND a background job are present
     together, even the mode icon is not enough room by itself. Keep the full
     subagent count (the reported-overwritten text) by compacting the job
     trigger to its dot/chevron, and keep mode icon-only so the crumbs nav can
     also hold a small right-hand gap \u2014 the subagent text should never sit
     flush against the mode component. */
  @media (max-width: 559px) {
    [data-mobile-nav="frame"] [data-phase] header [class*="_crumbs"] {
      padding-right: 8px;
    }
    [data-mobile-nav="frame"] [data-phase] header:has([class*="_crumbs"] [class*="_root"]) [class*="_headerActions"] [class*="_root"]:not([class*="_switcherRoot"]):has(> button[class*="_trigger"]) [class*="_count"] {
      display: none !important;
    }
    [data-mobile-nav="frame"] [data-phase] header:has([class*="_crumbs"] [class*="_root"]):has([class*="_headerActions"] [class*="_root"]) [class*="_label"]:has(> svg) {
      max-width: 18px;
      min-width: 18px;
      padding-left: 18px;
      padding-right: 0 !important;
    }
  }
  @media (max-width: 359px) {
    [data-mobile-nav="frame"] [data-phase] header:has([class*="_crumbs"] [class*="_root"]):has([class*="_headerActions"] [class*="_root"]) [class*="_label"]:has(> svg) {
      display: none !important;
    }
  }

  /* --- Header popovers on mobile (dsh-client-ui-jobs / dsh-client-ui-subagent) --- */
  /* The official entries sit in the session header actions. Their popovers
     are anchored to the trigger's left edge, so clamp them to the viewport. */
  [data-mobile-nav="frame"] [data-phase] header [class*="_menu"] {
    left: 8px !important;
    right: auto !important;
    width: min(336px, calc(100vw - 16px));
    max-width: none;
    max-height: min(420px, calc(100dvh - 120px));
  }
  /* --- Settings dialog on mobile ---
     Desktop: 800px two-column flex (188px nav + content). Mobile: a
     near-full-width sheet \u2014 nav tabs wrap into rows on top, option rows
     stay horizontal (title+description left, control right). Structural
     selectors are scoped to the unique aria-modal dialog; every
     settings-specific rule is gated with
     :has(> :first-child > :last-child > button) \u2014 the settings nav tab
     list holds <button> tabs, so the transient export dialog (the same
     primitives Modal, header(title+close)+description+body) keeps its
     official centered card layout. Requires :has() support
     (Chromium 105+, 2022).

     The directory picker (dsh-client-ui-directory-picker-browse) must be
     excluded too: its footer bar holds <button> children AND its breadcrumb
     trail (role="navigation") \u2014 which the role gate relies on to exclude
     it \u2014 is REPLACED by the path input in edit mode (pencil button), so
     without the ZuhsRW exclusion clicking the pencil would suddenly match
     this sheet rule: the dialog jumps to the top of the screen, the header
     (with the path input) is hidden by the > :first-child > :first-child
     display:none rule below, and the user can no longer type a path
     (issue #12, 2026-08-16). The picker family keeps the official layout
     on mobile in every mode. */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) {
    position: absolute !important;
    left: 8px !important;
    /* Fixed top (no translateY): a transform on the panel combined with the
       panel overflowing the max-content drawer shifts the fixed overlay's
       coordinate frame, dragging the whole sidebar content off-screen. The
       safe-area inset keeps the sheet below the status bar / notch. */
    top: calc(env(safe-area-inset-top, 0px) + 12px) !important;
    width: calc(100vw - 16px);
    max-width: calc(100vw - 16px);
    /* Height follows the content (no dead space under a short page); it
       caps at 100dvh-24 (less the safe-area top) and the options area
       scrolls only then. */
    height: auto;
    max-height: min(800px, calc(100vh - 24px - env(safe-area-inset-top, 0px)));
    max-height: min(800px, calc(100dvh - 24px - env(safe-area-inset-top, 0px)));
    flex-direction: column !important;
    border-radius: 14px !important;
    animation: dsh-web-mobile-sheet-in .22s var(--ds-ease-out, ease-in-out);
  }
  /* The settings sheet's dimmed mask fades in with the panel (the mask is
     the first child of the overlay that directly contains the sheet). */
  :has(> [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"]))) > :first-child {
    animation: dsh-web-mobile-fade .18s var(--ds-ease-out, ease-in-out);
  }
  @media (prefers-reduced-motion: reduce) {
    [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])),
    :has(> [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"]))) > :first-child {
      animation: none !important;
    }
  }
  /* The export dialog (not the settings sheet) must never overflow the
     viewport: the official centered card can be wider than 390px. */
  [aria-modal="true"]:not(:has(> :first-child > :last-child > button)) {
    max-width: calc(100vw - 32px);
  }
  /* Nav bar: hide the "Settings" caption (redundant on a full-width sheet)
     and wrap the tab list so every tab is visible \u2014 a horizontal scroll cut
     the last tab ("Plugins") off with no affordance to scroll. */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child {
    width: 100%;
    flex-direction: row !important;
    align-items: center;
    gap: 6px;
    padding: 10px 12px 8px;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child > :first-child {
    display: none !important;
  }
  /* The tab list scrolls in the space left by the toolbar: the toolbar
     (config file + close) is reparented INTO this nav row by a client
     reconciler task (settings-toolbar-reparent), so the tab list must be
     anchored by its class, NOT by :last-child (the reparented toolbar
     becomes the nav's new last child). */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child [class*="_navList"] {
    flex: 1 1 auto;
    min-width: 0;
    flex-direction: row !important;
    flex-wrap: wrap;
    gap: 6px;
    overflow: visible;
  }
  /* Content toolbar (Open configuration file + close): grouped flush to
     the right edge, and reparented INTO the nav row on mobile by the
     settings-toolbar-reparent reconciler task, so it shares one line with
     the tabs (user feedback 2026-08-16 \u2014 the toolbar's own row left a
     full-width dead gap under the tabs). Children carry official
     auto-margins that would defeat flex-end, so neutralize them. The close
     button gets a round tappable base so it reads as its own control, not
     part of the outline button.
     Anchored structurally, not by class substring: a bare [class*="_header"]
     also matches every plugin settings card header in the options area \u2014
     the official Plugins config cards (YyYd_a_header) and the dsh-web-ui-all
     group cards (Kwoi6G_header / bpnj3G_header / Jh0q7G_header / jmhvDG_header /
     rUBhvW_header, all sharing the upstream template text-align:left,
     gap:12px, padding:14px 16px). The old broad anchor right-aligned their
     text, gutted the padding and painted a 32px gray circle behind the
     chevron (2026-09-05 sweep: 8 bleeding headers). The toolbar has two
     structural homes, both covered below: after the reparent it is a direct
     child of the nav row ([class*="_nav"]); before the reparent runs it is
     the content column's direct child (the panel's :last-child). Card
     headers live deeper \u2014 inside the options scroll area \u2014 and match
     neither, so no per-plugin hash guards are needed. */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > [class*="_nav"] > [class*="_header"]:not([class*="_headerActions"]),
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :last-child > [class*="_header"]:not([class*="_headerActions"]) {
    flex: 0 0 auto;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 0 0 0 4px;
    min-height: 40px;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > [class*="_nav"] > [class*="_header"]:not([class*="_headerActions"]) > *,
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :last-child > [class*="_header"]:not([class*="_headerActions"]) > * {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > [class*="_nav"] > [class*="_header"]:not([class*="_headerActions"]) > :last-child,
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :last-child > [class*="_header"]:not([class*="_headerActions"]) > :last-child {
    width: 32px;
    height: 32px;
    border-radius: 50% !important;
    display: inline-flex !important;
    align-items: center;
    justify-content: center;
    background: var(--dsw-alias-interactive-bg-hover, rgba(0, 0, 0, .06)) !important;
  }
  /* Appearance mode cards: the official cube row renders three tall
     vertical cards (~268px) that eat half the sheet. Turn them into a
     compact horizontal trio (icon + label inline, equal widths).
     Relies on the official cube-row class name of this version. */
  [aria-modal="true"] [class*="_cubeRow"] {
    gap: 6px;
  }
  [aria-modal="true"] [class*="_cubeRow"] > * {
    flex: 1 1 0;
    flex-direction: row !important;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 8px;
    min-height: 0;
  }
  /* Content: the options scroll area gets bottom breathing room so the last
     row never sits flush against the sheet's rounded corner. */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :last-child {
    flex: 1 1 auto;
    min-height: 0;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :last-child > :last-child {
    padding: 0 12px 24px;
  }
}
`;

// client/mobile/styles/compat.css.ts
var COMPAT_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* ---------- dsh-web-ui family compatibility ----------
     The linxin666 plugin suite extends the shell frame directly:
       - aionui-panel appends two trailing grid columns (explorer / preview)
         plus absolute drag handles to [data-dsh-frame]; its 5-track inline
         grid is already overridden above, but the handles and columns would
         still float over the main UI. On mobile the columns leave the grid
         as floating bottom sheets and keep their own visibility state \u2014
         the suite's collapse chevron / preview tabs still work, so no
         feature is lost. The task-board / ssh plugins inject sidebar
         entries and center-column takeover panels; the entries need
         spacing and the kanban needs scrollable columns. */

  /* Touch devices: the drag handles are useless \u2014 the floating expand
     button is the opener. */
  .aionui-explorer-handle,
  .aionui-preview-handle {
    display: none !important;
  }

  /* Shared base: both columns leave the grid as floating panels. The
     explorer is gated shut by default (its own persisted expanded state
     must never cover the mobile UI on load); the header Files action opens
     it via the frame marker below, and the sheet's own collapse chevron
     clears it. Preview stays owned by the suite (hidden while no tab is
     open). The per-column rules below override the geometry. */
  [data-aionui-explorer-col],
  [data-aionui-preview-col] {
    position: fixed !important;
    z-index: 55 !important;
    background: var(--aion-bg-base, #ffffff) !important;
    border-left: none !important;
  }
  /* \u5BBF\u4E3B\u6CA1\u6709 aionui explorer \u5217\uFF08\u5B98\u65B9 DSH \u4E0D\u5E26 dsh-web-ui\uFF0Cissue #48\uFF09\u65F6\u9690\u85CF
     \u79FB\u52A8\u7AEF\u300C\u6587\u4EF6\u6D4F\u89C8\u300D\u5165\u53E3\uFF08header \u56FE\u6807 + drawer footer \u9879\uFF09\u2014\u2014\u4E0D\u7136\u70B9\u4E86\u6CA1\u53CD\u5E94\u3002 */
  [data-mobile-nav-explorer="0"] [data-mobile-nav="files"],
  [data-mobile-nav-explorer="0"] [data-mobile-nav="explorer"] {
    display: none !important;
  }
  /* ---------- \u5BBF\u4E3B\u300C\u6253\u5F00\u65B9\u5F0F\u300D\u4E0B\u62C9\uFF08Explorer / Git Bash / VS Code \u2026\uFF09 ----------
     \u8BE5\u63A7\u4EF6\u7531 @deepseek-ai/dsh-client-ui-open-in-app \u6CE8\u518C\u8FDB
     conversation.session.header.utilities\uFF08split \u4E3B\u6309\u94AE + chevron \u4E0B\u62C9\uFF09\uFF0C\u662F\u684C\u9762
     \u4E0A\u300C\u628A\u9879\u76EE\u5728\u672C\u5730\u5E94\u7528\u91CC\u6253\u5F00\u300D\u7684\u5165\u53E3\uFF0C\u624B\u673A\u4E0A\u7528\u4E0D\u5230\u8FD8\u6324\u5360\u4F1A\u8BDD\u5934\u90E8 \u2014\u2014 \u6309 slot
     \u7CBE\u786E\u5B9A\u4F4D\u540E\u6574\u5757\u9690\u85CF\uFF08\u4E0D\u9690\u85CF\u6574\u4E2A slot\uFF1Asession-log-export \u7B49\u4E5F\u6CE8\u518C\u5728\u8FD9\u91CC\uFF09\u3002
     class \u662F CSS Module \u54C8\u5E0C\uFF0C_split \u662F\u5B83\u7684\u6A21\u5757\u952E\u540D\uFF1B\u8BE5 slot \u5185\u53EA\u6709\u8FD9\u4E2A\u63A7\u4EF6\u7528
     split \u7ED3\u6784\uFF08deliverables / trajectory \u7684 split \u4E0D\u5728\u6B64 slot\uFF09\u3002 */
  [data-mobile-nav="frame"] [data-slot="conversation.session.header.utilities"] div[class*="_split"] {
    display: none !important;
  }
  /* Explorer (file tree) bottom sheet: bottom edge aligned exactly with
     the composer card's bottom line \u2014 the card sits 36px above the
     viewport bottom (8px composer padding + the 28px stats strip below
     the card), so the sheet uses the same 36px bottom offset. */
  [data-aionui-explorer-col] {
    visibility: hidden !important;
    left: 8px !important;
    right: 8px !important;
    top: auto !important;
    bottom: 36px !important;
    width: auto !important;
    height: min(55dvh, 460px) !important;
    max-height: calc(100dvh - 44px) !important;
    border-radius: 14px !important;
    overflow: hidden !important;
    box-shadow: 0 -4px 28px rgba(0, 0, 0, .18) !important;
    animation: dsh-web-mobile-sheet-up .24s var(--ds-ease-out, ease-in-out) !important;
  }
  /* Preview (file content) bottom sheet. Gated shut by default: the suite
     persists open preview tabs in localStorage and restores them on load,
     which would pop the sheet over the fresh UI. The client only sets the
     frame marker after the user taps a file row in the explorer; the
     suite's own collapse chevron clears it via the visibility watcher. */
  [data-aionui-preview-col] {
    visibility: hidden !important;
    position: fixed !important;
    left: 8px !important;
    right: 8px !important;
    top: auto !important;
    bottom: 40px !important;
    width: auto !important;
    height: min(50dvh, 420px) !important;
    max-height: calc(100dvh - 48px) !important;
    border-radius: 14px !important;
    overflow: hidden !important;
    box-shadow: 0 -4px 28px rgba(0, 0, 0, .18) !important;
    z-index: 56 !important;
    animation: dsh-web-mobile-sheet-up .24s var(--ds-ease-out, ease-in-out) !important;
    /* Fullscreen toggle (issue #8): animate the geometry change instead of
       snapping. visibility is deliberately not listed, so opening/closing
       the sheet stays instant; the open/close keyframes own transform. */
    transition:
      left .24s var(--ds-ease-out, ease-in-out),
      right .24s var(--ds-ease-out, ease-in-out),
      top .24s var(--ds-ease-out, ease-in-out),
      bottom .24s var(--ds-ease-out, ease-in-out),
      width .24s var(--ds-ease-out, ease-in-out),
      height .24s var(--ds-ease-out, ease-in-out),
      border-radius .24s var(--ds-ease-out, ease-in-out),
      box-shadow .24s var(--ds-ease-out, ease-in-out),
      padding-top .24s var(--ds-ease-out, ease-in-out) !important;
  }
  /* User-opened preview sheet (frame marker, set on file-row tap). */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-preview-col] {
    visibility: visible !important;
  }
  /* The Files action opens the explorer sheet (frame marker). */
  [data-mobile-nav="frame"][data-aionui-explorer-open] [data-aionui-explorer-col] {
    visibility: visible !important;
  }
  /* While the preview sheet is up, the explorer sheet yields (two stacked
     bottom sheets would read as one broken overlay). Closing the preview
     via its collapse chevron / tab close clears the marker, and the
     explorer sheet returns. Same specificity as the explorer-open rule, so
     this must stay AFTER it. */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-explorer-col] {
    visibility: hidden !important;
  }
  /* The open drawer must never sit under a sheet: while the frame is in the
     narrow-expanded state both sheets yield (later in the file than the
     open marker rule, so it wins at equal specificity). The fullscreen
     toggle has its own drawer-open rule at the end of its section. */
  [data-mobile-nav="frame"]:not([data-sidebar-collapsed]) [data-aionui-explorer-col],
  [data-mobile-nav="frame"]:not([data-sidebar-collapsed]) [data-aionui-preview-col] {
    visibility: hidden !important;
    display: none !important;
  }
  /* The suite's own expand button reads the store state we bypass on
     mobile \u2014 hide it; the header Files action is the opener. */
  .aionui-floating-expand {
    display: none !important;
  }

  /* Preview sheet fullscreen toggle (issue #8): a fixed button parked in the
     sheet's titlebar row, just left of the suite's collapse chevron (24px at
     right:8px of the sheet, and the sheet spans 8px..(100vw-8px)). The top
     calc mirrors the sheet geometry above (bottom 40px + min(50dvh, 420px));
     when the frame carries "data-mobile-preview-full" the sheet goes
     fullscreen and the button moves to the viewport corner. */
  [data-mobile-nav="preview-full-toggle"] {
    position: absolute !important;
    right: 36px !important;
    top: 8px !important;
    z-index: 57 !important;
    display: none !important;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--aion-text-secondary, var(--dsw-alias-label-secondary, inherit));
    cursor: pointer;
    -webkit-tap-highlight-color: transparent;
    /* Native look: same size/radius/hover language as the suite's tab-bar
       icon buttons (the 20px panelCollapse next to it). The button lives
       INSIDE the preview column, so it rides the sheet's own open
       animation and geometry transition \u2014 no curve matching needed. */
    transition: background-color .15s, top .24s var(--ds-ease-out, ease-in-out);
  }
  [data-mobile-nav="preview-full-toggle"]:hover {
    background: var(--aion-bg-3, rgba(0, 0, 0, .22));
  }
  [data-mobile-nav="preview-full-toggle"]:active {
    background: var(--aion-bg-active, rgba(0, 0, 0, .28));
  }
  [data-mobile-nav="preview-full-toggle"]:focus-visible {
    outline: 2px solid var(--dsw-alias-state-business-primary, #4f6ef7);
    outline-offset: 2px;
  }
  [data-mobile-nav="preview-full-toggle"] svg {
    width: 14px;
    height: 14px;
  }
  /* Keep the last tab (and the "+" URL-tab trigger) from sliding under the
     fullscreen toggle: reserve the right end of the preview tab row. */
  [data-aionui-preview-col] [class*="_tabScroll"] {
    padding-right: 34px !important;
  }
  /* Visible only while the preview sheet is open. Visibility itself is
     inherited from the column, so the sheet's own hide rules (collapse,
     drawer open) cover the button too. */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] {
    display: inline-flex !important;
  }
  /* Icon swap on the frame fullscreen marker. */
  [data-mobile-nav="preview-full-toggle"] .dsh-web-mobile-full-out {
    display: none !important;
  }
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] .dsh-web-mobile-full-in {
    display: none !important;
  }
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] .dsh-web-mobile-full-out {
    display: inline !important;
  }
  /* Fullscreen preview: the sheet fills the whole viewport (notch included);
     the safe-area padding drops the titlebar row below the status bar, and
     the toggle follows the titlebar into the top corner. */
  [data-mobile-nav="frame"][data-aionui-preview-open][data-mobile-preview-full] [data-aionui-preview-col] {
    inset: 0 !important;
    left: 0 !important;
    right: 0 !important;
    top: 0 !important;
    bottom: 0 !important;
    width: 100% !important;
    height: 100dvh !important;
    max-height: none !important;
    box-sizing: border-box !important;
    padding-top: env(safe-area-inset-top, 0px) !important;
    border-radius: 0 !important;
    box-shadow: none !important;
    z-index: 57 !important;
    animation: none !important;
  }
  /* Fullscreen: the column fills the viewport, so the button follows the
     titlebar row down below the notch. */
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] {
    top: calc(env(safe-area-inset-top, 0px) + 8px) !important;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-aionui-preview-col],
    [data-mobile-nav="preview-full-toggle"] {
      transition: none !important;
      animation: none !important;
    }
  }

  /* dsh-web-ui sidebar entries (task board / ssh) sit flush against each
     other \u2014 give the injected rows breathing room. */
  button[data-dsh-taskboard-entry],
  button[data-dsh-ssh-entry] {
    margin-bottom: 8px !important;
  }

  /* Task board: five kanban columns at minmax(0,1fr) crush into ~78px phone
     strips. Give every column a usable minimum and let the row scroll. */
  [data-dsh-taskboard-board] > [class*="_columns"] {
    grid-template-columns: repeat(5, minmax(240px, 1fr)) !important;
    overflow-x: auto !important;
  }
  /* The floating button must not float over a takeover panel (task board /
     ssh own the center column while active). */
  html[data-dsh-taskboard-active] [data-mobile-nav="fab"],
  html[data-dsh-ssh-active] [data-mobile-nav="fab"],
  html[data-dsh-taskboard-active] [data-mobile-nav="backdrop"],
  html[data-dsh-ssh-active] [data-mobile-nav="backdrop"] {
    display: none !important;
  }
  /* Board header: let the search field take the slack instead of squeezing
     the action buttons. */
  [data-dsh-taskboard-board] > [class*="_boardHeader"] [class*="_search"] {
    flex: 1 1 auto !important;
    min-width: 80px !important;
  }

  /* ---------- dsh-web-ui polish: plugin market search ----------
     The market tab row (Discover / Themes / Installed + the plugin search
     box) is a no-wrap flex: at 390px the tabs plus the ~218px search box
     (~475px total) overflow the ~334px sheet and the search box runs off
     the right edge of the screen (it also forces a horizontal scrollbar on
     the sheet's options area). Let the row wrap: the tabs keep the first
     line and the search box gets its own full-width second line. */

  [aria-modal="true"] [class*="_tabs"] {
    flex-wrap: wrap !important;
    row-gap: 8px !important;
  }
  [aria-modal="true"] [class*="_searchInline"] {
    flex: 1 1 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }
  /* iOS Safari auto-zooms a focused input whose computed font-size is below
     16px. dshmarket's tab search uses the shared primitive Input at 13px;
     raise only this market-owned field on mobile so focusing it keeps the
     current viewport scale. Scoped to the market root to avoid changing
     unrelated settings/search fields; pinch zoom stays available. */
  [data-dsh-market-root] [class*="tabSearch"] input,
  [data-dsh-market-root] input[class*="tabSearch"] {
    font-size: 16px !important;
  }

  /* ---------- dshmarket polish: Tasks operations popup ----------
     Upstream .opPanel is a small dropdown pinned to the right edge of its
     ~54px trigger button; on a phone it reads as stuck to the sheet edge
     instead of centered. Promote it to a fixed, viewport-centered card:
     no ancestor between the popup and the viewport carries a transform,
     so position:fixed centers against the real viewport (a plain left:50%
     would resolve against the tiny relative trigger wrapper and land even
     further right). The upstream 86vw width cap, 70vh max-height and
     internal scroll all still apply; the close button stays inside. */
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_opPanel"] {
    position: fixed !important;
    top: 50% !important;
    bottom: auto !important;
    left: 50% !important;
    right: auto !important;
    transform: translate(-50%, -50%) !important;
  }

  /* ---------- dshmarket polish: header title row ----------
     The title row (icon + title + repo link + version + optional
     "Update market" / "Update all" buttons) is a nowrap flex whose
     natural width (~450px with both update buttons) exceeds the ~334px
     sheet. Flex then crushes the flexible items below their content
     width and every label wraps word-by-word \u2014 the "text turns
     vertical" report. Trigger is state-dependent (the buttons only
     exist while plugin updates are pending), which explains the
     sometimes-horizontal/sometimes-vertical flapping. Let the row wrap
     instead: line 1 keeps icon + title + repo + version, the update
     buttons get their own full-width-feeling second line, and the title
     itself is locked to one ellipsized line no matter what follows it. */
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_titleRow"] {
    flex-wrap: wrap !important;
    row-gap: 6px !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_titleRow"] [class*="_title"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    white-space: nowrap !important;
    overflow: hidden !important;
    text-overflow: ellipsis !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_titleRow"] button {
    white-space: nowrap !important;
  }

  /* ---------- dshmarket 1.20+ compat: keep the settings nav visible ----------
     Upstream Market.module.css hides the host dialog's nav on phones
     ([role=dialog]:has([data-dsh-market-root]) > nav { display:none } at
     max-width:560px) so the market can take over the dialog; its comment
     assumes the host keeps "its own close button in the content header".
     Our host's only close \u2715 lives inside that very nav, so the market
     would leave no categories and no way back or out (dead-end UI,
     2026-08-23). Mirror upstream's exact media condition and restore the
     nav: categories row + \u2715 stay above the inline market page. */
  @media (max-width: 560px) {
    [data-mobile-nav="frame"] [role="dialog"]:has([data-dsh-market-root]) > nav {
      display: flex !important;
    }
  }

  /* ---------- dsh-usage-stats polish: usage & balance panel ----------
     The panel's stats row shows three token counters side by side
     (today / month / total). The counters use tabular nowrap figures whose
     min-content width overflows the ~336px panel body on a phone: figures
     clip at the row's edges and the panel grows a horizontal scrollbar.
     Stack the three counters vertically \u2014 full-width rows, so the figures
     always fit. */

  [class*="usg_"][class*="_statsRow"] {
    flex-direction: column !important;
  }
  [class*="usg_"][class*="_stat"]:not([class*="_statsRow"]) {
    flex: 0 0 auto !important;
    width: 100% !important;
    min-width: 0 !important;
  }

  /* ---------- dsh-web-ui polish: settings sheet ----------
     The official dialog is a desktop two-column form; on a phone the
     label/control split leaves a huge dead gap and long descriptions wrap
     into tall stacks. Stack each row (text above, control full-width) and
     keep the nav tabs on ONE horizontally scrolling row. */

  /* Nav tabs: single scrolling row instead of the 3-per-row grid \u2014 seven
     categories wrap into three rows on a phone (~130px of sheet height);
     one row with a thin scrollbar keeps every tab reachable and returns
     that space to the options area (user feedback 2026-08-16). An earlier
     one-row attempt had no scroll affordance and silently cut the last
     tab off; the thin scrollbar IS the affordance. Scoped to the frame
     marker: the desktop dialog keeps its official vertical nav column. */
  [data-mobile-nav="frame"] [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child [class*="_navList"] {
    display: flex !important;
    flex-wrap: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    gap: 6px !important;
    width: 100% !important;
    scrollbar-width: thin !important;
    -webkit-overflow-scrolling: touch !important;
  }
  /* Hairline scrollbar for the tab row: the default WebKit scrollbar reads
     fat on a phone; 2px keeps the scroll affordance without the bulk. */
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_navList"]::-webkit-scrollbar {
    height: 2px !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_navList"]::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-border-l2, rgba(0, 0, 0, .22)) !important;
    border-radius: 1px !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_navList"]::-webkit-scrollbar-track {
    background: transparent !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_navCell"] {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
    padding: 6px 8px !important;
    gap: 6px !important;
    font-size: 13px !important;
    justify-content: flex-start !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_navCell"] svg {
    width: 14px !important;
    height: 14px !important;
    flex: none !important;
  }
  /* Content toolbar: the "Open configuration file" button is hidden on
     mobile \u2014 it is rarely needed on a phone and steals ~180px from the
     tab row's scroll area (user feedback 2026-08-16). Only the close \u2715
     stays, flush right in the nav row. Desktop untouched (frame scoped). */
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_header"]:not([class*="_headerActions"]) [class*="_actions"] {
    display: none !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class*="_header"]:not([class*="_headerActions"]) [class*="_actions"] [class*="_action"]:not([class*="_actions"]) {
    font-size: 13px !important;
    padding: 6px 12px !important;
    min-height: 0 !important;
  }
  /* Setting rows: text on top, control below at full width. Compound
     "_row*" families are excluded: the Models page names its whole card
     list "_rows" (plus "_rowCard/_rowHead/_rowIdentity/_rowActions"), and
     the bare-substring match used to hand the list's first/last cards a
     width:100% that - on the official content-box cards (+14px padding,
     1px border) - ran 30px past their siblings and off-screen. */
  [aria-modal="true"] [class*="_section"] [class*="_row"]:not([class*="_rows"]):not([class*="_rowCard"]):not([class*="_rowHead"]):not([class*="_rowIdentity"]):not([class*="_rowActions"]) {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }
  [aria-modal="true"] [class*="_section"] [class*="_row"]:not([class*="_rows"]):not([class*="_rowCard"]):not([class*="_rowHead"]):not([class*="_rowIdentity"]):not([class*="_rowActions"]) > :first-child {
    width: 100% !important;
    max-width: none !important;
  }
  [aria-modal="true"] [class*="_section"] [class*="_row"]:not([class*="_rows"]):not([class*="_rowCard"]):not([class*="_rowHead"]):not([class*="_rowIdentity"]):not([class*="_rowActions"]) > :last-child {
    width: 100% !important;
    max-width: none !important;
  }
  /* Appearance mode group: give the cube row a consistent bordered
     segmented look (the official borders differ per state). */
  [aria-modal="true"] [class*="_cubeRow"] > * {
    border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12)) !important;
  }

  /* ---------- dsh-web-ui polish: explorer sheet ----------
     The aionui explorer was designed for a desktop side column: compact the
     header, search box and tree rows so a phone shows more entries, and pad
     the scroll bottom so the last row never sits flush on the edge. */

  [data-aionui-explorer-col] [class*="_tabBar"]:not([class*="_tabBarRight"]) {
    height: 36px !important;
  }
  [data-aionui-explorer-col] [class*="_tabBtn"],
  [data-aionui-explorer-col] [class*="_tabBtnActive"] {
    padding: 0 12px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class*="_searchBox"] {
    height: 32px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class*="_treeRow"] {
    height: 30px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class*="_treeRow"] svg {
    width: 14px !important;
    height: 14px !important;
  }
  [data-aionui-explorer-col] [class*="_scrollArea"] {
    padding-bottom: 28px !important;
  }

  /* ---------- dsh-web-ui polish: drawer footer ----------
     The injected footer actions (Files + Session log) become two equal pill
     buttons instead of text-width capsules. */

  /* The official footerActions row also hosts the remote-web-ui entry
     row (two icon buttons); without wrapping the two groups squeeze each
     other on one line. Wrap so each group gets its own full-width row. */
  [data-mobile-nav="frame"] [class*="_footerActions"] {
    flex-wrap: wrap !important;
    gap: 6px !important;
  }
  [data-mobile-nav="drawer-actions"] {
    width: 100% !important;
  }
  [data-mobile-nav="drawer-actions"] > button {
    flex: 1 1 0 !important;
    padding: 0 8px !important;
    white-space: nowrap !important;
  }

  /* ---------- dsh-web-ui polish: floating pet ----------
     The whale-girl pet (dsh-pet) floats at the viewport corner with a
     persisted, draggable position. On phones the pet is scaled down so
     it does not dominate the screen; the plugin's own drag + persist
     still work (the position itself is left alone \u2014 the mobile default
     position is seeded via the pet API to just above the composer). */

  body > [class*="_float"]:has([class*="_sprite"][role="button"]) {
    transform: scale(.66);
    transform-origin: bottom right;
  }
  /* While a modal dialog (settings sheet / export) owns the screen the pet
     floats ABOVE it and covers the dialog content; modal semantics say the
     background is inert, so hide the pet for the modal's lifetime. */
  body:has([aria-modal="true"]) > [class*="_float"]:has([class*="_sprite"][role="button"]) {
    display: none !important;
  }

  /* ---------- dsh-web-ui polish: conversation stats line ----------
     The official session-status row (turns / steps / LLM time / TTFT /
     cache) is long. The client marks the exact row with
     [data-mobile-nav="stats"] (text-anchored, hashed classes can't be
     targeted). Layout: ONE fixed-height (26px) flex strip that scrolls
     horizontally \u2014 the full metrics stream stays reachable by swiping,
     the row never grows vertically, no ellipsis or fade, 8px gaps
     between metric groups, a 2px scrollbar as the swipe affordance. */

  [data-mobile-nav="stats"] {
    display: flex !important;
    flex-flow: row nowrap !important;
    align-items: center !important;
    width: 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
    height: 26px !important;
    min-height: 26px !important;
    max-height: 26px !important;
    box-sizing: border-box !important;
    white-space: nowrap !important;
    overflow-x: auto !important;
    overflow-y: hidden !important;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    scrollbar-width: thin !important;
    scrollbar-color: var(--dsw-alias-border-l1, rgba(0, 0, 0, .28)) transparent !important;
    padding: 0 0 2px !important;
    line-height: 18px !important;
    font-size: 11px !important;
  }
  [data-mobile-nav="stats"]::-webkit-scrollbar {
    height: 2px !important;
  }
  [data-mobile-nav="stats"]::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) !important;
    border-radius: 2px !important;
  }
  [data-mobile-nav="stats"]::-webkit-scrollbar-track {
    background: transparent !important;
  }
  [data-mobile-nav="stats"] > * {
    display: flex !important;
    flex: 0 0 auto !important;
    flex-flow: row nowrap !important;
    align-items: center !important;
    width: max-content !important;
    min-width: max-content !important;
    max-width: none !important;
    white-space: nowrap !important;
    margin-right: 8px !important;
    padding: 0 !important;
  }
  [data-mobile-nav="stats"] > *:last-child {
    margin-right: 0 !important;
  }
  [data-mobile-nav="stats"] * {
    white-space: nowrap !important;
  }

  /* ---------- dsh-genui panel dock ----------
     The genui panel docks above the composer (conversation.input.dock,
     id genui-panel). On a phone its business-blue outline, generous chrome
     and single-line ellipsis read as an unfinished artifact: long titles
     truncate mid-word ("\u2026default b\xB7\xB7\xB7") with the chevron glued to the
     ellipsis, and the pill crowds the composer. Mobile treatment: neutral
     card border matching the composer, tighter chrome so the full title
     fits, chevron with breathing room. Scoped to the mobile frame marker \u2014
     desktop keeps genui's own styling untouched. */

  [data-mobile-nav="frame"] [data-genui-panel] {
    margin: 6px 12px 4px !important;
    border-color: var(--dsw-alias-border-l1, rgba(0, 0, 0, .12)) !important;
    border-radius: 12px !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelToggle"] {
    padding: 7px 12px !important;
    gap: 8px !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelBadge"] {
    padding: 0 7px !important;
    border-radius: 5px !important;
    font-size: 10.5px !important;
    line-height: 1.7 !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelTitle"] {
    flex: 1 1 auto !important;
    min-width: 0 !important;
    font-size: 12.5px !important;
    line-height: 1.45 !important;
  }
  [data-mobile-nav="frame"] [data-genui-panel] [class*="_panelChevron"] {
    flex: none !important;
    margin-left: 0 !important;
    padding-left: 4px !important;
  }

  /* ---------- git-graph branch chip: inside the composer card ----------
     The branch chip (conversation.input.dock) floats between the dock rows
     and the input card; on a phone it reads as a stray capsule crowding the
     composer. A client reconciler task (git-chip-reparent) reparents the
     chip INTO the composer card; these rules pin it to the card's top-left
     and give the card a dedicated chip row. The card is position: relative
     by the official stylesheet, so the absolute anchor resolves against it.
     The plugin's own sheet sets all four offsets on the anchor, so
     right/bottom must be neutralized too. Scope is the frame marker + the
     anchor attribute (NOT the dock slot \u2014 the reparenting moves the chip
     out of the dock's subtree). Desktop untouched: the frame marker only
     exists below 1024px, and the effect restores the chip to the dock when
     the viewport widens. Chip row geometry (2026-08-16, user feedback):
     48px padding left a 16px dead gap between the chip and the input line
     and made the composer read too tall; the row was tuned to 40px = chip
     (24px) at top 12px + ~4px to the textarea. The chip itself has since
     grown to 28px (git-graph chip CSS), which ate the breathing gap, so the
     row is 44px to keep the same ~4px clearance (2026-09-06). */

  [data-mobile-nav="frame"] [data-gitgraph-chip-anchor] {
    position: absolute !important;
    top: 12px !important;
    left: 12px !important;
    right: auto !important;
    bottom: auto !important;
    z-index: 1 !important;
  }
  [data-mobile-nav="frame"] [class*="_card"]:has([data-gitgraph-chip-anchor]) {
    padding-top: 44px !important;
  }
  /* Kill double-tap zoom on the chip wherever it lives (the tap-target trio
     in misc.css is scoped to the dock slot and dies once the reparent moves
     the anchor into the card). Geometry-free: touch-action only. */
  [data-mobile-nav="frame"] [data-gitgraph-chip-anchor] [data-gitgraph-chip] {
    touch-action: manipulation !important;
  }

  /* ---------- dsh-meme \u8868\u60C5\u9009\u62E9\u5361\u7247\uFF1A\u53F3\u7F18\u5B89\u5168\u8DDD\u79BB ----------
     The meme picker (conversation.input.overlay, id meme-picker) is
     absolutely positioned left:0 inside the composer's overlay anchor with
     width:min(360px,90vw). That 90vw resolves against the VIEWPORT, not the
     anchor, and with the picker's own padding+border the border-box
     (377px on a 390px phone) exceeds the 356px anchor \u2014 the card's right
     edge then runs past the anchor and off the right screen edge, while the
     left edge keeps the anchor's 17px safe inset. Stretch the card to the
     anchor on both sides (left/right 0, width auto, border-box) so the
     right gap mirrors the left; cap at the card's original border-box size
     (360px content + 24px padding + 2px border) so tablets keep the
     intended card width instead of stretching. Desktop is untouched: the
     frame marker only exists below 1024px. */
  [data-mobile-nav="frame"] .meme-picker {
    left: 0 !important;
    right: 0 !important;
    width: auto !important;
    box-sizing: border-box !important;
    max-width: 386px !important;
  }

  /* dsh-meme \u7F51\u683C\u7F29\u7565\u56FE\uFF1A\u81EA\u9002\u5E94\u94FA\u6EE1\u5361\u7247,\u4FDD\u7559 8px \u95F4\u9699\u3002
     dsh-meme \u7684 .mp-grid \u662F flex-wrap + \u56FA\u5B9A 76px \u7684 .mp-cell(\u884C\u5185 style \u518D\u538B\u5230 74px):
     3 \u5217(390px \u624B\u673A)\u65F6\u6BCF\u884C\u53F3\u4FA7\u5269 ~78px \u7A7A\u767D,\u5361\u7247\u6CA1\u6709\u94FA\u6EE1\u3002\u6362\u6210\u54CD\u5E94\u5F0F grid:
     repeat(auto-fill, minmax(64px,1fr)) \u8BA9\u5217\u6570\u968F\u53EF\u7528\u5BBD\u5EA6\u4F38\u7F29\u3001\u5361\u7247 width:100% +
     aspect-ratio:1 \u968F\u8F68\u9053\u81EA\u9002\u5E94(\u65B9\u5F62,cover \u88C1\u5207\u4E0D\u53D8),gap \u4ECD\u662F dsh-meme \u7684 8px\u3002
     \u884C\u5185 width/height \u7528 !important \u8986\u76D6;\u624B\u673A\u7AEF\u7EA6 4 \u5217\u3001\u5E73\u677F\u7AEF\u7EA6 5 \u5217,\u5747\u6EE1\u5BBD\u3002 */
  [data-mobile-nav="frame"] .meme-picker .mp-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)) !important;
    scrollbar-width: thin !important;
    scrollbar-color: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) transparent !important;
  }
  [data-mobile-nav="frame"] .meme-picker .mp-cell {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 1 !important;
  }
  /* dsh-meme \u7F51\u683C\u53F3\u4FA7\u6EDA\u52A8\u6761\uFF1A\u9ED8\u8BA4 WebKit \u6EDA\u52A8\u6761\u5728\u624B\u673A\u4E0A\u770B\u592A\u7C97,\u538B\u6210 4px
     \u7EC6\u6761\u2014\u2014\u4FDD\u7559\u6EDA\u52A8\u6307\u793A\u53C8\u4E0D\u5360\u6A2A\u5411\u7A7A\u95F4,thumb \u5706\u89D2\u6D45\u8272\u3001\u8F68\u9053\u900F\u660E\u3002 */
  [data-mobile-nav="frame"] .meme-picker .mp-grid::-webkit-scrollbar {
    width: 4px !important;
  }
  [data-mobile-nav="frame"] .meme-picker .mp-grid::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) !important;
    border-radius: 999px !important;
  }
  [data-mobile-nav="frame"] .meme-picker .mp-grid::-webkit-scrollbar-track {
    background: transparent !important;
  }

  /* ---------- agent preset \u6A21\u5F0F\u9009\u62E9\u83DC\u5355\uFF1A\u624B\u673A\u7AEF\u7D27\u51D1\u5E95\u90E8\u5F39\u5C42 ----------
     The official agent-preset menu (role=menu, portal mounted on body) uses
     position:fixed + max-height:820px + bottom:12px, so on a phone it
     stretches from the trigger down to 12px above the screen bottom \u2014
     effectively filling the screen. Turn it into a polished bottom sheet:
     cap the height, center it horizontally (the official max-width 360px
     left-anchors at left:12px, leaving 12/18px asymmetric gaps), add a
     drag-handle affordance, breathing room, and softer top radius; the
     inner viewport keeps scrolling. Scoped to the agent-preset item class
     (cubgiG_*) so other role=menu dropdowns (model/access mode) are
     untouched. Desktop \u22651024px is outside the media query, so it keeps the
     official large dropdown. */
  /* agent-preset \u83DC\u5355\u4F9D\u8D56 @deepseek-ai/dsh-client-ui-agent-preset \u7684 CSS Module \u54C8\u5E0C (cubgiG_*)\uFF0C\u5347\u7EA7\u8BE5\u5305\u65F6\u9700\u9A8C\u8BC1\u6B64\u9009\u62E9\u5668\u662F\u5426\u4ECD\u6709\u6548 */
  [role="menu"]:has([class*="cubgiG_item"]) {
    top: auto !important;
    left: 50% !important;
    right: auto !important;
    bottom: 12px !important;
    transform: translateX(-50%) !important;
    width: min(100% - 24px, 360px) !important;
    max-width: 360px !important;
    max-height: min(55dvh, 440px) !important;
    padding: 30px 6px 10px !important;
    border-radius: 16px !important;
  }
  [role="menu"]:has([class*="cubgiG_item"])::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: var(--dsw-alias-border-l2, rgba(0, 0, 0, .22)) !important;
    pointer-events: none;
  }
  /* \u83DC\u5355\u5185\u90E8\u6EDA\u52A8\u6761\uFF1A\u9ED8\u8BA4 WebKit \u6EDA\u52A8\u6761\u5728\u7AD6\u5C4F\u592A\u7C97,\u4F1A\u5360 ~15px \u5BBD\u5EA6\u628A\u6587\u5B57\u63CF\u8FF0
     \u6324\u7A84,\u5BFC\u81F4\u63CF\u8FF0\u6362\u884C/\u622A\u65AD\u4E0D\u81EA\u7136\u3002\u538B\u6210 4px \u7EC6\u6761(\u4E0E\u8868\u60C5\u7F51\u683C\u4E00\u81F4),\u6587\u5B57\u533A\u57DF
     \u6062\u590D\u81EA\u9002\u5E94\u5BBD\u5EA6\u3002 */
  [role="menu"]:has([class*="cubgiG_item"]) [class*="_viewport_"] {
    scrollbar-width: thin !important;
    scrollbar-color: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) transparent !important;
  }
  [role="menu"]:has([class*="cubgiG_item"]) [class*="_viewport_"]::-webkit-scrollbar {
    width: 4px !important;
  }
  [role="menu"]:has([class*="cubgiG_item"]) [class*="_viewport_"]::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) !important;
    border-radius: 999px !important;
  }
  [role="menu"]:has([class*="cubgiG_item"]) [class*="_viewport_"]::-webkit-scrollbar-track {
    background: transparent !important;
  }

  /* ---------- dsh-meme \u8868\u60C5\u9009\u62E9\u5361\u7247\uFF1A\u53F3\u7F18\u5B89\u5168\u8DDD\u79BB ----------
     The meme picker (conversation.input.overlay, id meme-picker) is
     absolutely positioned left:0 inside the composer's overlay anchor with
     width:min(360px,90vw). That 90vw resolves against the VIEWPORT, not the
     anchor, and with the picker's own padding+border the border-box
     (377px on a 390px phone) exceeds the 356px anchor \u2014 the card's right
     edge then runs past the anchor and off the right screen edge, while the
     left edge keeps the anchor's 17px safe inset. Stretch the card to the
     anchor on both sides (left/right 0, width auto, border-box) so the
     right gap mirrors the left; cap at the card's original border-box size
     (360px content + 24px padding + 2px border) so tablets keep the
     intended card width instead of stretching. Desktop is untouched: the
     frame marker only exists below 1024px. */
  [data-mobile-nav="frame"] .meme-picker {
    left: 0 !important;
    right: 0 !important;
    width: auto !important;
    box-sizing: border-box !important;
    max-width: 386px !important;
  }

  /* dsh-meme \u7F51\u683C\u7F29\u7565\u56FE\uFF1A\u81EA\u9002\u5E94\u94FA\u6EE1\u5361\u7247,\u4FDD\u7559 8px \u95F4\u9699\u3002
     dsh-meme \u7684 .mp-grid \u662F flex-wrap + \u56FA\u5B9A 76px \u7684 .mp-cell(\u884C\u5185 style \u518D\u538B\u5230 74px):
     3 \u5217(390px \u624B\u673A)\u65F6\u6BCF\u884C\u53F3\u4FA7\u5269 ~78px \u7A7A\u767D,\u5361\u7247\u6CA1\u6709\u94FA\u6EE1\u3002\u6362\u6210\u54CD\u5E94\u5F0F grid:
     repeat(auto-fill, minmax(64px,1fr)) \u8BA9\u5217\u6570\u968F\u53EF\u7528\u5BBD\u5EA6\u4F38\u7F29\u3001\u5361\u7247 width:100% +
     aspect-ratio:1 \u968F\u8F68\u9053\u81EA\u9002\u5E94(\u65B9\u5F62,cover \u88C1\u5207\u4E0D\u53D8),gap \u4ECD\u662F dsh-meme \u7684 8px\u3002
     \u884C\u5185 width/height \u7528 !important \u8986\u76D6;\u624B\u673A\u7AEF\u7EA6 4 \u5217\u3001\u5E73\u677F\u7AEF\u7EA6 5 \u5217,\u5747\u6EE1\u5BBD\u3002 */
  [data-mobile-nav="frame"] .meme-picker .mp-grid {
    display: grid !important;
    grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)) !important;
    scrollbar-width: thin !important;
    scrollbar-color: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) transparent !important;
  }
  [data-mobile-nav="frame"] .meme-picker .mp-cell {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 1 !important;
  }
  /* dsh-meme \u7F51\u683C\u53F3\u4FA7\u6EDA\u52A8\u6761\uFF1A\u9ED8\u8BA4 WebKit \u6EDA\u52A8\u6761\u5728\u624B\u673A\u4E0A\u770B\u592A\u7C97,\u538B\u6210 4px
     \u7EC6\u6761\u2014\u2014\u4FDD\u7559\u6EDA\u52A8\u6307\u793A\u53C8\u4E0D\u5360\u6A2A\u5411\u7A7A\u95F4,thumb \u5706\u89D2\u6D45\u8272\u3001\u8F68\u9053\u900F\u660E\u3002 */
  [data-mobile-nav="frame"] .meme-picker .mp-grid::-webkit-scrollbar {
    width: 4px !important;
  }
  [data-mobile-nav="frame"] .meme-picker .mp-grid::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) !important;
    border-radius: 999px !important;
  }
  [data-mobile-nav="frame"] .meme-picker .mp-grid::-webkit-scrollbar-track {
    background: transparent !important;
  }

  /* ---------- agent preset \u6A21\u5F0F\u9009\u62E9\u83DC\u5355\uFF1A\u624B\u673A\u7AEF\u7D27\u51D1\u5E95\u90E8\u5F39\u5C42 ----------
     The official agent-preset menu (role=menu, portal mounted on body) uses
     position:fixed + max-height:820px + bottom:12px, so on a phone it
     stretches from the trigger down to 12px above the screen bottom \u2014
     effectively filling the screen. Turn it into a polished bottom sheet:
     cap the height, center it horizontally (the official max-width 360px
     left-anchors at left:12px, leaving 12/18px asymmetric gaps), add a
     drag-handle affordance, breathing room, and softer top radius; the
     inner viewport keeps scrolling. Scoped to the agent-preset item class
     (cubgiG_*) so other role=menu dropdowns (model/access mode) are
     untouched. Desktop \u22651024px is outside the media query, so it keeps the
     official large dropdown. */
  /* agent-preset \u83DC\u5355\u4F9D\u8D56 @deepseek-ai/dsh-client-ui-agent-preset \u7684 CSS Module \u54C8\u5E0C (cubgiG_*)\uFF0C\u5347\u7EA7\u8BE5\u5305\u65F6\u9700\u9A8C\u8BC1\u6B64\u9009\u62E9\u5668\u662F\u5426\u4ECD\u6709\u6548 */
  [role="menu"]:has([class*="cubgiG_item"]) {
    top: auto !important;
    left: 50% !important;
    right: auto !important;
    bottom: 12px !important;
    transform: translateX(-50%) !important;
    width: min(100% - 24px, 360px) !important;
    max-width: 360px !important;
    max-height: min(55dvh, 440px) !important;
    padding: 30px 6px 10px !important;
    border-radius: 16px !important;
  }
  [role="menu"]:has([class*="cubgiG_item"])::before {
    content: '';
    position: absolute;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 36px;
    height: 4px;
    border-radius: 999px;
    background: var(--dsw-alias-border-l2, rgba(0, 0, 0, .22)) !important;
    pointer-events: none;
  }
  /* \u83DC\u5355\u5185\u90E8\u6EDA\u52A8\u6761\uFF1A\u9ED8\u8BA4 WebKit \u6EDA\u52A8\u6761\u5728\u7AD6\u5C4F\u592A\u7C97,\u4F1A\u5360 ~15px \u5BBD\u5EA6\u628A\u6587\u5B57\u63CF\u8FF0
     \u6324\u7A84,\u5BFC\u81F4\u63CF\u8FF0\u6362\u884C/\u622A\u65AD\u4E0D\u81EA\u7136\u3002\u538B\u6210 4px \u7EC6\u6761(\u4E0E\u8868\u60C5\u7F51\u683C\u4E00\u81F4),\u6587\u5B57\u533A\u57DF
     \u6062\u590D\u81EA\u9002\u5E94\u5BBD\u5EA6\u3002 */
  [role="menu"]:has([class*="cubgiG_item"]) [class*="_viewport_"] {
    scrollbar-width: thin !important;
    scrollbar-color: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) transparent !important;
  }
  [role="menu"]:has([class*="cubgiG_item"]) [class*="_viewport_"]::-webkit-scrollbar {
    width: 4px !important;
  }
  [role="menu"]:has([class*="cubgiG_item"]) [class*="_viewport_"]::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-label-tertiary, rgba(0, 0, 0, .3)) !important;
    border-radius: 999px !important;
  }
  [role="menu"]:has([class*="cubgiG_item"]) [class*="_viewport_"]::-webkit-scrollbar-track {
    background: transparent !important;
  }

/* \u641C\u7D22\u6846\u5E95\u90E8\u95F4\u8DDD\u4FEE\u590D */
[aria-modal="true"] [class*="tabSearchRow"] {
  padding: 2px 4px 16px !important;
}


/* ===== \u5DF2\u5B89\u88C5\u5217\u8868\uFF1A\u8DEF\u5F84\u5355\u884C\u622A\u65AD ===== */
[class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > div > [class*="spec"] {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 100% !important;
  font-size: 12px !important;
}
[class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > div > [class*="nm"] {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 100% !important;
}
/* ===== \u5DF2\u5B89\u88C5\u5217\u8868\uFF1A\u624B\u673A\u7AEF\u7EB5\u5411\u91CD\u6392 ===== */
@media (max-width: 1023px) and (pointer: coarse) {
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) {
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 4px 10px !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > div:first-child {
    flex: 1 1 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > [class*="grow"] {
    flex: 1 1 auto !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > button {
    flex: 0 0 auto !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > button[class*="switch"] {
    order: 3 !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > button:not([class*="switch"]) {
    order: 2 !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > [class*="owner"] {
    order: 1 !important;
  }
  [class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"]) > [class*="grow"] {
    order: 0 !important;
  }
}
/* ===== \u5E02\u573A\u5361\u7247\u56FE\u7247\u5BB9\u5668\uFF1A\u6A2A\u5411\u6EDA\u52A8 ===== */
[data-mobile-nav="frame"] [class*="cardShots"] {
  display: flex !important;
  flex-wrap: nowrap !important;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch !important;
  scrollbar-width: thin !important;
  min-width: 0 !important;
  width: 100% !important;
  max-width: 100% !important;
  gap: 8px !important;
  padding: 4px 0 !important;
}
[data-mobile-nav="frame"] [class*="cardShots"] > [class*="cardShot"] {
  flex: 0 0 min(100%, 420px) !important;
  width: min(100%, 420px) !important;
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
  object-fit: contain !important;
}
[data-mobile-nav="frame"] [class*="cardShots"]::-webkit-scrollbar {
  height: 4px !important;
}
[data-mobile-nav="frame"] [class*="cardShots"]::-webkit-scrollbar-thumb {
  background: var(--ds-border-color, #ccc) !important;
  border-radius: 4px !important;
}

  /* ---------- dsh-file-viewer (conversation.view tab\u300C\u6587\u4EF6\u67E5\u770B\u5668\u300D) ----------
     The plugin ships NO responsive CSS: its min-width:0 flex panels overflow
     on a phone \u2014 the titlebar caps the path at 520px beside a 5-button action
     row, and CSV/code headers row-stick inside content scrollers. It renders
     inline into the conversation view region (stable 'dsfv-*' prefix, injected
     <style>), not a modal sheet, so the fixes here are: stop the PANEL from
     scrolling horizontally (leave horizontal scrolling inside the content
     scrollers), compress the titlebar/statusbar, enlarge touch targets, and
     scope everything under [data-file-viewer-open] so only the active
     file-viewer tab is affected. The marker is owned by the
     file-viewer-open-marker reconciler task; nothing leaks to desktop because
     this whole block lives inside the mobile media query.
     (Port of community fork fix 2ff7976.) */

  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-panel {
    min-width: 0 !important;
    max-width: 100% !important;
    overflow-x: hidden !important;
  }
  /* Titlebar: single compact row; path truncates, secondary meta hides on
     narrow, the 5-button action row wraps to two rows of tall targets. */
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-titlebar {
    gap: 4px !important;
    padding: 6px 8px !important;
    flex-wrap: nowrap !important;
    min-width: 0 !important;
  }
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-titlebar-path {
    min-width: 0 !important;
    padding-right: 4px !important;
  }
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-path {
    font-size: 13px !important;
    min-width: 0 !important;
    max-width: 220px !important;
  }
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-titlebar-actions {
    flex-wrap: wrap !important;
    gap: 4px !important;
    justify-content: flex-end !important;
    margin-left: auto !important;
  }
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-toolbar-btn {
    min-height: 34px !important;
    padding: 0 10px !important;
    font-size: 13px !important;
  }
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-icon-btn,
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-back-btn {
    min-height: 34px !important;
    min-width: 34px !important;
  }
  @media (max-width: 480px) {
    [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-meta {
      display: none !important;
    }
  }
  /* Status bar: wrap, safe-area bottom padding, compact. */
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-statusbar {
    flex-wrap: wrap !important;
    gap: 4px 10px !important;
    padding: 4px 8px calc(4px + env(safe-area-inset-bottom, 0px)) !important;
    font-size: 12px !important;
  }
  /* Content scrollers must own horizontal scrolling; the flex columns and the
     renderer stack must not let content push the panel wide. */
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-renderer,
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-renderer-stack,
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-scroll,
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-csv-scroll,
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-code-body {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-scroll,
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-csv-scroll {
    overflow-x: auto !important;
    -webkit-overflow-scrolling: touch !important;
  }
  /* Browser / subtoolbar rows wrap; file rows get touch-friendly height. */
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-browser-nav,
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-subtoolbar {
    flex-wrap: wrap !important;
    gap: 6px !important;
    padding: 4px 8px !important;
  }
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-file-row {
    min-height: 44px !important;
    padding: 8px 10px !important;
  }
  [data-mobile-nav="frame"][data-file-viewer-open] .dsfv-file-list [class*="name"] {
    min-width: 0 !important;
  }
  /* Produced-file chips render in the conversation tail, outside the viewer
     tab \u2014 keep tappable but not scoped to the marker. */
  [data-mobile-nav="frame"] .dsfv-produced-chip,
  [data-mobile-nav="frame"] .dsfv-produced-folder {
    min-height: 40px !important;
    padding: 0 12px !important;
  }
  @media (prefers-reduced-motion: reduce) {
    [data-mobile-nav="frame"][data-file-viewer-open] [class*="dsfv-"] {
      transition: none !important;
      animation: none !important;
    }
  }
}

`;

// client/mobile/styles/misc.css.ts
var MISC_CSS = `@media (max-width: 1023px) and (pointer: coarse) {
  /* ---------- hero composer on mobile ----------
     The official hero card carries a 2-line textarea plus a tall tool row,
     which reads oversized on a phone. Tighten the empty-state rhythm: keep
     the official centered hero, shrink the textarea line box, slim the card
     padding and the tool row, and close the gap under the headline. */

  [data-phase="hero"] [class*="_card"]:has(textarea, [data-composer-input]) {
    gap: 8px !important;
  }
  /* Cards carrying the reparented git branch chip must keep compat.css's
     44px chip clearance: that rule sets padding-top: 44px on any card that
     contains the absolutely-positioned chip anchor (top 12px + 28px chip \u2014
     the chip grew 24\u219228px, so the clearance grew 40\u219244px to keep the same
     ~4px breathing gap). This compact override used to stomp it back to 6px
     with the same specificity (this sheet loads after compat), so on the
     hero empty state the chip painted over the input line (2026-09-06).
     Excluding chip-bearing cards restores the clearance; the textarea
     collapse below still applies to them. */
  [data-phase="hero"] [class*="_card"]:has(textarea, [data-composer-input]):not(:has([data-gitgraph-chip-anchor])) {
    padding-top: 6px !important;
  }
  /* The official composer autosizes the textarea and writes an inline
     height (2 lines on the hero empty state) on the textarea's scroll/grow
     wrappers. :placeholder-shown lets us collapse the EMPTY state to one
     line with !important; as soon as the user types, the pseudo-class no
     longer matches and the autosizer's inline height takes over again \u2014 so
     multi-line growth keeps working. */
  [data-phase="hero"] textarea:placeholder-shown {
    height: 28px !important;
  }
  [data-phase="hero"] [class*="_card"]:has(textarea:placeholder-shown) > [class*="_scroll"],
  [data-phase="hero"] [class*="_card"]:has(textarea:placeholder-shown) [class*="_grow"] {
    height: 28px !important;
  }
  /* DSH 0.1.2: the input is a Lexical contentEditable (no textarea) and the
     empty state is signalled by the separate [data-composer-placeholder]
     node, so mirror the one-line collapse for that shape. */
  [data-phase="hero"] [class*="_card"]:has([data-composer-placeholder]) [data-composer-input] {
    height: 28px !important;
  }
  [data-phase="hero"] [class*="_card"]:has([data-composer-placeholder]) > [class*="_scroll"],
  [data-phase="hero"] [class*="_card"]:has([data-composer-placeholder]) [class*="_grow"] {
    height: 28px !important;
  }
  [data-phase="hero"] [class*="_card"]:has(textarea, [data-composer-input]) > [class*="_row"] {
    padding-top: 2px !important;
  }
  [data-phase="hero"] [class*="_headline"] {
    line-height: 1.15 !important;
    margin-bottom: 0 !important;
  }
  [data-phase="hero"] [class*="_stack"] {
    gap: 0 !important;
  }

  /* ---------- composer dock: swap git branch chip with the todo card ----------
     The git-graph branch chip (conversation.input.dock, order 100) floats
     alone at the bottom-left above the input card, with a dead zone to its
     right; the full-width todo card (order 0) sits above it. Swap them so
     the chip reads as the stack's top row and the todo card fills the row
     above the composer. The dock container itself is display:contents
     (inline style) \u2014 its children are direct flex items of the composer
     stack, so order on the children is what reorders them. Only the chip
     needs an order change: -1 puts it before the todo card (order 0) and
     before the input card (order 0, later in DOM). The todo card must KEEP
     its order 0 \u2014 raising it past the input card's order 0 would drop it
     below the composer entirely (2026-08-16 regression, fixed). The queue
     strip (order 20) keeps hugging the input card. Desktop untouched (this
     block lives inside the max-width: 1023px media query). */
  [data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor] {
    order: -1 !important;
  }
  /* Mobile tap target + feedback for the branch chip (git-graph, 24px
     desktop spec). Two real-world problems: \u2460 the chip is tiny and sits
     right above the expandable todo card \u2014 mis-taps land on the todo card;
     \u2461 opening the popover waits for the host's /git/branches round-trip
     (~700ms on device) with zero feedback, so users tap again and toggle
     the popover closed. Enlarge the target, kill double-tap zoom delay,
     and give an instant pressed state so a tap reads as registered. */
  [data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor] [data-gitgraph-chip] {
    touch-action: manipulation !important;
    min-height: 34px !important;
    padding: 0 12px !important;
    font-size: 13px !important;
  }
  [data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor] [data-gitgraph-chip]:active {
    transform: scale(.96) !important;
    transition: transform .12s !important;
  }

  /* ---------- ask question composer (ask_user_question): kill iOS Safari
      input-focus auto-zoom ----------
      Safari on iPhone enlarges the whole viewport when a focused <input> /
      <textarea> computes font-size < 16px, and only reverts on blur. The ask
      dialog is a modal composer takeover, so taps outside never blur the
      field and the magnification persists until the field loses focus
      (e.g. the dialog is dismissed). The ask
      composer's custom-answer <input> (.customInput) and optionless free-form
      <textarea> (.customTextarea) both ship at 14px (ui-user-questions
      QuestionComposer.module.css). Raise them to 16px on mobile so Safari
      sees a >=16px field and skips the zoom entirely. Scoped to the ask
      composer's stable [data-question-key] root (AGENTS.md: scope hashed-class
      selectors to the owning region, prefer stable data-* markers); the
      class-name suffix match follows the plugin's established harness
      CSS-module convention (verified against the live app: generated names
      end with the original local name, e.g. uV2eYG_input / qDHVXG_searchInput). */
  [data-question-key] [class*="_customInput"],
  [data-question-key] [class*="_customTextarea"] {
    font-size: 16px !important;
  }

  /* ---------- dsh-file-viewer inputs: kill iOS Safari auto-zoom ----------
     Same rule as the ask composer above: the file viewer's search / jump-to-
     line / pdf-page fields ship at 13-14px, which Safari auto-magnifies on
     focus inside a panel that does not blur on tap-away. Raise them to 16px
     on mobile so Safari skips the zoom. Scoped to the frame marker; the
     viewer itself is scoped by its stable dsfv prefix.
     (Port of community fork fix 2ff7976.) */
  [data-mobile-nav="frame"] [class*="dsfv-search-input"],
  [data-mobile-nav="frame"] [class*="dsfv-jump-input"],
  [data-mobile-nav="frame"] [class*="dsfv-page-input"] {
    font-size: 16px !important;
  }

  /* ---------- iOS WebKit: hold every text field at >=16px so Safari never
      focus-zooms the viewport (#45) ----------
      Report (iPhone 15 Pro Max): the page magnifies as soon as a field takes
      focus, sometimes also when switching sessions (the host composer mounts
      with autoFocus), and it stays magnified until the app is closed and
      reopened or rotated landscape->portrait.
      Mechanism: iOS Safari enlarges the visual viewport whenever a focused
      input / textarea computes below 16px, and it only zooms back out on
      blur \u2014 a chat shell keeps the composer focused, so the zoom has no
      moment to revert; before this fix the root touch-action also withheld
      pinch-zoom, so the user could not pull it back out either (see
      layout.css.ts). maximum-scale=1 in the viewport meta is NOT the fix:
      iOS 10+ ignores it for user pinch zoom while other engines honor it, so
      writing it would only take zoom away from Android. Raising the fields is
      the fix that stays inside the standard.
      Gated on html[data-mobile-nav-ios] (phone-chrome.ts detectIosWebKit)
      because only WebKit on iOS zooms on focus: Android and desktop keep the
      compact 13px search boxes they were designed with. The floor covers
      every text-entry field on the page, including the ones portalled
      outside the frame (settings dialogs, the market sheet, third-party
      panels) \u2014 a phone can reach all of them. Button-like and widget inputs
      are excluded (nothing to type, no keyboard), and select is left alone on
      purpose: it would break the composer's 28px access-mode control, and a
      native picker overlays the screen instead of leaving a zoomed page
      behind. The composer's mirror / backdrop layers ride along with the
      textarea: they measure the autosize height and paint the highlight, so
      all three must share one font-size or the caret drifts off the text
      (they inherit 16px from the host card today \u2014 the rule locks that in on
      hosts whose composer ships smaller).
      The contenteditable branch is the forward-looking one: dsh
      0.1.2-rc.1 replaces the composer textarea with a Lexical
      contenteditable whose card reads font-size:
      var(--dsh-content-font-size, 14px), i.e. 14px by default \u2014 squarely in
      the zoom-triggering range. Match the attribute rather than the value
      "true" (Lexical writes "true", other hosts use plaintext-only or the
      bare attribute) and exclude contenteditable="false", which Lexical puts
      on decorator nodes inside the editor. */
  html[data-mobile-nav-ios] textarea,
  html[data-mobile-nav-ios] [contenteditable]:not([contenteditable="false"]),
  html[data-mobile-nav-ios] [data-input-mirror],
  html[data-mobile-nav-ios] [data-input-backdrop],
  html[data-mobile-nav-ios] input:not([type="button"]):not([type="checkbox"]):not([type="color"]):not([type="file"]):not([type="hidden"]):not([type="image"]):not([type="radio"]):not([type="range"]):not([type="reset"]):not([type="submit"]) {
    font-size: 16px !important;
  }

  /* ---------- drawer session tree: skip off-screen rendering ----------
     The drawer mounts ~389 nodes at once (the open gesture early-commits
     the host state while the drawer is still off-screen), and during
     streaming every token commit re-lays-out tree rows that are not even
     visible. content-visibility: auto lets the engine skip layout and
     paint of the session tree while it is outside the viewport (the arm
     moment of the open gesture) and of off-screen rows when the drawer is
     open on a long conversation. contain-intrinsic-size keeps the scroll
     geometry stable while rows are skipped. Scoped to the drawer tree via
     the frame marker + first child so the explorer sheet tree (a different
     subtree) is not affected. Measured with CDP Tracing on an empty
     conversation at 1x CPU (2026-08-29): biggest script task 104 -> 66ms,
     max rAF gap 167 -> 33ms; the benefit scales with conversation length.
     Desktop untouched (this block lives inside the max-width: 1023px
     media query). */
  [data-mobile-nav="frame"] > :first-child [role="tree"] {
    content-visibility: auto;
    contain-intrinsic-size: auto 600px;
  }
}

/* ---------- tablet / wide mobile: keep sheets from becoming full-width ----------
   Below 768px the near-full-width sheets are the right call for a phone.
   On wider but still sub-desktop viewports (foldables, tablet portrait,
   desktop-mode tall windows) the same full-bleed sheet leaves content
   clustered at the left edge with a large dead zone on the right. Cap and
   center the modal sheets and the aionui bottom sheets instead. */
@media (min-width: 768px) and (max-width: 1023px) and (pointer: coarse) {
  /* All modal dialogs: centered, never edge-to-edge. The settings sheet has
     a higher-specificity full-width rule above, so repeat its selector here
     to win; the generic export/other-modal rule is covered by the second
     selector. */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])),
  [aria-modal="true"]:not(:has(> :first-child > :last-child > button)) {
    left: 0 !important;
    right: 0 !important;
    margin-left: auto !important;
    margin-right: auto !important;
    width: min(calc(100vw - 32px), 720px) !important;
    max-width: min(calc(100vw - 32px), 720px) !important;
  }

  /* The dsh-web-ui explorer / preview bottom sheets: same treatment \u2014 keep
     the mobile bottom-sheet behavior, but stop them spanning the full width. */
  [data-aionui-explorer-col],
  [data-aionui-preview-col] {
    left: 0 !important;
    right: 0 !important;
    width: min(calc(100vw - 32px), 720px) !important;
    margin-left: auto !important;
    margin-right: auto !important;
  }

  /* Settings sections (e.g. Agent presets) often carry a desktop max-width
     (720px) that leaves a dead strip on the right once the sheet is capped to
     the same width; let them fill the sheet body instead. */
  [aria-modal="true"] [class*="_section"] {
    width: 100% !important;
    max-width: none !important;
  }
}

/* ---------- desktop / non-touch: the mobile controls must never appear ----------
   Exact complement of the mobile query "(max-width: 1023px) and (pointer:
   coarse)" as a comma list (NOT A or NOT B): any viewport \u22651024px, plus any
   narrow viewport whose primary pointer is a mouse (fine) or absent (none).
   The pointer terms are what keep the header Files button off narrow desktop
   windows \u2014 the slot renders the buttons at every width, so before this the
   only guard was the width term (2026-08-30 PC leak: split windows and OS
   display scaling dropped the CSS viewport below 1024px and armed the whole
   mobile shell on desktop).

   The session-delete trio (menu item + confirm/error dialog) is the ONE
   deliberate exception: its effect arms on TOUCH_QUERY (pointer: coarse at
   every width \u2014 large tablets in landscape), so it lives in the pointer-only
   block below instead of this width arm. */

@media (min-width: 1024px), (pointer: fine), (pointer: none) {
  [data-mobile-nav="toggle"],
  [data-mobile-nav="files"],
  [data-mobile-nav="fab"],
  [data-mobile-nav="backdrop"],
  [data-mobile-nav="session-log"],
  [data-mobile-nav="explorer"],
  [data-mobile-nav="preview-full-toggle"],
  [data-mobile-nav="drawer-actions"] {
    display: none !important;
  }
}

/* Session-delete trio: hide on mouse-driven or pointer-less windows at ANY
   width. No width term \u2014 the injection is armed on touch at every width, so
   a width arm here would hide the item on wide touch (the device class the
   injection exists for). */
@media (pointer: fine), (pointer: none) {
  [data-mobile-nav="session-delete"],
  [data-mobile-nav="delete-dialog-backdrop"],
  [data-mobile-nav="delete-dialog"] {
    display: none !important;
  }
}
`;

// client/mobile/styles/index.ts
var MOBILE_CSS = [BASE_CSS, LAYOUT_CSS, COMPAT_CSS, MISC_CSS].join("\n");

// client/mobile/effects/gesture-guard.ts
var consumed = /* @__PURE__ */ new Map();
var strokeLocked = false;
function markStrokeLocked() {
  strokeLocked = true;
}
function clearStrokeLocked() {
  strokeLocked = false;
}
function isStrokeLocked() {
  return strokeLocked;
}
function isElementLike(value) {
  return typeof value === "object" && value !== null && "parentElement" in value && value.parentElement !== void 0;
}
function markGestureConsumed(target, windowMs, upTo) {
  const until = performance.now() + windowMs;
  if (!isElementLike(target)) {
    consumed.set(target, until);
    return;
  }
  let el = target;
  while (el !== null) {
    consumed.set(el, until);
    if (el === upTo) break;
    el = isElementLike(el.parentElement) ? el.parentElement : null;
  }
}
function consumeIfGestured(event) {
  const now = performance.now();
  const target = event.target;
  if (!isElementLike(target)) {
    for (const [t, until] of consumed) {
      if (until <= now) consumed.delete(t);
    }
    return false;
  }
  let el = target;
  while (el !== null) {
    const until = consumed.get(el);
    if (until !== void 0) {
      if (until <= now) {
        consumed.delete(el);
      } else {
        return true;
      }
    }
    el = isElementLike(el.parentElement) ? el.parentElement : null;
  }
  return false;
}

// client/mobile/core/reconciler-core.ts
function createReconcilerCore(options) {
  const onError = options.onError ?? ((taskName, error, phase) => {
    console.error(
      `[dsh-web-mobile] reconciler task ${taskName}${phase === "dispose" ? " dispose" : ""} failed`,
      error
    );
  });
  const registered = /* @__PURE__ */ new Set();
  let active = null;
  let dirty = /* @__PURE__ */ new Set();
  let forceAll = false;
  let pending = null;
  const runEnsure = (task) => {
    try {
      task.ensure();
    } catch (error) {
      onError(task.name, error, "ensure");
    }
  };
  const runDispose = (task) => {
    try {
      task.dispose();
    } catch (error) {
      onError(task.name, error, "dispose");
    }
  };
  const flush = () => {
    if (pending !== null) {
      pending();
      pending = null;
    }
    if (active === null) {
      dirty.clear();
      forceAll = false;
      return;
    }
    if (forceAll) {
      for (const task of active) runEnsure(task);
    } else if (dirty.size > 0) {
      for (const task of active) {
        const scopes = task.scopes;
        if (scopes === void 0 || scopes.some((key) => dirty.has(key))) runEnsure(task);
      }
    }
    dirty.clear();
    forceAll = false;
  };
  const schedule = () => {
    if (pending !== null) return;
    pending = options.requestFrame(() => {
      pending = null;
      flush();
    });
  };
  const register = (task) => {
    registered.add(task);
    if (active !== null) {
      active.add(task);
      runEnsure(task);
    }
    return () => {
      registered.delete(task);
      if (active !== null) {
        active.delete(task);
        runDispose(task);
      }
    };
  };
  const activate = () => {
    if (active !== null) return;
    active = new Set(registered);
    forceAll = true;
    flush();
  };
  const deactivate = () => {
    if (pending !== null) {
      pending();
      pending = null;
    }
    dirty.clear();
    forceAll = false;
    if (active !== null) {
      const snapshot = active;
      active = null;
      for (const task of snapshot) runDispose(task);
    }
  };
  return {
    get size() {
      return registered.size;
    },
    register,
    activate,
    deactivate,
    note: (keys) => {
      for (const key of keys) dirty.add(key);
      schedule();
    },
    flush
  };
}

// client/mobile/effects/aionui-compat.ts
function installAionuiCompat(ctx) {
  installMobileEffect(ctx, "dsh-web-mobile: aionui explorer close marker", () => {
    const onChevronClick = (event) => {
      const target = event.target;
      if (target === null || !target.closest(".aionui-collapse-chevron")) return;
      getFrame()?.removeAttribute("data-aionui-explorer-open");
    };
    document.addEventListener("click", onChevronClick, true);
    return () => document.removeEventListener("click", onChevronClick, true);
  });
  installMobileEffect(ctx, "dsh-web-mobile: preview sheet open marker", () => {
    const closePreview = () => {
      getFrame()?.removeAttribute("data-aionui-preview-open");
      getFrame()?.removeAttribute("data-mobile-preview-full");
    };
    const DESKTOP_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    const DESKTOP_APPVERSION = "5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    let restoreTimer = null;
    let spoofed = false;
    let originalPlatform = navigator.platform;
    let originalUserAgent = navigator.userAgent;
    let originalAppVersion = navigator.appVersion;
    const restoreNavigator = () => {
      if (restoreTimer !== null) {
        window.clearTimeout(restoreTimer);
        restoreTimer = null;
      }
      if (!spoofed) return;
      spoofed = false;
      Object.defineProperty(navigator, "platform", { value: originalPlatform, configurable: true });
      Object.defineProperty(navigator, "userAgent", { value: originalUserAgent, configurable: true });
      Object.defineProperty(navigator, "appVersion", { value: originalAppVersion, configurable: true });
    };
    const spoofDesktop = () => {
      if (!spoofed) {
        originalPlatform = navigator.platform;
        originalUserAgent = navigator.userAgent;
        originalAppVersion = navigator.appVersion;
        Object.defineProperty(navigator, "platform", { value: "Win32", configurable: true });
        Object.defineProperty(navigator, "userAgent", { value: DESKTOP_UA, configurable: true });
        Object.defineProperty(navigator, "appVersion", { value: DESKTOP_APPVERSION, configurable: true });
        spoofed = true;
      }
      if (restoreTimer !== null) window.clearTimeout(restoreTimer);
      restoreTimer = window.setTimeout(restoreNavigator, 1e3);
    };
    const onTap = (event) => {
      const target = event.target;
      if (target === null) return;
      const row = target.closest('[data-aionui-explorer-col] [class*="_treeRow"]');
      if (row === null) return;
      if (row.querySelector('[class*="_treeArrow"]:not([class*="_treeArrowEmpty"])') !== null) return;
      spoofDesktop();
      getFrame()?.setAttribute("data-aionui-preview-open", "");
    };
    const onCollapse = (event) => {
      const target = event.target;
      if (target === null) return;
      if (target.closest('[data-aionui-preview-col] [class*="_panelCollapse"]') !== null) {
        closePreview();
      }
    };
    document.addEventListener("click", onTap, true);
    document.addEventListener("click", onCollapse, true);
    return () => {
      restoreNavigator();
      document.removeEventListener("click", onTap, true);
      document.removeEventListener("click", onCollapse, true);
    };
  });
  installMobileEffect(ctx, "dsh-web-mobile: explorer availability (issue #48)", () => {
    const narrow = window.matchMedia("(max-width: 1023px)");
    if (!narrow.matches) return () => {
    };
    const check = () => {
      const has = document.querySelector("[data-aionui-explorer-col]") !== null;
      getFrame()?.setAttribute("data-mobile-nav-explorer", has ? "1" : "0");
    };
    check();
    const timer = window.setTimeout(check, 1500);
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  });
}
function createPreviewCloseTask() {
  return {
    name: "preview-close-sync",
    // Only acts when the suite hides the col via inline style. Deliberately
    // NOT scoped to data-aionui-preview-open: our own open marker is set
    // before the suite necessarily flips its inline visibility, so waking on
    // that marker would read the still-hidden style as a "suite close" and
    // immediately undo the file-row tap.
    scopes: ["style"],
    ensure: () => {
      const pv = document.querySelector("[data-aionui-preview-col]");
      if (pv === null) return;
      if (pv.style.visibility === "hidden") {
        getFrame()?.removeAttribute("data-aionui-preview-open");
        getFrame()?.removeAttribute("data-mobile-preview-full");
      }
    },
    dispose: () => {
    }
  };
}
function createSheetRiseTask() {
  const cols = ["[data-aionui-explorer-col]", "[data-aionui-preview-col]"];
  const seen = /* @__PURE__ */ new Map();
  const play = (el) => {
    el.animate(
      [
        { opacity: 0, transform: "translateY(28px)" },
        { opacity: 1, transform: "none" }
      ],
      { duration: 280, easing: "cubic-bezier(.16, 1, .3, 1)", fill: "backwards" }
    );
  };
  return {
    name: "sheet-rise-replay",
    // The flush runs on the next frame, by which time React has rendered the
    // opened col, so the frame markers / inline style / class changes are
    // reliable triggers — no '*'.
    scopes: [
      "style",
      "class",
      "data-aionui-explorer-open",
      "data-aionui-preview-open",
      "data-mobile-preview-full"
    ],
    ensure: () => {
      for (const sel of cols) {
        const el = document.querySelector(sel);
        if (el === null) continue;
        const visible = getComputedStyle(el).visibility === "visible";
        const prev = seen.get(sel) ?? false;
        if (visible && !prev) play(el);
        seen.set(sel, visible);
      }
    },
    dispose: () => {
      seen.clear();
    }
  };
}

// client/mobile/effects/stats-line.ts
var SEP_SPLIT = /\s*[·．]\s*|(?<![0-9])\.(?![0-9])|(?<!\d)\.(?=\d)/;
var TTFT_ZH = /^首\s*token\s*平均/;
var TTFT_EN = /^TTFT\s+avg/i;
function compactGroup(text, lang) {
  const trimmed = text.trim();
  if (trimmed === "") return "";
  const parts = trimmed.split(SEP_SPLIT).map((part) => part.trim()).filter(Boolean);
  const zh3 = lang === "zh";
  if (zh3 ? /[轮步]/.test(trimmed) : /\b(turns|steps)\b/i.test(trimmed)) {
    if (zh3) return parts.map((part) => part.replace(/\s+/g, "")).join("");
    return parts.join(" ");
  }
  if (zh3 ? /(LLM|工具调用)/.test(trimmed) : /(LLM|Tool call)/i.test(trimmed)) {
    const mapped = parts.map((part) => {
      let out = part;
      if (zh3) out = out.replace(/LLM/, "\u6A21\u578B").replace(/工具调用\s*/, "\u5DE5\u5177");
      else out = out.replace(/Tool call/i, "Tool");
      return out.trim();
    }).filter(Boolean);
    return mapped.join(" ");
  }
  if (zh3 ? /(首\s*token|tok\/s)/.test(trimmed) : /(TTFT|tok\/s)/i.test(trimmed)) {
    const mapped = parts.filter((part) => !(zh3 ? TTFT_ZH : TTFT_EN).test(part)).map((part) => part.replace(/tok\/s/g, "t/s").trim()).filter(Boolean);
    return mapped.join(" \xB7 ");
  }
  if (zh3 ? /缓存命中/.test(trimmed) : /Cache hit/i.test(trimmed)) {
    let out = trimmed;
    if (zh3) out = out.replace(/缓存命中/, "\u7F13\u4E2D");
    else out = out.replace(/Cache hit/i, "Cache");
    return out.trim();
  }
  if (zh3 ? /(输入|输出|tok)/.test(trimmed) : /(Input|Output|tok)/i.test(trimmed)) {
    const mapped = parts.map((part) => {
      let out = part;
      if (zh3) out = out.replace(/输入\s*/, "\u5165 ").replace(/输出\s*/, "\u51FA");
      else out = out.replace(/Input/i, "In").replace(/Output/i, "Out");
      out = out.replace(/\btok\b/g, "t");
      return out.trim();
    }).filter(Boolean);
    return mapped.join(zh3 ? " . " : " \xB7 ");
  }
  return trimmed;
}
function isStatsGroup(el) {
  return el.nodeType === 1 && el.tagName === "SPAN" && el.getAttribute("aria-hidden") !== "true";
}
function removeStatsGroup(group) {
  const prev = group.previousSibling;
  if (prev !== null && prev.nodeType === 3 && /^\s*$/.test(prev.textContent ?? "") && prev.previousSibling !== null && prev.previousSibling.nodeType === 1 && prev.previousSibling.getAttribute("aria-hidden") === "true") {
    prev.previousSibling.remove();
    prev.remove();
    group.remove();
    return;
  }
  const next = group.nextSibling;
  if (next !== null && next.nodeType === 3 && /^\s*$/.test(next.textContent ?? "") && next.nextSibling !== null && next.nextSibling.nodeType === 1 && next.nextSibling.getAttribute("aria-hidden") === "true") {
    next.nextSibling.remove();
    next.remove();
    group.remove();
    return;
  }
  group.remove();
}
function compactStats(stats) {
  const lang = /[\u4e00-\u9fff]/.test(stats.textContent ?? "") ? "zh" : "en";
  for (const group of Array.from(stats.children).filter(isStatsGroup)) {
    const original = group.textContent ?? "";
    if (original.trim() === "") continue;
    const compacted = compactGroup(original, lang);
    if (compacted === "") {
      removeStatsGroup(group);
    } else if (compacted !== original) {
      group.textContent = compacted;
    }
  }
  for (const el of Array.from(stats.children)) {
    if (el.children.length === 0 && /^TPS\s+\d/.test((el.textContent ?? "").trim())) {
      const text = el.textContent ?? "";
      const compacted = text.replace(/tok\/s/g, "t/s");
      if (compacted !== text) el.textContent = compacted;
    }
  }
}
function statsAnchorAlive(el) {
  if (el === null || !el.isConnected) return false;
  if (el.closest("[data-phase]") === null) return false;
  return el.closest('[class*="_composerStack"]') !== null;
}
function createStatsLineTask() {
  let tpsOrigin = null;
  const moveTps = (stats) => {
    if ([...stats.children].some((c) => /^TPS\s+\d/.test((c.textContent ?? "").trim()))) return;
    const stack = stats.closest('[class*="_composerStack"]');
    if (stack === null) return;
    for (const el of stack.querySelectorAll("div")) {
      const text = (el.textContent ?? "").trim();
      if (!/^TPS\s+\d/.test(text)) continue;
      if (el.children.length > 0) continue;
      if (el.parentElement !== null) {
        tpsOrigin = { parent: el.parentElement, next: el.nextSibling };
      }
      stats.appendChild(el);
      return;
    }
  };
  const mark = () => {
    const anchor = document.querySelector('[data-mobile-nav="stats"]');
    if (anchor !== null && statsAnchorAlive(anchor)) {
      moveTps(anchor);
      return;
    }
    anchor?.removeAttribute("data-mobile-nav");
    for (const root of document.querySelectorAll('[data-phase] [class*="_root"]')) {
      if (root.closest('[class*="_composerStack"]') === null) continue;
      if (root.matches('[data-testid="todo-panel"]')) continue;
      if (root.querySelector("button") !== null) continue;
      const text = root.textContent ?? "";
      if (!/(turns|steps|\bLLM\b|轮|步)/.test(text)) continue;
      if (root.querySelector("textarea, [data-composer-input]") !== null) continue;
      root.setAttribute("data-mobile-nav", "stats");
      moveTps(root);
      compactStats(root);
      return;
    }
  };
  return {
    name: "stats-line",
    scopes: ["*"],
    ensure: mark,
    dispose: () => {
      if (tpsOrigin !== null && tpsOrigin.parent.isConnected) {
        for (const stats of document.querySelectorAll('[data-mobile-nav="stats"]')) {
          const tps = [...stats.querySelectorAll("div")].find(
            (el) => el.children.length === 0 && /^TPS\s+\d/.test((el.textContent ?? "").trim())
          );
          if (tps !== void 0) {
            tpsOrigin.parent.insertBefore(tps, tpsOrigin.next);
            break;
          }
        }
      }
      for (const el of document.querySelectorAll('[data-mobile-nav="stats"]')) {
        el.removeAttribute("data-mobile-nav");
      }
      tpsOrigin = null;
    }
  };
}

// client/mobile/effects/preview-fullscreen.ts
function createPreviewFullscreenTask(t) {
  let button = null;
  const syncLabel = (target) => {
    const full = getFrame()?.hasAttribute("data-mobile-preview-full") ?? false;
    const label = t(full ? "previewExitFullscreen" : "previewFullscreen");
    if (target.getAttribute("aria-label") === label) return;
    target.setAttribute("aria-label", label);
    target.title = label;
  };
  const onClick = () => {
    getFrame()?.toggleAttribute("data-mobile-preview-full");
    if (button !== null) syncLabel(button);
  };
  return {
    name: "preview-fullscreen-toggle",
    scopes: ["data-aionui-preview-open", "data-mobile-preview-full"],
    ensure: () => {
      const col = document.querySelector("[data-aionui-preview-col]");
      if (col === null) return;
      if (button === null) {
        button = document.createElement("button");
        button.type = "button";
        button.dataset.mobileNav = "preview-full-toggle";
        button.innerHTML = [
          '<svg class="dsh-web-mobile-full-in" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
          '<path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
          "</svg>",
          '<svg class="dsh-web-mobile-full-out" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
          '<path d="M6 2v4H2M10 2v4h4M6 14v-4H2M10 14v-4h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
          "</svg>"
        ].join("");
        button.addEventListener("click", onClick);
      }
      syncLabel(button);
      if (button.parentElement !== col) col.appendChild(button);
    },
    dispose: () => {
      button?.remove();
      button = null;
    }
  };
}

// client/mobile/effects/git-chip-reparent.ts
function createGitChipTask() {
  return {
    name: "git-chip-reparent",
    scopes: ["*"],
    ensure: () => {
      const chip = document.querySelector('[data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor]');
      if (chip === null) return;
      const card = document.querySelector("[data-composer-input], textarea")?.closest('[class*="_card"]');
      if (card == null) return;
      if (chip.parentElement !== card) card.insertBefore(chip, card.firstChild);
    },
    dispose: () => {
      const chip = document.querySelector('[data-slot="conversation.input.dock"] [data-gitgraph-chip-anchor]');
      const dock = document.querySelector('[data-slot="conversation.input.dock"]');
      if (chip !== null && dock !== null && chip.parentElement !== dock) dock.appendChild(chip);
    }
  };
}

// client/mobile/effects/settings-toolbar-reparent.ts
function createSettingsToolbarTask() {
  let origin = null;
  return {
    name: "settings-toolbar-reparent",
    scopes: ["*"],
    ensure: () => {
      const dialog = document.querySelector('[aria-modal="true"]');
      if (dialog === null) return;
      const nav = dialog.querySelector(':scope > [class*="_nav"]');
      const header = dialog.querySelector('[class*="_header"]:not([class*="_headerActions"])');
      if (nav === null || header === null) return;
      if (header.parentElement === nav) return;
      if (header.parentElement !== null) {
        origin = { parent: header.parentElement, next: header.nextSibling };
      }
      nav.appendChild(header);
    },
    dispose: () => {
      if (origin === null) return;
      const header = document.querySelector('[aria-modal="true"] [class*="_header"]:not([class*="_headerActions"])');
      if (header !== null && origin.parent.isConnected) {
        origin.parent.insertBefore(header, origin.next);
      }
      origin = null;
    }
  };
}

// client/mobile/effects/overlay-backdrop-fab.ts
function fadeOverlayOut() {
  fadeHook?.();
}
var fadeHook = null;
var BACKDROP_FADE_MS = 200;
function createOverlayTask(t, toggleSidebar) {
  let backdrop = null;
  let fab = null;
  let backdropRemoveTimer = null;
  let faded = false;
  const drawerOpen2 = () => {
    const frame = getFrame();
    return frame !== null && !frame.hasAttribute("data-sidebar-collapsed");
  };
  const heroPhase = () => document.querySelector('[data-phase="active"]') === null;
  fadeHook = () => {
    if (backdrop === null) return;
    faded = true;
    backdrop.style.pointerEvents = "none";
    backdrop.style.opacity = "0";
  };
  return {
    name: "overlay-backdrop-fab",
    scopes: ["*", "data-sidebar-collapsed", "data-phase"],
    ensure: () => {
      const frame = getFrame();
      if (frame === null) return;
      if (drawerOpen2()) {
        if (backdrop === null) {
          backdrop = document.createElement("div");
          backdrop.dataset.mobileNav = "backdrop";
          backdrop.setAttribute("role", "button");
          backdrop.setAttribute("aria-label", t("backdrop"));
          backdrop.addEventListener("click", toggleSidebar);
          frame.appendChild(backdrop);
          faded = false;
        } else if (faded && backdropRemoveTimer !== null) {
          window.clearTimeout(backdropRemoveTimer);
          backdropRemoveTimer = null;
          faded = false;
          backdrop.style.removeProperty("pointer-events");
          backdrop.style.removeProperty("opacity");
        }
      } else if (backdrop !== null) {
        backdrop.style.pointerEvents = "none";
        backdrop.style.opacity = "0";
        faded = true;
        if (backdropRemoveTimer === null) {
          backdropRemoveTimer = window.setTimeout(() => {
            backdropRemoveTimer = null;
            backdrop?.remove();
            backdrop = null;
          }, BACKDROP_FADE_MS + 60);
        }
      }
      if (heroPhase() && !drawerOpen2() && fab === null) {
        fab = document.createElement("button");
        fab.type = "button";
        fab.dataset.mobileNav = "fab";
        fab.setAttribute("aria-label", t("open"));
        fab.title = t("open");
        fab.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="18" height="18"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.67272 0.522841C10.8339 0.522841 11.76 0.522714 12.4963 0.602493C13.2453 0.683657 13.8789 0.854248 14.4264 1.25197C14.7504 1.48739 15.0355 1.77247 15.2709 2.0965C15.6686 2.64394 15.8392 3.27758 15.9204 4.02655C16.0002 4.7629 16 5.68895 16 6.85014V9.14986C16 10.3111 16.0002 11.2371 15.9204 11.9735C15.8392 12.7224 15.6686 13.3561 15.2709 13.9035C15.0355 14.2275 14.7504 14.5126 14.4264 14.748C13.8789 15.1458 13.2453 15.3163 12.4963 15.3975C11.76 15.4773 10.8339 15.4772 9.67272 15.4772H6.3273C5.16611 15.4772 4.24006 15.4773 3.50371 15.3975C2.75474 15.3163 2.1211 15.1458 1.57366 14.748C1.24963 14.5126 0.964549 14.2275 0.729131 13.9035C0.331407 13.3561 0.160817 12.7224 0.0796529 11.9735C-0.000126137 11.2371 1.25338e-09 10.3111 1.25338e-09 9.14986V6.85014C1.25329e-09 5.68895 -0.000126137 4.7629 0.0796529 4.02655C0.160817 3.27758 0.331407 2.64394 0.729131 2.0965C0.964549 1.77247 1.24963 1.48739 1.57366 1.25197C2.1211 0.854248 2.75474 0.683657 3.50371 0.602493C4.24006 0.522714 5.16611 0.522841 6.3273 0.522841H9.67272ZM5.54303 1.88715V14.1118C5.78636 14.1128 6.04709 14.1169 6.3273 14.1169H9.67272C10.8639 14.1169 11.7032 14.1164 12.3493 14.0465C12.9824 13.9779 13.3497 13.8494 13.6268 13.6482C13.8354 13.4966 14.0195 13.3125 14.1711 13.1039C14.3723 12.8268 14.5007 12.4595 14.5693 11.8264C14.6393 11.1803 14.6398 10.341 14.6398 9.14986V6.85014C14.6398 5.65896 14.6393 4.81967 14.5693 4.1736C14.5007 3.54048 14.3723 3.17318 14.1711 2.89609C14.0195 2.68747 13.8354 2.50337 13.6268 2.35179C13.3497 2.1506 12.9824 2.02212 12.3493 1.95353C11.7032 1.88358 10.8639 1.88307 9.67272 1.88307H6.3273C6.04709 1.88307 5.78636 1.8862 5.54303 1.88715ZM4.1828 1.91166C3.99125 1.9216 3.8148 1.93577 3.65076 1.95353C3.01764 2.02212 2.65034 2.1506 2.37325 2.35179C2.16463 2.50337 1.98052 2.68747 1.82895 2.89609C1.62776 3.17318 1.49928 3.54048 1.43069 4.1736C1.36074 4.81967 1.36023 5.65896 1.36023 6.85014V9.14986C1.36023 10.341 1.36074 11.1803 1.43069 11.8264C1.49928 12.4595 1.62776 12.8268 1.82895 13.1039C1.98052 13.3125 2.16463 13.4966 2.37325 13.6482C2.65034 13.8494 3.01764 13.9779 3.65076 14.0465C4.29683 14.1164 5.13612 14.1169 6.3273 14.1169H9.67272C10.8639 14.1169 11.7032 14.1164 12.3493 14.0465C12.9824 13.9779 13.3497 13.8494 13.6268 13.6482C13.8354 13.4966 14.0195 13.3125 14.1711 13.1039C14.3723 12.8268 14.5007 12.4595 14.5693 11.8264C14.6393 11.1803 14.6398 10.341 14.6398 9.14986V6.85014C14.6398 5.65896 14.6393 4.81967 14.5693 4.1736C14.5007 3.54048 14.3723 3.17318 14.1711 2.89609C14.0195 2.68747 13.8354 2.50337 13.6268 2.35179C13.3497 2.1506 12.9824 2.02212 12.3493 1.95353C11.7032 1.88358 10.8639 1.88307 9.67272 1.88307H6.3273C5.13612 1.88307 4.29683 1.88358 3.65076 1.95353C3.47672 1.97129 3.30027 1.98546 3.10872 1.9954L4.1828 1.91166Z" fill="currentColor"/></svg>';
        fab.addEventListener("click", toggleSidebar);
        frame.appendChild(fab);
      } else if ((!heroPhase() || drawerOpen2()) && fab !== null) {
        fab.remove();
        fab = null;
      }
    },
    dispose: () => {
      if (backdropRemoveTimer !== null) {
        window.clearTimeout(backdropRemoveTimer);
        backdropRemoveTimer = null;
      }
      fadeHook = null;
      backdrop?.remove();
      backdrop = null;
      fab?.remove();
      fab = null;
    }
  };
}

// client/mobile/effects/file-viewer-compat.ts
function createFileViewerMarkerTask() {
  return {
    name: "file-viewer-open-marker",
    scopes: ["*"],
    ensure: () => {
      const frame = getFrame();
      if (frame === null) return;
      const active = document.querySelector(".dsfv-panel") !== null;
      if (active) {
        frame.setAttribute("data-file-viewer-open", "");
      } else if (frame.hasAttribute("data-file-viewer-open")) {
        frame.removeAttribute("data-file-viewer-open");
      }
    },
    dispose: () => {
      getFrame()?.removeAttribute("data-file-viewer-open");
    }
  };
}

// client/mobile/effects/phone-chrome.ts
var NS = "mobileNav";
var MOBILE_QUERY = "(max-width: 1023px) and (pointer: coarse)";
var DESKTOP_QUERY = "(min-width: 1024px)";
var TOUCH_QUERY = "(pointer: coarse)";
function installMobileEffect(ctx, label, install, query = MOBILE_QUERY) {
  ctx.effect(() => {
    const narrow = window.matchMedia(query);
    let cleanup;
    const arm = () => {
      cleanup?.();
      cleanup = narrow.matches ? install(narrow) : void 0;
    };
    arm();
    narrow.addEventListener("change", arm);
    return () => {
      narrow.removeEventListener("change", arm);
      cleanup?.();
    };
  }, label);
}
function findFrame() {
  return document.querySelector("[data-shell-overlay]")?.parentElement ?? null;
}
function getFrame() {
  return document.querySelector('[data-mobile-nav="frame"]') ?? findFrame();
}
function installFrameController() {
  if (frameControllerInstalled) return () => {
  };
  frameControllerInstalled = true;
  let frame = null;
  const removeTask = addReconcilerTask({
    name: "frame-marker",
    scopes: ["*"],
    ensure: () => {
      frame = findFrame();
      if (frame !== null && !frame.hasAttribute("data-mobile-nav")) {
        frame.setAttribute("data-mobile-nav", "frame");
      }
    },
    dispose: () => {
      if (frame !== null) {
        frame.removeAttribute("data-mobile-nav");
        frame.removeAttribute("data-mobile-preview-full");
        frame.removeAttribute("data-aionui-explorer-open");
        frame.removeAttribute("data-aionui-preview-open");
      }
      frame = null;
    }
  });
  return () => {
    removeTask();
    frameControllerInstalled = false;
  };
}
var frameControllerInstalled = false;
var reconcileTasksRegistered = false;
var reconcilerInstalled = false;
var core = createReconcilerCore({
  requestFrame: (flush) => {
    let id = 0;
    const run = () => {
      id = 0;
      flush();
    };
    id = requestAnimationFrame(run);
    return () => {
      if (id !== 0) cancelAnimationFrame(id);
    };
  }
});
function installReconciler(ctx) {
  if (reconcilerInstalled) return () => {
  };
  reconcilerInstalled = true;
  installMobileEffect(ctx, "dsh-web-mobile: DOM reconciler", () => {
    const observer = new MutationObserver((records) => {
      const keys = /* @__PURE__ */ new Set();
      for (const record of records) {
        keys.add(
          record.type === "attributes" && record.attributeName !== null ? record.attributeName : "*"
        );
      }
      core.note(keys);
    });
    observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [
        "style",
        "class",
        "data-phase",
        "data-sidebar-collapsed",
        "data-aionui-explorer-open",
        "data-aionui-preview-open",
        "data-mobile-preview-full"
      ]
    });
    core.activate();
    return () => {
      observer.disconnect();
      core.deactivate();
    };
  });
  return () => {
    reconcilerInstalled = false;
  };
}
function addReconcilerTask(task) {
  return core.register(task);
}
function detectIosWebKit(nav, supports) {
  if (supports !== null) {
    try {
      if (supports("(font: -apple-system-body) and (-webkit-touch-callout: none)")) return true;
    } catch {
    }
  }
  const ua = nav.userAgent;
  if (/iP(hone|ad|od)/.test(ua)) return true;
  return /Macintosh/.test(ua) && nav.maxTouchPoints > 1;
}
var IOS_MARKER = "data-mobile-nav-ios";
var VIEWPORT_CONTENT = "width=device-width, initial-scale=1, viewport-fit=cover";
var findViewportMeta = () => document.querySelector('meta[name="viewport"]');
function installPhoneChrome(ctx) {
  installMobileEffect(ctx, "dsh-web-mobile: status bar theme + viewport + zoom guard", () => {
    const themeMeta = document.createElement("meta");
    themeMeta.name = "theme-color";
    const bodyBg = () => getComputedStyle(document.body).backgroundColor;
    const root = document.documentElement;
    let originalViewport = null;
    let observedMeta = null;
    let applying = false;
    const assertViewport = () => {
      const viewport = findViewportMeta();
      if (viewport === null) return;
      if (originalViewport === null) originalViewport = viewport.content;
      if (applying || viewport.content === VIEWPORT_CONTENT) return;
      applying = true;
      viewport.content = VIEWPORT_CONTENT;
      applying = false;
    };
    const metaObserver = new MutationObserver(assertViewport);
    const attachMetaObserver = () => {
      const viewport = findViewportMeta();
      if (viewport === observedMeta) return;
      if (observedMeta !== null) metaObserver.disconnect();
      observedMeta = viewport;
      if (viewport !== null) {
        metaObserver.observe(viewport, { attributes: true, attributeFilter: ["content"] });
      }
    };
    const headObserver = new MutationObserver(() => {
      attachMetaObserver();
      assertViewport();
    });
    headObserver.observe(document.head, { childList: true });
    attachMetaObserver();
    assertViewport();
    const observer = new MutationObserver(() => {
      themeMeta.content = bodyBg();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
    const cssSupports = typeof CSS !== "undefined" && typeof CSS.supports === "function" ? (condition) => CSS.supports(condition) : null;
    if (detectIosWebKit(navigator, cssSupports)) root.setAttribute(IOS_MARKER, "");
    themeMeta.content = bodyBg();
    if (themeMeta.parentElement === null) document.head.appendChild(themeMeta);
    return () => {
      metaObserver.disconnect();
      headObserver.disconnect();
      observer.disconnect();
      const viewport = findViewportMeta();
      if (viewport !== null && originalViewport !== null && viewport.content === VIEWPORT_CONTENT) {
        viewport.content = originalViewport;
      }
      themeMeta.remove();
      root.removeAttribute(IOS_MARKER);
    };
  });
}
function installOverlayInteractions(ctx) {
  installMobileEffect(ctx, "dsh-web-mobile: drawer close (Escape + navigate)", () => {
    const toggleSidebar = () => ctx.layout.toggleSidebar();
    const drawerOpen2 = () => {
      const frame = getFrame();
      return frame !== null && !frame.hasAttribute("data-sidebar-collapsed");
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (document.querySelector('[aria-modal="true"]') !== null) return;
      if (drawerOpen2()) toggleSidebar();
    };
    const drawerRoot = () => document.querySelector('[data-mobile-nav="frame"] > :first-child');
    const shouldCloseOnTapInsideDrawer = (target) => {
      if (document.querySelector('[aria-modal="true"]') !== null) return false;
      if (!drawerOpen2()) return false;
      if (!(target instanceof Element)) return false;
      const drawer = drawerRoot();
      if (drawer === null || !drawer.contains(target)) return false;
      if (target.closest('[class*="sessionRow"] button') !== null) return false;
      return target.closest(
        'button[data-dsh-taskboard-entry], button[data-dsh-ssh-entry], [class*="newSession"], [class*="sessionRow"], [class*="searchResultRow"], [class*="searchResultWorkspace"], [class*="usg_"]'
      ) !== null;
    };
    let lastTouchNavAt = 0;
    let navSignatureAtArm = "";
    let navObserver = null;
    let navTimer = null;
    const selectedRowSignature = () => {
      const selected = drawerRoot()?.querySelector('[role="treeitem"][aria-selected="true"]');
      const title = selected?.querySelector('[class*="_title"]');
      return title?.textContent?.trim() ?? null;
    };
    const disarmNav = () => {
      navObserver?.disconnect();
      navObserver = null;
      if (navTimer !== null) window.clearTimeout(navTimer);
      navTimer = null;
      navSignatureAtArm = "";
    };
    const armNav = () => {
      disarmNav();
      navSignatureAtArm = selectedRowSignature() ?? "";
      const root = drawerRoot();
      if (root === null) return;
      navObserver = new MutationObserver(() => {
        if (!drawerOpen2()) {
          disarmNav();
          return;
        }
        const signature = selectedRowSignature();
        if (signature !== null && signature !== navSignatureAtArm) {
          disarmNav();
          toggleSidebar();
        }
      });
      navObserver.observe(root, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["aria-selected"]
      });
      navTimer = window.setTimeout(disarmNav, 2e3);
    };
    const onDrawerClick = (event) => {
      if (isStrokeLocked() || consumeIfGestured(event)) return;
      if (performance.now() - lastTouchNavAt < 500) return;
      if (shouldCloseOnTapInsideDrawer(event.target)) toggleSidebar();
    };
    const onDrawerPointerUp = (event) => {
      if (isStrokeLocked() || consumeIfGestured(event)) return;
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (!shouldCloseOnTapInsideDrawer(target)) return;
      const row = target.closest('[role="treeitem"]');
      if (row !== null) {
        lastTouchNavAt = performance.now();
        if (row.getAttribute("aria-selected") === "true") {
          toggleSidebar();
        } else {
          armNav();
        }
        return;
      }
      toggleSidebar();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("click", onDrawerClick, true);
    document.addEventListener("pointerup", onDrawerPointerUp, true);
    return () => {
      disarmNav();
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("click", onDrawerClick, true);
      document.removeEventListener("pointerup", onDrawerPointerUp, true);
    };
  });
}
function registerReconcileTasks(ctx) {
  if (reconcileTasksRegistered) return () => {
  };
  reconcileTasksRegistered = true;
  const t = ctx.locale.bind(NS);
  const removeTasks = [
    addReconcilerTask(createPreviewFullscreenTask(t)),
    addReconcilerTask(createGitChipTask()),
    addReconcilerTask(createSettingsToolbarTask()),
    addReconcilerTask(createPreviewCloseTask()),
    addReconcilerTask(createSheetRiseTask()),
    addReconcilerTask(createStatsLineTask()),
    addReconcilerTask(createOverlayTask(t, () => ctx.layout.toggleSidebar())),
    addReconcilerTask(createFileViewerMarkerTask())
  ];
  return () => {
    for (const remove of removeTasks) remove();
    reconcileTasksRegistered = false;
  };
}

// client/mobile/effects/sidebar-swipe.ts
var START_ZONE_RATIO = 0.45;
function startZonePxFor(viewportWidthPx, ratio = START_ZONE_RATIO) {
  return Math.round(viewportWidthPx * ratio);
}
var LOCK_PX = 8;
var OPEN_DISTANCE_RATIO = 0.16;
var CLOSE_DISTANCE_RATIO = 0.13;
var VELOCITY_WINDOW_MS = 60;
var OPEN_VELOCITY = 0.45;
var CLOSE_VELOCITY = 0.45;
var COOLDOWN_MS = 350;
var CONSUME_WINDOW_MS = 300;
var OPEN_FOLLOW_ARM_PX = 8;
var CLOSED_SLOT_PCT = 110;
var COMMIT_ANIM_MS = 280;
var OPEN_FOLLOW_BASE_PCT = 101;
var trackingPointer = 0;
var tracking = false;
var samples = [];
var startX = 0;
var startY = 0;
var lockDrawerOpen = false;
var cooldownUntil = 0;
var consumedEl = null;
var followDrawer = null;
var followEngaged = false;
var strokeClosedTx = 0;
var strokeRtl = false;
var openFollowArmed = false;
var openFollowRefused = false;
function classifySwipe(t, m, rtl) {
  const dx = rtl ? -m.dx : m.dx;
  if (Math.abs(dx) <= t.lockPx) return "none";
  if (Math.abs(dx) <= Math.abs(m.dy)) return "none";
  if (t.drawerOpen) {
    const travel = Math.abs(dx);
    if (travel / t.viewportWidthPx >= t.closeDistanceRatio) return "close";
    const velX2 = rtl ? -m.velX : m.velX;
    if (velX2 > 0 !== dx > 0) return "none";
    return Math.abs(velX2) >= t.closeVelocity ? "close" : "none";
  }
  if (dx <= 0) return "none";
  if (dx / t.viewportWidthPx >= t.openDistanceRatio) return "open";
  const velX = rtl ? -m.velX : m.velX;
  return velX >= t.openVelocity ? "open" : "none";
}
function slidingVelocity(samples2, windowMs, now) {
  const cutoff = now - windowMs;
  const inWindow = samples2.filter((s) => s.t >= cutoff);
  if (inWindow.length < 2) return 0;
  const a = inWindow[inWindow.length - 2];
  const b = inWindow[inWindow.length - 1];
  const dt = b.t - a.t;
  if (dt <= 0) return 0;
  return (b.x - a.x) / dt;
}
function hitTestStart(clientX, viewportWidthPx, rtl, t) {
  const edge = rtl ? viewportWidthPx - clientX : clientX;
  return edge >= 0 && edge <= t.startZonePx;
}
function followTranslate(closedTx, dx, rtl, drawerOpen2) {
  const dir = closedTx <= 0 ? -1 : 1;
  const slot = Math.abs(closedTx);
  const d = rtl ? -dx : dx;
  if (drawerOpen2) {
    if (d >= 0) return null;
    return dir * Math.min(slot, -d) + 0;
  }
  if (d <= 0) return null;
  return dir * (slot - Math.min(slot, d)) + 0;
}
function followOpenTransform(travelPx, rtl) {
  const t = rtl ? -travelPx : travelPx;
  if (t <= 0) return null;
  return rtl ? `translateX(max(0px, calc(${OPEN_FOLLOW_BASE_PCT}% - ${t}px)))` : `translateX(min(0px, calc(-${OPEN_FOLLOW_BASE_PCT}% + ${t}px)))`;
}
function findHorizontalScroller(node) {
  let cur = node;
  while (cur !== null) {
    if ((cur.overflowX === "auto" || cur.overflowX === "scroll") && cur.scrollWidth > cur.clientWidth + 1) {
      return cur;
    }
    cur = cur.parent;
  }
  return null;
}
function findDrawer() {
  const frame = getFrame();
  return frame !== null && frame.firstElementChild instanceof HTMLElement ? frame.firstElementChild : null;
}
function drawerOpen() {
  const frame = getFrame();
  return frame !== null && !frame.hasAttribute("data-sidebar-collapsed");
}
function chainFrom(target) {
  let node = null;
  let el = target;
  while (el !== null) {
    node = {
      parent: node,
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      overflowX: getComputedStyle(el).overflowX
    };
    el = el.parentElement;
  }
  return node;
}
function modalOpen() {
  return document.querySelector('[aria-modal="true"]') !== null;
}
function takeoverActive() {
  return document.documentElement.hasAttribute("data-dsh-taskboard-active") || document.documentElement.hasAttribute("data-dsh-ssh-active") || document.querySelector("[data-conversation-composer-overlay]") !== null;
}
function selectionOwnsStroke() {
  if (typeof window === "undefined") return false;
  const sel = window.getSelection();
  if (sel !== null && !sel.isCollapsed) return true;
  if (typeof document === "undefined") return false;
  const el = document.activeElement;
  if (el === null) return false;
  const tag = el.tagName;
  if (tag !== "TEXTAREA" && tag !== "INPUT") return false;
  try {
    const { selectionStart: start, selectionEnd: end } = el;
    return typeof start === "number" && typeof end === "number" && start !== end;
  } catch {
    return false;
  }
}
function onCooldown() {
  return performance.now() < cooldownUntil;
}
function dragMarkYields(event) {
  if (document.documentElement.hasAttribute("data-mobile-nav-dragging")) return true;
  if (document.body.hasAttribute("data-mobile-nav-dragging")) return true;
  return event.target instanceof Element && event.target.closest("[data-mobile-nav-dragging]") !== null;
}
var FLOATING_WIDGET_MAX_PX = 200;
function findFloatingWidget(target) {
  if (target.closest('[data-mobile-nav="frame"]') !== null) return null;
  let el = target;
  while (el !== null) {
    if (el instanceof HTMLElement) {
      const cs = getComputedStyle(el);
      if ((cs.position === "fixed" || cs.position === "absolute") && el.offsetWidth <= FLOATING_WIDGET_MAX_PX && el.offsetHeight <= FLOATING_WIDGET_MAX_PX) {
        return el;
      }
    }
    el = el.parentElement;
  }
  return null;
}
function floatingWidgetYields(event) {
  return event.target instanceof Element && findFloatingWidget(event.target) !== null;
}
function startFollow() {
  followDrawer = null;
  followEngaged = false;
  openFollowArmed = false;
  openFollowRefused = false;
  strokeRtl = frameRtl();
  const drawer = findDrawer();
  if (drawer === null) return;
  if (!lockDrawerOpen) return;
  followDrawer = drawer;
  const slot = drawer.getBoundingClientRect().width * CLOSED_SLOT_PCT / 100;
  strokeClosedTx = strokeRtl ? slot : -slot;
}
var cvDeferred = false;
function revealDrawerContent() {
  if (!cvDeferred) return;
  cvDeferred = false;
  followDrawer?.style.removeProperty("content-visibility");
  const el = findDrawer();
  if (el !== null && el !== followDrawer) el.style.removeProperty("content-visibility");
}
function armOpenFollow(ctx) {
  if (openFollowArmed || openFollowRefused) return;
  const drawer = findDrawer();
  if (drawer === null || modalOpen() || takeoverActive()) {
    openFollowRefused = true;
    return;
  }
  followDrawer = drawer;
  followEngaged = true;
  drawer.style.setProperty("transition", "none", "important");
  const pinned = followOpenTransform(1e-4, strokeRtl);
  drawer.style.setProperty("transform", pinned ?? `translateX(-${CLOSED_SLOT_PCT}%)`, "important");
  drawer.style.setProperty("content-visibility", "hidden", "important");
  cvDeferred = true;
  openFollowArmed = true;
  ctx.layout.toggleSidebar();
  requestAnimationFrame(() => {
    requestAnimationFrame(revealDrawerContent);
  });
}
function applyFollow(ctx, dx) {
  if (!tracking) return;
  if (!lockDrawerOpen) {
    const travel = strokeRtl ? -dx : dx;
    if (!openFollowArmed) {
      if (travel < OPEN_FOLLOW_ARM_PX) return;
      armOpenFollow(ctx);
      if (!openFollowArmed) return;
    }
    const value = followOpenTransform(dx, strokeRtl);
    if (value === null) {
      followDrawer?.style.setProperty(
        "transform",
        `translateX(-${CLOSED_SLOT_PCT}%)`,
        "important"
      );
      return;
    }
    followDrawer?.style.setProperty("transform", value, "important");
    return;
  }
  if (followDrawer === null) return;
  const tx = followTranslate(strokeClosedTx, dx, strokeRtl, lockDrawerOpen);
  if (tx === null) {
    followEngaged = true;
    followDrawer.style.setProperty("transition", "none", "important");
    followDrawer.style.setProperty("transform", "translateX(0px)", "important");
    return;
  }
  followEngaged = true;
  followDrawer.style.setProperty("transition", "none", "important");
  followDrawer.style.setProperty("transform", `translateX(${tx}px)`, "important");
}
function releaseFollowStyles() {
  const el = followDrawer;
  if (!followEngaged || el === null) return;
  followEngaged = false;
  el.style.removeProperty("transition");
  el.style.removeProperty("transform");
}
var pendingCommit = null;
function finishPendingCommit() {
  const pending = pendingCommit;
  if (pending === null) return;
  pendingCommit = null;
  window.clearTimeout(pending.timer);
  pending.el.style.removeProperty("transition");
  pending.el.style.removeProperty("transform");
  const frame = getFrame();
  if (frame !== null && !frame.hasAttribute("data-sidebar-collapsed")) {
    pending.ctx.layout.toggleSidebar();
  }
}
function commitWithAnimation(ctx, el, targetTx) {
  finishPendingCommit();
  el.style.setProperty("transition", `transform ${COMMIT_ANIM_MS}ms ease-in-out`, "important");
  void el.getBoundingClientRect();
  el.style.setProperty("transform", targetTx, "important");
  fadeOverlayOut();
  cooldownUntil = performance.now() + COOLDOWN_MS;
  pendingCommit = {
    el,
    ctx,
    timer: window.setTimeout(finishPendingCommit, COMMIT_ANIM_MS + 40)
  };
}
function commitFollowClose(ctx) {
  const el = followDrawer;
  followDrawer = null;
  followEngaged = false;
  if (el === null) {
    releaseFollowStyles();
    ctx.layout.toggleSidebar();
    cooldownUntil = performance.now() + COOLDOWN_MS;
    return;
  }
  const target = strokeRtl ? `translateX(${CLOSED_SLOT_PCT}%)` : `translateX(-${CLOSED_SLOT_PCT}%)`;
  commitWithAnimation(ctx, el, target);
}
function abortStroke(ctx, immediate = false) {
  if (pendingCommit !== null) {
    if (immediate) finishPendingCommit();
    return;
  }
  const wasArmed = openFollowArmed;
  openFollowArmed = false;
  openFollowRefused = false;
  revealDrawerContent();
  if (wasArmed && ctx !== null && followDrawer !== null && !immediate) {
    reset();
    commitFollowClose(ctx);
    return;
  }
  releaseFollowStyles();
  reset();
  if (wasArmed && ctx !== null) {
    ctx.layout.toggleSidebar();
    cooldownUntil = performance.now() + COOLDOWN_MS;
  }
}
function beginStroke(event, rtl, viewportWidthPx) {
  if (onCooldown()) return false;
  if (modalOpen()) return false;
  if (takeoverActive()) return false;
  if (selectionOwnsStroke()) return false;
  if (dragMarkYields(event)) return false;
  if (floatingWidgetYields(event)) return false;
  if (!(event.target instanceof Element)) return false;
  if (findHorizontalScroller(chainFrom(event.target)) !== null) return false;
  const open = drawerOpen();
  if (open) {
    const frame = getFrame();
    if (frame === null) return false;
    const rect = frame.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right) return false;
    if (event.clientY < rect.top || event.clientY > rect.bottom) return false;
    if (event.target.closest('[class*="sessionRow"] button') !== null) return false;
  } else if (!hitTestStart(event.clientX, viewportWidthPx, rtl, { startZonePx: startZonePxFor(viewportWidthPx) })) {
    return false;
  }
  trackingPointer = event.pointerId;
  tracking = false;
  startX = event.clientX;
  startY = event.clientY;
  samples = [{ t: event.timeStamp, x: event.clientX }];
  return true;
}
function tryLock(event) {
  const dx = event.clientX - startX;
  const dy = event.clientY - startY;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < LOCK_PX) return false;
  if (dragMarkYields(event) || floatingWidgetYields(event)) {
    reset();
    return false;
  }
  if (Math.abs(dx) <= Math.abs(dy)) {
    reset();
    return false;
  }
  tracking = true;
  lockDrawerOpen = drawerOpen();
  markStrokeLocked();
  startFollow();
  return true;
}
function pushSample(event) {
  samples.push({ t: event.timeStamp, x: event.clientX });
  const cutoff = event.timeStamp - VELOCITY_WINDOW_MS;
  let i = 0;
  while (i < samples.length - 1 && samples[i].t < cutoff) i += 1;
  if (i > 0) samples = samples.slice(i);
}
function endStroke(ctx, event, rtl, viewportWidthPx) {
  const wasTracking = tracking;
  const armedOpen = openFollowArmed;
  openFollowArmed = false;
  openFollowRefused = false;
  const vel = slidingVelocity(samples, VELOCITY_WINDOW_MS, event.timeStamp);
  const dx = event.clientX - startX;
  const dy = event.clientY - startY;
  reset();
  if (!wasTracking) {
    if (armedOpen) {
      commitFollowClose(ctx);
    }
    return;
  }
  const modal = modalOpen();
  const verdict = modal || !armedOpen && onCooldown() ? "none" : classifySwipe(
    {
      openDistanceRatio: OPEN_DISTANCE_RATIO,
      closeDistanceRatio: CLOSE_DISTANCE_RATIO,
      velocityWindowMs: VELOCITY_WINDOW_MS,
      openVelocity: OPEN_VELOCITY,
      closeVelocity: CLOSE_VELOCITY,
      lockPx: LOCK_PX,
      cooldownMs: COOLDOWN_MS,
      startZonePx: startZonePxFor(viewportWidthPx),
      viewportWidthPx,
      drawerOpen: lockDrawerOpen
    },
    { dx, dy, velX: vel },
    rtl
  );
  revealDrawerContent();
  if (armedOpen) {
    if (verdict === "open") {
      releaseFollowStyles();
      cooldownUntil = performance.now() + COOLDOWN_MS;
    } else {
      commitFollowClose(ctx);
    }
    if (event.target instanceof Element) markStrokeConsumed(event.target);
    return;
  }
  if (!(event.target instanceof Element)) return;
  if (verdict === "close") {
    markStrokeConsumed(event.target);
    commitFollowClose(ctx);
    return;
  }
  releaseFollowStyles();
  if (verdict === "open") {
    markStrokeConsumed(event.target);
    ctx.layout.toggleSidebar();
    cooldownUntil = performance.now() + COOLDOWN_MS;
  }
}
function markStrokeConsumed(target) {
  const drawer = findDrawer();
  const upTo = drawer !== null && drawer.contains(target) ? drawer : getFrame() ?? null;
  markGestureConsumed(target, CONSUME_WINDOW_MS, upTo);
  consumedEl = target;
}
function reset() {
  trackingPointer = 0;
  tracking = false;
  samples = [];
  clearStrokeLocked();
}
function frameRtl() {
  const frame = getFrame();
  return frame !== null && getComputedStyle(frame).direction === "rtl";
}
function installSidebarSwipe(ctx) {
  installMobileEffect(ctx, "dsh-web-mobile: sidebar swipe gestures", () => {
    const viewportWidth = () => window.innerWidth || document.documentElement.clientWidth || 0;
    const onPointerDown = (event) => {
      consumedEl = null;
      clearStrokeLocked();
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      if (trackingPointer !== 0 && trackingPointer !== event.pointerId) {
        abortStroke(ctx);
        return;
      }
      beginStroke(event, frameRtl(), viewportWidth());
    };
    const onPointerMove = (event) => {
      if (event.pointerId !== trackingPointer) return;
      if (modalOpen() || takeoverActive()) {
        abortStroke(ctx);
        return;
      }
      if (!tracking) {
        if (selectionOwnsStroke()) {
          reset();
          return;
        }
        if (tryLock(event)) {
          pushSample(event);
          applyFollow(ctx, event.clientX - startX);
        }
      } else {
        pushSample(event);
        applyFollow(ctx, event.clientX - startX);
      }
    };
    const onPointerUp = (event) => {
      if (event.pointerId !== trackingPointer) return;
      endStroke(ctx, event, frameRtl(), viewportWidth());
    };
    const onPointerCancel = (event) => {
      if (event.pointerId !== trackingPointer) return;
      abortStroke(ctx);
    };
    const onClick = (event) => {
      if (consumedEl === null) return;
      if (!(event.target instanceof Element)) return;
      const overlay = event.target.closest(
        '[data-mobile-nav="backdrop"], [data-mobile-nav="fab"]'
      );
      if (overlay !== null && !overlay.contains(consumedEl)) return;
      if (!consumeIfGestured(event)) return;
      event.stopPropagation();
      event.preventDefault();
      consumedEl = null;
    };
    const onVisibility = () => {
      if (document.hidden) abortStroke(ctx);
    };
    const onTouchMove = (event) => {
      if (trackingPointer === 0) return;
      if (event.touches.length > 1) {
        abortStroke(ctx);
        return;
      }
      event.preventDefault();
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("pointermove", onPointerMove, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("pointercancel", onPointerCancel, true);
    document.addEventListener("click", onClick, true);
    document.addEventListener("touchmove", onTouchMove, { capture: true, passive: false });
    const onBlur = () => abortStroke(ctx);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("pointermove", onPointerMove, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("pointercancel", onPointerCancel, true);
      document.removeEventListener("click", onClick, true);
      document.removeEventListener("touchmove", onTouchMove, { capture: true });
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      abortStroke(ctx, true);
    };
  });
}

// client/mobile/effects/subagent-chip-touch.ts
var CHIP_TRIGGER_SELECTOR = '[data-mobile-nav="frame"] button[class*="_trigger"][aria-haspopup="tree"][aria-expanded]:not([class*="_switcherTrigger"])';
var HOVER_SUBTREE_SELECTOR = '[class*="ZKlsPq_root"], [class*="ZKlsPq_menu"], [class*="h8S2Va_root"], [class*="h8S2Va_menu"]';
var SWALLOW_WINDOW_MS = 800;
var CLICK_GRACE_MS = 1e3;
var SWALLOWED_TYPES = ["mouseover", "mouseout", "mouseenter", "mouseleave"];
function installSubagentChipTouch(ctx) {
  installMobileEffect(ctx, "dsh-web-mobile: lineage chip touch toggle", () => {
    if (typeof PointerEvent === "undefined") return void 0;
    let swallowUntil = 0;
    const armSwallowWindow = () => {
      swallowUntil = Date.now() + SWALLOW_WINDOW_MS;
    };
    let toggledTrigger = null;
    let toggledUntil = 0;
    const onPointerUp = (event) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      armSwallowWindow();
      const target = event.target;
      if (!(target instanceof Element)) return;
      const trigger = target.closest(CHIP_TRIGGER_SELECTOR);
      if (trigger === null) return;
      const open = trigger.getAttribute("aria-expanded") === "true";
      trigger.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: open ? "Escape" : "ArrowDown",
          bubbles: true,
          cancelable: true
        })
      );
      toggledTrigger = trigger;
      toggledUntil = Date.now() + CLICK_GRACE_MS;
    };
    const onClick = (event) => {
      if (toggledTrigger === null) return;
      if (Date.now() >= toggledUntil) {
        toggledTrigger = null;
        return;
      }
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(CHIP_TRIGGER_SELECTOR) !== toggledTrigger) return;
      toggledTrigger = null;
      event.stopPropagation();
    };
    const onAnyPointerActivity = (event) => {
      if (event.pointerType !== "touch" && event.pointerType !== "pen") return;
      armSwallowWindow();
      void event;
    };
    const swallowSyntheticHover = (event) => {
      if (Date.now() >= swallowUntil) return;
      if (!event.isTrusted) return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(HOVER_SUBTREE_SELECTOR) === null) return;
      event.stopImmediatePropagation();
    };
    document.addEventListener("pointerdown", onAnyPointerActivity, true);
    document.addEventListener("pointerup", onPointerUp, true);
    document.addEventListener("click", onClick, true);
    for (const type of SWALLOWED_TYPES) {
      document.addEventListener(type, swallowSyntheticHover, true);
    }
    return () => {
      document.removeEventListener("pointerdown", onAnyPointerActivity, true);
      document.removeEventListener("pointerup", onPointerUp, true);
      document.removeEventListener("click", onClick, true);
      for (const type of SWALLOWED_TYPES) {
        document.removeEventListener(type, swallowSyntheticHover, true);
      }
    };
  });
}

// client/mobile/effects/session-menu.ts
var NS2 = "mobileNav";
var WORKSPACE_NS = "workspace";
var DELETE_ITEM_MARKER = 'data-mobile-nav="session-delete"';
var DANGER_COLOR = "var(--dsw-alias-state-error-primary, #b91c1c)";
var TRASH_SVG = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M14.4782 4.84067L14.2138 10.1152C14.1102 12.1872 14.067 13.0115 13.3866 13.9607C13.1044 14.3546 12.7498 14.6912 12.3424 14.9535C11.8239 15.2872 11.2415 15.4316 10.5585 15.4998C9.88727 15.5668 9.04946 15.5656 7.99998 15.5656C6.95051 15.5656 6.1127 15.5668 5.44142 15.4998C4.75851 15.4316 4.17602 15.2872 3.65753 14.9535C3.25012 14.6912 2.89559 14.3546 2.61332 13.9607C1.93296 13.0115 1.88979 12.1872 1.78619 10.1152L1.52179 4.84067L2.89006 4.77277L3.15343 10.0463C3.26221 12.2218 3.32452 12.6015 3.72646 13.1624C3.90825 13.4161 4.13686 13.6334 4.39927 13.8023C4.66204 13.9714 5.00263 14.0792 5.57825 14.1367C6.16562 14.1953 6.92298 14.1963 7.99998 14.1963C9.07699 14.1963 9.83434 14.1953 10.4217 14.1367C10.9973 14.0792 11.3379 14.1367 11.6007 13.8023C11.8631 13.6334 12.0917 13.4161 12.2735 13.1624C12.6755 12.6015 12.7378 12.2218 12.8465 10.0463L13.1099 4.77277L14.4782 4.84067ZM5.43011 6.22849H6.7994V11.3909H5.43011V6.22849ZM9.20056 6.22849H10.5699V11.3909H9.20056V6.22849ZM8.53597 0.434431C9.17976 0.434431 9.6522 0.426926 10.0966 0.571258C10.2357 0.616451 10.3717 0.672554 10.502 0.738948C10.9182 0.951107 11.2464 1.29099 11.7015 1.74612L12.4978 2.54136H15.3742V3.91169H0.625732V2.54136H3.50218L4.29845 1.74612C4.75358 1.29099 5.08174 0.951107 5.49801 0.738948C5.62831 0.672554 5.76425 0.616451 5.90334 0.571258C6.34776 0.426926 6.82021 0.434431 7.46399 0.434431H8.53597ZM7.46399 1.80476C6.73208 1.80476 6.51641 1.81187 6.32617 1.87369C6.25545 1.89667 6.18668 1.92533 6.12041 1.95907C5.96398 2.03878 5.82348 2.16253 5.44142 2.54136H10.5585C10.1765 2.16253 10.036 2.03878 9.87955 1.95907C9.81329 1.92533 9.74452 1.89667 9.6738 1.87369C9.48356 1.81187 9.26789 1.80476 8.53597 1.80476H7.46399Z" fill="currentColor" /></svg>';
function escapeHtml(value) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
}
function installSessionMenuDelete(ctx) {
  installMobileEffect(ctx, "dsh-web-mobile: session-menu delete", () => {
    const navT = ctx.locale.bind(NS2);
    const wsT = (key, params) => ctx.locale.bind(WORKSPACE_NS)(key, params);
    let anchor = null;
    let injectRaf = 0;
    let dialogHost = null;
    let closeDialogOnKey = null;
    const resolveSessionId = (row, title) => {
      const sessions = ctx.sessions.list.getSnapshot();
      const workspaces = ctx.workspaces.list.getSnapshot();
      const archived = new Set(workspaces.archivedSessionIds);
      const candidates = sessions.ids.filter((id) => {
        const summary = sessions.byId[id];
        return summary !== void 0 && !summary.blank && summary.displayTitle === title && !archived.has(id);
      });
      if (candidates.length === 1) return candidates[0];
      if (candidates.length === 0) return void 0;
      const group = row.closest('[class*="_groupSection"]');
      if (group === null) return void 0;
      const headerTitle = group.querySelector(':scope > [class*="_projectRow"] [class*="_title"]')?.textContent?.trim();
      const owned = new Set(workspaces.items.flatMap((workspace2) => workspace2.sessionIds));
      const workspace = headerTitle === void 0 ? void 0 : workspaces.items.find((candidate) => candidate.title === headerTitle);
      const workspaceIds = workspace === void 0 ? [] : workspace.sessionIds;
      const groupIds = workspace === void 0 ? sessions.ids.filter((id) => !owned.has(id) && !archived.has(id) && sessions.byId[id] !== void 0) : workspaceIds.filter((id) => !archived.has(id) && sessions.byId[id] !== void 0);
      const sameTitleGroupIds = groupIds.filter((id) => sessions.byId[id]?.displayTitle === title);
      const rows = [...group.querySelectorAll(':scope > [class*="_sessionRow"]')];
      const rowIndex = rows.indexOf(row);
      const sameTitleBefore = rowIndex === -1 ? 0 : rows.slice(0, rowIndex).filter(
        (candidate) => candidate.querySelector('[class*="_title"]')?.textContent?.trim() === title
      ).length;
      return sameTitleGroupIds[sameTitleBefore];
    };
    const isSessionMenu = (menu) => {
      const labels = [...menu.querySelectorAll('[role="menuitem"] [class*="_itemLabel"]')].map((element) => element.textContent?.trim() ?? "");
      const rename = wsT("rename");
      const fork = wsT("menu.fork");
      const archive = wsT("menu.archiveSession");
      return labels.length === 3 && labels.includes(rename) && labels.includes(fork) && labels.includes(archive);
    };
    const closeDialog = () => {
      if (closeDialogOnKey !== null) {
        document.removeEventListener("keydown", closeDialogOnKey, true);
        closeDialogOnKey = null;
      }
      if (dialogHost !== null) {
        dialogHost.backdrop.remove();
        dialogHost.card.remove();
        dialogHost = null;
      }
    };
    const showDeleteDialog = (sessionId, title) => {
      closeDialog();
      const frame = getFrame() ?? document.body;
      const backdrop = document.createElement("div");
      backdrop.dataset.mobileNav = "delete-dialog-backdrop";
      const card = document.createElement("div");
      card.dataset.mobileNav = "delete-dialog";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-modal", "true");
      card.innerHTML = `
        <div data-mobile-nav="delete-confirm-title">${escapeHtml(navT("deleteConfirmTitle"))}</div>
        <div data-mobile-nav="delete-confirm-desc">${escapeHtml(navT("deleteConfirmDesc", { title }))}</div>
        <div data-mobile-nav="delete-confirm-actions">
          <button type="button" data-mobile-nav="delete-confirm-no">${escapeHtml(navT("deleteConfirmNo"))}</button>
          <button type="button" data-mobile-nav="delete-confirm-yes">${escapeHtml(navT("deleteConfirmYes"))}</button>
        </div>
        <div data-mobile-nav="delete-error" role="alert" hidden></div>`;
      const noButton = card.querySelector('[data-mobile-nav="delete-confirm-no"]');
      const yesButton = card.querySelector('[data-mobile-nav="delete-confirm-yes"]');
      const errorLine = card.querySelector('[data-mobile-nav="delete-error"]');
      noButton?.addEventListener("click", closeDialog);
      backdrop.addEventListener("click", closeDialog);
      const onKey = (event) => {
        if (event.key === "Escape") closeDialog();
      };
      document.addEventListener("keydown", onKey, true);
      closeDialogOnKey = onKey;
      const resetButtons = () => {
        if (yesButton !== null) {
          yesButton.disabled = false;
          yesButton.textContent = navT("deleteConfirmYes");
        }
        if (noButton !== null) noButton.disabled = false;
      };
      const fail = (message) => {
        if (errorLine !== null) {
          errorLine.textContent = message;
          errorLine.hidden = false;
        }
        resetButtons();
      };
      const mapError = (payload, reason) => {
        const code = payload?.error?.code;
        if (code === "session-not-found") return navT("deleteErrorNotFound");
        if (code === "session-busy") return navT("deleteErrorBusy");
        const message = payload?.error?.message ?? (reason instanceof Error ? reason.message : String(reason));
        return navT("deleteErrorGeneric", { message });
      };
      yesButton?.addEventListener("click", async () => {
        yesButton.disabled = true;
        if (noButton !== null) noButton.disabled = true;
        yesButton.textContent = navT("deletePending");
        if (errorLine !== null) errorLine.hidden = true;
        const wasCurrent = ctx.sessions.list.getSnapshot().current === sessionId;
        try {
          const response = await fetch("/api/mobile-nav.session.delete", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId })
          });
          const payload = await response.json().catch(() => null);
          if (!response.ok || payload === null || payload.ok !== true) {
            fail(mapError(payload, new Error(`HTTP ${response.status}`)));
            return;
          }
        } catch (reason) {
          fail(mapError(null, reason));
          return;
        }
        closeDialog();
        if (wasCurrent) ctx.sessions.clear();
        const sessions = ctx.sessions;
        await sessions.refresh?.();
        if (wasCurrent && window.matchMedia(MOBILE_QUERY).matches) ctx.layout.toggleSidebar();
      });
      frame.appendChild(backdrop);
      frame.appendChild(card);
      dialogHost = { backdrop, card };
    };
    const showError = (message) => {
      closeDialog();
      const frame = getFrame() ?? document.body;
      const backdrop = document.createElement("div");
      backdrop.dataset.mobileNav = "delete-dialog-backdrop";
      const card = document.createElement("div");
      card.dataset.mobileNav = "delete-dialog";
      card.setAttribute("role", "dialog");
      card.setAttribute("aria-modal", "true");
      card.innerHTML = `
        <div data-mobile-nav="delete-confirm-title">${escapeHtml(navT("deleteSession"))}</div>
        <div data-mobile-nav="delete-error" role="alert">${escapeHtml(message)}</div>
        <div data-mobile-nav="delete-confirm-actions">
          <button type="button" data-mobile-nav="delete-confirm-no">${escapeHtml(navT("deleteConfirmNo"))}</button>
        </div>`;
      card.querySelector('[data-mobile-nav="delete-confirm-no"]')?.addEventListener("click", closeDialog);
      backdrop.addEventListener("click", closeDialog);
      const onKey = (event) => {
        if (event.key === "Escape") closeDialog();
      };
      document.addEventListener("keydown", onKey, true);
      closeDialogOnKey = onKey;
      frame.appendChild(backdrop);
      frame.appendChild(card);
      dialogHost = { backdrop, card };
    };
    const injectInto = (menu) => {
      if (menu.querySelector(`[${DELETE_ITEM_MARKER}]`) !== null) return;
      const template = menu.querySelector('[role="menuitem"]');
      const wrap = template?.parentElement;
      const viewport = menu.querySelector('[class*="_viewport"]');
      if (template === null || wrap === null || wrap === void 0 || viewport === null) return;
      const clone = wrap.cloneNode(true);
      const button = clone.querySelector('[role="menuitem"]');
      if (button === null) return;
      const icon = button.querySelector('[class*="_itemIcon"]');
      if (icon !== null) {
        icon.innerHTML = TRASH_SVG;
        icon.style.color = DANGER_COLOR;
      }
      const label = button.querySelector('[class*="_itemLabel"]');
      if (label !== null) {
        label.textContent = navT("deleteSession");
        label.style.color = DANGER_COLOR;
      }
      button.setAttribute("data-mobile-nav", "session-delete");
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const captured = anchor;
        captured?.button.click();
        try {
          if (captured === null || captured === void 0) {
            showError(navT("deleteErrorResolve"));
            return;
          }
          const sessionId = resolveSessionId(captured.row, captured.title);
          if (sessionId === void 0) {
            showError(navT("deleteErrorResolve"));
            return;
          }
          showDeleteDialog(sessionId, captured.title);
        } catch (reason) {
          console.error("[dsh-web-mobile] session delete failed:", reason);
          showError(navT("deleteErrorGeneric", {
            message: reason instanceof Error ? reason.message : String(reason)
          }));
        }
      });
      viewport.appendChild(clone);
    };
    const injectAll = () => {
      for (const menu of document.querySelectorAll('[role="menu"]')) {
        if (isSessionMenu(menu)) injectInto(menu);
      }
    };
    const scheduleInject = () => {
      if (injectRaf !== 0) return;
      injectRaf = requestAnimationFrame(() => {
        injectRaf = 0;
        injectAll();
      });
    };
    const onDocumentClick = (event) => {
      const target = event.target;
      if (target === null) return;
      const row = target.closest('[class*="_sessionRow"]');
      if (row === null) return;
      const button = row.querySelector("button");
      if (button === null) return;
      const title = row.querySelector('[class*="_title"]')?.textContent?.trim() ?? "";
      anchor = { button, row, title };
      scheduleInject();
    };
    document.addEventListener("click", onDocumentClick, true);
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.type !== "childList") continue;
        const target = record.target;
        if (target === document.body) {
          scheduleInject();
          break;
        }
        if (target instanceof HTMLElement && (target.matches('[role="menu"]') || target.closest('[role="menu"]') !== null)) {
          scheduleInject();
          break;
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
    injectAll();
    return () => {
      document.removeEventListener("click", onDocumentClick, true);
      observer.disconnect();
      if (injectRaf !== 0) cancelAnimationFrame(injectRaf);
      closeDialog();
      anchor = null;
    };
  }, TOUCH_QUERY);
}

// client/mobile/effects/composer-keyboard-guard.ts
var COMPOSER_CARD_SELECTOR = "[data-composer-card]";
var COMPOSER_INPUT_SELECTOR = "[data-composer-input]";
var SHADOW_MARKER = "data-mobile-nav-focus-shadow";
function installComposerKeyboardGuard(ctx) {
  installMobileEffect(ctx, "dsh-web-mobile: composer keyboard guard", () => {
    if (!detectIosWebKit(navigator, typeof CSS !== "undefined" && typeof CSS.supports === "function" ? CSS.supports.bind(CSS) : null)) {
      return void 0;
    }
    const restore = () => {
      const el = document.querySelector(`[${SHADOW_MARKER}]`);
      if (el === null) return;
      el.removeAttribute(SHADOW_MARKER);
      const shadowed = el;
      if (Object.prototype.hasOwnProperty.call(el, "focus")) delete shadowed.focus;
    };
    const onMouseDown = (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (typeof target.closest !== "function") return;
      const card = target.closest(COMPOSER_CARD_SELECTOR);
      if (card === null) return;
      const editor = card.querySelector(COMPOSER_INPUT_SELECTOR);
      if (editor === null || target.closest(COMPOSER_INPUT_SELECTOR) !== null) return;
      restore();
      editor.setAttribute(SHADOW_MARKER, "");
      Object.defineProperty(editor, "focus", {
        configurable: true,
        writable: true,
        value: function swallowedFocus() {
        }
      });
      setTimeout(restore, 0);
    };
    document.addEventListener("mousedown", onMouseDown, true);
    return () => {
      document.removeEventListener("mousedown", onMouseDown, true);
      restore();
    };
  });
}

// client/mobile/core/raf-scheduler.ts
function createRafScheduler(raf, caf) {
  let pending = 0;
  let queued = false;
  return {
    schedule(fn) {
      if (queued) return;
      queued = true;
      pending = raf(() => {
        queued = false;
        fn();
      });
    },
    cancel() {
      if (!queued) return;
      caf(pending);
      queued = false;
    }
  };
}

// client/mobile/debug.ts
function installDebugBadge(ctx) {
  ctx.effect(() => {
    if (!new URLSearchParams(location.search).has("mobile-nav-debug")) return () => {
    };
    const errors = [];
    const onError = (event) => errors.push(`ERR ${event.message.slice(0, 120)}`);
    const onRejection = (event) => errors.push(`REJ ${String(event.reason).slice(0, 120)}`);
    window.addEventListener("error", onError);
    window.addEventListener("unhandledrejection", onRejection);
    const badge = document.createElement("div");
    badge.style.cssText = [
      "position:fixed",
      "top:40px",
      "right:6px",
      "z-index:2147483000",
      "background:rgba(0,0,0,.82)",
      "color:#fff",
      "font:11px/1.5 ui-monospace,monospace",
      "padding:8px 10px",
      "border-radius:8px",
      "max-width:94vw",
      "max-height:70vh",
      "overflow:auto",
      "white-space:pre-wrap",
      "pointer-events:none"
    ].join(";");
    const read = () => {
      const q = (sel) => !!document.querySelector(sel);
      const vis = (sel) => {
        const el = document.querySelector(sel);
        return el === null ? "absent" : getComputedStyle(el).visibility;
      };
      const frame = document.querySelector('[data-mobile-nav="frame"]');
      return [
        `build 20260906 (overlay takeover re-scope)`,
        `URL ${location.pathname}${location.search}`,
        `W ${innerWidth} x ${innerHeight} dpr ${devicePixelRatio}`,
        `mq\u22641023 ${matchMedia(MOBILE_QUERY).matches}  mq\u22651024 ${matchMedia(DESKTOP_QUERY).matches}`,
        `css ${q('style[data-plugin-css*="mobile"]')}  frame ${!!frame}`,
        `previewCol ${vis("[data-aionui-preview-col]")}  explorerCol ${vis("[data-aionui-explorer-col]")}`,
        `previewOpen ${frame?.hasAttribute("data-aionui-preview-open") ?? "?"}  explorerOpen ${frame?.hasAttribute("data-aionui-explorer-open") ?? "?"}  previewFull ${frame?.hasAttribute("data-mobile-preview-full") ?? "?"}`,
        `header ${vis("[data-phase] header")}  composer ${q("textarea, [data-composer-input]")}`,
        `genui cards ${document.querySelectorAll("[data-genui]").length}  panel ${q("[data-genui-panel]")}`,
        `phase ${document.querySelector("[data-phase]")?.getAttribute("data-phase") ?? "?"}`,
        `errs ${errors.slice(-5).join(" | ") || "none"}`
      ].join("\n");
    };
    const paint = () => {
      badge.textContent = read();
    };
    paint();
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        if (record.target === badge || badge.contains(record.target)) continue;
        paint();
        return;
      }
    });
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });
    const timer = setInterval(paint, 1500);
    document.body.appendChild(badge);
    return () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
      observer.disconnect();
      clearInterval(timer);
      badge.remove();
    };
  }, "dsh-web-mobile: debug badge");
}

// client/mobile/i18n/locales.ts
var NS3 = "mobileNav";
var zh = {
  "open": "\u6253\u5F00\u76EE\u5F55",
  "close": "\u6536\u8D77\u76EE\u5F55",
  "backdrop": "\u70B9\u51FB\u5173\u95ED\u76EE\u5F55",
  "sessionLog": "\u5BFC\u51FA\u4F1A\u8BDD\u65E5\u5FD7",
  "files": "\u6587\u4EF6\u6D4F\u89C8",
  "previewFullscreen": "\u5168\u5C4F\u9884\u89C8",
  "previewExitFullscreen": "\u9000\u51FA\u5168\u5C4F",
  "deleteSession": "\u5220\u9664\u4F1A\u8BDD",
  "deleteConfirmTitle": "\u5220\u9664\u4F1A\u8BDD\uFF1F",
  "deleteConfirmDesc": "\u5C06\u5220\u9664\u300C{title}\u300D\u7684\u5B8C\u6574\u4F1A\u8BDD\u8BB0\u5F55\uFF0C\u6B64\u64CD\u4F5C\u4E0D\u53EF\u6062\u590D\u3002",
  "deleteConfirmYes": "\u5220\u9664",
  "deleteConfirmNo": "\u53D6\u6D88",
  "deletePending": "\u6B63\u5728\u5220\u9664\u2026",
  "deleteErrorBusy": "\u8BE5\u4F1A\u8BDD\u6B63\u5728\u8FD0\u884C\u4E14\u65E0\u6CD5\u505C\u6B62\uFF0C\u8BF7\u7A0D\u540E\u91CD\u8BD5\u3002",
  "deleteErrorNotFound": "\u4F1A\u8BDD\u4E0D\u5B58\u5728\u6216\u5DF2\u88AB\u5220\u9664\u3002",
  "deleteErrorResolve": "\u65E0\u6CD5\u786E\u5B9A\u8981\u5220\u9664\u7684\u4F1A\u8BDD\uFF0C\u8BF7\u91CD\u8BD5\u3002",
  "deleteErrorGeneric": "\u5220\u9664\u5931\u8D25\uFF1A{message}"
};
var en = {
  "open": "Open directory",
  "close": "Close directory",
  "backdrop": "Click to close directory",
  "sessionLog": "Session log",
  "files": "Files",
  "previewFullscreen": "Fullscreen preview",
  "previewExitFullscreen": "Exit fullscreen",
  "deleteSession": "Delete session",
  "deleteConfirmTitle": "Delete session?",
  "deleteConfirmDesc": "The complete log of \u201C{title}\u201D will be permanently removed. This cannot be undone.",
  "deleteConfirmYes": "Delete",
  "deleteConfirmNo": "Cancel",
  "deletePending": "Deleting\u2026",
  "deleteErrorBusy": "This session is running and could not be stopped. Try again later.",
  "deleteErrorNotFound": "The session does not exist or was already deleted.",
  "deleteErrorResolve": "Could not identify the session to delete. Please try again.",
  "deleteErrorGeneric": "Delete failed: {message}"
};

// client/mobile/index.tsx
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS3, { zh, en }), "dsh-web-mobile: dictionaries");
  ctx.effect(() => {
    const tag = document.createElement("style");
    tag.dataset.plugin = "dsh-web-mobile";
    tag.dataset.pluginCss = "dsh-web-mobile/mobile.css";
    tag.textContent = MOBILE_CSS;
    document.head.appendChild(tag);
    setTimeout(() => {
      if (tag.isConnected) document.head.appendChild(tag);
    }, 0);
    return () => {
      tag.remove();
    };
  }, "dsh-web-mobile: styles");
  ctx.effect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const rowSelector = '[class*="irow"]:not([class*="irowActions"]):not([class*="irowTrailing"])';
    const set = (el, props) => {
      for (const [key, value] of Object.entries(props)) {
        el.style.setProperty(key, value, "important");
      }
    };
    const unset = (el, props) => {
      for (const key of props) el.style.removeProperty(key);
    };
    const rowProps = ["flex-wrap", "align-items", "gap"];
    const firstProps = ["flex", "max-width", "min-width"];
    const textProps = ["white-space", "overflow", "text-overflow", "max-width"];
    const clear = () => {
      document.querySelectorAll(rowSelector).forEach((row) => {
        unset(row, rowProps);
        const first = row.children[0];
        if (first) unset(first, firstProps);
        row.querySelectorAll(':scope > button, :scope > [class*="owner"], :scope > [class*="grow"]').forEach((el) => {
          unset(el, ["order"]);
        });
        const spec = row.querySelector('[class*="spec"]');
        const nm = row.querySelector('[class*="nm"]');
        if (spec) unset(spec, textProps);
        if (nm) unset(nm, textProps);
      });
    };
    const apply3 = () => {
      if (document.querySelector('[data-dsh-market-root], [role="dialog"]') === null) return;
      document.querySelectorAll(rowSelector).forEach((row) => {
        set(row, {
          "flex-wrap": "wrap",
          "align-items": "center",
          "gap": "4px 10px"
        });
        const first = row.children[0];
        if (first) {
          set(first, {
            "flex": "1 1 100%",
            "max-width": "100%",
            "min-width": "0"
          });
        }
        const spec = row.querySelector('[class*="spec"]');
        const nm = row.querySelector('[class*="nm"]');
        if (spec) {
          set(spec, {
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "max-width": "100%"
          });
        }
        if (nm) {
          set(nm, {
            "white-space": "nowrap",
            "overflow": "hidden",
            "text-overflow": "ellipsis",
            "max-width": "100%"
          });
        }
      });
    };
    const arm = () => {
      clear();
      if (mq.matches) apply3();
    };
    arm();
    const scheduler = createRafScheduler(
      (cb) => window.requestAnimationFrame(cb),
      (id) => window.cancelAnimationFrame(id)
    );
    const mo = new MutationObserver(() => {
      if (mq.matches) scheduler.schedule(() => {
        if (mq.matches) apply3();
      });
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
    mq.addEventListener("change", arm);
    return () => {
      scheduler.cancel();
      mo.disconnect();
      mq.removeEventListener("change", arm);
      clear();
    };
  }, "dsh-web-mobile: installed-list-inline-styles");
  ctx.effect(() => {
    const stops = [
      installFrameController(),
      installReconciler(ctx),
      registerReconcileTasks(ctx)
    ];
    return () => {
      for (const stop of stops) stop();
    };
  }, "dsh-web-mobile: reconciler infrastructure");
  installOverlayInteractions(ctx);
  installSessionMenuDelete(ctx);
  installSidebarSwipe(ctx);
  installSubagentChipTouch(ctx);
  installComposerKeyboardGuard(ctx);
  installPhoneChrome(ctx);
  installAionuiCompat(ctx);
  installDebugBadge(ctx);
  ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
    name: "conversation.session.header.actions",
    id: "mobile-nav-toggle",
    order: 10,
    locale: NS3,
    inject: () => ({
      toggleSidebar: () => ctx.layout.toggleSidebar()
    })
  }, MobileNavToggle));
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "mobile-nav-session-log",
    order: 5,
    locale: NS3,
    inject: () => ({
      // The component's internal id is a plain string (slot runtime typing);
      // the host-generation brand boundary lives here and only here, hence
      // the double assertion (string and Branded<'SessionId'> do not overlap).
      downloadSessionLog: (sessionId) => ctx.sessionLogDownload.download(sessionId)
    })
  }, MobileDrawerFooter));
}

// client/pocket-locales.js
var NS4 = "pocket-k";
var zh2 = {
  "section": "\u624B\u673A\u8BBF\u95EE",
  "title": "\u{1F4F1} \u624B\u673A\u8BBF\u95EE",
  "subtitle": "\u624B\u673A\u626B\u7801\u6253\u5F00\u7684\u5C31\u662F\u7535\u8111\u4E0A\u7684\u8FD9\u4E2A\u754C\u9762\uFF0C\u5B9E\u65F6\u540C\u6B65",
  "developer": "\u5F00\u53D1\u8005\uFF1A\u7A0B\u5E8F\u5458\u5C11\u5317\u6668 \xB7 kaneve",
  "internalBuild": "\u5185\u90E8\u7248\u672C v1.13.4-k1\uFF08\u4E0A\u6E38 {upstream}\uFF09",
  "restarted": "\u{1F504} \u5DF2\u91CD\u542F",
  "ok": "\u77E5\u9053\u4E86",
  "bgHint": "\u8FDB\u7A0B\u5728\u540E\u53F0\u8FD0\u884C\uFF08\u4E0D\u6302\u7EC8\u7AEF\uFF09\u3002\u5982\u9700\u505C\u6B62\uFF1A{cmd}",
  "updatedRestart": "\u2705 \u5DF2\u66F4\u65B0 v{ver}\uFF0C\u91CD\u542F\u751F\u6548",
  "updateAutoRestarting": "\u2705 \u5DF2\u66F4\u65B0 v{ver}\uFF0C\u6B63\u5728\u81EA\u52A8\u91CD\u542F\u2026",
  "updatedOk": "\u2705 \u5DF2\u66F4\u65B0 v{ver}",
  "updateAvailable": "\u{1F4E6} \u65B0\u7248\u672C v{ver}",
  "updating": "\u66F4\u65B0\u4E2D\u2026",
  "updateTo": "\u66F4\u65B0\u5230 v{ver}",
  "restartingNow": "\u6B63\u5728\u91CD\u542F\u751F\u6548\u2026",
  "restarting": "\u91CD\u542F\u4E2D\u2026",
  "restartNow": "\u{1F504} \u91CD\u542F dsh web \u751F\u6548",
  "updatingDetail": "\u23F3 \u66F4\u65B0\u4E2D\uFF08\u901A\u5E38 1-2 \u5206\u949F\uFF09\xB7 \u5DF2\u7B49\u5F85 {s} \u79D2",
  "restartingDetail": "\u23F3 \u6B63\u5728\u91CD\u542F\u751F\u6548\uFF08\u901A\u5E38 10-30 \u79D2\uFF09\xB7 \u5DF2\u7B49\u5F85 {s} \u79D2",
  "updatedAutoDetail": "\u2705 \u5DF2\u66F4\u65B0\uFF0C\u6B63\u5728\u81EA\u52A8\u91CD\u542F\u751F\u6548\uFF0C\u8BF7\u7A0D\u5019\u5237\u65B0",
  "updatedRestartDetail": "\u2705 \u5DF2\u66F4\u65B0\uFF0C\u91CD\u542F dsh web \u751F\u6548",
  "updateFailed": "\u274C \u5931\u8D25\uFF1A{err}\uFF08\u624B\u52A8\u66F4\u65B0\uFF1Adsh plugin --profile web update dsh-pocket-k --latest -w\uFF09",
  "versionRange": "\u5F53\u524D v{cur} \u2192 \u6700\u65B0 v{latest}",
  "lanTitle": "\u{1F4F6} \u5C40\u57DF\u7F51\uFF08\u540C\u4E00 WiFi\uFF09",
  "lanHint": "\u624B\u673A\u8FDE\u63A5\u540C\u4E00 WiFi \u540E\u626B\u7801\u5373\u53EF\u6253\u5F00",
  "lanAddress": "\u5C40\u57DF\u7F51\u5730\u5740",
  "lanAddressAuto": "\u81EA\u52A8\uFF08\u63A8\u8350\uFF09",
  "lanAddressHint": "\u9AD8\u7EA7\u9009\u9879\uFF1A\u4E00\u822C\u4E0D\u9700\u8981\u4FEE\u6539\uFF1B\u4F7F\u7528 Tailscale/VPN \u7B49\u8FDC\u7A0B\u8BBF\u95EE\u65F6\u53EF\u624B\u52A8\u9009\u62E9",
  "lanPin": "\u5C40\u57DF\u7F51\u8BBF\u95EE\u5BC6\u7801",
  "on": "\u5F00",
  "off": "\u5173",
  "lanPinValue": "\u{1F510} \u8BBF\u95EE\u5BC6\u7801\uFF1A{pin}\uFF08\u624B\u673A\u6253\u5F00\u9700\u8F93\u5165\uFF1B\u4E0E\u516C\u7F51\u5BC6\u7801\u5206\u5F00\uFF09",
  "lanPinCustomValue": "\u{1F510} \u8BBF\u95EE\u5BC6\u7801\uFF1A{pin}\uFF08\u81EA\u5B9A\u4E49\uFF1B\u624B\u673A\u6253\u5F00\u9700\u8F93\u5165\uFF09",
  "refresh": "\u5237\u65B0",
  "customize": "\u81EA\u5B9A\u4E49",
  "customizing": "\u65B0\u5BC6\u7801\uFF088 \u4F4D\u6570\u5B57\uFF09\uFF1A",
  "save": "\u4FDD\u5B58",
  "cancel": "\u53D6\u6D88",
  "pinInvalid": "\u5BC6\u7801\u5FC5\u987B\u662F 8 \u4F4D\u6570\u5B57",
  "pinCustomHint": "\u81EA\u5B9A\u4E49\u540E\u5F00\u542F\u516C\u7F51\u4E0D\u518D\u81EA\u52A8\u6362\u65B0",
  "lanPinOff": "\u{1F513} \u5BC6\u7801\u5DF2\u5173\u95ED\uFF1A\u626B\u7801\u76F4\u8FDE\uFF0C\u65E0\u9700\u5BC6\u7801\uFF08\u4EC5\u540C\u4E00\u5C40\u57DF\u7F51\u8BBE\u5907\u53EF\u8BBF\u95EE\uFF1B\u516C\u7F51\u4ECD\u8981\u5BC6\u7801\uFF09",
  "lanDisabled": "\u5C40\u57DF\u7F51\u8BBF\u95EE\u5DF2\u5173\u95ED\uFF1A\u624B\u673A\u65E0\u6CD5\u901A\u8FC7\u5C40\u57DF\u7F51\u8BBF\u95EE\uFF08\u516C\u7F51\u96A7\u9053\u4E0D\u53D7\u5F71\u54CD\uFF09",
  "lanEnable": "\u5F00\u542F\u5C40\u57DF\u7F51",
  "lanStarting": "\u4EE3\u7406\u672A\u5C31\u7EEA\u2026",
  "wanTitle": "\u{1F310} \u516C\u7F51\uFF08\u4EBA\u5728\u5916\u9762\uFF09",
  "wanHint": "\u4EFB\u4F55\u7F51\u7EDC\u626B\u7801\u5373\u7528\uFF08URL \u6BCF\u6B21\u91CD\u542F\u81EA\u52A8\u6362\u65B0\uFF09",
  "wanPin": "\u{1F510} \u8BBF\u95EE\u5BC6\u7801\uFF1A{pin}\uFF08\u6BCF\u6B21\u5F00\u542F\u516C\u7F51\u53D8\u65B0\uFF1B\u624B\u673A\u6253\u5F00\u94FE\u63A5\u9700\u8F93\u5165\u6B64\u5BC6\u7801\uFF09",
  "wanPinCustom": "\u{1F510} \u8BBF\u95EE\u5BC6\u7801\uFF1A{pin}\uFF08\u81EA\u5B9A\u4E49\uFF0C\u5F00\u542F\u516C\u7F51\u4E0D\u518D\u81EA\u52A8\u6362\u65B0\uFF09",
  "fixedMode": "\u56FA\u5B9A\u57DF\u540D\u6A21\u5F0F\uFF08\u624B\u52A8 named tunnel\uFF09",
  "randomMode": "\u968F\u673A\u96A7\u9053\u6A21\u5F0F\uFF08\u6BCF\u6B21\u91CD\u542F\u6362\u65B0\u5730\u5740\uFF09",
  "publicBaseTitle": "\u516C\u7F51\u56FA\u5B9A\u5730\u5740",
  "publicBasePlaceholder": "https://dsh.example.com",
  "publicBaseClear": "\u6E05\u9664",
  "publicBaseHint": "\u5728 Cloudflare \u63A7\u5236\u53F0\u521B\u5EFA named tunnel \u5E76\u6307\u5411\u672C\u673A 3081 \u7AEF\u53E3\uFF1B\u57DF\u540D\u9700\u6258\u7BA1\u5728 Cloudflare\uFF1B\u5927\u9646\u53EF\u8FBE\u6027\u8BF7\u81EA\u6D4B\u3002\u4FDD\u5B58\u540E\u516C\u7F51\u4E8C\u7EF4\u7801\u6539\u7528\u6B64\u5730\u5740\uFF0C\u767B\u5F55\u72B6\u6001\u8DE8\u91CD\u542F\u4FDD\u6301\u3002",
  "cfModeTitle": "Cloudflare \u81EA\u52A8\u914D\u7F6E\u65B9\u5F0F",
  "cfModeCli": "CLI \u767B\u5F55\uFF08cloudflared tunnel login\uFF09",
  "cfModeApi": "API Token\uFF08\u65E0\u9700\u547D\u4EE4\u884C\uFF09",
  "cfModePickHint": "\u8BF7\u9009\u62E9\u4E00\u79CD\u81EA\u52A8\u914D\u7F6E\u65B9\u5F0F\uFF1ACLI \u767B\u5F55\u6216 API Token\u3002",
  "cfModeHintCli": "\u5148\u5728\u7EC8\u7AEF\u8FD0\u884C `cloudflared tunnel login` \u751F\u6210\u8BC1\u4E66\uFF0C\u4FDD\u5B58\u56FA\u5B9A\u57DF\u540D\u540E\u70B9\u300C\u5F00\u542F\u56FA\u5B9A\u57DF\u540D\u516C\u7F51\u300D\uFF0C\u63D2\u4EF6\u4F1A\u81EA\u52A8\u521B\u5EFA named tunnel\u3001\u914D\u7F6E DNS \u5E76\u542F\u52A8\u3002",
  "cfModeHintApi": "\u7C98\u8D34 Cloudflare API Token\uFF08\u9700 Account > Cloudflare Tunnel > Edit \u548C Zone > DNS > Edit \u6743\u9650\uFF09\u3002\u63D2\u4EF6\u4F1A\u81EA\u52A8\u521B\u5EFA\u96A7\u9053\u3001\u914D\u7F6E DNS \u5E76\u542F\u52A8\uFF0C\u65E0\u9700\u547D\u4EE4\u884C\u3002",
  "cfTokenPlaceholder": "\u7C98\u8D34 Cloudflare API Token",
  "cfTokenSaved": "\u5DF2\u4FDD\u5B58 Token\uFF08\u4E0D\u56DE\u663E\uFF09",
  "cfTokenSave": "\u4FDD\u5B58 Token",
  "cfTokenReplace": "\u66FF\u6362 Token",
  "cfTokenClear": "\u6E05\u9664",
  "cfTokenSavedHint": "Token \u5DF2\u4FDD\u5B58\uFF0C\u4EC5\u5B58\u672C\u673A settings.json\uFF080600\uFF09\uFF0C\u4E0D\u4F1A\u56DE\u663E\u5230\u9875\u9762\u3002",
  "enableFixed": "\u5F00\u542F\u56FA\u5B9A\u57DF\u540D\u516C\u7F51",
  "close": "\u5173\u95ED",
  "publicBaseErrMissing": "\u8BF7\u8F93\u5165 https:// \u5730\u5740",
  "publicBaseErrUrl": "\u4E0D\u662F\u5408\u6CD5\u7684 URL",
  "publicBaseErrProtocol": "\u4EC5\u652F\u6301 https://",
  "publicBaseErrPath": "\u4E0D\u80FD\u5305\u542B\u8DEF\u5F84\u3001\u7ED3\u5C3E\u659C\u6760\u3001query \u6216 hash",
  "publicBaseErrAuth": "\u4E0D\u80FD\u5305\u542B\u7528\u6237\u540D\u6216\u5BC6\u7801",
  "devicesTitle": "\u5DF2\u914D\u5BF9\u8BBE\u5907",
  "devicesHint": "\u5DF2\u767B\u5F55\u8FC7\u516C\u7F51\u5730\u5740\u7684\u624B\u673A/\u6D4F\u89C8\u5668\uFF1B\u6BCF\u53F0\u8BBE\u5907\u6301\u6709\u72EC\u7ACB\u4F1A\u8BDD\u3002\u64A4\u9500\u540E\u8BE5\u8BBE\u5907\u4E0B\u6B21\u8BBF\u95EE\u9700\u91CD\u65B0\u8F93\u5165 PIN\u3002",
  "devicesLoading": "\u6B63\u5728\u52A0\u8F7D\u8BBE\u5907\u2026",
  "devicesEmpty": "\u8FD8\u6CA1\u6709\u8BBE\u5907\u767B\u5F55\u8FC7\u516C\u7F51\u5730\u5740",
  "deviceOnline": "\u5728\u7EBF",
  "deviceOffline": "\u79BB\u7EBF",
  "deviceMeta": "\u9996\u6B21\u767B\u5F55\uFF1A{first} \xB7 \u6700\u8FD1\u6D3B\u52A8\uFF1A{last}",
  "deviceRevoke": "\u64A4\u9500",
  "deviceRevokeAll": "\u5168\u90E8\u64A4\u9500",
  "deviceRevokeTitle": "\u64A4\u9500\u8FD9\u53F0\u8BBE\u5907\uFF1F",
  "deviceRevokeAllTitle": "\u64A4\u9500\u5168\u90E8\u8BBE\u5907\uFF1F",
  "deviceRevokeBody": "\u64A4\u9500\u540E\uFF0C\u8BE5\u8BBE\u5907\u4E0B\u6B21\u8BBF\u95EE\u516C\u7F51\u5730\u5740\u9700\u8981\u91CD\u65B0\u8F93\u5165 PIN\u3002",
  "deviceRevokeAllBody": "\u64A4\u9500\u540E\uFF0C\u6240\u6709\u5DF2\u914D\u5BF9\u8BBE\u5907\u4E0B\u6B21\u8BBF\u95EE\u516C\u7F51\u5730\u5740\u90FD\u9700\u8981\u91CD\u65B0\u8F93\u5165 PIN\u3002",
  "revoking": "\u64A4\u9500\u4E2D\u2026",
  "enableBackup": "\u5F00\u542F\u5FEB\u901F\u96A7\u9053\uFF08\u5907\u7528\uFF09",
  "stopTunnel": "\u5173\u95ED\u516C\u7F51",
  "enable": "\u5F00\u542F\u516C\u7F51\u8BBF\u95EE",
  "opening": "\u5F00\u542F\u4E2D\u2026",
  "disclaimerTitle": "\u26A0\uFE0F \u5B89\u5168\u514D\u8D23\u58F0\u660E",
  "disclaimerBody": "\u5F00\u542F\u516C\u7F51 = \u628A\u672C\u673A DSH\uFF08\u80FD\u6267\u884C\u4EE3\u7801\uFF09\u66B4\u9732\u5230\u4E92\u8054\u7F51\u3002\u4EFB\u4F55\u4EBA\u62FF\u5230\u516C\u7F51\u94FE\u63A5\u548C\u5BC6\u7801\uFF0C\u90FD\u80FD\u8BBF\u95EE\u751A\u81F3\u64CD\u4F5C\u4F60\u7684\u7535\u8111\u3002\u8BF7\u786E\u8BA4\uFF1A\u2460 \u4F7F\u7528\u81EA\u5B9A\u4E49\u5F3A\u5BC6\u7801\u6216\u59A5\u5584\u4FDD\u7BA1\u81EA\u52A8\u5BC6\u7801\uFF1B\u2461 \u7528\u5B8C\u7ACB\u5373\u300C\u5173\u95ED\u516C\u7F51\u300D\uFF1B\u2462 \u516C\u53F8/\u6D89\u5BC6\u7F51\u7EDC\u8BF7\u5148\u786E\u8BA4\u5408\u89C4\u3002",
  "disclaimerAgree": "\u6211\u5DF2\u77E5\u60C5\uFF0C\u540C\u610F\u5F00\u542F",
  "disclaimerHint": "\u8BF7\u52FE\u9009\u300C\u6211\u5DF2\u77E5\u60C5\u300D\u540E\u518D\u5F00\u542F\u516C\u7F51",
  "downloading": "\u23F3 \u4E0B\u8F7D cloudflared\uFF08\u9996\u6B21\u7EA6 20-50MB\uFF0C\u901A\u5E38 1-2 \u5206\u949F\uFF1B\u4E4B\u540E\u79D2\u5F00\uFF09\xB7 \u5DF2\u7B49\u5F85 {s} \u79D2",
  "connecting": "\u23F3 \u8FDE\u63A5 Cloudflare \u8FB9\u7F18\uFF08\u901A\u5E38 5-30 \u79D2\uFF09\xB7 \u5DF2\u7B49\u5F85 {s} \u79D2{suffix}",
  "slowHint": " \u2014 \u6709\u70B9\u4E45\uFF1F\u68C0\u67E5\u662F\u5426\u5F00\u7740\u4EE3\u7406/VPN\uFF08Clash TUN \u7B49\uFF09",
  "error": "\u274C \u5F00\u542F\u5931\u8D25\uFF1A{detail}\uFF08\u53EF\u91CD\u8BD5\uFF1B\u82E5\u662F\u4EE3\u7406/VPN \u95EE\u9898\u89C1 README \u6392\u969C\uFF09",
  "unknownError": "\u672A\u77E5\u9519\u8BEF",
  "feedback": "\u6709\u95EE\u9898\uFF1F\u6B22\u8FCE\u5230 GitHub Issues \u53CD\u9988 \u{1F64F}"
};
var en2 = {
  "section": "Phone access",
  "title": "\u{1F4F1} Phone access",
  "subtitle": "The phone shows this exact screen, live",
  "developer": "Developer: \u5C11\u5317\u6668 (shaobeichen) \xB7 kaneve",
  "internalBuild": "Internal build v1.13.4-k1 (upstream {upstream})",
  "restarted": "\u{1F504} Restarted",
  "ok": "Got it",
  "bgHint": "Running in the background (not attached to a terminal). To stop: {cmd}",
  "updatedRestart": "\u2705 Updated to v{ver} \u2014 restart to apply",
  "updateAutoRestarting": "\u2705 Updated to v{ver} \u2014 auto-restarting\u2026",
  "updatedOk": "\u2705 Updated to v{ver}",
  "updateAvailable": "\u{1F4E6} Update available: v{ver}",
  "updating": "Updating\u2026",
  "updateTo": "Update to v{ver}",
  "restartingNow": "Restarting to apply\u2026",
  "restarting": "Restarting\u2026",
  "restartNow": "\u{1F504} Restart dsh web now",
  "updatingDetail": "\u23F3 Updating (usually 1-2 min) \xB7 {s}s elapsed",
  "restartingDetail": "\u23F3 Restarting to apply (usually 10-30s) \xB7 {s}s elapsed",
  "updatedAutoDetail": "\u2705 Updated \u2014 auto-restarting in progress, refresh shortly",
  "updatedRestartDetail": "\u2705 Updated \u2014 restart dsh web to apply",
  "updateFailed": "\u274C Failed: {err} (manual update: dsh plugin --profile web update dsh-pocket-k --latest -w)",
  "versionRange": "Current v{cur} \u2192 latest v{latest}",
  "lanTitle": "\u{1F4F6} LAN (same Wi-Fi)",
  "lanHint": "Scan to open once your phone is on the same Wi-Fi",
  "lanAddress": "LAN address",
  "lanAddressAuto": "Auto (recommended)",
  "lanAddressHint": "Advanced option: usually no change needed; select manually when accessing through Tailscale/VPN",
  "lanPin": "LAN access PIN",
  "on": "On",
  "off": "Off",
  "lanPinValue": "\u{1F510} PIN: {pin} (required on the phone; separate from the public PIN)",
  "lanPinCustomValue": "\u{1F510} PIN: {pin} (custom; required on the phone)",
  "refresh": "Refresh",
  "customize": "Customize",
  "customizing": "New PIN (8 digits): ",
  "save": "Save",
  "cancel": "Cancel",
  "pinInvalid": "PIN must be exactly 8 digits",
  "pinCustomHint": "custom PINs are not rotated on tunnel start",
  "lanPinOff": "\u{1F513} PIN off \u2014 scan & go, no PIN (LAN devices only; public still requires PIN)",
  "lanDisabled": "LAN access is off: phones cannot reach this computer over LAN (public tunnel is unaffected)",
  "lanEnable": "Enable LAN",
  "lanStarting": "Proxy starting\u2026",
  "wanTitle": "\u{1F310} Anywhere (public)",
  "wanHint": "Scan from any network (the URL changes on every restart)",
  "wanPin": "\u{1F510} PIN: {pin} (changes each time the tunnel is enabled; required on the phone)",
  "wanPinCustom": "\u{1F510} PIN: {pin} (custom \u2014 not rotated on tunnel start)",
  "fixedMode": "Fixed-domain mode (manual named tunnel)",
  "randomMode": "Random tunnel mode (new address on every restart)",
  "publicBaseTitle": "Public fixed address",
  "publicBasePlaceholder": "https://dsh.example.com",
  "publicBaseClear": "Remove",
  "publicBaseHint": "Create a named tunnel in the Cloudflare dashboard pointing at local port 3081; the domain must be hosted on Cloudflare (reachability from mainland China may vary). Once saved, the public QR code uses this address and your login survives restarts.",
  "cfModeTitle": "Cloudflare auto-setup",
  "cfModeCli": "CLI login (cloudflared tunnel login)",
  "cfModeApi": "API Token (no CLI needed)",
  "cfModePickHint": "Choose an auto-setup method: CLI login or API Token.",
  "cfModeHintCli": 'Run `cloudflared tunnel login` in a terminal first. After saving the fixed domain, click "Enable fixed-domain" and the plugin will create the named tunnel, set up DNS, and start it.',
  "cfModeHintApi": "Paste a Cloudflare API Token (permissions: Account > Cloudflare Tunnel > Edit and Zone > DNS > Edit). The plugin creates the tunnel, configures DNS, and starts it \u2014 no CLI needed.",
  "cfTokenPlaceholder": "Paste Cloudflare API Token",
  "cfTokenSaved": "Token saved (not shown again)",
  "cfTokenSave": "Save Token",
  "cfTokenReplace": "Replace Token",
  "cfTokenClear": "Clear",
  "cfTokenSavedHint": "Token is stored only in local settings.json (0600) and is never echoed on this page.",
  "enableFixed": "Enable fixed-domain",
  "close": "Close",
  "publicBaseErrMissing": "Enter an https:// address",
  "publicBaseErrUrl": "Not a valid URL",
  "publicBaseErrProtocol": "Only https:// is supported",
  "publicBaseErrPath": "No path, trailing slash, query, or hash allowed",
  "publicBaseErrAuth": "Username/password are not allowed",
  "devicesTitle": "Paired devices",
  "devicesHint": "Phones/browsers that have signed in to the public address; each device has an independent session. Revoking one makes it re-enter the PIN on its next visit.",
  "devicesLoading": "Loading devices\u2026",
  "devicesEmpty": "No devices have signed in to the public address yet",
  "deviceOnline": "Online",
  "deviceOffline": "Offline",
  "deviceMeta": "First seen: {first} \xB7 Last activity: {last}",
  "deviceRevoke": "Revoke",
  "deviceRevokeAll": "Revoke all",
  "deviceRevokeTitle": "Revoke this device?",
  "deviceRevokeAllTitle": "Revoke all devices?",
  "deviceRevokeBody": "After revoking, this device must enter the PIN again on its next visit to the public address.",
  "deviceRevokeAllBody": "After revoking, every paired device must enter the PIN again on its next visit to the public address.",
  "revoking": "Revoking\u2026",
  "enableBackup": "Start quick tunnel (backup)",
  "stopTunnel": "Stop",
  "enable": "Enable anywhere",
  "opening": "Enabling\u2026",
  "disclaimerTitle": "\u26A0\uFE0F Security disclaimer",
  "disclaimerBody": "Enabling public access exposes this computer\u2019s DSH (which can execute code) to the internet. Anyone with the public link and PIN can reach \u2014 and operate \u2014 your computer. Please confirm: \u2460 use a strong custom PIN or keep the auto-generated one safe; \u2461 turn public access OFF as soon as you\u2019re done; \u2462 on a corporate/classified network, confirm compliance first.",
  "disclaimerAgree": "I understand and agree",
  "disclaimerHint": 'Check "I understand" before enabling public access',
  "downloading": "\u23F3 Downloading cloudflared (first run ~20-50MB, usually 1-2 min; instant afterward) \xB7 {s}s elapsed",
  "connecting": "\u23F3 Connecting to Cloudflare edge (usually 5-30s) \xB7 {s}s elapsed{suffix}",
  "slowHint": " \u2014 taking long? Check for a proxy/VPN (e.g., Clash TUN)",
  "error": "\u274C Failed to enable: {detail} (you can retry; for proxy/VPN issues see the README)",
  "unknownError": "unknown error",
  "feedback": "\u{1F64F} Questions? Open an issue on GitHub"
};

// client/index.jsx
var name = "dsh-pocket-k";
var inject = ["slots", "connection", "layout", "locale", "sessionLogDownload"];
function fmt(t, key, vars) {
  let s = t(key);
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      s = String(s).split(`{${k}}`).join(String(v));
    }
  }
  return s;
}
function publicBaseError(raw) {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  try {
    const u = new URL(s);
    if (u.protocol !== "https:") return "publicBaseErrProtocol";
    if (u.pathname !== "/" || /\/$/.test(s) || u.search || u.hash) return "publicBaseErrPath";
    if (u.username || u.password) return "publicBaseErrAuth";
    return null;
  } catch {
    return "publicBaseErrUrl";
  }
}
function publicHostOf(status) {
  const raw = status?.activeTunnelUrl || status?.publicBase || status?.tunnelUrl || null;
  if (!raw) return null;
  try {
    return new URL(raw).host;
  } catch {
    return null;
  }
}
function formatTime(ts) {
  try {
    return new Date(ts).toLocaleString();
  } catch {
    return String(ts ?? "");
  }
}
var styles = {
  card: { background: "var(--dsw-alias-bg-layer-1,#fff)", border: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", borderRadius: 12, padding: "16px 20px", maxWidth: 480 },
  block: { borderTop: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", marginTop: 16, paddingTop: 16 },
  muted: { color: "var(--dsw-alias-label-tertiary,#8b93a1)", fontSize: 12, lineHeight: 1.5 },
  code: { fontFamily: "ui-monospace,Menlo,monospace", fontSize: 12, wordBreak: "break-all", margin: "6px 0 10px", color: "var(--dsw-alias-label-primary,inherit)" },
  // 主按钮：官方 md 胶囊形（36px）
  primary: { font: "inherit", cursor: "pointer", border: "none", background: "var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary,#4f6ef7))", color: "var(--dsw-alias-label-primary-foreground, #fff)", height: 36, padding: "0 16px", borderRadius: 999, fontSize: 13, fontWeight: 500, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  // 次级按钮：官方 outline/ghost 胶囊形
  btn: { font: "inherit", cursor: "pointer", border: "1px solid var(--dsw-alias-button-ghost-active-border, var(--dsw-alias-border-l2,#d1d5db))", background: "var(--dsw-alias-bg-layer-1,#fff)", color: "var(--dsw-alias-label-primary,inherit)", height: 36, padding: "0 16px", borderRadius: 999, fontSize: 13, display: "inline-flex", alignItems: "center", justifyContent: "center" },
  qr: { width: 220, height: 220, borderRadius: 10, border: "1px solid var(--dsw-alias-border-l2,#e5e7eb)", margin: "8px 0" },
  warn: { color: "var(--dsw-alias-state-warn-primary,#b45309)", fontSize: 12, lineHeight: 1.5 }
};
function PocketSettingsTab({ rpcCall, t }) {
  const [status, setStatus] = (0, import_react.useState)(null);
  const [busy, setBusy] = (0, import_react.useState)(false);
  const [lanBusy, setLanBusy] = (0, import_react.useState)(false);
  const [error, setError] = (0, import_react.useState)(null);
  const [tunnelState, setTunnelState] = (0, import_react.useState)(null);
  const [restartNotice, setRestartNotice] = (0, import_react.useState)(false);
  const [updateInfo, setUpdateInfo] = (0, import_react.useState)(null);
  const [isDesktop, setIsDesktop] = (0, import_react.useState)(false);
  const [now, setNow] = (0, import_react.useState)(Date.now());
  const [devices, setDevices] = (0, import_react.useState)(null);
  const [deviceHost, setDeviceHost] = (0, import_react.useState)(null);
  const [revokeTarget, setRevokeTarget] = (0, import_react.useState)(null);
  const [revokeBusy, setRevokeBusy] = (0, import_react.useState)(false);
  (0, import_react.useEffect)(() => {
    const t2 = setInterval(() => setNow(Date.now()), 1e3);
    return () => clearInterval(t2);
  }, []);
  const elapsed = (startedAt) => startedAt ? Math.max(0, Math.floor((Date.now() - startedAt) / 1e3)) : 0;
  const call = async (endpoint, payload) => {
    const res = await rpcCall(endpoint, payload);
    if (!res?.ok) throw new Error(res?.error?.message ?? "RPC failed");
    return res.value;
  };
  const load = async () => {
    try {
      const s = await call(POCKET_ENDPOINTS.status, {});
      setStatus(s);
      setTunnelState(s.tunnelState ?? null);
      if (s.desktop) setIsDesktop(true);
      if (s.restartNotice) {
        setRestartNotice(true);
        setUpdateInfo(null);
        if (!sessionStorage.getItem("dshp-auto-reloaded")) {
          sessionStorage.setItem("dshp-auto-reloaded", "1");
          setTimeout(() => {
            try {
              location.reload();
            } catch {
            }
          }, 2e3);
        }
      }
    } catch {
    }
  };
  (0, import_react.useEffect)(() => {
    load();
    const t2 = setInterval(load, 3e3);
    return () => clearInterval(t2);
  }, []);
  (0, import_react.useEffect)(() => {
    try {
      sessionStorage.removeItem("dshp-auto-reloaded");
    } catch {
    }
  }, []);
  (0, import_react.useEffect)(() => {
    if (isDesktop) return;
    let alive = true;
    const check = async () => {
      try {
        const v = await call(POCKET_ENDPOINTS.version, {});
        const meta = await (await fetch("https://registry.npmjs.org/dsh-pocket-k/latest", { cache: "no-store" })).json();
        if (!alive) return;
        const latest = typeof meta?.version === "string" ? meta.version : null;
        if (latest && v.current && compareVersions(latest, v.current) > 0) {
          setUpdateInfo({ current: v.current, latest, updating: false, result: null });
        } else if (v.current && v.loaded && compareVersions(v.current, v.loaded) > 0) {
          setUpdateInfo({ current: v.current, latest: v.current, updating: false, result: "ok", updated: true });
        }
      } catch {
      }
    };
    check();
    const t2 = setInterval(check, 5 * 60 * 1e3);
    return () => {
      alive = false;
      clearInterval(t2);
    };
  }, [isDesktop]);
  const restartPocket = async () => {
    setUpdateInfo((u) => ({ ...u, restarting: true, startedAt: Date.now() }));
    try {
      await Promise.race([
        call(POCKET_ENDPOINTS.restart, {}),
        new Promise((_, rej) => setTimeout(() => rej(new Error("restart requested (no reply within 3s)")), 3e3))
      ]);
      setUpdateInfo((u) => ({ ...u, restarting: true, result: "ok" }));
    } catch (err) {
      const msg = String(err?.message ?? "");
      if (/connection|socket|fetch|network|abort|cancelled|ECONN|disconnect|closed|timeout/i.test(msg)) {
        setUpdateInfo((u) => ({ ...u, restarting: true, result: "ok" }));
        return;
      }
      setUpdateInfo((u) => ({ ...u, restarting: false, result: "fail", output: err.message }));
    }
  };
  const runUpdate = async () => {
    setUpdateInfo((u) => ({ ...u, updating: true, result: null, startedAt: Date.now() }));
    try {
      const r = await call(POCKET_ENDPOINTS.update, {});
      setUpdateInfo((u) => ({
        ...u,
        updating: false,
        result: r.ok ? "ok" : "fail",
        autoRestart: r.autoRestart === true,
        output: r.output ?? r.error
      }));
    } catch (err) {
      setUpdateInfo((u) => ({ ...u, updating: false, result: "fail", output: err.message }));
    }
  };
  const [disclaimerOpen, setDisclaimerOpen] = (0, import_react.useState)(false);
  const [disclaimerChecked, setDisclaimerChecked] = (0, import_react.useState)(false);
  const doStartTunnel = async (quick = false) => {
    setBusy(true);
    setError(null);
    setTunnelState({ phase: "starting", detail: "\u6B63\u5728\u5F00\u542F\u2026", startedAt: Date.now() });
    try {
      setStatus(await call(POCKET_ENDPOINTS.tunnelStart, { disclaimer: true, ...quick ? { quick: true } : {} }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const [startMode, setStartMode] = (0, import_react.useState)("fixed");
  const startTunnel = (quick = false) => {
    setStartMode(quick ? "quick" : "fixed");
    setDisclaimerChecked(false);
    setDisclaimerOpen(true);
  };
  const confirmDisclaimer = () => {
    if (!disclaimerChecked) return;
    setDisclaimerOpen(false);
    doStartTunnel(startMode === "quick");
  };
  const stopTunnel = async () => {
    try {
      setStatus(await call(POCKET_ENDPOINTS.tunnelStop, {}));
    } catch {
    }
  };
  const refreshLanPin = async () => {
    try {
      const r = await call(POCKET_ENDPOINTS.lanTokenRefresh, {});
      setStatus((s) => ({ ...s, lanToken: r.lanToken }));
    } catch {
    }
  };
  const setLanAuth = async (on) => {
    try {
      const r = await call(POCKET_ENDPOINTS.lanAuthSetEnabled, { on });
      setStatus((s) => ({ ...s, lanAuthEnabled: r.lanAuthEnabled }));
    } catch {
    }
  };
  const setLanAccess = async (on) => {
    setLanBusy(true);
    try {
      setStatus(await call(POCKET_ENDPOINTS.lanSetEnabled, { on }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLanBusy(false);
    }
  };
  const setLanAddress = async (ip) => {
    try {
      setStatus(await call(POCKET_ENDPOINTS.lanSetOverride, { ip }));
    } catch (err) {
      setError(err.message);
    }
  };
  const [customPin, setCustomPin] = (0, import_react.useState)(null);
  const saveCustomPin = async (which) => {
    try {
      const r = await call(POCKET_ENDPOINTS.pinSetCustom, { which, value: customPin?.value ?? "" });
      setStatus((s) => ({
        ...s,
        accessToken: which === "public" ? r.pin : s.accessToken,
        lanToken: which === "lan" ? r.pin : s.lanToken,
        publicPinCustom: which === "public" ? true : s.publicPinCustom,
        lanPinCustom: which === "lan" ? true : s.lanPinCustom
      }));
      setCustomPin(null);
    } catch (err) {
      setCustomPin((c) => ({ ...c, err: err.message }));
    }
  };
  const customPinRow = (which) => (0, import_react.createElement)(
    "div",
    { style: { marginTop: 6, fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)", lineHeight: 1.5 } },
    t("customizing"),
    (0, import_react.createElement)("input", {
      style: { width: 110, margin: "0 6px", padding: "4px 8px", fontSize: 14, letterSpacing: 2, textAlign: "center", border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", borderRadius: 6, outline: "none" },
      type: "password",
      inputMode: "numeric",
      maxLength: 8,
      value: customPin?.value ?? "",
      autoFocus: true,
      onChange: (e) => setCustomPin((c) => ({ ...c, value: e.target.value.replace(/\D/g, ""), err: null })),
      onKeyDown: (e) => {
        if (e.key === "Enter") saveCustomPin(which);
        if (e.key === "Escape") setCustomPin(null);
      }
    }),
    (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 10px", fontSize: 12, marginLeft: 2 }, onClick: () => saveCustomPin(which) }, t("save")),
    (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 10px", fontSize: 12 }, onClick: () => setCustomPin(null) }, t("cancel")),
    customPin?.err ? (0, import_react.createElement)("div", { style: { color: "var(--dsw-alias-state-error-primary,#dc2626)", marginTop: 4 } }, customPin.err) : null
  );
  const customBtn = (which) => (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 10px", fontSize: 12, marginLeft: 8 }, onClick: () => setCustomPin({ which, value: "", err: null }) }, t("customize"));
  const [baseInput, setBaseInput] = (0, import_react.useState)(null);
  const publicBase = status?.publicBase ?? null;
  (0, import_react.useEffect)(() => {
    setBaseInput(null);
  }, [publicBase]);
  const savePublicBase = async () => {
    if (baseError) return;
    setBusy(true);
    setError(null);
    try {
      setStatus(await call(POCKET_ENDPOINTS.publicBaseSet, { url: (baseInput ?? "").trim() }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const clearPublicBase = async () => {
    setBusy(true);
    setError(null);
    try {
      setStatus(await call(POCKET_ENDPOINTS.publicBaseClear, {}));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const cfMode = status?.cfMode ?? null;
  const cfTokenSet = !!status?.cfTokenSet;
  const [cfTokenInput, setCfTokenInput] = (0, import_react.useState)("");
  const [cfBusy, setCfBusy] = (0, import_react.useState)(false);
  const saveCfMode = async (mode) => {
    setCfBusy(true);
    setError(null);
    try {
      setStatus(await call(POCKET_ENDPOINTS.cfModeSet, { mode }));
    } catch (err) {
      setError(err.message);
    } finally {
      setCfBusy(false);
    }
  };
  const saveCfToken = async () => {
    const token = (cfTokenInput ?? "").trim();
    if (!token) return;
    setCfBusy(true);
    setError(null);
    try {
      setStatus(await call(POCKET_ENDPOINTS.cfTokenSet, { token }));
      setCfTokenInput("");
    } catch (err) {
      setError(err.message);
    } finally {
      setCfBusy(false);
    }
  };
  const clearCfToken = async () => {
    setCfBusy(true);
    setError(null);
    try {
      setStatus(await call(POCKET_ENDPOINTS.cfTokenClear, {}));
    } catch (err) {
      setError(err.message);
    } finally {
      setCfBusy(false);
    }
  };
  const publicHost = publicHostOf(status);
  const baseValue = baseInput ?? publicBase ?? "";
  const baseError = baseInput !== null ? publicBaseError(baseValue) : null;
  (0, import_react.useEffect)(() => {
    let alive = true;
    const fetchDevices = async () => {
      setDeviceHost(publicHost);
      if (!publicHost) {
        if (alive) setDevices([]);
        return;
      }
      try {
        const list = await call(POCKET_ENDPOINTS.deviceList, { host: publicHost });
        if (alive) setDevices(list);
      } catch {
        if (alive) setDevices([]);
      }
    };
    fetchDevices();
    const timer = setInterval(fetchDevices, 3e3);
    return () => {
      alive = false;
      clearInterval(timer);
    };
  }, [publicHost]);
  const confirmRevokeDevice = async () => {
    if (!revokeTarget) return;
    setRevokeBusy(true);
    setError(null);
    try {
      if (revokeTarget === "all") {
        if (publicHost) await call(POCKET_ENDPOINTS.deviceRevokeAll, { host: publicHost });
      } else {
        await call(POCKET_ENDPOINTS.deviceRevoke, { id: revokeTarget.id });
      }
      setRevokeTarget(null);
      const list = publicHost ? await call(POCKET_ENDPOINTS.deviceList, { host: publicHost }) : [];
      setDevices(list);
    } catch (err) {
      setError(err.message);
    } finally {
      setRevokeBusy(false);
    }
  };
  const lanUrl = status?.lanUrl;
  const tunnelUrl = status?.tunnelUrl;
  const tunnelPhase = tunnelState?.phase ?? "idle";
  const tunnelStarting = ["downloading", "starting", "registering"].includes(tunnelPhase);
  const tunnelStateDetail = tunnelState?.detail ?? "";
  const tunnelStateStarted = tunnelState?.startedAt ?? null;
  return (0, import_react.createElement)(
    "div",
    { style: styles.card },
    (0, import_react.createElement)(
      "div",
      { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
      (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)("strong", null, t("title")),
        (0, import_react.createElement)("div", { style: styles.muted }, t("subtitle"))
      ),
      (0, import_react.createElement)(
        "div",
        { style: { fontSize: 12, color: "var(--dsw-alias-label-tertiary,#8b93a1)", textAlign: "right" } },
        (0, import_react.createElement)("div", { style: { whiteSpace: "nowrap" } }, t("developer")),
        (0, import_react.createElement)("div", { style: { whiteSpace: "nowrap" } }, fmt(t, "internalBuild", { upstream: status?.upstreamLatest || "v1.13.4" }))
      )
    ),
    // 桌面端不显示更新/重启横幅（更新由 DSH Desktop 管理），也不需要额外提示
    // 重启后提示（进程在后台运行，停止方法）——左侧蓝色色条（桌面端不会触发本插件的自重启）
    !isDesktop && restartNotice ? (0, import_react.createElement)(
      "div",
      { style: { ...styles.block, borderLeft: "4px solid var(--dsw-alias-brand-primary,#4f6ef7)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-2,#f3f4f6)", padding: "10px 12px" } },
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
        (0, import_react.createElement)("div", { style: { fontWeight: 600, fontSize: 13 } }, t("restarted")),
        (0, import_react.createElement)("button", { style: styles.btn, onClick: () => setRestartNotice(false) }, t("ok"))
      ),
      (0, import_react.createElement)("div", { style: styles.muted, marginTop: 4, wordBreak: "break-all" }, fmt(t, "bgHint", { cmd: status?.killHint ?? `lsof -ti :${status?.dshPort ?? 3080} | xargs kill -9` }))
    ) : null,
    // 更新提示——左侧黄色色条（提示有新版本）；单状态：有更新/更新中/已更新自动重启，不并存
    // 桌面端不渲染（更新由 DSH Desktop 管理）
    !isDesktop && updateInfo ? (0, import_react.createElement)(
      "div",
      { style: { ...styles.block, borderLeft: "4px solid var(--dsw-alias-state-warn-primary,#b45309)", borderRadius: 8, background: "var(--dsw-alias-bg-layer-2,#f3f4f6)", padding: "10px 12px" } },
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
        (0, import_react.createElement)(
          "div",
          { style: { fontWeight: 600, fontSize: 13 } },
          updateInfo.updated ? fmt(t, "updatedRestart", { ver: updateInfo.current }) : updateInfo.result === "ok" ? updateInfo.autoRestart ? fmt(t, "updateAutoRestarting", { ver: updateInfo.latest }) : fmt(t, "updatedOk", { ver: updateInfo.latest }) : fmt(t, "updateAvailable", { ver: updateInfo.latest })
        ),
        updateInfo.result !== "ok" ? (0, import_react.createElement)("button", { style: styles.primary, onClick: runUpdate, disabled: updateInfo.updating }, updateInfo.updating ? t("updating") : fmt(t, "updateTo", { ver: updateInfo.latest })) : updateInfo.autoRestart ? (0, import_react.createElement)("button", { style: styles.btn, disabled: true }, t("restartingNow")) : (0, import_react.createElement)("button", { style: styles.primary, onClick: restartPocket, disabled: updateInfo.restarting }, updateInfo.restarting ? t("restarting") : t("restartNow"))
      ),
      (0, import_react.createElement)(
        "div",
        { style: styles.muted, marginTop: 4 },
        updateInfo.updating ? fmt(t, "updatingDetail", { s: elapsed(updateInfo.startedAt) }) : updateInfo.restarting ? fmt(t, "restartingDetail", { s: elapsed(updateInfo.startedAt) }) : updateInfo.result === "ok" ? updateInfo.autoRestart ? t("updatedAutoDetail") : t("updatedRestartDetail") : updateInfo.result === "fail" ? fmt(t, "updateFailed", { err: updateInfo.output || t("unknownError") }) : fmt(t, "versionRange", { cur: updateInfo.current, latest: updateInfo.latest })
      )
    ) : null,
    // 局域网
    (0, import_react.createElement)(
      "div",
      { style: styles.block },
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13 } },
        t("lanTitle")
      ),
      status?.lanEnabled !== false ? lanUrl ? (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)("img", { src: status.lanQr, alt: "LAN QR", style: styles.qr }),
        (0, import_react.createElement)("div", { style: styles.code }, lanUrl),
        (0, import_react.createElement)("div", { style: styles.muted }, t("lanHint")),
        (0, import_react.createElement)(
          "label",
          { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 10, fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)" } },
          t("lanAddress"),
          (0, import_react.createElement)(
            "select",
            {
              value: status?.lanIpOverride || "",
              onChange: (e) => setLanAddress(e.target.value),
              style: { font: "inherit", height: 30, padding: "0 8px", borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", background: "var(--dsw-alias-bg-layer-1,#fff)", color: "var(--dsw-alias-label-primary,inherit)" }
            },
            (0, import_react.createElement)("option", { value: "" }, t("lanAddressAuto")),
            (status?.lanCandidates || []).map((ip) => (0, import_react.createElement)("option", { key: ip, value: ip }, ip))
          )
        ),
        (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 2 } }, t("lanAddressHint")),
        // 访问密码开关（issue #24）：默认开启；关闭后扫码直连（仅同一局域网设备可访问）
        (0, import_react.createElement)(
          "div",
          { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 8 } },
          (0, import_react.createElement)("span", { style: { fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)" } }, t("lanPin")),
          (0, import_react.createElement)("button", {
            style: { ...styles.btn, height: 28, padding: "0 12px", fontSize: 12, fontWeight: status?.lanAuthEnabled !== false ? 600 : 400, background: status?.lanAuthEnabled !== false ? "var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary,#4f6ef7))" : "var(--dsw-alias-bg-layer-1,#fff)", color: status?.lanAuthEnabled !== false ? "var(--dsw-alias-label-primary-foreground, #fff)" : "var(--dsw-alias-label-primary,inherit)" },
            onClick: () => setLanAuth(true)
          }, t("on")),
          (0, import_react.createElement)("button", {
            style: { ...styles.btn, height: 28, padding: "0 12px", fontSize: 12, fontWeight: status?.lanAuthEnabled === false ? 600 : 400, background: status?.lanAuthEnabled === false ? "var(--dsw-alias-state-error-primary,#dc2626)" : "var(--dsw-alias-bg-layer-1,#fff)", color: status?.lanAuthEnabled === false ? "#fff" : "var(--dsw-alias-label-primary,inherit)" },
            onClick: () => setLanAuth(false)
          }, t("off"))
        ),
        status?.lanAuthEnabled !== false ? customPin?.which === "lan" ? customPinRow("lan") : (0, import_react.createElement)(
          "div",
          { style: { marginTop: 6, fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)", lineHeight: 1.5 } },
          fmt(t, status?.lanPinCustom ? "lanPinCustomValue" : "lanPinValue", { pin: status.lanToken }),
          (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 10px", fontSize: 12, marginLeft: 8 }, onClick: refreshLanPin }, t("refresh")),
          customBtn("lan")
        ) : (0, import_react.createElement)(
          "div",
          { style: { marginTop: 6, fontSize: 12, color: "var(--dsw-alias-state-warn-primary,#b45309)", lineHeight: 1.5 } },
          t("lanPinOff")
        ),
        (0, import_react.createElement)(
          "div",
          { style: { marginTop: 10 } },
          (0, import_react.createElement)("button", { style: { ...styles.btn, height: 28, padding: "0 12px", fontSize: 12 }, onClick: () => setLanAccess(false), disabled: lanBusy }, t("close"))
        )
      ) : (0, import_react.createElement)("div", { style: styles.muted }, t("lanStarting")) : (0, import_react.createElement)(
        "div",
        { style: { marginTop: 4 } },
        (0, import_react.createElement)("div", { style: styles.muted }, t("lanDisabled")),
        (0, import_react.createElement)("button", { style: { ...styles.primary, marginTop: 8, height: 30, padding: "0 14px", fontSize: 12 }, onClick: () => setLanAccess(true), disabled: lanBusy }, t("lanEnable"))
      )
    ),
    // 公网
    (0, import_react.createElement)(
      "div",
      { style: styles.block },
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", gap: 8, fontWeight: 600, fontSize: 13 } },
        t("wanTitle"),
        status?.tunnelMode === "fixed" ? (0, import_react.createElement)("span", { style: { display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--dsw-alias-brand-primary,#4f6ef7)", color: "#fff" } }, t("fixedMode")) : status?.tunnelMode === "quick" ? (0, import_react.createElement)("span", { style: { display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--dsw-alias-state-warn-primary,#b45309)", color: "#fff" } }, t("randomMode")) : publicBase ? (0, import_react.createElement)("span", { style: { display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--dsw-alias-brand-primary,#4f6ef7)", color: "#fff" } }, t("fixedMode")) : null
      ),
      // 公网固定地址（named tunnel）：保存后公网二维码改用此地址，登录状态跨重启保持
      (0, import_react.createElement)(
        "div",
        { style: { marginTop: 8 } },
        (0, import_react.createElement)("div", { style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary,#6b7280)" } }, t("publicBaseTitle")),
        (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, marginTop: 6 } },
          (0, import_react.createElement)("input", {
            style: { flex: 1, font: "inherit", height: 30, padding: "0 10px", fontSize: 12, borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", background: "var(--dsw-alias-bg-layer-1,#fff)", color: "var(--dsw-alias-label-primary,inherit)", outline: "none" },
            type: "url",
            placeholder: t("publicBasePlaceholder"),
            value: baseValue,
            onChange: (e) => setBaseInput(e.target.value),
            onKeyDown: (e) => {
              if (e.key === "Enter") savePublicBase();
            },
            spellCheck: false
          }),
          (0, import_react.createElement)("button", { style: { ...styles.btn, height: 30, padding: "0 12px", fontSize: 12 }, onClick: savePublicBase, disabled: busy || !!baseError || (baseInput ?? "") === (publicBase ?? "") }, t("save")),
          publicBase ? (0, import_react.createElement)("button", { style: { ...styles.btn, height: 30, padding: "0 12px", fontSize: 12 }, onClick: clearPublicBase, disabled: busy }, t("publicBaseClear")) : null
        ),
        baseError ? (0, import_react.createElement)("div", { style: { color: "var(--dsw-alias-state-error-primary,#dc2626)", fontSize: 12, marginTop: 4 } }, t(baseError)) : null,
        (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 4 } }, t("publicBaseHint"))
      ),
      publicBase ? (0, import_react.createElement)(
        "div",
        { style: { marginTop: 8 } },
        (0, import_react.createElement)("div", { style: { fontSize: 12, fontWeight: 600, color: "var(--dsw-alias-label-secondary,#6b7280)" } }, t("cfModeTitle")),
        (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, marginTop: 6 } },
          (0, import_react.createElement)("button", { style: { ...styles.btn, height: 30, padding: "0 12px", fontSize: 12, fontWeight: cfMode === "cli" ? 600 : 400, background: cfMode === "cli" ? "var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary,#4f6ef7))" : "var(--dsw-alias-bg-layer-1,#fff)", color: cfMode === "cli" ? "var(--dsw-alias-label-primary-foreground, #fff)" : "var(--dsw-alias-label-primary,inherit)" }, onClick: () => saveCfMode("cli"), disabled: cfBusy }, t("cfModeCli")),
          (0, import_react.createElement)("button", { style: { ...styles.btn, height: 30, padding: "0 12px", fontSize: 12, fontWeight: cfMode === "api" ? 600 : 400, background: cfMode === "api" ? "var(--dsw-alias-button-primary-fill, var(--dsw-alias-brand-primary,#4f6ef7))" : "var(--dsw-alias-bg-layer-1,#fff)", color: cfMode === "api" ? "var(--dsw-alias-label-primary-foreground, #fff)" : "var(--dsw-alias-label-primary,inherit)" }, onClick: () => saveCfMode("api"), disabled: cfBusy }, t("cfModeApi"))
        ),
        cfMode === "cli" ? (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 4 } }, t("cfModeHintCli")) : cfMode === "api" ? (0, import_react.createElement)(
          "div",
          null,
          (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 4 } }, t("cfModeHintApi")),
          (0, import_react.createElement)(
            "div",
            { style: { display: "flex", gap: 8, marginTop: 6 } },
            (0, import_react.createElement)("input", { style: { flex: 1, font: "inherit", height: 30, padding: "0 10px", fontSize: 12, borderRadius: 8, border: "1px solid var(--dsw-alias-border-l2,#d1d5db)", background: "var(--dsw-alias-bg-layer-1,#fff)", color: "var(--dsw-alias-label-primary,inherit)", outline: "none" }, type: "password", placeholder: cfTokenSet ? t("cfTokenSaved") : t("cfTokenPlaceholder"), value: cfTokenInput, onChange: (e) => setCfTokenInput(e.target.value), spellCheck: false, autoComplete: "off" }),
            (0, import_react.createElement)("button", { style: { ...styles.btn, height: 30, padding: "0 12px", fontSize: 12 }, onClick: saveCfToken, disabled: cfBusy || !(cfTokenInput ?? "").trim() }, cfTokenSet ? t("cfTokenReplace") : t("cfTokenSave")),
            cfTokenSet ? (0, import_react.createElement)("button", { style: { ...styles.btn, height: 30, padding: "0 12px", fontSize: 12 }, onClick: clearCfToken, disabled: cfBusy }, t("cfTokenClear")) : null
          ),
          cfTokenSet ? (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 4 } }, t("cfTokenSavedHint")) : null
        ) : (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 4 } }, t("cfModePickHint"))
      ) : null,
      tunnelUrl ? (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)("img", { src: status.tunnelQr, alt: "Tunnel QR", style: styles.qr }),
        (0, import_react.createElement)("div", { style: styles.code }, tunnelUrl),
        (0, import_react.createElement)("div", { style: styles.muted }, t("wanHint")),
        status.accessToken ? customPin?.which === "public" ? customPinRow("public") : (0, import_react.createElement)(
          "div",
          { style: { marginTop: 6, fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)", lineHeight: 1.5 } },
          fmt(t, status?.publicPinCustom ? "wanPinCustom" : "wanPin", { pin: status.accessToken }),
          customBtn("public"),
          status?.publicPinCustom ? (0, import_react.createElement)("div", { style: { marginTop: 2, fontSize: 11, color: "var(--dsw-alias-state-warn-primary,#b45309)" } }, t("pinCustomHint")) : null
        ) : null,
        (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, margin: "8px 0" } },
          publicBase ? [
            (0, import_react.createElement)("button", { style: status?.tunnelMode === "fixed" ? styles.primary : styles.btn, onClick: status?.tunnelMode === "fixed" ? stopTunnel : () => startTunnel(), disabled: busy || tunnelStarting }, status?.tunnelMode === "fixed" ? t("close") : busy ? t("opening") : t("enableFixed")),
            (0, import_react.createElement)("button", { style: status?.tunnelMode === "quick" ? styles.primary : styles.btn, onClick: status?.tunnelMode === "quick" ? stopTunnel : () => startTunnel(true), disabled: busy || tunnelStarting }, status?.tunnelMode === "quick" ? t("close") : busy ? t("opening") : t("enableBackup"))
          ] : (0, import_react.createElement)("button", { style: { ...status?.tunnelMode === "quick" ? styles.primary : styles.btn }, onClick: status?.tunnelMode === "quick" ? stopTunnel : () => startTunnel(), disabled: busy || tunnelStarting }, status?.tunnelMode === "quick" ? t("close") : busy ? t("opening") : t("enable"))
        )
      ) : (0, import_react.createElement)(
        "div",
        null,
        (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, margin: "8px 0" } },
          publicBase ? [
            (0, import_react.createElement)("button", { style: status?.tunnelMode === "fixed" ? styles.primary : styles.btn, onClick: status?.tunnelMode === "fixed" ? stopTunnel : () => startTunnel(), disabled: busy || tunnelStarting }, status?.tunnelMode === "fixed" ? t("close") : busy ? t("opening") : t("enableFixed")),
            (0, import_react.createElement)("button", { style: status?.tunnelMode === "quick" ? styles.primary : styles.btn, onClick: status?.tunnelMode === "quick" ? stopTunnel : () => startTunnel(true), disabled: busy || tunnelStarting }, status?.tunnelMode === "quick" ? t("close") : busy ? t("opening") : t("enableBackup"))
          ] : (0, import_react.createElement)("button", { style: { ...status?.tunnelMode === "quick" ? styles.primary : styles.btn }, onClick: status?.tunnelMode === "quick" ? stopTunnel : () => startTunnel(), disabled: busy || tunnelStarting }, status?.tunnelMode === "quick" ? t("close") : busy ? t("opening") : t("enable"))
        ),
        tunnelStarting ? (0, import_react.createElement)(
          "div",
          { style: { marginTop: 4, fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)" } },
          tunnelPhase === "downloading" ? fmt(t, "downloading", { s: elapsed(tunnelStateStarted) }) : fmt(t, "connecting", { s: elapsed(tunnelStateStarted), suffix: elapsed(tunnelStateStarted) > 30 ? t("slowHint") : "" })
        ) : tunnelPhase === "error" ? (0, import_react.createElement)(
          "div",
          { style: { marginTop: 4, fontSize: 12, color: "var(--dsw-alias-state-error-primary,#dc2626)" } },
          fmt(t, "error", { detail: tunnelStateDetail || t("unknownError") })
        ) : null
      )
    ),
    // 已配对设备（t14）：仅当前公网入口 Host；逐台/全部撤销
    (0, import_react.createElement)(
      "div",
      { style: styles.block },
      (0, import_react.createElement)(
        "div",
        { style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 } },
        (0, import_react.createElement)("div", { style: { fontWeight: 600, fontSize: 13 } }, t("devicesTitle")),
        publicHost && devices?.length ? (0, import_react.createElement)("button", { style: { ...styles.btn, height: 28, padding: "0 12px", fontSize: 12 }, onClick: () => setRevokeTarget("all"), disabled: revokeBusy }, t("deviceRevokeAll")) : null
      ),
      (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 4 } }, t("devicesHint")),
      devices === null ? (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 8 } }, t("devicesLoading")) : devices.length === 0 ? (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 8 } }, t("devicesEmpty")) : (0, import_react.createElement)(
        "div",
        { style: { marginTop: 8 } },
        devices.map((d) => (0, import_react.createElement)(
          "div",
          { key: d.id, style: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: "8px 0", borderBottom: "1px solid var(--dsw-alias-border-l2,#e5e7eb)" } },
          (0, import_react.createElement)(
            "div",
            null,
            (0, import_react.createElement)(
              "div",
              { style: { display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 500 } },
              d.name,
              (0, import_react.createElement)("span", { style: { fontSize: 11, fontWeight: 400, color: "var(--dsw-alias-label-tertiary,#8b93a1)" } }, `#${d.shortId || d.id.slice(0, 6)}`),
              (0, import_react.createElement)("span", { style: { width: 8, height: 8, borderRadius: 999, background: d.online && status?.tunnelRunning ? "#16a34a" : "#9ca3af", display: "inline-block" } }),
              (0, import_react.createElement)("span", { style: { fontSize: 11, fontWeight: 400, color: d.online && status?.tunnelRunning ? "#16a34a" : "var(--dsw-alias-label-tertiary,#8b93a1)" } }, d.online && status?.tunnelRunning ? t("deviceOnline") : t("deviceOffline"))
            ),
            (0, import_react.createElement)("div", { style: { ...styles.muted, marginTop: 2 } }, fmt(t, "deviceMeta", { first: formatTime(d.createdAt), last: formatTime(d.lastSeenAt) }))
          ),
          (0, import_react.createElement)("button", { style: { ...styles.btn, height: 26, padding: "0 10px", fontSize: 12 }, onClick: () => setRevokeTarget(d), disabled: revokeBusy }, t("deviceRevoke"))
        ))
      )
    ),
    error ? (0, import_react.createElement)("div", { style: { color: "var(--dsw-alias-state-error-primary,#dc2626)", fontSize: 12, marginTop: 8 } }, `\u274C ${error}`) : null,
    // 安全免责声明弹框（issue #31）：每次开启公网访问前确认
    disclaimerOpen ? (0, import_react.createElement)(
      "div",
      { style: { position: "fixed", inset: 0, zIndex: 1e4, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 } },
      (0, import_react.createElement)(
        "div",
        { style: { background: "var(--dsw-alias-bg-layer-1,#fff)", borderRadius: 12, maxWidth: 420, width: "100%", padding: "20px 22px", boxShadow: "0 8px 32px rgba(0,0,0,.18)" } },
        (0, import_react.createElement)("div", { style: { fontWeight: 600, fontSize: 15, color: "var(--dsw-alias-state-warn-primary,#b45309)", marginBottom: 10 } }, t("disclaimerTitle")),
        (0, import_react.createElement)("div", { style: { fontSize: 13, lineHeight: 1.7, color: "var(--dsw-alias-label-primary,inherit)" } }, t("disclaimerBody")),
        (0, import_react.createElement)(
          "label",
          { style: { display: "flex", alignItems: "center", gap: 8, marginTop: 14, fontSize: 13, cursor: "pointer" } },
          (0, import_react.createElement)("input", { type: "checkbox", checked: disclaimerChecked, onChange: (e) => setDisclaimerChecked(e.target.checked), style: { width: 16, height: 16 } }),
          t("disclaimerAgree")
        ),
        (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, marginTop: 16 } },
          (0, import_react.createElement)("button", { style: { ...styles.btn, flex: 1 }, onClick: () => setDisclaimerOpen(false) }, t("cancel")),
          (0, import_react.createElement)("button", {
            style: { ...styles.primary, flex: 1, opacity: disclaimerChecked ? 1 : 0.5 },
            disabled: !disclaimerChecked,
            onClick: confirmDisclaimer
          }, t("disclaimerAgree"))
        ),
        !disclaimerChecked ? (0, import_react.createElement)("div", { style: { marginTop: 8, fontSize: 12, color: "var(--dsw-alias-state-error-primary,#dc2626)" } }, t("disclaimerHint")) : null
      )
    ) : null,
    // 撤销设备确认弹层（t14）：撤销后该设备下次访问需重新输入 PIN
    revokeTarget ? (0, import_react.createElement)(
      "div",
      { style: { position: "fixed", inset: 0, zIndex: 1e4, background: "rgba(0,0,0,.5)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 } },
      (0, import_react.createElement)(
        "div",
        { style: { background: "var(--dsw-alias-bg-layer-1,#fff)", borderRadius: 12, maxWidth: 420, width: "100%", padding: "20px 22px", boxShadow: "0 8px 32px rgba(0,0,0,.18)" } },
        (0, import_react.createElement)("div", { style: { fontWeight: 600, fontSize: 15, color: "var(--dsw-alias-state-error-primary,#dc2626)", marginBottom: 10 } }, revokeTarget === "all" ? t("deviceRevokeAllTitle") : t("deviceRevokeTitle")),
        (0, import_react.createElement)("div", { style: { fontSize: 13, lineHeight: 1.7, color: "var(--dsw-alias-label-primary,inherit)" } }, revokeTarget === "all" ? t("deviceRevokeAllBody") : t("deviceRevokeBody")),
        (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, marginTop: 16 } },
          (0, import_react.createElement)("button", { style: { ...styles.btn, flex: 1 }, onClick: () => setRevokeTarget(null), disabled: revokeBusy }, t("cancel")),
          (0, import_react.createElement)("button", { style: { ...styles.primary, flex: 1, background: "var(--dsw-alias-state-error-primary,#dc2626)" }, onClick: confirmRevokeDevice, disabled: revokeBusy }, revokeBusy ? t("revoking") : revokeTarget === "all" ? t("deviceRevokeAll") : t("deviceRevoke"))
        )
      )
    ) : null,
    // 页面最底部：反馈入口
    (0, import_react.createElement)(
      "div",
      { style: { ...styles.block, textAlign: "center" } },
      (0, import_react.createElement)(
        "a",
        { href: "https://github.com/kaneve/dsh-pocket-k/issues", target: "_blank", rel: "noreferrer", style: { fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)", textDecoration: "none" } },
        t("feedback")
      )
    )
  );
}
function apply2(ctx) {
  apply(ctx);
  const rpcCall = (endpoint, payload, signal) => ctx.connection.rpc.call(POCKET_RPC_CHANNEL, endpoint, payload, signal);
  const translate = ctx.locale.bind(NS4);
  ctx.effect(() => ctx.locale.register(NS4, { zh: zh2, en: en2 }), "dsh-pocket-k: pocket locale dictionaries");
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register(
      {
        name: "settings.section",
        id: "pocket-k",
        order: 1,
        label: () => translate("section"),
        inject: () => ({ rpcCall, t: translate })
      },
      PocketSettingsTab
    )
  );
}

    return module.exports;
  }
});
