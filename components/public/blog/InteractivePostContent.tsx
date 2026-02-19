'use client'

import { Fragment, useMemo } from 'react'
import McqBlock, { type McqConfig } from './McqBlock'
import CtaBlock, { type CtaConfig } from './CtaBlock'
import AudioBlock, { type AudioConfig } from './AudioBlock'
import FillGapsBlock, { type FillGapsConfig } from './FillGapsBlock'
import DropdownGapsBlock, { type DropdownGapsConfig } from './DropdownGapsBlock'
import TrueFalseBlock, { type TrueFalseConfig } from './TrueFalseBlock'
import MatchingBlock, { type MatchingConfig } from './MatchingBlock'
import EmailWritingBlock, { type EmailWritingConfig } from './EmailWritingBlock'
import MissingLettersBlock, { type MissingLettersConfig } from './MissingLettersBlock'

interface InteractivePostContentProps {
  html: string
  postId?: string
  postSlug?: string
}

interface HtmlSegment {
  kind: 'html'
  html: string
}

interface BlockSegment {
  kind: 'block'
  blockType: string
  config: unknown
  blockId?: string
}

type Segment = HtmlSegment | BlockSegment

const BLOCK_REGEX = /<div\b[^>]*\bdata-block=(["'])([^"']+)\1[^>]*>\s*<\/div>|<p>\s*\[block:([a-z0-9_-]+):([^\]]+)\]\s*<\/p>|\[block:([a-z0-9_-]+):([^\]]+)\]/gi

function getAttribute(tag: string, name: string): string | null {
  const pattern = new RegExp(`\\b${name}=(["'])([\\s\\S]*?)\\1`, 'i')
  const match = tag.match(pattern)
  return match?.[2] ?? null
}

function decodeHtmlEntities(input: string): string {
  return input
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&amp;', '&')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function parseConfig(rawConfig: string | null): unknown {
  if (!rawConfig) return null
  const normalized = decodeHtmlEntities(rawConfig)

  try {
    return JSON.parse(normalized)
  } catch {
    try {
      return JSON.parse(decodeURIComponent(normalized))
    } catch {
      return null
    }
  }
}

function splitContent(html: string): Segment[] {
  const segments: Segment[] = []
  let cursor = 0

  for (const match of html.matchAll(BLOCK_REGEX)) {
    const blockHtml = match[0]
    const index = match.index ?? 0

    if (index > cursor) {
      segments.push({ kind: 'html', html: html.slice(cursor, index) })
    }

    const isDivBlock = blockHtml.startsWith('<div')
    const blockType = isDivBlock
      ? getAttribute(blockHtml, 'data-block') ?? 'unknown'
      : (match[3] ?? match[5] ?? 'unknown')
    const config = isDivBlock
      ? parseConfig(getAttribute(blockHtml, 'data-config'))
      : parseConfig(match[4] ?? match[6] ?? null)
    const blockId = isDivBlock ? getAttribute(blockHtml, 'data-id') ?? undefined : undefined

    segments.push({ kind: 'block', blockType, config, blockId })
    cursor = index + blockHtml.length
  }

  if (cursor < html.length) {
    segments.push({ kind: 'html', html: html.slice(cursor) })
  }

  if (segments.length === 0) {
    return [{ kind: 'html', html }]
  }

  return segments
}

function isMcqConfig(config: unknown): config is McqConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return (
    typeof c.question === 'string'
    && Array.isArray(c.options)
    && c.options.every(option => typeof option === 'string')
    && typeof c.answer === 'number'
  )
}

function isCtaConfig(config: unknown): config is CtaConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return typeof c.title === 'string'
}

function isAudioConfig(config: unknown): config is AudioConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return typeof c.src === 'string'
}

function isFillGapsConfig(config: unknown): config is FillGapsConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return (
    (c.mode === 'paragraph' || c.mode === 'sentences')
    && Array.isArray(c.items)
    && c.items.every(item => typeof item === 'string')
  )
}

