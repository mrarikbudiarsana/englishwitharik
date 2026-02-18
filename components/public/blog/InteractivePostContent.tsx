'use client'

import { Fragment, useMemo } from 'react'
import McqBlock, { type McqConfig } from './McqBlock'
import CtaBlock, { type CtaConfig } from './CtaBlock'

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

        return <UnknownBlock key={`block-${index}`} blockType={segment.blockType} />
      })}
    </>
  )
}
