'use client'

import { useMemo, useState } from 'react'

export interface MatchingConfig {
  title?: string
  prompt?: string
  pairs: Array<{
    left: string
    right: string
  }>
  explanation?: string
}

interface MatchingBlockProps {
  config: MatchingConfig
}

function seededShuffle(items: string[], seed: number) {
  const result = [...items]
  let currentSeed = seed

  for (let i = result.length - 1; i > 0; i -= 1) {
    currentSeed = (currentSeed * 9301 + 49297) % 233280
    const j = Math.floor((currentSeed / 233280) * (i + 1))
    const temp = result[i]
    result[i] = result[j]
    result[j] = temp
  }

  return result
}

export default function MatchingBlock({ config }: MatchingBlockProps) {
  const rightOptions = useMemo(() => {
    const source = config.pairs.map(pair => pair.right)
    const seed = config.pairs.map(pair => `${pair.left}|${pair.right}`).join('|').length
    return seededShuffle(source, seed)
  }, [config.pairs])
  const [answers, setAnswers] = useState<string[]>(() => config.pairs.map(() => ''))
  const [checked, setChecked] = useState(false)

  const score = useMemo(() => {
    if (!checked) return 0
    return config.pairs.reduce((sum, pair, index) => {
      return sum + (answers[index] === pair.right ? 1 : 0)
    }, 0)
  }, [answers, checked, config.pairs])

  function updateAnswer(index: number, value: string) {
    setAnswers(prev => prev.map((item, i) => (i === index ? value : item)))
    if (checked) setChecked(false)
  }

  return (
    <section className="not-prose my-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      {config.title && <h3 className="text-lg font-semibold text-slate-900">{config.title}</h3>}
      {config.prompt && <p className="mt-2 text-sm text-slate-600">{config.prompt}</p>}

      <div className="mt-4 space-y-3">
        {config.pairs.map((pair, index) => {
          const isCorrect = checked && answers[index] === pair.right
          const isWrong = checked && answers[index] && !isCorrect

          return (
            <div
              key={`pair-${index}`}
              className={`grid grid-cols-1 gap-2 rounded-xl border p-3 sm:grid-cols-[1fr_auto] sm:items-center ${
                isCorrect
                  ? 'border-emerald-300 bg-emerald-50'
                  : isWrong
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <p className="text-sm text-slate-800">{pair.left}</p>
              <select
                value={answers[index] ?? ''}
                onChange={event => updateAnswer(index, event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                aria-label={`Match for item ${index + 1}`}
              >
                <option value="">Select match</option>
                {rightOptions.map(option => (
                  <option key={`${option}-${index}`} value={option}>{option}</option>
                ))}
              </select>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setChecked(true)}
          className="rounded-lg bg-[#08507f] px-4 py-2 text-sm font-medium text-white hover:bg-[#063a5c]"
        >
          Check matches
        </button>
        {checked && (
          <p className="text-sm font-medium text-slate-700">
            Score: {score}/{config.pairs.length}
          </p>
        )}
      </div>

      {checked && config.explanation && <p className="mt-3 text-sm text-slate-600">{config.explanation}</p>}
    </section>
  )
}
