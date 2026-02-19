'use client'

import { useMemo, useState } from 'react'

export interface FillGapsConfig {
  mode: 'paragraph' | 'sentences'
  title?: string
  items: string[]
  explanation?: string
}

interface FillGapsBlockProps {
  config: FillGapsConfig
}

interface ParsedBlank {
  answer: string
}

interface ParsedItem {
  parts: Array<{ type: 'text'; value: string } | { type: 'blank'; blankIndex: number }>
}

function parseItems(items: string[]) {
  const parsedItems: ParsedItem[] = []
  const blanks: ParsedBlank[] = []
  let blankIndex = 0

  for (const item of items) {
    const parts: ParsedItem['parts'] = []
    const regex = /\[\[([^[\]]+)\]\]/g
    let cursor = 0

    for (const match of item.matchAll(regex)) {
      const matchStart = match.index ?? 0
      if (matchStart > cursor) {
        parts.push({ type: 'text', value: item.slice(cursor, matchStart) })
      }

      blanks.push({ answer: (match[1] ?? '').trim() })
      parts.push({ type: 'blank', blankIndex })
      blankIndex += 1
      cursor = matchStart + match[0].length
    }

    if (cursor < item.length) {
      parts.push({ type: 'text', value: item.slice(cursor) })
    }

    parsedItems.push({ parts })
  }

  return { parsedItems, blanks }
}

export default function FillGapsBlock({ config }: FillGapsBlockProps) {
  const { parsedItems, blanks } = useMemo(() => parseItems(config.items), [config.items])
  const [answers, setAnswers] = useState<string[]>(() => blanks.map(() => ''))
  const [checked, setChecked] = useState(false)

  const score = useMemo(() => {
    if (!checked) return 0
    return blanks.reduce((sum, blank, index) => {
      const isCorrect = answers[index]?.trim().toLowerCase() === blank.answer.toLowerCase()
      return sum + (isCorrect ? 1 : 0)
    }, 0)
  }, [answers, blanks, checked])

  function updateAnswer(index: number, value: string) {
    setAnswers(prev => prev.map((item, i) => (i === index ? value : item)))
    if (checked) setChecked(false)
  }

  return (
    <section className="not-prose my-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      {config.title && <h3 className="text-lg font-semibold text-slate-900 mb-3">{config.title}</h3>}

      <div className="space-y-3 text-slate-800">
        {parsedItems.map((item, itemIndex) => (
          <div key={`item-${itemIndex}`} className={config.mode === 'paragraph' ? 'leading-8' : ''}>
            {config.mode === 'sentences' && <span className="mr-2 font-medium text-slate-500">{itemIndex + 1}.</span>}
            {item.parts.map((part, partIndex) => {
              if (part.type === 'text') return <span key={`text-${itemIndex}-${partIndex}`}>{part.value}</span>

              const expected = blanks[part.blankIndex]?.answer ?? ''
              const value = answers[part.blankIndex] ?? ''
              const isCorrect = checked && value.trim().toLowerCase() === expected.toLowerCase()
              const isWrong = checked && !isCorrect

              return (
                <input
                  key={`blank-${itemIndex}-${partIndex}`}
                  type="text"
                  value={value}
                  onChange={event => updateAnswer(part.blankIndex, event.target.value)}
                  className={`mx-1 inline-block rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-[#08507f] ${
                    isCorrect
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                      : isWrong
                        ? 'border-red-300 bg-red-50 text-red-900'
                        : 'border-slate-300 bg-white text-slate-800'
                  }`}
                  style={{ width: `${Math.max(expected.length + 2, 8)}ch` }}
                  aria-label={`Blank ${part.blankIndex + 1}`}
                />
              )
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="rounded-lg bg-[#08507f] px-4 py-2 text-sm font-medium text-white hover:bg-[#063a5c]"
        >
          Check answers
        </button>
        {checked && (
          <p className="text-sm font-medium text-slate-700">
            Score: {score}/{blanks.length}
          </p>
        )}
      </div>

      {checked && config.explanation && <p className="mt-3 text-sm text-slate-600">{config.explanation}</p>}
    </section>
  )
}
