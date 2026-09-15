import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createStatsLineTask } from '../client/mobile/effects/stats-line.ts'

// Minimal DOM stand-in for the stats-line reconciler. It only implements the
// surface stats-line.ts touches: element/text nodes, sibling links, children,
// appendChild/remove, and a document that returns the root under test.

class FakeNode {
  constructor(type = 0) {
    this.nodeType = type
    this.parentNode = null
    this._prev = null
    this._next = null
    this._childNodes = []
  }

  get previousSibling() {
    return this._prev
  }

  get nextSibling() {
    return this._next
  }

  get childNodes() {
    return this._childNodes
  }

  remove() {
    if (this.parentNode === null) return
    const list = this.parentNode._childNodes
    const index = list.indexOf(this)
    if (index === -1) return
    list.splice(index, 1)
    if (this._prev !== null) this._prev._next = this._next
    if (this._next !== null) this._next._prev = this._prev
    this.parentNode = null
    this._prev = null
    this._next = null
  }

  appendChild(node) {
    if (node.parentNode !== null) node.remove()
    node.parentNode = this
    this._childNodes.push(node)
    this._relink()
    return node
  }

  insertBefore(node, before) {
    if (node.parentNode !== null) node.remove()
    node.parentNode = this
    const list = this._childNodes
    const index = list.indexOf(before)
    if (index === -1) list.push(node)
    else list.splice(index, 0, node)
    this._relink()
    return node
  }

  _relink() {
    let prev = null
    for (const node of this._childNodes) {
      node._prev = prev
      if (prev !== null) prev._next = node
      prev = node
    }
    if (this._childNodes.length > 0) this._childNodes[this._childNodes.length - 1]._next = null
  }
}

class FakeText extends FakeNode {
  constructor(text) {
    super(3)
    this._text = text
  }

  get textContent() {
    return this._text
  }

  set textContent(value) {
    this._text = String(value)
  }
}

class FakeElement extends FakeNode {
  constructor(tagName, attrs = {}) {
    super(1)
    this.tagName = tagName.toUpperCase()
    this._attrs = { ...attrs }
    this._text = ''
  }

  get children() {
    return this._childNodes.filter((node) => node.nodeType === 1)
  }

  get textContent() {
    if (this._childNodes.length === 0) return this._text
    return this._childNodes.map((node) => node.textContent ?? '').join('')
  }

  set textContent(value) {
    this._text = String(value)
    this._childNodes = [new FakeText(String(value))]
    this._childNodes[0].parentNode = this
  }

  setAttribute(key, value) {
    this._attrs[key] = String(value)
  }

  getAttribute(key) {
    return key in this._attrs ? this._attrs[key] : null
  }

  removeAttribute(key) {
    delete this._attrs[key]
  }

  matches() {
    return false
  }

  closest() {
    return this._closest ?? null
  }

  querySelector() {
    return null
  }

  querySelectorAll() {
    return []
  }
}

const text = (value) => new FakeText(value)
const element = (tag, attrs) => new FakeElement(tag, attrs)
const groupSpan = (value) => {
  const node = element('span')
  node.appendChild(text(value))
  return node
}
const separatorSpan = () => {
  const node = element('span', { 'aria-hidden': 'true', class: 'sep' })
  node.appendChild(text('|'))
  return node
}
const buildStatsRoot = (groups, { withTps = false } = {}) => {
  const root = element('div')
  root._closest = element('div')
  groups.forEach((value, index) => {
    if (index > 0) {
      root.appendChild(separatorSpan())
      root.appendChild(text(' '))
    }
    root.appendChild(groupSpan(value))
  })
  if (withTps) {
    const tps = element('div')
    tps.appendChild(text('TPS 89.4 tok/s'))
    root.appendChild(tps)
  }
  return root
}
const runTwice = (root) => {
  // Upstream v2.4.1's fast path probes document.querySelector('[data-mobile-nav="stats"]')
  // before the full-tree scan; the fake DOM carries no marker, so it falls through to
  // the scan these assertions cover.
  globalThis.document = { querySelector: () => null, querySelectorAll: () => [root] }
  const task = createStatsLineTask()
  task.ensure()
  const first = root.textContent
  task.ensure()
  const second = root.textContent
  return { first, second }
}

test('stats-line: zh compact labels, TTFT removal, TPS unit, idempotent', () => {
  const root = buildStatsRoot(
    [
      '45 轮 · 326 步',
      'LLM 170m7s.工具调用40m49s',
      '首 token 平均 11.5s · 40 tok/s',
      '缓存命中 89%',
      '输入 22.4M tok · 输出 266K tok',
    ],
    { withTps: true },
  )
  const { first, second } = runTwice(root)
  const expected =
    '45轮326步| 模型 170m7s 工具40m49s| 40 t/s| 缓中 89%| 入 22.4M t . 出266K tTPS 89.4 t/s'
  assert.equal(first, expected)
  assert.equal(second, expected)
})

test('stats-line: en equivalent compact labels are idempotent', () => {
  const root = buildStatsRoot(
    [
      '45 turns · 326 steps',
      'LLM 170m7s · Tool call 40m49s',
      'TTFT avg 11.5s · 40 tok/s',
      'Cache hit 89%',
      'Input 22.4M tok · Output 266K tok',
    ],
    { withTps: true },
  )
  const { first, second } = runTwice(root)
  const expected =
    '45 turns 326 steps| LLM 170m7s Tool 40m49s| 40 t/s| Cache 89%| In 22.4M t · Out 266K tTPS 89.4 t/s'
  assert.equal(first, expected)
  assert.equal(second, expected)
})

test('stats-line: TTFT-only speed group is removed with its separator', () => {
  const root = buildStatsRoot([
    '45 轮 · 326 步',
    'LLM 170m7s.工具调用40m49s',
    '首 token 平均 11.5s',
    '缓存命中 89%',
    '输入 22.4M tok · 输出 266K tok',
  ])
  const { first, second } = runTwice(root)
  const expected = '45轮326步| 模型 170m7s 工具40m49s| 缓中 89%| 入 22.4M t . 出266K t'
  assert.equal(first, expected)
  assert.equal(second, expected)
})