'use client'

import { useMemo, useState } from 'react'

export interface TrueFalseConfig {
  title?: string
  statements: Array<{
    text: string
    answer: boolean
  }>
  explanation?: string
}

interface TrueFalseBlockProps {
  config: TrueFalseConfig
}

export default function TrueFalseBlock({ config }: TrueFalseBlockProps) {
  const [answers, setAnswers] = useState<Array<boolean | null>>(() => config.statements.map(() => null))
  const [checked, setChecked] = useState(false)

  const score = useMemo(() => {
    if (!checked) return 0
    return config.statements.reduce((sum, statement, index) => {
      return sum + (answers[index] === statement.answer ? 1 : 0)
    }, 0)
  }, [answers, checked, config.statements])

  function setAnswer(index: number, value: boolean) {
    setAnswers(prev => prev.map((item, i) => (i === index ? value : item)))
    if (checked) setChecked(false)
  }

  return (
    <section className="not-prose my-8 rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
      {config.title && <h3 className="text-lg font-semibold text-slate-900 mb-3">{config.title}</h3>}

      <div className="space-y-3">
        {config.statements.map((statement, index) => {
          const selected = answers[index]
          const isCorrect = checked && selected === statement.answer
          const isWrong = checked && selected !== null && !isCorrect

          return (
            <div
              key={`statement-${index}`}
              className={`rounded-xl border p-4 ${
                isCorrect
                  ? 'border-emerald-300 bg-emerald-50'
                  : isWrong
                    ? 'border-red-300 bg-red-50'
                    : 'border-slate-200 bg-white'
              }`}
            >
              <p className="text-sm text-slate-800">{statement.text}</p>
              <div className="mt-3 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setAnswer(index, true)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    selected === true ? 'border-[#08507f] bg-[#08507f] text-white' : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  True
                </button>
                <button
                  type="button"
                  onClick={() => setAnswer(index, false)}
                  className={`rounded-lg border px-3 py-1.5 text-sm ${
                    selected === false ? 'border-[#08507f] bg-[#08507f] text-white' : 'border-slate-300 bg-white text-slate-700'
                  }`}
                >
                  False
                </button>
              </div>
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
          Check answers
        </button>
        {checked && (
          <p className="text-sm font-medium text-slate-700">
            Score: {score}/{config.statements.length}
          </p>
        )}
      </div>

      {checked && config.explanation && <p className="mt-3 text-sm text-slate-600">{config.explanation}</p>}
    </section>
  )
}
