'use client'

import { useMemo, useState } from 'react'

export interface ReadingMcqConfig {
    text: string
    question: string
    options: string[]
    answer: number
    explanation?: string
}

interface ReadingMcqBlockProps {
    config: ReadingMcqConfig
}

export default function ReadingMcqBlock({ config }: ReadingMcqBlockProps) {
    const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

    const hasAnswered = selectedIndex !== null
    const isCorrect = hasAnswered && selectedIndex === config.answer

    const feedback = useMemo(() => {
        if (!hasAnswered) return null
        if (isCorrect) return 'Correct.'
        return 'Not quite. Try another option.'
    }, [hasAnswered, isCorrect])

    return (
        <section className="my-8 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-200">

                {/* Reading Text Section */}
                <div className="flex-1 p-5 sm:p-6 lg:p-8 bg-white/50">
                    <div className="prose prose-slate max-w-none text-slate-700 whitespace-pre-wrap">
                        {config.text}
                    </div>
                </div>

                {/* Question & Options Section */}
                <div className="flex-1 p-5 sm:p-6 lg:p-8">
                    <p className="text-lg font-semibold text-slate-900 mb-6">{config.question}</p>

                    <div className="space-y-3">
                        {config.options.map((option, index) => {
                            const isSelected = selectedIndex === index
                            const showCorrect = hasAnswered && index === config.answer
                            const showIncorrectSelected = hasAnswered && isSelected && !showCorrect

                            return (
                                <button
                                    key={`${option}-${index}`}
                                    type="button"
                                    onClick={() => setSelectedIndex(index)}
                                    className={`w-full cursor-pointer rounded-xl border px-4 py-3 text-left text-sm sm:text-base transition-colors ${showCorrect
                                            ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                                            : showIncorrectSelected
                                                ? 'border-red-300 bg-red-50 text-red-900'
                                                : isSelected
                                                    ? 'border-[#08507f] bg-white text-slate-900'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                                        }`}
                                >
                                    <span className="font-medium mr-3 text-slate-400">
                                        {String.fromCharCode(65 + index)}.
                                    </span>
                                    {option}
                                </button>
                            )
                        })}
                    </div>

                    {feedback && (
                        <div className={`mt-6 p-4 rounded-xl text-sm font-medium ${isCorrect ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                            <p className="font-bold mb-1">{feedback}</p>
                            {config.explanation && <p className="font-normal opacity-90">{config.explanation}</p>}
                        </div>
                    )}
                </div>

            </div>
        </section>
    )
}
