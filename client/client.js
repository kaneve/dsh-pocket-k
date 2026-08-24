window.__ModuleLoader__.load({
  id: "dsh-pocket",
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
var POCKET_RPC_CHANNEL = "/dsh-pocket";
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

// client/mobile/core/reconciler-core.ts
function createReconcilerCore(options) {
  const onError = options.onError ?? ((taskName, error, phase) => {
    console.error(
      `[dsh-mobile-nav] reconciler task ${taskName}${phase === "dispose" ? " dispose" : ""} failed`,
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
  installMobileEffect(ctx, "dsh-mobile-nav: aionui explorer close marker", () => {
    const onChevronClick = (event) => {
      const target = event.target;
      if (target === null || !target.closest(".aionui-collapse-chevron")) return;
      getFrame()?.removeAttribute("data-aionui-explorer-open");
    };
    document.addEventListener("click", onChevronClick, true);
    return () => document.removeEventListener("click", onChevronClick, true);
  });
  installMobileEffect(ctx, "dsh-mobile-nav: preview sheet open marker", () => {
    const closePreview = () => {
      getFrame()?.removeAttribute("data-aionui-preview-open");
      getFrame()?.removeAttribute("data-mobile-preview-full");
    };
    const onTap = (event) => {
      const target = event.target;
      if (target === null) return;
      const row = target.closest('[data-aionui-explorer-col] [class*="_treeRow"]');
      if (row === null) return;
      if (row.querySelector('[class*="_treeArrow"]:not([class*="_treeArrowEmpty"])') !== null) return;
      getFrame()?.setAttribute("data-aionui-preview-open", "");
    };
    const onCollapse = (event) => {
      const target = event.target;
      if (target === null) return;
      if (target.closest('[data-aionui-preview-col] [class$="_panelCollapse"]') !== null) {
        closePreview();
      }
    };
    document.addEventListener("click", onTap, true);
    document.addEventListener("click", onCollapse, true);
    return () => {
      document.removeEventListener("click", onTap, true);
      document.removeEventListener("click", onCollapse, true);
    };
  });
  installMobileEffect(ctx, "dsh-mobile-nav: explorer availability (issue #48)", () => {
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
function createStatsLineTask() {
  let tpsOrigin = null;
  const moveTps = (stats) => {
    if ([...stats.children].some((c) => /^TPS\s+\d/.test((c.textContent ?? "").trim()))) return;
    const stack = stats.closest('[class$="_composerStack"]');
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
    for (const root of document.querySelectorAll('[data-phase] [class*="_root"]')) {
      if (root.closest('[class$="_composerStack"]') === null) continue;
      if (root.matches('[data-testid="todo-panel"]')) continue;
      if (root.querySelector("button") !== null) continue;
      const text = root.textContent ?? "";
      if (!/(turns|steps|\bLLM\b|轮|步)/.test(text)) continue;
      if (root.querySelector("textarea") !== null) continue;
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
          '<svg class="dsh-mobile-nav-full-in" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
          '<path d="M6 2H2v4M10 2h4v4M6 14H2v-4M10 14h4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
          "</svg>",
          '<svg class="dsh-mobile-nav-full-out" viewBox="0 0 16 16" fill="none" aria-hidden="true">',
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
      const card = document.querySelector("textarea")?.closest('[class$="_card"]');
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
      const nav = dialog.querySelector(':scope > [class$="_nav"]');
      const header = dialog.querySelector('[class$="_header"]');
      if (nav === null || header === null) return;
      if (header.parentElement === nav) return;
      if (header.parentElement !== null) {
        origin = { parent: header.parentElement, next: header.nextSibling };
      }
      nav.appendChild(header);
    },
    dispose: () => {
      if (origin === null) return;
      const header = document.querySelector('[aria-modal="true"] [class$="_header"]');
      if (header !== null && origin.parent.isConnected) {
        origin.parent.insertBefore(header, origin.next);
      }
      origin = null;
    }
  };
}

// client/mobile/effects/overlay-backdrop-fab.ts
function createOverlayTask(t, toggleSidebar) {
  let backdrop = null;
  let fab = null;
  const drawerOpen = () => {
    const frame = getFrame();
    return frame !== null && !frame.hasAttribute("data-sidebar-collapsed");
  };
  const heroPhase = () => document.querySelector('[data-phase="active"]') === null;
  return {
    name: "overlay-backdrop-fab",
    scopes: ["*", "data-sidebar-collapsed", "data-phase"],
    ensure: () => {
      const frame = getFrame();
      if (frame === null) return;
      if (drawerOpen() && backdrop === null) {
        backdrop = document.createElement("div");
        backdrop.dataset.mobileNav = "backdrop";
        backdrop.setAttribute("role", "button");
        backdrop.setAttribute("aria-label", t("backdrop"));
        backdrop.addEventListener("click", toggleSidebar);
        frame.appendChild(backdrop);
      } else if (!drawerOpen() && backdrop !== null) {
        backdrop.remove();
        backdrop = null;
      }
      if (heroPhase() && !drawerOpen() && fab === null) {
        fab = document.createElement("button");
        fab.type = "button";
        fab.dataset.mobileNav = "fab";
        fab.setAttribute("aria-label", t("open"));
        fab.title = t("open");
        fab.innerHTML = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true" width="18" height="18"><path fill-rule="evenodd" clip-rule="evenodd" d="M9.67272 0.522841C10.8339 0.522841 11.76 0.522714 12.4963 0.602493C13.2453 0.683657 13.8789 0.854248 14.4264 1.25197C14.7504 1.48739 15.0355 1.77247 15.2709 2.0965C15.6686 2.64394 15.8392 3.27758 15.9204 4.02655C16.0002 4.7629 16 5.68895 16 6.85014V9.14986C16 10.3111 16.0002 11.2371 15.9204 11.9735C15.8392 12.7224 15.6686 13.3561 15.2709 13.9035C15.0355 14.2275 14.7504 14.5126 14.4264 14.748C13.8789 15.1458 13.2453 15.3163 12.4963 15.3975C11.76 15.4773 10.8339 15.4772 9.67272 15.4772H6.3273C5.16611 15.4772 4.24006 15.4773 3.50371 15.3975C2.75474 15.3163 2.1211 15.1458 1.57366 14.748C1.24963 14.5126 0.964549 14.2275 0.729131 13.9035C0.331407 13.3561 0.160817 12.7224 0.0796529 11.9735C-0.000126137 11.2371 1.25338e-09 10.3111 1.25338e-09 9.14986V6.85014C1.25329e-09 5.68895 -0.000126137 4.7629 0.0796529 4.02655C0.160817 3.27758 0.331407 2.64394 0.729131 2.0965C0.964549 1.77247 1.24963 1.48739 1.57366 1.25197C2.1211 0.854248 2.75474 0.683657 3.50371 0.602493C4.24006 0.522714 5.16611 0.522841 6.3273 0.522841H9.67272ZM5.54303 1.88715V14.1118C5.78636 14.1128 6.04709 14.1169 6.3273 14.1169H9.67272C10.8639 14.1169 11.7032 14.1164 12.3493 14.0465C12.9824 13.9779 13.3497 13.8494 13.6268 13.6482C13.8354 13.4966 14.0195 13.3125 14.1711 13.1039C14.3723 12.8268 14.5007 12.4595 14.5693 11.8264C14.6393 11.1803 14.6398 10.341 14.6398 9.14986V6.85014C14.6398 5.65896 14.6393 4.81967 14.5693 4.1736C14.5007 3.54048 14.3723 3.17318 14.1711 2.89609C14.0195 2.68747 13.8354 2.50337 13.6268 2.35179C13.3497 2.1506 12.9824 2.02212 12.3493 1.95353C11.7032 1.88358 10.8639 1.88307 9.67272 1.88307H6.3273C6.04709 1.88307 5.78636 1.8862 5.54303 1.88715ZM4.1828 1.91166C3.99125 1.9216 3.8148 1.93577 3.65076 1.95353C3.01764 2.02212 2.65034 2.1506 2.37325 2.35179C2.16463 2.50337 1.98052 2.68747 1.82895 2.89609C1.62776 3.17318 1.49928 3.54048 1.43069 4.1736C1.36074 4.81967 1.36023 5.65896 1.36023 6.85014V9.14986C1.36023 10.341 1.36074 11.1803 1.43069 11.8264C1.49928 12.4595 1.62776 12.8268 1.82895 13.1039C1.98052 13.3125 2.16463 13.4966 2.37325 13.6482C2.65034 13.8494 3.01764 13.9779 3.65076 14.0465C4.29683 14.1164 5.13612 14.1169 6.3273 14.1169H9.67272C10.8639 14.1169 11.7032 14.1164 12.3493 14.0465C12.9824 13.9779 13.3497 13.8494 13.6268 13.6482C13.8354 13.4966 14.0195 13.3125 14.1711 13.1039C14.3723 12.8268 14.5007 12.4595 14.5693 11.8264C14.6393 11.1803 14.6398 10.341 14.6398 9.14986V6.85014C14.6398 5.65896 14.6393 4.81967 14.5693 4.1736C14.5007 3.54048 14.3723 3.17318 14.1711 2.89609C14.0195 2.68747 13.8354 2.50337 13.6268 2.35179C13.3497 2.1506 12.9824 2.02212 12.3493 1.95353C11.7032 1.88358 10.8639 1.88307 9.67272 1.88307H6.3273C5.13612 1.88307 4.29683 1.88358 3.65076 1.95353C3.47672 1.97129 3.30027 1.98546 3.10872 1.9954L4.1828 1.91166Z" fill="currentColor"/></svg>';
        fab.addEventListener("click", toggleSidebar);
        frame.appendChild(fab);
      } else if ((!heroPhase() || drawerOpen()) && fab !== null) {
        fab.remove();
        fab = null;
      }
    },
    dispose: () => {
      backdrop?.remove();
      backdrop = null;
      fab?.remove();
      fab = null;
    }
  };
}

// client/mobile/effects/phone-chrome.ts
var NS = "mobileNav";
var MOBILE_QUERY = "(max-width: 1023px)";
function installMobileEffect(ctx, label, install) {
  ctx.effect(() => {
    const narrow = window.matchMedia(MOBILE_QUERY);
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
  installMobileEffect(ctx, "dsh-mobile-nav: DOM reconciler", () => {
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
function installPhoneChrome(ctx) {
  installMobileEffect(ctx, "dsh-mobile-nav: status bar theme + viewport + zoom guard", () => {
    const viewport = document.querySelector('meta[name="viewport"]');
    const originalViewport = viewport?.content ?? "";
    const themeMeta = document.createElement("meta");
    themeMeta.name = "theme-color";
    const bodyBg = () => getComputedStyle(document.body).backgroundColor;
    const sync = () => {
      if (viewport !== null) viewport.content = "width=device-width, initial-scale=1, viewport-fit=cover";
      themeMeta.content = bodyBg();
      if (themeMeta.parentElement === null) document.head.appendChild(themeMeta);
    };
    const restore = () => {
      if (viewport !== null) viewport.content = originalViewport;
      themeMeta.remove();
    };
    const onGestureStart = (event) => event.preventDefault();
    const observer = new MutationObserver(() => {
      themeMeta.content = bodyBg();
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["data-ds-dark-theme"] });
    document.addEventListener("gesturestart", onGestureStart);
    sync();
    return () => {
      observer.disconnect();
      document.removeEventListener("gesturestart", onGestureStart);
      restore();
    };
  });
}
function installOverlayInteractions(ctx) {
  installMobileEffect(ctx, "dsh-mobile-nav: drawer close (Escape + navigate)", () => {
    const toggleSidebar = () => ctx.layout.toggleSidebar();
    const drawerOpen = () => {
      const frame = getFrame();
      return frame !== null && !frame.hasAttribute("data-sidebar-collapsed");
    };
    const onKeyDown = (event) => {
      if (event.key !== "Escape") return;
      if (document.querySelector('[aria-modal="true"]') !== null) return;
      if (drawerOpen()) toggleSidebar();
    };
    const onDrawerClick = (event) => {
      if (document.querySelector('[aria-modal="true"]') !== null) return;
      if (!drawerOpen()) return;
      const target = event.target;
      if (target === null) return;
      const drawer = document.querySelector('[data-mobile-nav="frame"] > :first-child');
      if (drawer === null || !drawer.contains(target)) return;
      if (target.closest('[class*="sessionRow"] button') !== null) return;
      const navigates = target.closest(
        'button[data-dsh-taskboard-entry], button[data-dsh-ssh-entry], [class*="newSession"], [class*="sessionRow"], [class*="searchResultRow"], [class*="searchResultWorkspace"], [class*="usg_"]'
      );
      if (navigates !== null) toggleSidebar();
    };
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("click", onDrawerClick, true);
    return () => {
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("click", onDrawerClick, true);
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
    addReconcilerTask(createOverlayTask(t, () => ctx.layout.toggleSidebar()))
  ];
  return () => {
    for (const remove of removeTasks) remove();
    reconcileTasksRegistered = false;
  };
}

// client/mobile/components/MobileNavToggle.tsx
function MobileNavToggle({ toggleSidebar, t }) {
  const toggleExplorer = () => {
    const frame = getFrame();
    if (frame === null) return;
    if (frame.hasAttribute("data-aionui-explorer-open")) {
      frame.removeAttribute("data-aionui-explorer-open");
    } else {
      frame.removeAttribute("data-aionui-preview-open");
      frame.setAttribute("data-aionui-explorer-open", "");
    }
  };
  return /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "data-mobile-nav": "toggle",
      "aria-label": t("open"),
      title: t("open"),
      onClick: () => toggleSidebar()
    },
    /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives.IconPanelLeftOutline16, { size: 16 })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "data-mobile-nav": "files",
      "aria-label": t("files"),
      title: t("files"),
      onClick: toggleExplorer
    },
    /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives.IconFolderOpenOutline16, { size: 16 })
  ));
}

// client/mobile/components/MobileDrawerFooter.tsx
var import_dsh_client_ui_primitives2 = require("@deepseek-ai/dsh-client-ui-primitives");
function MobileDrawerFooter({ useSessions, downloadSessionLog, toggleSidebar, t }) {
  const sessionId = useSessions((state) => state.current);
  const openExplorer = () => {
    getFrame()?.removeAttribute("data-aionui-preview-open");
    getFrame()?.setAttribute("data-aionui-explorer-open", "");
    toggleSidebar();
  };
  return /* @__PURE__ */ React.createElement("div", { "data-mobile-nav": "drawer-actions" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "button",
      "data-mobile-nav": "explorer",
      "aria-label": t("files"),
      title: t("files"),
      onClick: openExplorer
    },
    /* @__PURE__ */ React.createElement(import_dsh_client_ui_primitives2.IconPanelLeftOutline16, { size: 14 }),
    /* @__PURE__ */ React.createElement("span", null, t("files"))
  ), /* @__PURE__ */ React.createElement(
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

/* Floating fallback button (hero / blank phases without a session header).
   The top clears the camera band below the status bar; when the client has
   set viewport-fit=cover the safe-area inset moves it below the notch too. */
[data-mobile-nav="fab"] {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 72px);
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
  animation: dsh-mobile-nav-fade .2s var(--ds-ease-in-out, ease-in-out);
  -webkit-tap-highlight-color: transparent;
}
@keyframes dsh-mobile-nav-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
/* Settings sheet entrance: the official dialog mounts with no animation at
   all, so it snaps in. Fade + slight rise/scale reads as a proper sheet. */
@keyframes dsh-mobile-nav-sheet-in {
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
@keyframes dsh-mobile-nav-sheet-up {
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
var LAYOUT_CSS = `/* ---------- mobile-only layout ---------- */

@media (max-width: 1023px) {
  /* --- Phone chrome ---
     The system status bar stays visible (no fullscreen). Two adjustments
     make it behave:
     - touch-action: manipulation kills double-tap-to-zoom (and the 300ms
       tap delay) while keeping pan and pinch zoom; the client also
       suppresses legacy-iOS gesturestart as a fallback.
     - With the client's viewport-fit=cover, env(safe-area-inset-top) is the
       status bar / notch height; the rules below push the app content below
       it so the status bar never covers anything. Off notched phones (or in
       a normal browser tab where the layout viewport already sits below the
       status bar) the inset is 0 and nothing shifts. */
  html,
  body {
    touch-action: manipulation !important;
  }

  /* AppFrame: the drawer takes the sidebar column out of grid flow, so the
     remaining in-flow items (center, details) land in tracks 1..2: give the
     center every pixel and keep the details track at zero. The top padding
     clears the status bar / notch for every in-flow surface (session header,
     messages, composer); the absolutely-positioned drawer is unaffected (its
     containing block is the frame's padding box, i.e. still the frame top). */
  [data-mobile-nav="frame"] {
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

  /* Drag handles are useless on touch and would float over the drawer. */
  [data-side="sidebar"],
  [data-side="details"] {
    display: none !important;
  }

  /* --- Conversation text on mobile ---
     The official message flow keeps desktop's 32px side gutters and 16px
     type. On a phone: shrink the type a notch and widen the lines by
     trimming the gutters (the sidebar drawer list keeps its size). The
     flow's scroll container is the only _scroll element holding markdown
     <p> paragraphs \u2014 the composer's own scroll (textarea) is excluded
     via :has(p). */
  /* The official main scroll body reserves scrollbar-gutter for desktop
     scrollbars (8px), which shoves every column off-center on a phone.
     Classic desktop scrollbars (Edge/Chrome) also occupy ~8-17px in a
     phone-sized viewport, shifting the column further. Mobile scrolling
     is touch/wheel, so remove the scrollbar entirely on phones: the
     column is then exactly centered in every browser. */
  [data-phase] [class$="_scrollBody"] {
    scrollbar-gutter: auto !important;
    scrollbar-width: none;
  }
  [data-phase] [class$="_scrollBody"]::-webkit-scrollbar {
    display: none !important;
    width: 0;
    height: 0;
  }
  /* Message action rows (copy / run-time badges) can overflow the right
     edge on narrow screens \u2014 keep them inside the message width. */
  [data-phase] [class$="_actions"] {
    overflow: hidden;
  }
  [data-phase] [class$="_actions"] [class$="_timeEnd"] {
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }

  [data-phase] [class$="_scroll"]:has(p) {
    padding-left: 20px;
    padding-right: 20px;
    font-size: 15px !important;
  }
  /* The official markdown styles set an explicit 16px on paragraphs and
     list items, so the container's inherited 15px is not enough. User
     messages render their text in a div whose class carries _text_
     (16px too) \u2014 cover it as well. */
  [data-phase] [class$="_scroll"]:has(p) p,
  [data-phase] [class$="_scroll"]:has(p) li,
  [data-phase] [class$="_scroll"]:has(p) [class*="_text_"] {
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

  /* User bubbles: the official stack is capped at min(525px, 82%), which on a
     phone leaves a large blank strip on the left and pushes the bubble high.
     On mobile let the user message fill the same full width as assistant
     messages (the bubble background then spans the whole message column). */
  [data-phase] [class$="_userStack"],
  [data-phase] [class$="_userStack"] [class$="_bubble"] {
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
  /* :has()-free fallback (older Android WebView / iOS Safari <15.4, which
     also lack container queries): without it the composer action row is
     completely unstyled \u2014 model selector / context / send button lose
     their right-aligned lane. Modern browsers match the more specific
     :has() rules below, which override this baseline. */
  [data-phase] [class*="_card"] [class$="_trailing"] {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-left: auto;
    min-width: 0;
    gap: 6px;
  }
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) {
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
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > :first-child {
    flex: 0 1 auto;
    min-width: 0;
    gap: 6px;
    /* The permission dropdown (Menu, side: top) pops upward from inside the
       tools lane; overflow hidden here would crop it, same as the row. Text
       ellipsis is handled by the trigger label itself. */
    overflow: visible;
  }
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > [class$="_trailing"] {
    flex: 1 1 auto;
    min-width: 0;
    gap: 6px;
    /* Must not clip the model dropdown; the model trigger clips its own label. */
    overflow: visible;
  }
  /* PermissionSelect / plan controls share the tools lane. Let the
     permission label use the remaining tools width, while the lower-priority
     plan slot keeps an icon-sized target instead of stealing model width. */
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > :first-child > :nth-child(2) {
    flex: 0 1 auto;
    min-width: 0;
    max-width: none;
    gap: 4px;
    /* The permission Menu list (side: top) pops upward out of this lane;
       overflow hidden crops it. The trigger label clips its own text. */
    overflow: visible;
  }
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > :first-child > :nth-child(2) > [class$="_trigger"] {
    flex: 1 1 auto;
    min-width: 28px;
    max-width: 100%;
    display: flex !important;
    overflow: hidden;
  }
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > :first-child > :nth-child(2) > [class$="_trigger"] > [class$="_triggerLabel"] {
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
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > :first-child > :nth-child(2) > :not([class$="_trigger"]) {
    flex: 0 1 auto;
    min-width: 34px;
    max-width: max-content;
    overflow: visible;
  }
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > :first-child > :nth-child(2) > [class$="_wrap"] > [class$="_chip"] {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }
  @container dsh-mobile-composer (max-width: 359px) {
    [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > :first-child > :nth-child(2) > [class$="_trigger"] > [class$="_triggerLabel"] {
      display: none !important;
    }
  }
  /* Model selector: flexible and shrinkable, but never clipped.
     The root must be overflow:visible so the dropdown menu can render.
     The trigger itself clips the label text. */
  [data-phase] [class*="_card"]:has(textarea) [class$="_root"]:has(> [class$="_trigger"][aria-haspopup="menu"]) {
    flex: 0 1 auto;
    min-width: 0;
    overflow: visible;
  }
  @container dsh-mobile-composer (max-width: 359px) {
    [data-phase] [class*="_card"]:has(textarea) [class$="_root"]:has(> [class$="_trigger"][aria-haspopup="menu"]) {
      flex-basis: auto;
    }
  }
  [data-phase] [class*="_card"]:has(textarea) [class$="_root"]:has(> [class$="_trigger"][aria-haspopup="menu"]) > [class$="_trigger"] {
    display: flex !important;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
  }
  [data-phase] [class*="_card"]:has(textarea) [class$="_root"]:has(> [class$="_trigger"][aria-haspopup="menu"]) > [class$="_trigger"] > [class$="_triggerLabel"] {
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap !important;
  }
  [data-phase] [class*="_card"]:has(textarea) [class$="_root"]:has(> [class$="_trigger"]):not(:has(> [class$="_trigger"][aria-haspopup="menu"])) {
    flex: 0 0 auto;
  }

  /* Model switcher menu: center the dropdown on the now-shrinkable trigger,
     but never let it exceed the viewport on narrow phones. */
  [data-phase] [class*="_card"]:has(textarea) [class$="_root"]:has(> [class$="_trigger"]) > [class$="_menu"] {
    left: 50% !important;
    right: auto !important;
    transform: translateX(-50%) !important;
    max-width: min(320px, calc(100vw - 16px));
    box-sizing: border-box;
  }

  /* --- Fix composer row overflow at narrow widths (320px-360px) ---
     Force every direct child of the tools and trailing lanes to shrink,
     so they can fit within the available space without causing horizontal
     overflow. */
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > :first-child > * {
    flex-shrink: 1;
    min-width: 0;
  }
  [data-phase] [class*="_card"]:has(textarea) [class$="_row"]:has([class$="_trailing"]) > [class$="_trailing"] > * {
    flex-shrink: 1;
    min-width: 0;
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
  [data-mobile-nav="frame"] [data-phase] header [class$="_headerActions"] {
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
  [data-mobile-nav="frame"] [data-phase] header [class$="_crumbs"] {
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
  [data-mobile-nav="frame"] [data-phase] header [class$="_label"]:has(> svg) {
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
  [data-mobile-nav="frame"] [data-phase] header [class$="_label"]:has(> svg) > svg {
    position: absolute !important;
    left: 0 !important;
    top: 50% !important;
    transform: translateY(-50%) !important;
  }
  /* Running/subagent controls keep their full status text and hit area; they
     do not give up width to the mode label. NOTE: the real subagent lineage
     root has class="ZKlsPq_root " \u2014 a TRAILING SPACE from the plugin's
     template-literal className \u2014 so [class$="_root"] never matches it. Use
     [class*="_root"] and exclude the switcher root ([class*="_switcherRoot"])
     so only the count/job roots get pinned (the switcher must stay shrinkable
     so its own title can ellipsize). */
  [data-mobile-nav="frame"] [data-phase] header [class*="_root"]:not([class*="_switcherRoot"]):has(> button[class$="_trigger"]) {
    order: 2;
    flex: 0 0 auto;
    min-width: max-content;
    max-width: max-content;
    white-space: nowrap !important;
    position: static;
  }
  [data-mobile-nav="frame"] [data-phase] header [class*="_root"]:not([class*="_switcherRoot"]):has(> button[class$="_trigger"]) > button,
  [data-mobile-nav="frame"] [data-phase] header [class*="_root"]:not([class*="_switcherRoot"]):has(> button[class$="_trigger"]) > button * {
    white-space: nowrap !important;
  }
  /* The lineage count's leading "/" (ZKlsPq_separator \u2014 official desktop
     chrome rendered only for a root session inside the crumbs) looks like a
     stray extra breadcrumb level on small screens; hide it. The crumbSep "/"
     between ancestry segments (subagent sessions) is a real separator and
     stays. */
  [data-mobile-nav="frame"] [data-phase] header [class$="_crumbs"] [class$="_separator"] {
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
     [class*="_root"] (the real class carries a trailing space; [class$="_root"]
     matches nothing). */
  @media (max-width: 440px) {
    [data-mobile-nav="frame"] [data-phase] header [class$="_crumbs"] {
      padding-right: 8px;
    }
    [data-mobile-nav="frame"] [data-phase] header [class$="_headerActions"]:has([class*="_root"]) [class$="_label"]:has(> svg),
    [data-mobile-nav="frame"] [data-phase] header:has([class$="_crumbs"] [class*="_root"]) [class$="_label"]:has(> svg) {
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
    [data-mobile-nav="frame"] [data-phase] header [class$="_crumbs"] {
      padding-right: 8px;
    }
    [data-mobile-nav="frame"] [data-phase] header:has([class$="_crumbs"] [class*="_root"]) [class$="_headerActions"] [class*="_root"]:not([class*="_switcherRoot"]):has(> button[class$="_trigger"]) [class$="_count"] {
      display: none !important;
    }
    [data-mobile-nav="frame"] [data-phase] header:has([class$="_crumbs"] [class*="_root"]):has([class$="_headerActions"] [class*="_root"]) [class$="_label"]:has(> svg) {
      max-width: 18px;
      min-width: 18px;
      padding-left: 18px;
      padding-right: 0 !important;
    }
  }
  @media (max-width: 359px) {
    [data-mobile-nav="frame"] [data-phase] header:has([class$="_crumbs"] [class*="_root"]):has([class$="_headerActions"] [class*="_root"]) [class$="_label"]:has(> svg) {
      display: none !important;
    }
  }

  /* --- Header popovers on mobile (dsh-client-ui-jobs / dsh-client-ui-subagent) --- */
  /* The official entries sit in the session header actions. Their popovers
     are anchored to the trigger's left edge, so clamp them to the viewport. */
  [data-mobile-nav="frame"] [data-phase] header [class$="_menu"] {
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
    animation: dsh-mobile-nav-sheet-in .22s var(--ds-ease-out, ease-in-out);
  }
  /* The settings sheet's dimmed mask fades in with the panel (the mask is
     the first child of the overlay that directly contains the sheet). */
  :has(> [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"]))) > :first-child {
    animation: dsh-mobile-nav-fade .18s var(--ds-ease-out, ease-in-out);
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
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child [class$="_navList"] {
    flex: 1 1 auto;
    min-width: 0;
    flex-direction: row !important;
    flex-wrap: wrap;
    gap: 6px;
    overflow: visible;
  }
  /* Content toolbar (Open configuration file + close): grouped flush to
     the right edge, and reparented INTO the nav row on mobile so it shares
     one line with the tabs (user feedback 2026-08-16 \u2014 the toolbar's own
     row left a full-width dead gap under the tabs). Anchored by class: the
     header leaves the content subtree, so :first-child/:last-child anchors
     would now hit the options area. Children carry official auto-margins
     that would defeat flex-end, so neutralize them. The close button gets
     a round tappable base so it reads as its own control, not part of the
     outline button. */
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) [class$="_header"] {
    flex: 0 0 auto;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 0 0 0 4px;
    min-height: 40px;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) [class$="_header"] > * {
    margin-left: 0 !important;
    margin-right: 0 !important;
  }
  [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) [class$="_header"] > :last-child {
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
  [aria-modal="true"] [class$="_cubeRow"] {
    gap: 6px;
  }
  [aria-modal="true"] [class$="_cubeRow"] > * {
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
var COMPAT_CSS = `@media (max-width: 1023px) {
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
    animation: dsh-mobile-nav-sheet-up .24s var(--ds-ease-out, ease-in-out) !important;
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
    animation: dsh-mobile-nav-sheet-up .24s var(--ds-ease-out, ease-in-out) !important;
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
  [data-aionui-preview-col] [class$="_tabScroll"] {
    padding-right: 34px !important;
  }
  /* Visible only while the preview sheet is open. Visibility itself is
     inherited from the column, so the sheet's own hide rules (collapse,
     drawer open) cover the button too. */
  [data-mobile-nav="frame"][data-aionui-preview-open] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] {
    display: inline-flex !important;
  }
  /* Icon swap on the frame fullscreen marker. */
  [data-mobile-nav="preview-full-toggle"] .dsh-mobile-nav-full-out {
    display: none !important;
  }
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] .dsh-mobile-nav-full-in {
    display: none !important;
  }
  [data-mobile-nav="frame"][data-mobile-preview-full] [data-aionui-preview-col] [data-mobile-nav="preview-full-toggle"] .dsh-mobile-nav-full-out {
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
  [data-dsh-taskboard-board] > [class$="_columns"] {
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
  [data-dsh-taskboard-board] > [class$="_boardHeader"] [class$="_search"] {
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

  [aria-modal="true"] [class$="_tabs"] {
    flex-wrap: wrap !important;
    row-gap: 8px !important;
  }
  [aria-modal="true"] [class$="_searchInline"] {
    flex: 1 1 100% !important;
    width: 100% !important;
    max-width: 100% !important;
  }

  /* ---------- dsh-usage-stats polish: usage & balance panel ----------
     The panel's stats row shows three token counters side by side
     (today / month / total). The counters use tabular nowrap figures whose
     min-content width overflows the ~336px panel body on a phone: figures
     clip at the row's edges and the panel grows a horizontal scrollbar.
     Stack the three counters vertically \u2014 full-width rows, so the figures
     always fit. */

  [class*="usg_"][class$="_statsRow"] {
    flex-direction: column !important;
  }
  [class*="usg_"][class$="_stat"] {
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
  [data-mobile-nav="frame"] [aria-modal="true"]:has(> :first-child > :last-child > button):not(:has([role="navigation"])):not(:has([class*="ZuhsRW"])) > :first-child [class$="_navList"] {
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
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navList"]::-webkit-scrollbar {
    height: 2px !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navList"]::-webkit-scrollbar-thumb {
    background: var(--dsw-alias-border-l2, rgba(0, 0, 0, .22)) !important;
    border-radius: 1px !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navList"]::-webkit-scrollbar-track {
    background: transparent !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navCell"] {
    flex: 0 0 auto !important;
    white-space: nowrap !important;
    padding: 6px 8px !important;
    gap: 6px !important;
    font-size: 13px !important;
    justify-content: flex-start !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_navCell"] svg {
    width: 14px !important;
    height: 14px !important;
    flex: none !important;
  }
  /* Content toolbar: the "Open configuration file" button is hidden on
     mobile \u2014 it is rarely needed on a phone and steals ~180px from the
     tab row's scroll area (user feedback 2026-08-16). Only the close \u2715
     stays, flush right in the nav row. Desktop untouched (frame scoped). */
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_header"] [class$="_actions"] {
    display: none !important;
  }
  [data-mobile-nav="frame"] [aria-modal="true"] [class$="_header"] [class$="_actions"] [class$="_action"] {
    font-size: 13px !important;
    padding: 6px 12px !important;
    min-height: 0 !important;
  }
  /* Setting rows: text on top, control below at full width. */
  [aria-modal="true"] [class$="_section"] [class$="_row"] {
    flex-direction: column !important;
    align-items: stretch !important;
    gap: 8px !important;
  }
  [aria-modal="true"] [class$="_section"] [class$="_row"] > :first-child {
    width: 100% !important;
    max-width: none !important;
  }
  [aria-modal="true"] [class$="_section"] [class$="_row"] > :last-child {
    width: 100% !important;
    max-width: none !important;
  }
  /* Appearance mode group: give the cube row a consistent bordered
     segmented look (the official borders differ per state). */
  [aria-modal="true"] [class$="_cubeRow"] > * {
    border: 1px solid var(--dsw-alias-border-l1, rgba(0, 0, 0, .12)) !important;
  }

  /* ---------- dsh-web-ui polish: explorer sheet ----------
     The aionui explorer was designed for a desktop side column: compact the
     header, search box and tree rows so a phone shows more entries, and pad
     the scroll bottom so the last row never sits flush on the edge. */

  [data-aionui-explorer-col] [class$="_tabBar"] {
    height: 36px !important;
  }
  [data-aionui-explorer-col] [class$="_tabBtn"],
  [data-aionui-explorer-col] [class$="_tabBtnActive"] {
    padding: 0 12px !important;
    font-size: 13px !important;
  }
  [data-aionui-explorer-col] [class$="_searchBox"] {
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
  [data-aionui-explorer-col] [class$="_scrollArea"] {
    padding-bottom: 28px !important;
  }

  /* ---------- dsh-web-ui polish: drawer footer ----------
     The injected footer actions (Files + Session log) become two equal pill
     buttons instead of text-width capsules. */

  /* The official footerActions row also hosts the remote-web-ui entry
     row (two icon buttons); without wrapping the two groups squeeze each
     other on one line. Wrap so each group gets its own full-width row. */
  [data-mobile-nav="frame"] [class$="_footerActions"] {
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

  body > [class$="_float"]:has([class$="_sprite"][role="button"]) {
    transform: scale(.66);
    transform-origin: bottom right;
  }
  /* While a modal dialog (settings sheet / export) owns the screen the pet
     floats ABOVE it and covers the dialog content; modal semantics say the
     background is inert, so hide the pet for the modal's lifetime. */
  body:has([aria-modal="true"]) > [class$="_float"]:has([class$="_sprite"][role="button"]) {
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
     and made the composer read too tall; the row is now 40px = chip (24px)
     at top 12px + ~4px to the textarea \u2014 the chip sits slightly lower and
     the gap is compressed without touching the official height budget
     further. */

  [data-mobile-nav="frame"] [data-gitgraph-chip-anchor] {
    position: absolute !important;
    top: 12px !important;
    left: 12px !important;
    right: auto !important;
    bottom: auto !important;
    z-index: 1 !important;
  }
  [data-mobile-nav="frame"] [class$="_card"]:has([data-gitgraph-chip-anchor]) {
    padding-top: 40px !important;
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
[class*="irow"] > div > [class*="spec"] {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 100% !important;
  font-size: 12px !important;
}
[class*="irow"] > div > [class*="nm"] {
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
  max-width: 100% !important;
}
/* ===== \u5DF2\u5B89\u88C5\u5217\u8868\uFF1A\u624B\u673A\u7AEF\u7EB5\u5411\u91CD\u6392 ===== */
@media (max-width: 1023px) {
  [class*="irow"] {
    flex-wrap: wrap !important;
    align-items: center !important;
    gap: 4px 10px !important;
  }
  [class*="irow"] > div:first-child {
    flex: 1 1 100% !important;
    max-width: 100% !important;
    min-width: 0 !important;
  }
  [class*="irow"] > [class*="grow"] {
    flex: 1 1 auto !important;
  }
  [class*="irow"] > button {
    flex: 0 0 auto !important;
  }
  [class*="irow"] > button[class*="switch"] {
    order: 3 !important;
  }
  [class*="irow"] > button:not([class*="switch"]) {
    order: 2 !important;
  }
  [class*="irow"] > [class*="owner"] {
    order: 1 !important;
  }
  [class*="irow"] > [class*="grow"] {
    order: 0 !important;
  }
}
}

`;

// client/mobile/styles/misc.css.ts
var MISC_CSS = `@media (max-width: 1023px) {
  /* ---------- hero composer on mobile ----------
     The official hero card carries a 2-line textarea plus a tall tool row,
     which reads oversized on a phone. Tighten the empty-state rhythm: keep
     the official centered hero, shrink the textarea line box, slim the card
     padding and the tool row, and close the gap under the headline. */

  [data-phase="hero"] [class$="_card"]:has(textarea) {
    padding-top: 6px !important;
    gap: 8px !important;
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
  [data-phase="hero"] [class$="_card"]:has(textarea:placeholder-shown) > [class$="_scroll"],
  [data-phase="hero"] [class$="_card"]:has(textarea:placeholder-shown) [class$="_grow"] {
    height: 28px !important;
  }
  [data-phase="hero"] [class$="_card"]:has(textarea) > [class$="_row"] {
    padding-top: 2px !important;
  }
  [data-phase="hero"] [class$="_headline"] {
    line-height: 1.15 !important;
    margin-bottom: 0 !important;
  }
  [data-phase="hero"] [class$="_stack"] {
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
  [data-question-key] [class$="_customInput"],
  [data-question-key] [class$="_customTextarea"] {
    font-size: 16px !important;
  }
}

/* ---------- tablet / wide mobile: keep sheets from becoming full-width ----------
   Below 768px the near-full-width sheets are the right call for a phone.
   On wider but still sub-desktop viewports (foldables, tablet portrait,
   desktop-mode tall windows) the same full-bleed sheet leaves content
   clustered at the left edge with a large dead zone on the right. Cap and
   center the modal sheets and the aionui bottom sheets instead. */
@media (min-width: 768px) and (max-width: 1023px) {
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
  [aria-modal="true"] [class$="_section"] {
    width: 100% !important;
    max-width: none !important;
  }
}

/* ---------- desktop: the mobile controls must never appear ---------- */

@media (min-width: 1024px) {
  [data-mobile-nav="toggle"],
  [data-mobile-nav="files"],
  [data-mobile-nav="fab"],
  [data-mobile-nav="backdrop"],
  [data-mobile-nav="session-log"],
  [data-mobile-nav="explorer"],
  [data-mobile-nav="drawer-actions"] {
    display: none !important;
  }
}
`;

// client/mobile/styles/index.ts
var MOBILE_CSS = [BASE_CSS, LAYOUT_CSS, COMPAT_CSS, MISC_CSS].join("\n");

// client/mobile/i18n/locales.ts
var NS2 = "mobileNav";
var zh = {
  "open": "\u6253\u5F00\u76EE\u5F55",
  "close": "\u6536\u8D77\u76EE\u5F55",
  "backdrop": "\u70B9\u51FB\u5173\u95ED\u76EE\u5F55",
  "sessionLog": "\u5BFC\u51FA\u4F1A\u8BDD\u65E5\u5FD7",
  "files": "\u6587\u4EF6\u6D4F\u89C8",
  "previewFullscreen": "\u5168\u5C4F\u9884\u89C8",
  "previewExitFullscreen": "\u9000\u51FA\u5168\u5C4F"
};
var en = {
  "open": "Open directory",
  "close": "Close directory",
  "backdrop": "Click to close directory",
  "sessionLog": "Session log",
  "files": "Files",
  "previewFullscreen": "Fullscreen preview",
  "previewExitFullscreen": "Exit fullscreen"
};

// client/mobile/index.tsx
function apply(ctx) {
  ctx.effect(() => ctx.locale.register(NS2, { zh, en }), "dsh-mobile-nav: dictionaries");
  ctx.effect(() => {
    const tag = document.createElement("style");
    tag.dataset.plugin = "@dsh-external/dsh-mobile-nav";
    tag.dataset.pluginCss = "@dsh-external/dsh-mobile-nav/mobile.css";
    tag.textContent = MOBILE_CSS;
    document.head.appendChild(tag);
    setTimeout(() => {
      if (tag.isConnected) document.head.appendChild(tag);
    }, 0);
    return () => {
      tag.remove();
    };
  }, "dsh-mobile-nav: styles");
  ctx.effect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const set = (el, props) => {
      for (const [key, value] of Object.entries(props)) {
        el.style.setProperty(key, value, "important");
      }
    };
    const apply3 = () => {
      if (!mq.matches) return;
      document.querySelectorAll('[class*="irow"]').forEach((row) => {
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
        row.querySelectorAll(':scope > button[class*="switch"]').forEach((el) => {
          set(el, { "order": "3" });
        });
        row.querySelectorAll(':scope > button:not([class*="switch"])').forEach((el) => {
          set(el, { "order": "2" });
        });
        row.querySelectorAll(':scope > [class*="owner"]').forEach((el) => {
          set(el, { "order": "1" });
        });
        row.querySelectorAll(':scope > [class*="grow"]').forEach((el) => {
          set(el, { "order": "0" });
        });
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
    apply3();
    const mo = new MutationObserver(apply3);
    mo.observe(document.documentElement, { childList: true, subtree: true });
    const onMq = () => {
      if (mq.matches) apply3();
    };
    mq.addEventListener("change", onMq);
    return () => {
      mo.disconnect();
      mq.removeEventListener("change", onMq);
    };
  }, "dsh-mobile-nav: installed-list-inline-styles");
  ctx.effect(() => {
    const stops = [
      installFrameController(),
      installReconciler(ctx),
      registerReconcileTasks(ctx)
    ];
    return () => {
      for (const stop of stops) stop();
    };
  }, "dsh-mobile-nav: reconciler infrastructure");
  installOverlayInteractions(ctx);
  installPhoneChrome(ctx);
  installAionuiCompat(ctx);
  ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
    name: "conversation.session.header.actions",
    id: "mobile-nav-toggle",
    order: 10,
    locale: NS2,
    inject: () => ({
      toggleSidebar: () => ctx.layout.toggleSidebar()
    })
  }, MobileNavToggle));
  ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
    name: "sidebar.footer.action",
    id: "mobile-nav-session-log",
    order: 5,
    locale: NS2,
    inject: () => ({
      downloadSessionLog: (sessionId) => ctx.sessionLogDownload.download(sessionId),
      toggleSidebar: () => ctx.layout.toggleSidebar()
    })
  }, MobileDrawerFooter));
}

// client/pocket-locales.js
var NS3 = "pocket";
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
  "updateFailed": "\u274C \u5931\u8D25\uFF1A{err}\uFF08\u624B\u52A8\u66F4\u65B0\uFF1Adsh plugin --profile web update dsh-pocket --latest -w\uFF09",
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
  "updateFailed": "\u274C Failed: {err} (manual update: dsh plugin --profile web update dsh-pocket --latest -w)",
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
var name = "dsh-pocket";
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
        const meta = await (await fetch("https://registry.npmjs.org/dsh-pocket/latest", { cache: "no-store" })).json();
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
  const disableFixedDomain = async () => {
    setBusy(true);
    setError(null);
    try {
      setStatus(await call(POCKET_ENDPOINTS.tunnelStop, {}));
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
        publicBase ? (0, import_react.createElement)("span", { style: { display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--dsw-alias-brand-primary,#4f6ef7)", color: "#fff" } }, t("fixedMode")) : tunnelUrl ? (0, import_react.createElement)("span", { style: { display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: "var(--dsw-alias-state-warn-primary,#b45309)", color: "#fff" } }, t("randomMode")) : null
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
        status.tunnelRunning ? (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, marginTop: 8 } },
          (0, import_react.createElement)("button", { style: styles.primary, onClick: stopTunnel }, t("stopTunnel")),
          publicBase ? (0, import_react.createElement)("button", { style: styles.btn, onClick: () => startTunnel(true), disabled: busy || tunnelStarting }, busy ? t("opening") : t("enableBackup")) : null,
          publicBase ? (0, import_react.createElement)("button", { style: styles.btn, onClick: disableFixedDomain, disabled: busy }, t("close")) : null
        ) : publicBase ? (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, margin: "8px 0" } },
          (0, import_react.createElement)("button", { style: styles.btn, onClick: () => startTunnel(), disabled: busy || tunnelStarting }, busy ? t("opening") : t("enableFixed")),
          (0, import_react.createElement)("button", { style: styles.btn, onClick: () => startTunnel(true), disabled: busy || tunnelStarting }, t("enableBackup")),
          (0, import_react.createElement)("button", { style: styles.primary, onClick: disableFixedDomain, disabled: busy }, t("close"))
        ) : null
      ) : (0, import_react.createElement)(
        "div",
        null,
        publicBase ? (0, import_react.createElement)(
          "div",
          { style: { display: "flex", gap: 8, margin: "8px 0" } },
          (0, import_react.createElement)("button", { style: styles.btn, onClick: () => startTunnel(), disabled: busy || tunnelStarting }, busy ? t("opening") : t("enableFixed")),
          (0, import_react.createElement)("button", { style: styles.btn, onClick: () => startTunnel(true), disabled: busy || tunnelStarting }, t("enableBackup")),
          (0, import_react.createElement)("button", { style: styles.primary, onClick: disableFixedDomain, disabled: busy }, t("close"))
        ) : (0, import_react.createElement)("button", { style: { ...styles.primary, margin: "8px 0" }, onClick: () => startTunnel(), disabled: busy || tunnelStarting }, busy ? t("opening") : t("enable")),
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
              (0, import_react.createElement)("span", { style: { width: 8, height: 8, borderRadius: 999, background: d.online ? "#16a34a" : "#9ca3af", display: "inline-block" } }),
              (0, import_react.createElement)("span", { style: { fontSize: 11, fontWeight: 400, color: d.online ? "#16a34a" : "var(--dsw-alias-label-tertiary,#8b93a1)" } }, d.online ? t("deviceOnline") : t("deviceOffline"))
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
        { href: "https://github.com/shaobeichen/dsh-pocket/issues", target: "_blank", rel: "noreferrer", style: { fontSize: 12, color: "var(--dsw-alias-label-secondary,#6b7280)", textDecoration: "none" } },
        t("feedback")
      )
    )
  );
}
function apply2(ctx) {
  apply(ctx);
  const rpcCall = (endpoint, payload, signal) => ctx.connection.rpc.call(POCKET_RPC_CHANNEL, endpoint, payload, signal);
  const translate = ctx.locale.bind(NS3);
  ctx.effect(() => ctx.locale.register(NS3, { zh: zh2, en: en2 }), "dsh-pocket: pocket locale dictionaries");
  ctx.slots.inject(
    "settings.section",
    () => ctx.slots.register(
      {
        name: "settings.section",
        id: "pocket",
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
