export const SHORTCODE_REGEX = /\[block:([a-z0-9_-]+):([^\]]+)\]/g

export interface InteractiveValidationIssue {
  index: number
  blockType: string
  message: string
}

const FILL_GAP_TOKEN_REGEX = /\[\[[^[\]]+\]\]/
const DROPDOWN_GAP_TOKEN_REGEX = /\[\[[^[\]|]+\|[^[\]]+\]\]/

function parseConfig(encoded: string): Record<string, unknown> | null {
  try {
    return JSON.parse(decodeURIComponent(encoded)) as Record<string, unknown>
  } catch {
    try {
      return JSON.parse(encoded) as Record<string, unknown>
    } catch {
      return null
    }
  }
}

export function validateShortcode(shortcode: string): string | null {
  const match = shortcode.match(/^\[block:([a-z0-9_-]+):([^\]]+)\]$/)
  if (!match) return 'Invalid shortcode format.'

  const blockType = match[1]
  const config = parseConfig(match[2])
  if (!config) return 'Invalid block config JSON.'

  if (blockType === 'mcq') {
    const question = typeof config.question === 'string' ? config.question.trim() : ''
    const options = Array.isArray(config.options) ? config.options : []
    const answer = typeof config.answer === 'number' ? config.answer : -1
    if (!question) return 'MCQ question is required.'
    if (options.length < 2) return 'MCQ needs at least 2 options.'
    if (answer < 0 || answer >= options.length) return 'MCQ correct answer index is out of range.'
    return null
  }

  if (blockType === 'audio') {
    const src = typeof config.src === 'string' ? config.src.trim() : ''
    if (!src) return 'Audio URL is required.'
    return null
  }

  if (blockType === 'fill_gaps' || blockType === 'dropdown_gaps') {
    const mode = config.mode
    const items = Array.isArray(config.items) ? config.items : []
    if (mode !== 'paragraph' && mode !== 'sentences') return `${blockType} mode must be paragraph or sentences.`
    if (items.length === 0) return `${blockType} needs at least 1 item.`
    if (items.some(item => typeof item !== 'string')) return `${blockType} items are malformed.`

    const rows = items.map(item => item.trim()).filter(Boolean)
    if (rows.length === 0) return `${blockType} needs at least 1 non-empty item.`

    if (blockType === 'fill_gaps' && rows.some(item => !FILL_GAP_TOKEN_REGEX.test(item))) {
      return 'fill_gaps rows must include at least one [[answer]] placeholder.'
    }
    if (blockType === 'dropdown_gaps' && rows.some(item => !DROPDOWN_GAP_TOKEN_REGEX.test(item))) {
      return 'dropdown_gaps rows must include at least one [[correct|option]] placeholder.'
    }
    return null
  }

  if (blockType === 'true_false') {
    const statements = Array.isArray(config.statements) ? config.statements : []
    if (statements.length === 0) return 'True/False needs at least 1 statement.'
    const hasInvalid = statements.some(item => {
      if (!item || typeof item !== 'object') return true
      const row = item as { text?: unknown; answer?: unknown }
      return typeof row.text !== 'string' || typeof row.answer !== 'boolean'
    })
    if (hasInvalid) return 'True/False statements are malformed.'
    return null
  }

  if (blockType === 'matching') {
    const pairs = Array.isArray(config.pairs) ? config.pairs : []
    if (pairs.length < 2) return 'Matching needs at least 2 pairs.'
    const hasInvalid = pairs.some(item => {
      if (!item || typeof item !== 'object') return true
      const row = item as { left?: unknown; right?: unknown }
      return typeof row.left !== 'string' || typeof row.right !== 'string' || !row.left.trim() || !row.right.trim()
    })
    if (hasInvalid) return 'Matching pairs are malformed.'
    return null
  }

  if (blockType === 'cta') {
    const title = typeof config.title === 'string' ? config.title.trim() : ''
    if (!title) return 'CTA title is required.'
    return null
  }

  return `Unsupported block type: ${blockType}`
}

export function validateInteractiveShortcodes(html: string): InteractiveValidationIssue[] {
  const issues: InteractiveValidationIssue[] = []
  let blockIndex = 0

  for (const match of html.matchAll(SHORTCODE_REGEX)) {
    const blockType = match[1] ?? 'unknown'
    const shortcode = match[0]
    const issue = validateShortcode(shortcode)
    if (issue) {
      issues.push({
        index: blockIndex + 1,
        blockType,
        message: issue,
      })
    }
    blockIndex += 1
  }

  return issues
}
