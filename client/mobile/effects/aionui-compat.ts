import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { getFrame, installMobileEffect, type ReconcilerTask } from './phone-chrome.ts'

/** dsh-web-ui 兼容：explorer / preview 列的显隐标记与升起动画（同域同机制，合并一处）。 */
export function installAionuiCompat(ctx: ClientContext): void {
  installMobileEffect(ctx, 'dsh-web-mobile: aionui explorer close marker', () => {
    const onChevronClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target === null || !target.closest('.aionui-collapse-chevron')) return
      getFrame()?.removeAttribute('data-aionui-explorer-open')
    }
    document.addEventListener('click', onChevronClick, true)
    return () => document.removeEventListener('click', onChevronClick, true)
  })

  installMobileEffect(ctx, 'dsh-web-mobile: preview sheet open marker', () => {
    const closePreview = (): void => {
      getFrame()?.removeAttribute('data-aionui-preview-open')
      getFrame()?.removeAttribute('data-mobile-preview-full')
    }

    // Temporarily spoof platform/userAgent/appVersion to Win32 desktop to
    // bypass the suite's Android check. The spoof is global, so it must be
    // restore-safe: one in-flight timer, re-entrancy guarded, and always
    // restored on effect disposal (narrow→wide / plugin reload).
    const DESKTOP_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    const DESKTOP_APPVERSION = '5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    let restoreTimer: number | null = null
    let spoofed = false
    let originalPlatform = navigator.platform
    let originalUserAgent = navigator.userAgent
    let originalAppVersion = navigator.appVersion
    const restoreNavigator = (): void => {
      if (restoreTimer !== null) {
        window.clearTimeout(restoreTimer)
        restoreTimer = null
      }
      if (!spoofed) return
      spoofed = false
      Object.defineProperty(navigator, 'platform', { value: originalPlatform, configurable: true })
      Object.defineProperty(navigator, 'userAgent', { value: originalUserAgent, configurable: true })
      Object.defineProperty(navigator, 'appVersion', { value: originalAppVersion, configurable: true })
    }
    const spoofDesktop = (): void => {
      if (!spoofed) {
        originalPlatform = navigator.platform
        originalUserAgent = navigator.userAgent
        originalAppVersion = navigator.appVersion
        Object.defineProperty(navigator, 'platform', { value: 'Win32', configurable: true })
        Object.defineProperty(navigator, 'userAgent', { value: DESKTOP_UA, configurable: true })
        Object.defineProperty(navigator, 'appVersion', { value: DESKTOP_APPVERSION, configurable: true })
        spoofed = true
      }
      if (restoreTimer !== null) window.clearTimeout(restoreTimer)
      restoreTimer = window.setTimeout(restoreNavigator, 1000)
    }

    const onTap = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target === null) return
      const row = target.closest('[data-aionui-explorer-col] [class*="_treeRow"]')
      if (row === null) return
      if (row.querySelector('[class*="_treeArrow"]:not([class*="_treeArrowEmpty"])') !== null) return

      spoofDesktop()
      getFrame()?.setAttribute('data-aionui-preview-open', '')
    }
    const onCollapse = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (target === null) return
      if (target.closest('[data-aionui-preview-col] [class*="_panelCollapse"]') !== null) {
        closePreview()
      }
    }
    document.addEventListener('click', onTap, true)
    document.addEventListener('click', onCollapse, true)
    return () => {
      restoreNavigator()
      document.removeEventListener('click', onTap, true)
      document.removeEventListener('click', onCollapse, true)
    }
  })
  // The mobile "Files" entries (header icon + drawer footer) open the
  // dsh-web-ui **aionui explorer column** — a host-side component that plain
  // DeepSeek Harness does NOT ship (issue #48). Without it the entries are
  // dead buttons (they only toggle a frame attribute; nothing ever renders).
  // Detect whether the host provides the column and mark the frame with
  // `data-mobile-nav-explorer="1|0"` so the stylesheet can hide the entries
  // on hosts without it (dsh-web-ui installs keep the feature).
  installMobileEffect(ctx, 'dsh-web-mobile: explorer availability (issue #48)', () => {
    const narrow = window.matchMedia('(max-width: 1023px)')
    if (!narrow.matches) return () => {}
    const check = (): void => {
      const has = document.querySelector('[data-aionui-explorer-col]') !== null
      getFrame()?.setAttribute('data-mobile-nav-explorer', has ? '1' : '0')
    }
    check()
    const timer = window.setTimeout(check, 1500) // 宿主懒渲染：稍后再查一次
    const observer = new MutationObserver(check)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => {
      window.clearTimeout(timer)
      observer.disconnect()
    }
  })
}

export function createPreviewCloseTask(): ReconcilerTask {
  return {
    name: 'preview-close-sync',
    // Only acts when the suite hides the col via inline style. Deliberately
    // NOT scoped to data-aionui-preview-open: our own open marker is set
    // before the suite necessarily flips its inline visibility, so waking on
    // that marker would read the still-hidden style as a "suite close" and
    // immediately undo the file-row tap.
    scopes: ['style'],
    ensure: () => {
      const pv = document.querySelector<HTMLElement>('[data-aionui-preview-col]')
      if (pv === null) return
      if (pv.style.visibility === 'hidden') {
        getFrame()?.removeAttribute('data-aionui-preview-open')
        getFrame()?.removeAttribute('data-mobile-preview-full')
      }
    },
    dispose: () => {},
  }
}

export function createSheetRiseTask(): ReconcilerTask {
  const cols = ['[data-aionui-explorer-col]', '[data-aionui-preview-col]']
  const seen = new Map<string, boolean>()
  const play = (el: Element): void => {
    el.animate(
      [
        { opacity: 0, transform: 'translateY(28px)' },
        { opacity: 1, transform: 'none' },
      ],
      { duration: 280, easing: 'cubic-bezier(.16, 1, .3, 1)', fill: 'backwards' },
    )
  }
  return {
    name: 'sheet-rise-replay',
    // The flush runs on the next frame, by which time React has rendered the
    // opened col, so the frame markers / inline style / class changes are
    // reliable triggers — no '*'.
    scopes: [
      'style',
      'class',
      'data-aionui-explorer-open',
      'data-aionui-preview-open',
      'data-mobile-preview-full',
    ],
    ensure: () => {
      for (const sel of cols) {
        const el = document.querySelector(sel)
        if (el === null) continue
        const visible = getComputedStyle(el).visibility === 'visible'
        const prev = seen.get(sel) ?? false
        if (visible && !prev) play(el)
        seen.set(sel, visible)
      }
    },
    dispose: () => {
      seen.clear()
    },
  }
}
