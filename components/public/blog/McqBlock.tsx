'use client'

import { useMemo, useState } from 'react'

export interface McqConfig {
  question: string
  options: string[]
  answer: number
  explanation?: string
}

interface McqBlockProps {
  config: McqConfig
}

export default function McqBlock({ config }: McqBlockProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const hasAnswered = selectedIndex !== null
  const isCorrect = hasAnswered && selectedIndex === config.answer

  const feedback = useMemo(() => {
    if (!hasAnswered) return null
    if (isCorrect) return 'Correct.'
    return 'Not quite. Try another option.'
  }, [hasAnswered, isCorrect])

  return (
    <section className="my-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      <p className="text-lg font-semibold text-slate-900 mb-4">{config.question}</p>

      <div className="space-y-2">
        {config.options.map((option, index) => {
          const isSelected = selectedIndex === index
          const showCorrect = hasAnswered && index === config.answer
          const showIncorrectSelected = hasAnswered && isSelected && !showCorrect

          return (
            <button
              key={`${option}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`w-full rounded-xl border px-4 py-3 text-left text-sm sm:text-base transition-colors ${
                showCorrect
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : showIncorrectSelected
                    ? 'border-red-300 bg-red-50 text-red-900'
                    : isSelected
                      ? 'border-[#08507f] bg-white text-slate-900'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>

      {feedback && (
        <p className={`mt-4 text-sm font-medium ${isCorrect ? 'text-emerald-700' : 'text-red-700'}`}>
          {feedback}
          {config.explanation ? ` ${config.explanation}` : ''}
        </p>
      )}
    </section>
  )
}
