import type { Editor } from '@tiptap/react'
import { SHORTCODE_REGEX, validateShortcode } from '@/lib/interactive/shortcodes'
import type { ShortcodeEntry } from './types'

export function getShortcodeEntries(editor: Editor): ShortcodeEntry[] {
  const entries: ShortcodeEntry[] = []

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return

    for (const match of node.text.matchAll(SHORTCODE_REGEX)) {
      const matchIndex = match.index ?? 0
      const shortcode = match[0]
      const from = pos + matchIndex + 1
      const to = from + shortcode.length

      entries.push({
        id: `${from}-${to}-${entries.length}`,
        blockType: match[1] ?? 'unknown',
        shortcode,
        from,
        to,
        validationError: validateShortcode(shortcode) ?? undefined,
      })
    }
  })

  return entries
}

export function parseShortcodeConfig(encoded: string): Record<string, unknown> | null {
  try {
    return JSON.parse(decodeURIComponent(encoded)) as Record<string, unknown>
  } catch {
    return null
  }
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export function computeModalPosition(
  editor: Editor | null,
  panelWidth: number,
  panelHeight: number
): { top: number; left: number } {
  const viewportPadding = 16
  if (!editor) {
    return {
      top: 80,
      left: Math.max(viewportPadding, (window.innerWidth - panelWidth) / 2),
    }
  }

  try {
    const pos = editor.state.selection.from
    const coords = editor.view.coordsAtPos(pos)
    const maxLeft = window.innerWidth - panelWidth - viewportPadding
    const maxTop = Math.max(viewportPadding, window.innerHeight - panelHeight - viewportPadding)
    const left = Math.min(Math.max(viewportPadding, coords.left), Math.max(viewportPadding, maxLeft))
    const preferredBelow = coords.bottom + 12
    const preferredAbove = coords.top - panelHeight - 12
    const targetTop = preferredBelow <= maxTop ? preferredBelow : Math.max(viewportPadding, preferredAbove)
    const top = Math.min(Math.max(viewportPadding, targetTop), maxTop)
    return { top, left }
  } catch {
    return {
      top: 80,
      left: Math.max(viewportPadding, (window.innerWidth - panelWidth) / 2),
    }
  }
}

export function normalizeTemplateShortcode(shortcode: string): string {
  const match = shortcode.match(/^\[block:([a-z0-9_-]+):([^\]]+)\]$/)
  if (!match) return shortcode
  const blockType = match[1]
  const rawConfig = match[2]

  if (blockType !== 'cta' && blockType !== 'email_writing') return shortcode

  try {
    const config = JSON.parse(decodeURIComponent(rawConfig)) as Record<string, unknown>
    const fallbackTitle = blockType === 'email_writing' ? 'email-writing' : 'cta'
    const title = typeof config.title === 'string' ? config.title : fallbackTitle
    config.blockId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`
    return `[block:${blockType}:${encodeURIComponent(JSON.stringify(config))}]`
  } catch {
    return shortcode
  }
}

export function generateBlockId(title: string, fallback: string): string {
  const slugBase = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || fallback
  return `${slugBase}-${Date.now()}`
}