function isDropdownGapsConfig(config: unknown): config is DropdownGapsConfig {
  return isFillGapsConfig(config)
}

function isTrueFalseConfig(config: unknown): config is TrueFalseConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return (
    Array.isArray(c.statements)
    && c.statements.every(statement => (
      !!statement
      && typeof statement === 'object'
      && typeof (statement as { text?: unknown }).text === 'string'
      && typeof (statement as { answer?: unknown }).answer === 'boolean'
    ))
  )
}

function isMatchingConfig(config: unknown): config is MatchingConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return (
    Array.isArray(c.pairs)
    && c.pairs.every(pair => (
      !!pair
      && typeof pair === 'object'
      && typeof (pair as { left?: unknown }).left === 'string'
      && typeof (pair as { right?: unknown }).right === 'string'
    ))
  )
}

function isEmailWritingConfig(config: unknown): config is EmailWritingConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return typeof c.prompt === 'string' && c.prompt.trim().length > 0
}

function isMissingLettersConfig(config: unknown): config is MissingLettersConfig {
  if (!config || typeof config !== 'object') return false
  const c = config as Record<string, unknown>
  return Array.isArray(c.items) && c.items.every(item => typeof item === 'string')
}

function UnknownBlock({ blockType }: { blockType: string }) {
  return (
    <div className="my-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      Unsupported block: {blockType}
    </div>
  )
}

export default function InteractivePostContent({ html, postId, postSlug }: InteractivePostContentProps) {
  const segments = useMemo(() => splitContent(html), [html])

  return (
    <>
      {segments.map((segment, index) => {
        if (segment.kind === 'html') {
          if (!segment.html.trim()) return <Fragment key={`empty-${index}`} />
          return <div key={`html-${index}`} dangerouslySetInnerHTML={{ __html: segment.html }} />
        }

        if (segment.blockType === 'mcq' && isMcqConfig(segment.config)) {
          return <McqBlock key={`block-${index}`} config={segment.config} />
        }

        if (segment.blockType === 'cta' && isCtaConfig(segment.config)) {
          const ctaConfig = segment.config as CtaConfig & { blockId?: string }
          return (
            <CtaBlock
              key={`block-${index}`}
              config={{ ...ctaConfig, blockId: ctaConfig.blockId ?? segment.blockId }}
              postId={postId}
              postSlug={postSlug}
            />
          )
        }

        if (segment.blockType === 'audio' && isAudioConfig(segment.config)) {
          return <AudioBlock key={`block-${index}`} config={segment.config} />
        }

        if (segment.blockType === 'fill_gaps' && isFillGapsConfig(segment.config)) {
          return <FillGapsBlock key={`block-${index}`} config={segment.config} />
        }

        if (segment.blockType === 'dropdown_gaps' && isDropdownGapsConfig(segment.config)) {
          return <DropdownGapsBlock key={`block-${index}`} config={segment.config} />
        }

        if (segment.blockType === 'true_false' && isTrueFalseConfig(segment.config)) {
          return <TrueFalseBlock key={`block-${index}`} config={segment.config} />
        }

        if (segment.blockType === 'matching' && isMatchingConfig(segment.config)) {
          return <MatchingBlock key={`block-${index}`} config={segment.config} />
        }

        if (segment.blockType === 'email_writing' && isEmailWritingConfig(segment.config)) {
          return (
            <EmailWritingBlock
              key={`block-${index}`}
              config={segment.config}
              postId={postId}
              postSlug={postSlug}
            />
          )
        }

        if (segment.blockType === 'missing_letters' && isMissingLettersConfig(segment.config)) {
          return <MissingLettersBlock key={`block-${index}`} config={segment.config} />
        }

        return <UnknownBlock key={`block-${index}`} blockType={segment.blockType} />
      })}
    </>
  )
}
