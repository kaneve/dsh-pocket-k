import type { ReconcilerTask } from '../core/reconciler-core.ts'

// The official conversation status row (turns / steps / LLM time / TTFT /
// cache) has a hashed class, so the stylesheet cannot target it directly.
// Mark the exact row on narrow screens by text: a [class$=_root] that
// carries the metrics text and no textarea (the composer card also ends in
// _root and can mention turns in its model line). The CSS then lays the
// marked row out as ONE horizontally scrolling line with every metric
// reachable.
//
// On top of the layout marker, this file also compacts the row's label
// text so more metrics fit on the visible viewport: labels are shortened
// (LLM→模型 / 工具调用→工具 / tok/s→t/s / 缓存命中→缓中 / 输入→入 /
// 输出→出 / tok→t), the TTFT segment is dropped entirely, and separator
// variants (· / ．/ .) are normalised. The reconciler re-runs on every
// mutation, so all replacements must be idempotent: after the first pass
// the text no longer contains the long labels and further passes are no-ops.

// Separator variants are · (host), ． (fullwidth) and . (halfwidth), but a
// halfwidth dot must not split decimals like "11.5s" or "22.4M". The regex
// only treats "." as a separator when it is not part of a number.
const SEP_SPLIT = /\s*[·．]\s*|(?<![0-9])\.(?![0-9])|(?<!\d)\.(?=\d)/
const TTFT_ZH = /^首\s*token\s*平均/
const TTFT_EN = /^TTFT\s+avg/i

function compactGroup(text: string, lang: 'zh' | 'en'): string {
  const trimmed = text.trim()
  if (trimmed === '') return ''
  const parts = trimmed.split(SEP_SPLIT).map((part) => part.trim()).filter(Boolean)
  const zh = lang === 'zh'

  if (zh ? /[轮步]/.test(trimmed) : /\b(turns|steps)\b/i.test(trimmed)) {
    // "45 轮 · 326 步" → "45轮326步"; English keeps readable word labels
    // but drops the middle separator: "45 turns · 326 steps" → "45 turns 326 steps".
    if (zh) return parts.map((part) => part.replace(/\s+/g, '')).join('')
    return parts.join(' ')
  }

  if (zh ? /(LLM|工具调用)/.test(trimmed) : /(LLM|Tool call)/i.test(trimmed)) {
    const mapped = parts.map((part) => {
      let out = part
      if (zh) out = out.replace(/LLM/, '模型').replace(/工具调用\s*/, '工具')
      else out = out.replace(/Tool call/i, 'Tool')
      return out.trim()
    }).filter(Boolean)
    return mapped.join(' ')
  }

  if (zh ? /(首\s*token|tok\/s)/.test(trimmed) : /(TTFT|tok\/s)/i.test(trimmed)) {
    const mapped = parts
      .filter((part) => !(zh ? TTFT_ZH : TTFT_EN).test(part))
      .map((part) => part.replace(/tok\/s/g, 't/s').trim())
      .filter(Boolean)
    return mapped.join(' · ')
  }

  if (zh ? /缓存命中/.test(trimmed) : /Cache hit/i.test(trimmed)) {
    let out = trimmed
    if (zh) out = out.replace(/缓存命中/, '缓中')
    else out = out.replace(/Cache hit/i, 'Cache')
    return out.trim()
  }

  if (zh ? /(输入|输出|tok)/.test(trimmed) : /(Input|Output|tok)/i.test(trimmed)) {
    const mapped = parts.map((part) => {
      let out = part
      if (zh) out = out.replace(/输入\s*/, '入 ').replace(/输出\s*/, '出')
      else out = out.replace(/Input/i, 'In').replace(/Output/i, 'Out')
      out = out.replace(/\btok\b/g, 't')
      return out.trim()
    }).filter(Boolean)
    return mapped.join(zh ? ' . ' : ' · ')
  }

  return trimmed
}

function isStatsGroup(el: Element): boolean {
  return el.nodeType === 1 && el.tagName === 'SPAN' && el.getAttribute('aria-hidden') !== 'true'
}

function removeStatsGroup(group: Element): void {
  // A stats group is rendered as: [sep "|"]? <span>group</span>. When a
  // group becomes empty (e.g. TTFT was the only speed metric) remove its
  // own span plus the adjoining separator so no dangling "|" remains.
  const prev = group.previousSibling
  if (
    prev !== null &&
    prev.nodeType === 3 &&
    /^\s*$/.test(prev.textContent ?? '') &&
    prev.previousSibling !== null &&
    prev.previousSibling.nodeType === 1 &&
    prev.previousSibling.getAttribute('aria-hidden') === 'true'
  ) {
    prev.previousSibling.remove()
    prev.remove()
    group.remove()
    return
  }
  const next = group.nextSibling
  if (
    next !== null &&
    next.nodeType === 3 &&
    /^\s*$/.test(next.textContent ?? '') &&
    next.nextSibling !== null &&
    next.nextSibling.nodeType === 1 &&
    next.nextSibling.getAttribute('aria-hidden') === 'true'
  ) {
    next.nextSibling.remove()
    next.remove()
    group.remove()
    return
  }
  group.remove()
}

