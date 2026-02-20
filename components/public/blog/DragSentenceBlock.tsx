'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CheckCircle2, XCircle, RotateCcw } from 'lucide-react'
import { type DragSentenceConfig } from './InteractivePostContent'

interface DragSentenceBlockProps {
    config: DragSentenceConfig
}

export default function DragSentenceBlock({ config }: DragSentenceBlockProps) {
    const [hasStarted, setHasStarted] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [score, setScore] = useState({ correct: 0, total: 0 })

    // We'll manage state per item
    const [itemStates, setItemStates] = useState(
        config.items.map(item => {
            const parts: { type: 'text' | 'gap'; value: string; originalWord?: string; currentWord?: string | null; isCorrect?: boolean }[] = []
            let match
            const regex = /\[\[(.*?)\]\]/g
            let lastIndex = 0

            while ((match = regex.exec(item.speaker2Text)) !== null) {
                if (match.index > lastIndex) {
                    parts.push({ type: 'text', value: item.speaker2Text.substring(lastIndex, match.index) })
                }
                parts.push({ type: 'gap', value: '', originalWord: match[1], currentWord: null })
                lastIndex = regex.lastIndex
            }
            if (lastIndex < item.speaker2Text.length) {
                parts.push({ type: 'text', value: item.speaker2Text.substring(lastIndex) })
            }

            // Collect all words for the word bank (correct words + distractors), shuffled
            const correctWords = parts.filter(p => p.type === 'gap').map(p => p.originalWord!)
            const allWords = [...correctWords, ...(item.distractors || [])]
                .map(value => ({ value, sort: Math.random() }))
                .sort((a, b) => a.sort - b.sort)
                .map(({ value }) => value)

            return {
                parts,
                wordBank: allWords,
                isChecked: false,
            }
        })
    )

    const handleDragStart = (e: React.DragEvent, word: string, sourceIndex: number, isFromBank: boolean, gapIndex?: number) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ word, sourceIndex, isFromBank, gapIndex }))
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDropOnGap = (e: React.DragEvent, itemIndex: number, gapIndex: number) => {
        e.preventDefault()
        setHasStarted(true)
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'))
            const { word, sourceIndex, isFromBank, gapIndex: sourceGapIndex } = data

            setItemStates(prev => {
                const next = [...prev]
                const state = { ...next[itemIndex] }

                // If gap already has a word, return it to the bank first
                const currentWordInGap = state.parts[gapIndex].currentWord
                const newWordBank = [...state.wordBank]
                if (currentWordInGap) {
                    newWordBank.push(currentWordInGap)
                }

                if (isFromBank) {
                    // Remove word from bank
                    newWordBank.splice(sourceIndex, 1)
                } else if (sourceGapIndex !== undefined) {
                    // Moving from another gap, clear source gap
                    state.parts[sourceGapIndex].currentWord = null
                }

                // Set word in new gap
                state.parts[gapIndex].currentWord = word
                state.wordBank = newWordBank
                next[itemIndex] = state
                return next
            })
        } catch (err) {
            console.error('Drop error', err)
        }
    }

    const handleDropOnBank = (e: React.DragEvent, itemIndex: number) => {
        e.preventDefault()
        setHasStarted(true)
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'))
            const { word, isFromBank, gapIndex } = data

            if (!isFromBank && gapIndex !== undefined) {
                setItemStates(prev => {
                    const next = [...prev]
                    const state = { ...next[itemIndex] }
                    state.parts[gapIndex].currentWord = null
                    state.wordBank = [...state.wordBank, word]
                    next[itemIndex] = state
                    return next
                })
            }
        } catch (err) {
            console.error('Drop error', err)
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = 'move'
    }

    // Fallback click interactions for mobile
    const [selectedWordObj, setSelectedWordObj] = useState<{ word: string, itemIndex: number, isFromBank: boolean, sourceIndex?: number, gapIndex?: number } | null>(null)

    const handleWordClick = (word: string, itemIndex: number, isFromBank: boolean, idx: number) => {
        if (itemStates[itemIndex].isChecked) return
        if (selectedWordObj && selectedWordObj.word === word && selectedWordObj.itemIndex === itemIndex && selectedWordObj.isFromBank === isFromBank && (isFromBank ? selectedWordObj.sourceIndex === idx : selectedWordObj.gapIndex === idx)) {
            setSelectedWordObj(null) // deselect
            return
        }
        setSelectedWordObj({ word, itemIndex, isFromBank, ...(isFromBank ? { sourceIndex: idx } : { gapIndex: idx }) })
    }

    const handleGapClick = (itemIndex: number, gapIndex: number) => {
        if (itemStates[itemIndex].isChecked) return
        setHasStarted(true)

        // If a word is selected, place it in the gap
        if (selectedWordObj && selectedWordObj.itemIndex === itemIndex) {
            setItemStates(prev => {
                const next = [...prev]
                const state = { ...next[itemIndex] }
                const currentWordInGap = state.parts[gapIndex].currentWord
                const newWordBank = [...state.wordBank]

                if (currentWordInGap) {
                    newWordBank.push(currentWordInGap)
                }

                if (selectedWordObj.isFromBank && selectedWordObj.sourceIndex !== undefined) {
                    newWordBank.splice(newWordBank.indexOf(selectedWordObj.word), 1) // Remove from bank by value to be safe, or by index if stable
                } else if (!selectedWordObj.isFromBank && selectedWordObj.gapIndex !== undefined) {
                    state.parts[selectedWordObj.gapIndex].currentWord = null
                }

                state.parts[gapIndex].currentWord = selectedWordObj.word
                state.wordBank = newWordBank
                next[itemIndex] = state
                return next
            })
            setSelectedWordObj(null)
        } else {
            // If gap has word, return to bank
            const currentWordInGap = itemStates[itemIndex].parts[gapIndex].currentWord
            if (currentWordInGap) {
                setItemStates(prev => {
                    const next = [...prev]
                    const state = { ...next[itemIndex] }
                    state.parts[gapIndex].currentWord = null
                    state.wordBank = [...state.wordBank, currentWordInGap]
                    next[itemIndex] = state
                    return next
                })
            }
        }
    }


    const checkAnswers = () => {
        let totalGaps = 0
        let correctCount = 0

        const newStates = itemStates.map(state => {
            const newParts = state.parts.map(part => {
                if (part.type === 'gap') {
                    totalGaps++
                    const isCorrect = part.currentWord?.toLowerCase().trim() === part.originalWord?.toLowerCase().trim()
                    if (isCorrect) correctCount++
                    return { ...part, isCorrect }
                }
                return part
            })
            return { ...state, parts: newParts, isChecked: true }
        })

        setItemStates(newStates)
        setScore({ correct: correctCount, total: totalGaps })
        setIsCompleted(true)
    }

    const resetGame = () => {
        setHasStarted(false)
        setIsCompleted(false)
        setScore({ correct: 0, total: 0 })
        setSelectedWordObj(null)

        setItemStates(
            config.items.map(item => {
                const parts: { type: 'text' | 'gap'; value: string; originalWord?: string; currentWord?: string | null; isCorrect?: boolean }[] = []
                let match
                const regex = /\[\[(.*?)\]\]/g
                let lastIndex = 0

                while ((match = regex.exec(item.speaker2Text)) !== null) {
                    if (match.index > lastIndex) {
                        parts.push({ type: 'text', value: item.speaker2Text.substring(lastIndex, match.index) })
                    }
                    parts.push({ type: 'gap', value: '', originalWord: match[1], currentWord: null })
                    lastIndex = regex.lastIndex
                }
                if (lastIndex < item.speaker2Text.length) {
                    parts.push({ type: 'text', value: item.speaker2Text.substring(lastIndex) })
                }

                const correctWords = parts.filter(p => p.type === 'gap').map(p => p.originalWord!)
                const allWords = [...correctWords, ...(item.distractors || [])]
                    .map(value => ({ value, sort: Math.random() }))
                    .sort((a, b) => a.sort - b.sort)
                    .map(({ value }) => value)

                return {
                    parts,
                    wordBank: allWords,
                    isChecked: false,
                }
            })
        )
    }

    const allGapsFilled = itemStates.every(state => state.parts.filter(p => p.type === 'gap').every(p => p.currentWord !== null))

    return (
        <div className="my-8 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 bg-[#08507f] px-6 py-4">
                <h3 className="!text-white text-lg font-semibold !m-0">
                    {config.title || 'Drag the words to complete the sentences'}
                </h3>
                <p className="text-sm text-blue-100/80 mt-1">Drag and drop words into the correct gaps, or tap a word then tap a gap.</p>
            </div>

            <div className="p-6 md:p-8 space-y-10 bg-gray-50/30">
                {config.items.map((item, itemIndex) => {
                    const state = itemStates[itemIndex]

                    return (
                        <div key={`param-item-${itemIndex}`} className="space-y-6 max-w-4xl mx-auto">
                            {/* Speaker 1 (if exists) */}
                            {(item.speaker1Text || item.speaker1Image) && (
                                <div className="flex items-start gap-4 justify-start">
                                    {item.speaker1Image && (
                                        <div className="flex-shrink-0">
                                            <Image
                                                src={item.speaker1Image}
                                                alt="Speaker 1"
                                                width={48}
                                                height={48}
                                                className="rounded-full object-cover border-2 border-white shadow-sm"
                                            />
                                        </div>
                                    )}
                                    {item.speaker1Text && (
                                        <div className="relative bg-white border border-gray-200 rounded-2xl rounded-tl-none px-5 py-3.5 shadow-sm max-w-2xl">
                                            <p className="text-gray-800 font-medium leading-relaxed">{item.speaker1Text}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Speaker 2 (Interactive) */}
                            <div className="flex items-start gap-4 justify-end">
                                <div className="relative bg-[#08507f]/5 border border-[#08507f]/20 rounded-2xl rounded-tr-none px-6 py-5 shadow-sm max-w-3xl w-full">
                                    <div className="text-gray-800 font-medium leading-loose flex flex-wrap items-center gap-y-3">
                                        {state.parts.map((part, partIndex) => {
                                            if (part.type === 'text') {
                                                return <span key={partIndex} className="whitespace-pre-wrap">{part.value}</span>
                                            }

                                            const isSelectedTarget = selectedWordObj?.itemIndex === itemIndex && selectedWordObj?.gapIndex === partIndex

                                            return (
                                                <span
                                                    key={partIndex}
                                                    className={`
                            relative inline-flex items-center justify-center min-w-[120px] h-[42px] px-4 mx-1.5 rounded-xl border-2 transition-all cursor-pointer
                            ${!part.currentWord && !state.isChecked ? 'border-dashed border-gray-400 bg-white/50 hover:bg-white hover:border-[#08507f]/50' : ''}
                            ${part.currentWord && !state.isChecked ? 'border-solid border-[#08507f] bg-white text-[#08507f] shadow-sm hover:border-[#063a5c]' : ''}
                            ${state.isChecked && part.isCorrect ? 'border-solid border-green-500 bg-green-50 text-green-700' : ''}
                            ${state.isChecked && !part.isCorrect ? 'border-solid border-red-500 bg-red-50 text-red-700' : ''}
                            ${isSelectedTarget ? 'ring-2 ring-[#08507f] ring-offset-2 ring-offset-[#f8fafc]' : ''}
                          `}
                                                    onDragOver={handleDragOver}
                                                    onDrop={(e) => handleDropOnGap(e, itemIndex, partIndex)}
                                                    onClick={() => handleGapClick(itemIndex, partIndex)}
                                                >
                                                    {part.currentWord ? (
                                                        <span
                                                            draggable={!state.isChecked}
                                                            onDragStart={(e) => handleDragStart(e, part.currentWord!, partIndex, false, partIndex)}
                                                            className={`select-none ${state.isChecked ? 'cursor-default' : 'cursor-grab active:cursor-grabbing'}`}
                                                        >
                                                            {part.currentWord}
                                                        </span>
                                                    ) : (
                                                        <span className="text-gray-400 text-sm italic select-none">drop word</span>
                                                    )}

                                                    {state.isChecked && (
                                                        <div className="absolute -top-2 -right-2 bg-white rounded-full p-0.5 shadow-sm">
                                                            {part.isCorrect
                                                                ? <CheckCircle2 size={16} className="text-green-600" />
                                                                : <XCircle size={16} className="text-red-500" />
                                                            }
                                                        </div>
                                                    )}
                                                </span>
                                            )
                                        })}
                                    </div>
                                </div>
                                {item.speaker2Image && (
                                    <div className="flex-shrink-0 hidden sm:block">
                                        <Image
                                            src={item.speaker2Image}
                                            alt="Speaker 2"
                                            width={48}
                                            height={48}
                                            className="rounded-full object-cover border-2 border-white shadow-sm"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Word Bank */}
                            <div
                                className="pt-4 border-t border-gray-200 mt-6 min-h-[80px]"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDropOnBank(e, itemIndex)}
                            >
                                <div className="flex flex-wrap gap-3 justify-center">
                                    {state.wordBank.map((word, wordIndex) => {
                                        const isSelected = selectedWordObj?.itemIndex === itemIndex && selectedWordObj?.isFromBank && selectedWordObj?.sourceIndex === wordIndex

                                        return (
                                            <div
                                                key={`bank-${itemIndex}-${wordIndex}-${word}`}
                                                draggable={!state.isChecked}
                                                onDragStart={(e) => handleDragStart(e, word, wordIndex, true)}
                                                onClick={() => handleWordClick(word, itemIndex, true, wordIndex)}
                                                className={`
                           px-4 py-2 bg-white border-2 rounded-xl text-gray-700 font-medium select-none shadow-sm transition-all
                           ${state.isChecked ? 'opacity-50 cursor-default border-gray-200' : 'cursor-grab active:cursor-grabbing hover:border-[#08507f] hover:text-[#08507f] hover:shadow-md'}
                           ${isSelected ? 'border-[#08507f] bg-[#08507f]/5 ring-2 ring-[#08507f]/20' : 'border-gray-200'}
                         `}
                                            >
                                                {word}
                                            </div>
                                        )
                                    })}
                                    {state.wordBank.length === 0 && !state.isChecked && (
                                        <div className="text-gray-400 text-sm italic py-2">All words placed</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            <div className="border-t border-gray-200 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={checkAnswers}
                        disabled={!allGapsFilled || isCompleted}
                        className={`
              w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2
              ${!allGapsFilled || isCompleted
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-[#08507f] text-white hover:bg-[#063a5c] shadow-sm hover:shadow-md active:scale-95'
                            }
            `}
                    >
                        Check Answers
                    </button>

                    {(hasStarted || isCompleted) && (
                        <button
                            onClick={resetGame}
                            className="p-3 text-gray-500 hover:text-[#08507f] hover:bg-gray-100 rounded-xl transition-colors"
                            title="Reset Activity"
                        >
                            <RotateCcw size={20} />
                        </button>
                    )}
                </div>

                {isCompleted && (
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500 w-full sm:w-auto justify-center sm:justify-end">
                        <div className="text-center sm:text-right">
                            <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Score</p>
                            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#08507f] to-blue-600">
                                {score.correct} <span className="text-lg text-gray-400">/ {score.total}</span>
                            </p>
                        </div>
                        {score.correct === score.total && (
                            <div className="bg-green-100 text-green-700 p-3 rounded-full animate-bounce">
                                <CheckCircle2 size={32} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isCompleted && config.explanation && (
                <div className="border-t border-gray-100 bg-[#08507f]/5 p-6 animate-in fade-in slide-in-from-bottom-4">
                    <h4 className="font-semibold text-[#08507f] mb-2 flex items-center gap-2">
                        Explanation
                    </h4>
                    <p className="text-gray-700 leading-relaxed text-sm">
                        {config.explanation}
                    </p>
                </div>
            )}
        </div>
    )
}
