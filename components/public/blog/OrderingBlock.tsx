'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, RotateCcw, GripVertical, ChevronUp, ChevronDown } from 'lucide-react'

export interface OrderingConfig {
    title: string
    items: string[]
    explanation?: string
}

interface OrderingBlockProps {
    config: OrderingConfig
}

interface OrderItem {
    id: string
    text: string
    originalIndex: number
}

// Fisher-Yates shuffle
function shuffleItems(items: string[]): OrderItem[] {
    const mapped = items.map((text, i) => ({ id: `id-${i}-${Math.random().toString(36).substr(2, 9)}`, text, originalIndex: i }))
    for (let i = mapped.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[mapped[i], mapped[j]] = [mapped[j], mapped[i]]
    }
    return mapped
}

export default function OrderingBlock({ config }: OrderingBlockProps) {
    const [items, setItems] = useState<OrderItem[]>([])
    const [hasStarted, setHasStarted] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [score, setScore] = useState(0)

    useEffect(() => {
        setItems(shuffleItems(config.items))
    }, [config.items])

    const handleDragStart = (e: React.DragEvent, index: number) => {
        if (isCompleted) return
        e.dataTransfer.setData('text/plain', index.toString())
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault()
        if (isCompleted) return
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'), 10)
        if (isNaN(dragIndex) || dragIndex === dropIndex) return

        setHasStarted(true)
        setItems(prev => {
            const newItems = [...prev]
            const [draggedItem] = newItems.splice(dragIndex, 1)
            newItems.splice(dropIndex, 0, draggedItem)
            return newItems
        })
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (isCompleted) return
        e.dataTransfer.dropEffect = 'move'
    }

    const moveUp = (index: number) => {
        if (isCompleted || index === 0) return
        setHasStarted(true)
        setItems(prev => {
            const next = [...prev]
                ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
            return next
        })
    }

    const moveDown = (index: number) => {
        if (isCompleted || index === items.length - 1) return
        setHasStarted(true)
        setItems(prev => {
            const next = [...prev]
                ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
            return next
        })
    }

    const checkAnswers = () => {
        let correctCount = 0
        items.forEach((item, index) => {
            if (item.originalIndex === index) correctCount++
        })
        setScore(correctCount)
        setIsCompleted(true)
    }

    const resetGame = () => {
        setHasStarted(false)
        setIsCompleted(false)
        setScore(0)
        setItems(shuffleItems(config.items))
    }

    if (items.length === 0) return null

    return (
        <div className="my-8 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="border-b border-gray-100 bg-[#08507f] px-6 py-4">
                <h3 className="!text-white text-lg font-semibold !m-0">
                    {config.title || 'Put the items in the correct order'}
                </h3>
                <p className="!text-blue-100/90 text-sm !m-0 !mt-1">
                    Drag and drop items to reorder them, or use the arrows.
                </p>
            </div>

            <div className="p-6 md:p-8 bg-gray-50/30">
                <div className="max-w-3xl mx-auto space-y-3 relative">
                    {items.map((item, index) => {
                        const isCorrectPosition = isCompleted && item.originalIndex === index
                        const isWrongPosition = isCompleted && item.originalIndex !== index

                        return (
                            <div
                                key={item.id}
                                draggable={!isCompleted}
                                onDragStart={(e) => handleDragStart(e, index)}
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, index)}
                                className={`
                  flex items-center min-h-[56px] rounded-xl border-2 transition-all bg-white
                  ${!isCompleted ? 'cursor-grab active:cursor-grabbing hover:border-[#08507f]/40 hover:shadow-md' : ''}
                  ${isCorrectPosition ? 'border-green-500 bg-green-50 shadow-sm' : ''}
                  ${isWrongPosition ? 'border-red-400 bg-red-50/30' : ''}
                  ${!isCompleted && !isCorrectPosition && !isWrongPosition ? 'border-gray-200' : ''}
                `}
                            >
                                {/* Drag Handle visually */}
                                <div className={`
                  flex items-center justify-center w-10 sm:w-12 h-full border-r
                  ${isCorrectPosition ? 'border-green-200 text-green-600' : ''}
                  ${isWrongPosition ? 'border-red-200 text-red-500' : ''}
                  ${!isCompleted ? 'border-gray-100 text-gray-400' : ''}
                `}>
                                    {isCorrectPosition ? (
                                        <CheckCircle2 size={20} />
                                    ) : (
                                        <GripVertical size={20} className={!isCompleted ? 'opacity-70' : 'opacity-0'} />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 px-4 py-3 text-gray-800 font-medium">
                                    {item.text}
                                </div>

                                {/* Mobile controls */}
                                {!isCompleted && (
                                    <div className="flex flex-col border-l border-gray-100 h-full w-12 sm:w-14 items-center justify-center">
                                        <button
                                            onClick={() => moveUp(index)}
                                            disabled={index === 0}
                                            className="flex-1 flex w-full items-center justify-center text-gray-400 hover:text-[#08507f] hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-tr-xl pb-0.5 pt-1 cursor-pointer transition-colors"
                                            aria-label="Move up"
                                        >
                                            <ChevronUp size={20} />
                                        </button>
                                        <div className="w-full h-px bg-gray-100" />
                                        <button
                                            onClick={() => moveDown(index)}
                                            disabled={index === items.length - 1}
                                            className="flex-1 flex w-full items-center justify-center text-gray-400 hover:text-[#08507f] hover:bg-gray-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-br-xl pt-0.5 pb-1 cursor-pointer transition-colors"
                                            aria-label="Move down"
                                        >
                                            <ChevronDown size={20} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="border-t border-gray-200 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 w-full sm:w-auto">
                    <button
                        onClick={checkAnswers}
                        disabled={!hasStarted || isCompleted}
                        className={`
              w-full sm:w-auto px-8 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2
              ${!hasStarted || isCompleted
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
                            className="p-3 text-gray-500 hover:text-[#08507f] hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
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
                                {score} <span className="text-lg text-gray-400">/ {items.length}</span>
                            </p>
                        </div>
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
