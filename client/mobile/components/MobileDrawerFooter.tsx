import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { IconDownloadOutline16 } from '@deepseek-ai/dsh-client-ui-primitives'
import { NS } from '../i18n/locales.ts'

/** Full props for the sidebar footer action entry. */
export interface MobileDrawerFooterProps extends PropsRuntime<'sidebar.footer.action'>, PropsLocale<typeof NS> {
  /** Bound ctx.sessionLogDownload.download() for the current session. */
  downloadSessionLog: (sessionId: string) => void
}

/**
 * Mobile-only drawer footer action, relocated from the session header to the
 * drawer footer (beside Settings):
 * - Session log: the official session-log-export controller, so the
 *   progress/result dialog is shared with the desktop flow.
 * Hidden entirely on wide screens (CSS media query).
 *
 * The Files action that used to sit beside it (opening the dsh-web-ui explorer
 * as a floating bottom sheet) was removed on request — the explorer entry is not
 * wanted in the phone chrome any more.
 */
export function MobileDrawerFooter({ useSessions, downloadSessionLog, t }: MobileDrawerFooterProps) {
  const sessionId = useSessions((state) => state.current)
  return (
    <div data-mobile-nav="drawer-actions">
      <button
        type="button"
        data-mobile-nav="session-log"
        aria-label={t('sessionLog')}
        title={t('sessionLog')}
        disabled={sessionId === undefined}
        onClick={() => {
          if (sessionId !== undefined) downloadSessionLog(sessionId)
        }}
      >
        <IconDownloadOutline16 size={14} />
        <span>{t('sessionLog')}</span>
      </button>
    </div>
  )
}
