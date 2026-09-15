import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import { detectIosWebKit, installMobileEffect } from './phone-chrome.ts'

/**
 * iOS keyboard guard for the composer's fixed control cluster.
 *
 * Upstream `dsh-client-ui-conversation` (0.1.2-rc.1) hangs the same
 * `keepFocus` handler on the composer row's three buttons (send, stop, the
 * `+` commands trigger):
 *
 *   const keepFocus = (e) => {
 *     e.preventDefault()
 *     editor?.getRootElement()?.focus({ preventScroll: true })
 *   }
 *
 * `onMouseDown` keeps the caret in the editor across button clicks on
 * desktop. On iOS WebKit the same handler runs inside the tap's synthesized
 * mousedown, and that programmatic `focus()` call re-raises the on-screen
 * keyboard whenever it had closed (scroll-to-dismiss, keyboard dismissal,
 * PWA relaunch) while logical focus never left the contenteditable. The
 * user taps Send on a collapsed keyboard and the keyboard springs back up
 * over the running conversation — the message still sends, but the screen
 * is now half keyboard.
 *
 * Fix strategy, scoped to iOS WebKit (the engine that re-raises keyboards
 * from a programmatic focus; Android/desktop behavior is untouched):
 *
 * In the capture phase of every mousedown whose target sits inside the
 * composer card but is NOT the editing surface itself, temporarily install
 * an own no-op `focus` property on the `[data-composer-input]` element.
 * React's `keepFocus` then calls the shadow instead of the prototype
 * method, the keyboard stays down, and the shadow is removed on the next
 * macrotask so nothing outlives the tap:
 *
 *   capture mousedown → shadow focus → (bubbling) keepFocus → click →
 *   macrotask restore
 *
 * Why shadowing instead of intercepting the event: `keepFocus`'s own
 * `preventDefault()` must keep running (it stops the tap from blurring
 * the editor), and the editor's own tap-to-type path must never be
 * touched — only the button-initiated programmatic focus is undesirable
 * on iOS. A capture-phase `stopPropagation` would break both.
 *
 * DOM contract (verified against 0.1.2-rc.1 dsh-client-ui-conversation):
 * - `[data-composer-card]` — the composer card root (InputBar).
 * - `[data-composer-input]` — the Lexical contenteditable surface.
 * - The buttons carry hashed `_primary`/`_add` classes and no stable
 *   data marker, so the card boundary (not the buttons) is the anchor.
 * Audit both markers when the conversation package upgrades.
 */

/** The composer card root that owns the fixed control cluster. */
const COMPOSER_CARD_SELECTOR = '[data-composer-card]'

/** The Lexical editing surface (the only element allowed to raise the keyboard). */
const COMPOSER_INPUT_SELECTOR = '[data-composer-input]'

/** Re-arm marker kept on the editor element while its focus is shadowed. */
const SHADOW_MARKER = 'data-mobile-nav-focus-shadow'

export function installComposerKeyboardGuard(ctx: ClientContext): void {
  installMobileEffect(ctx, 'dsh-web-mobile: composer keyboard guard', () => {
    // Only iOS/iPadOS WebKit re-raises the dismissed keyboard on a
    // programmatic focus; other engines get no listener at all.
    if (!detectIosWebKit(navigator, typeof CSS !== 'undefined' && typeof CSS.supports === 'function' ? CSS.supports.bind(CSS) : null)) {
      return undefined
    }

    const restore = (): void => {
      const el = document.querySelector<HTMLElement>(`[${SHADOW_MARKER}]`)
      if (el === null) return
      el.removeAttribute(SHADOW_MARKER)
      const shadowed = el as Partial<Record<'focus', () => void>>
      if (Object.prototype.hasOwnProperty.call(el, 'focus')) delete shadowed.focus
    }

    const onMouseDown = (event: MouseEvent): void => {
      const target = event.target
      if (!(target instanceof Element)) return
      if (typeof target.closest !== 'function') return
      const card = target.closest(COMPOSER_CARD_SELECTOR)
      if (card === null) return
      const editor = card.querySelector<HTMLElement>(COMPOSER_INPUT_SELECTOR)
      if (editor === null || target.closest(COMPOSER_INPUT_SELECTOR) !== null) return
      // A button-area tap: shadow focus for the remainder of this dispatch.
      restore()
      editor.setAttribute(SHADOW_MARKER, '')
      Object.defineProperty(editor, 'focus', {
        configurable: true,
        writable: true,
        value: function swallowedFocus(): void {
          /* keepFocus called; keep the dismissed keyboard dismissed */
        },
      })
      setTimeout(restore, 0)
    }

    document.addEventListener('mousedown', onMouseDown, true)
    return () => {
      document.removeEventListener('mousedown', onMouseDown, true)
      restore()
    }
  })
}
