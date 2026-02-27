'use client'

import { useMemo, useState, useRef } from 'react'

export interface MissingLettersConfig {
    items: string[]
    title?: string
    explanation?: string
}

interface MissingLettersBlockProps {
    config: MissingLettersConfig
}

interface ParsedItem {
    parts: Array<
        | { type: 'text'; value: string }
        | { type: 'gap'; answer: string; gapIndex: number }
    >
}

interface Gap {
    answer: string
}

function endsWithWordChar(value: string) {
    return /[A-Za-z0-9]$/.test(value)
}

function startsWithWordChar(value: string) {
    return /^[A-Za-z0-9]/.test(value)
}

function parseItems(items: string[]) {
    const parsedItems: ParsedItem[] = []
    const gaps: Gap[] = []
    let gapIndex = 0

    for (const item of items) {
        const parts: ParsedItem['parts'] = []
        // Regex matches [[word]]
        const regex = /\[\[([^[\]]+)\]\]/g
        let cursor = 0

        for (const match of item.matchAll(regex)) {
            const matchStart = match.index ?? 0
            if (matchStart > cursor) {
                parts.push({ type: 'text', value: item.slice(cursor, matchStart) })
            }

            const answer = (match[1] ?? '').trim()
            if (answer) {
                parts.push({ type: 'gap', answer, gapIndex })
                gaps.push({ answer })
                gapIndex++
            }

            cursor = matchStart + match[0].length
        }

        if (cursor < item.length) {
            parts.push({ type: 'text', value: item.slice(cursor) })
        }

        parsedItems.push({ parts })
    }

    return { parsedItems, gaps }
}