function compactStats(stats: Element): void {
  const lang: 'zh' | 'en' = /[\u4e00-\u9fff]/.test(stats.textContent ?? '') ? 'zh' : 'en'
  for (const group of Array.from(stats.children).filter(isStatsGroup)) {
    const original = group.textContent ?? ''
    if (original.trim() === '') continue
    const compacted = compactGroup(original, lang)
    if (compacted === '') {
      removeStatsGroup(group)
    } else if (compacted !== original) {
      group.textContent = compacted
    }
  }
  // The composer's standalone TPS readout is folded into this strip; shorten
  // its unit too ("TPS 89.4 tok/s" → "TPS 89.4 t/s").
  for (const el of Array.from(stats.children)) {
    if (el.children.length === 0 && /^TPS\s+\d/.test((el.textContent ?? '').trim())) {
      const text = el.textContent ?? ''
      const compacted = text.replace(/tok\/s/g, 't/s')
      if (compacted !== text) el.textContent = compacted
    }
  }
}

export function createStatsLineTask(): ReconcilerTask {
  // The composer root renders the TPS readout ("TPS 89.4 tok/s") as its
  // own row BELOW the status strip; fold it into the strip so every
  // metric scrolls together. The suite re-renders its own tree, so this
  // must be idempotent and re-run on every mutation. Where the readout
  // came from is recorded so disposal can put it back — on a
  // narrow→wide transition the desktop layout must be the official one
  // again, and `[data-mobile-nav="stats"]` is not covered by the
  // desktop hide rules.
  let tpsOrigin: { parent: Node; next: Node | null } | null = null
  const moveTps = (stats: Element): void => {
    if ([...stats.children].some((c) => /^TPS\s+\d/.test((c.textContent ?? '').trim()))) return
    const stack = stats.closest('[class$="_composerStack"]')
    if (stack === null) return
    for (const el of stack.querySelectorAll('div')) {
      const text = (el.textContent ?? '').trim()
      if (!/^TPS\s+\d/.test(text)) continue
      if (el.children.length > 0) continue
      // The composer stack can be rebuilt by React between mutations:
      // refresh the origin every time we actually move the TPS readout, so
      // disposal returns it where it currently belongs.
      if (el.parentElement !== null) {
        tpsOrigin = { parent: el.parentElement, next: el.nextSibling }
      }
      stats.appendChild(el)
      return
    }
  }
  const mark = (): void => {
    for (const root of document.querySelectorAll('[data-phase] [class*="_root"]')) {
      // The status row lives inside the composer stack; message-area
      // blocks can also mention turns/steps and must be skipped.
      if (root.closest('[class$="_composerStack"]') === null) continue
      // The todo plan strip also lives in the composer stack and its root
      // ends in _root. Its items may legitimately contain "步"/"steps" in
      // their text, so never mistake it (or any interactive dock panel)
      // for the stats strip.
      if (root.matches('[data-testid="todo-panel"]')) continue
      if (root.querySelector('button') !== null) continue
      const text = root.textContent ?? ''
      if (!/(turns|steps|\bLLM\b|轮|步)/.test(text)) continue
      if (root.querySelector('textarea') !== null) continue
      root.setAttribute('data-mobile-nav', 'stats')
      moveTps(root)
      compactStats(root)
      return
    }
  }
  // Scope decision: the TPS readout updates are childList/characterData text
  // mutations inside the composer stack, so this task can only wake on the
  // tree key. A subtree-scoped observer would need one observer per
  // container, which the single full-tree observer design intentionally
  // avoids; the expensive composer-stack scan stays the cost of re-anchoring
  // markers that React rebuilds every token.
  return {
    name: 'stats-line',
    scopes: ['*'],
    ensure: mark,
    dispose: () => {
      // Hand the official layout back: return the TPS readout to its own
      // row, then drop the marker that drives the one-line strip.
      if (tpsOrigin !== null && tpsOrigin.parent.isConnected) {
        // Find the TPS readout only inside the marked stats strip we moved
        // it into — a global text search could pick up a different element.
        for (const stats of document.querySelectorAll('[data-mobile-nav="stats"]')) {
          const tps = [...stats.querySelectorAll('div')].find(
            (el) => el.children.length === 0 && /^TPS\s+\d/.test((el.textContent ?? '').trim()),
          )
          if (tps !== undefined) {
            tpsOrigin.parent.insertBefore(tps, tpsOrigin.next)
            break
          }
        }
      }
      for (const el of document.querySelectorAll('[data-mobile-nav="stats"]')) {
        el.removeAttribute('data-mobile-nav')
      }
      tpsOrigin = null
    },
  }
}