export default function MissingLettersBlock({ config }: MissingLettersBlockProps) {
    const { parsedItems, gaps } = useMemo(() => parseItems(config.items), [config.items])

    // State to hold the current value of each character input for each gap
    // structure: userInputs[gapIndex] = ['c', 'h', 'a', 'r', 's']
    const [userInputs, setUserInputs] = useState<string[][]>(() =>
        gaps.map(gap => Array(gap.answer.length).fill(''))
    )
    const [checked, setChecked] = useState(false)

    // Ref map to store input elements for focus management
    // key: `gap-${gapIndex}-char-${charIndex}`
    const inputsRef = useRef<Map<string, HTMLInputElement>>(new Map())

    const score = useMemo(() => {
        if (!checked) return 0
        return gaps.reduce((sum, gap, index) => {
            const userAnswer = userInputs[index]?.join('') ?? ''
            const isCorrect = userAnswer.toLowerCase() === gap.answer.toLowerCase()
            return sum + (isCorrect ? 1 : 0)
        }, 0)
    }, [userInputs, gaps, checked])

    const handleInputChange = (gapIndex: number, charIndex: number, value: string) => {
        // Only allow single character
        const char = value.slice(-1)

        setUserInputs(prev => {
            const newInputs = [...prev]
            // Copy the specific gap array
            const gapInputs = [...(newInputs[gapIndex] || [])]
            gapInputs[charIndex] = char
            newInputs[gapIndex] = gapInputs
            return newInputs
        })

        if (checked) setChecked(false)

        // Auto-advance focus if character was entered
        if (char && charIndex < (gaps[gapIndex]?.answer.length ?? 0) - 1) {
            const nextKey = `gap-${gapIndex}-char-${charIndex + 1}`
            const nextInput = inputsRef.current.get(nextKey)
            if (nextInput) nextInput.focus()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent, gapIndex: number, charIndex: number) => {
        const currentVal = userInputs[gapIndex]?.[charIndex]

        if (e.key === 'Backspace') {
            if (!currentVal && charIndex > 0) {
                // Move back if current is empty and backspace is pressed
                e.preventDefault() // Prevent deleting previous char in some browsers logic if focused? No, just focus back.
                const prevKey = `gap-${gapIndex}-char-${charIndex - 1}`
                const prevInput = inputsRef.current.get(prevKey)
                if (prevInput) {
                    prevInput.focus()
                    // Do we delete the previous char? Standard behavior usually doesn't, just moves cursor.
                    // But typically in these inputs, backspace on empty moves back AND deletes?
                    // Text fields are separate, so backspace on empty current field just does nothing by default.
                    // We want to move focus back.
                }
            } else if (currentVal) {
                // Standard backspace deletes current val, let it happen via onChange?
                // Actually controlled input with value={currentVal}. Backspace triggers onChange with empty string.
                // So we don't need to manually clear state here, just handle focus movement if empty.
            }
        } else if (e.key === 'ArrowRight') {
            if (charIndex < (gaps[gapIndex]?.answer.length ?? 0) - 1) {
                e.preventDefault()
                const nextKey = `gap-${gapIndex}-char-${charIndex + 1}`
                inputsRef.current.get(nextKey)?.focus()
            } else {
                // Maybe move to next gap?
                // For now stay in word
            }
        } else if (e.key === 'ArrowLeft') {
            if (charIndex > 0) {
                e.preventDefault()
                const prevKey = `gap-${gapIndex}-char-${charIndex - 1}`
                inputsRef.current.get(prevKey)?.focus()
            }
        }
    }

    // Effect to register/unregister inputs is handled in ref callback

    return (
        <section className="not-prose my-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            {config.title && <h3 className="text-xl font-bold text-slate-900 mb-6 pb-2 border-b border-slate-100">{config.title}</h3>}

            <div className="space-y-6 text-lg leading-relaxed text-slate-800 font-serif">
                {parsedItems.map((item, itemIndex) => (
                    <div key={`item-${itemIndex}`} className="leading-8">
                        {item.parts.map((part, partIndex) => {
                            if (part.type === 'text') {
                                return <span key={`text-${itemIndex}-${partIndex}`}>{part.value}</span>
                            }

                            // If it is a gap
                            const gapIndex = part.gapIndex
                            const answer = part.answer
                            const currentGapInputs = userInputs[gapIndex] || []
                            const prevPart = partIndex > 0 ? item.parts[partIndex - 1] : null
                            const nextPart = partIndex < item.parts.length - 1 ? item.parts[partIndex + 1] : null
                            const sticksToPrev = prevPart?.type === 'text' && endsWithWordChar(prevPart.value)
                            const sticksToNext = nextPart?.type === 'text' && startsWithWordChar(nextPart.value)

                            // Check correctness
                            const userAnswerFull = currentGapInputs.join('')
                            const isWordCorrect = checked && userAnswerFull.toLowerCase() === answer.toLowerCase()

                            return (
                                <span key={`gap-${gapIndex}`} className={`${sticksToPrev || sticksToNext ? 'mx-0' : 'mx-1'} inline-flex flex-wrap items-baseline gap-1 align-baseline whitespace-nowrap`}>
                                    {sticksToPrev && <span aria-hidden="true">{'\u2060'}</span>}
                                    {answer.split('').map((_, charIndex) => {
                                        const charValue = currentGapInputs[charIndex] || ''
                                        const inputKey = `gap-${gapIndex}-char-${charIndex}`

                                        // Styling logic
                                        let borderColor = 'border-slate-300'
                                        let bgColor = 'bg-slate-50'
                                        let textColor = 'text-slate-900'

                                        if (checked) {
                                            if (isWordCorrect) {
                                                borderColor = 'border-emerald-500'
                                                bgColor = 'bg-emerald-50'
                                                textColor = 'text-emerald-700'
                                            } else {
                                                borderColor = 'border-red-300'
                                                bgColor = 'bg-red-50'
                                                textColor = 'text-red-700'
                                            }
                                        } else if (charValue) {
                                            borderColor = 'border-slate-400'
                                            bgColor = 'bg-white'
                                        }

                                        return (
                                            <input
                                                key={inputKey}
                                                ref={(el) => {
                                                    if (el) inputsRef.current.set(inputKey, el)
                                                    else inputsRef.current.delete(inputKey)
                                                }}
                                                type="text"
                                                maxLength={1}
                                                value={charValue}
                                                onChange={(e) => handleInputChange(gapIndex, charIndex, e.target.value)}
                                                onKeyDown={(e) => handleKeyDown(e, gapIndex, charIndex)}
                                                className={`w-[2ch] h-[2em] p-0 text-center font-mono text-lg border-b-2 rounded-t-empty rounded-b-none 
                                     focus:outline-none focus:border-[#08507f] focus:ring-0 focus:bg-blue-50/50 
                                     transition-colors duration-200
                                     ${borderColor} ${bgColor} ${textColor}`}
                                                autoComplete="off"
                                                spellCheck={false}
                                            />
                                        )
                                    })}
                                    {sticksToNext && <span aria-hidden="true">{'\u2060'}</span>}
                                </span>
                            )
                        })}
                    </div>
                ))}
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-start sm:items-center gap-4 border-t border-slate-100 pt-6">
                <button
                    type="button"
                    onClick={() => setChecked(true)}
                    className="rounded-xl bg-[#08507f] px-6 py-2.5 text-base font-semibold text-white hover:bg-[#063a5c] shadow-md hover:shadow-lg transition-all active:scale-95"
                >
                    Check Answers
                </button>
                {checked && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2">
                        <span className={`text-lg font-bold ${score === gaps.length ? 'text-emerald-600' : 'text-slate-700'}`}>
                            You got {score} out of {gaps.length} correct
                        </span>
                        {score === gaps.length && <span className="text-2xl animate-bounce">🎉</span>}
                    </div>
                )}
            </div>

            {checked && config.explanation && (
                <div className="mt-6 rounded-xl bg-blue-50/50 p-5 border border-blue-100 text-blue-900 animate-in fade-in zoom-in-95">
                    <p className="font-bold mb-2 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-info"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
                        Explanation
                    </p>
                    <p className="text-base leading-relaxed text-slate-700">{config.explanation}</p>
                </div>
            )}
        </section>
    )
}
