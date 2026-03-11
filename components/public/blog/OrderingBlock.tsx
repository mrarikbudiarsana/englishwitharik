'use client'

import { useState, useEffect } from 'react'
import { CheckCircle2, RotateCcw, GripVertical, ChevronUp, ChevronDown, ArrowRight, ArrowLeft } from 'lucide-react'

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
    const [sourceItems, setSourceItems] = useState<OrderItem[]>([])
    const [targetItems, setTargetItems] = useState<OrderItem[]>([])
    const [hasStarted, setHasStarted] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [score, setScore] = useState(0)

    useEffect(() => {
        setSourceItems(shuffleItems(config.items))
        setTargetItems([])
    }, [config.items])

    const handleDragStart = (e: React.DragEvent, listName: 'source' | 'target', index: number) => {
        if (isCompleted) return
        e.dataTransfer.setData('text/plain', JSON.stringify({ listName, index }))
        e.dataTransfer.effectAllowed = 'move'
    }

    const handleDrop = (e: React.DragEvent, dropListName: 'source' | 'target', dropIndex?: number) => {
        e.preventDefault()
        if (isCompleted) return

        try {
            const dataStr = e.dataTransfer.getData('text/plain')
            if (!dataStr) return
            const data = JSON.parse(dataStr)

            const dragListName = data.listName as 'source' | 'target'
            const dragIndex = data.index as number

            if (dragListName === dropListName && dragIndex === dropIndex) return

            setHasStarted(true)

            let draggedItem: OrderItem;
            const newSource = [...sourceItems]
            const newTarget = [...targetItems]

            // Remove from original list
            if (dragListName === 'source') {
                draggedItem = newSource[dragIndex]
                newSource.splice(dragIndex, 1)
            } else {
                draggedItem = newTarget[dragIndex]
                newTarget.splice(dragIndex, 1)
            }

            // Add to new list
            if (dropListName === 'source') {
                if (dropIndex !== undefined) {
                    newSource.splice(dropIndex, 0, draggedItem)
                } else {
                    newSource.push(draggedItem)
                }
            } else {
                if (dropIndex !== undefined) {
                    newTarget.splice(dropIndex, 0, draggedItem)
                } else {
                    newTarget.push(draggedItem)
                }
            }

            setSourceItems(newSource)
            setTargetItems(newTarget)
        } catch (err) {
            console.error('Drop error', err);
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
        if (isCompleted) return
        e.dataTransfer.dropEffect = 'move'
    }

    const moveItem = (fromList: 'source' | 'target', index: number, toList: 'source' | 'target', toIndex?: number) => {
        if (isCompleted) return
        setHasStarted(true)

        let draggedItem: OrderItem;
        const newSource = [...sourceItems]
        const newTarget = [...targetItems]

        if (fromList === 'source') {
            draggedItem = newSource[index];
            newSource.splice(index, 1)
        } else {
            draggedItem = newTarget[index];
            newTarget.splice(index, 1)
        }

        if (toList === 'source') {
            if (toIndex !== undefined) {
                newSource.splice(toIndex, 0, draggedItem)
            } else {
                newSource.push(draggedItem)
            }
        } else {
            if (toIndex !== undefined) {
                newTarget.splice(toIndex, 0, draggedItem)
            } else {
                newTarget.push(draggedItem)
            }
        }

        setSourceItems(newSource)
        setTargetItems(newTarget)
    }

    const moveUpTarget = (index: number) => {
        if (isCompleted || index === 0) return
        setHasStarted(true)
        setTargetItems(prev => {
            const next = [...prev]
                ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
            return next
        })
    }

    const moveDownTarget = (index: number) => {
        if (isCompleted || index === targetItems.length - 1) return
        setHasStarted(true)
        setTargetItems(prev => {
            const next = [...prev]
                ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
            return next
        })
    }

    const checkAnswers = () => {
        let correctCount = 0
        // Score points for each correct pair
        for (let i = 0; i < targetItems.length - 1; i++) {
            if (targetItems[i].originalIndex + 1 === targetItems[i + 1].originalIndex) {
                correctCount++
            }
        }
        setScore(correctCount)
        setIsCompleted(true)
    }

    const resetGame = () => {
        setHasStarted(false)
        setIsCompleted(false)
        setScore(0)
        setSourceItems(shuffleItems(config.items))
        setTargetItems([])
    }

    // Determine correct/wrong status per item for visual highlighting
    // An item is "correct" visually if it is part of ANY correct pair (either right before it, or right after it).
    // The exact scoring rule gives points per *pair*, not per *item*, but visually users need to see which items are right/wrong.
    // If it's in its absolute correct final spot AND its pair is right, let's just mark it green if it forms a correct forward pair or backward pair.
    const isItemInCorrectPair = (index: number) => {
        if (!isCompleted) return false;
        const current = targetItems[index];
        const prev = targetItems[index - 1];
        const next = targetItems[index + 1];

        // First item correctly followed by the second item
        if (index === 0 && next && current.originalIndex + 1 === next.originalIndex && current.originalIndex === 0) return true;

        // Forms a correct pair with the previous item
        if (prev && prev.originalIndex + 1 === current.originalIndex) return true;
        // Forms a correct pair with the next item
        if (next && current.originalIndex + 1 === next.originalIndex) return true;

        return false;
    }

    if (config.items.length === 0) return null

    return (
        <div className="my-8 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm flex flex-col">
            <div className="border-b border-gray-100 bg-[#08507f] px-6 py-4">
                <p className="!text-white text-base font-medium !m-0 leading-relaxed">
                    {config.title || 'Restore the original order'}
                </p>
            </div>

            <div className="p-4 md:p-6 bg-gray-50/30 flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

                    {/* SOURCE COLUMN */}
                    <div
                        className="flex flex-col rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 min-h-[300px]"
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'source')}
                    >
                        <div className="p-3 border-b border-gray-200 bg-gray-100/50 rounded-t-xl text-center">
                            <h4 className="font-semibold text-gray-700 m-0">Source</h4>
                        </div>
                        <div className="p-4 flex-1 space-y-3">
                            {sourceItems.map((item, index) => (
                                <div
                                    key={item.id}
                                    draggable={!isCompleted}
                                    onDragStart={(e) => handleDragStart(e, 'source', index)}
                                    // Make items drop targets for reordering inside source, or just dropping anywhere.
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => {
                                        e.stopPropagation()
                                        handleDrop(e, 'source', index)
                                    }}
                                    className={`
                                        flex items-stretch min-h-[56px] rounded-xl border border-gray-200 bg-white shadow-sm transition-all
                                        ${!isCompleted ? 'cursor-grab active:cursor-grabbing hover:border-gray-300' : ''}
                                    `}
                                >
                                    <div className="flex items-center justify-center w-8 sm:w-10 border-r border-gray-100 text-gray-300">
                                        <GripVertical size={18} className={!isCompleted ? 'opacity-70' : 'opacity-0'} />
                                    </div>
                                    <div className="flex-1 px-3 py-3 text-gray-700 text-sm font-medium">
                                        {item.text}
                                    </div>
                                    {!isCompleted && (
                                        <button
                                            onClick={() => moveItem('source', index, 'target')}
                                            className="px-3 border-l border-gray-100 text-gray-400 hover:text-[#08507f] hover:bg-gray-50 rounded-r-xl transition-colors flex items-center justify-center"
                                            aria-label="Move to target"
                                            title="Move to target"
                                        >
                                            <ArrowRight size={18} className="rotate-90 md:rotate-0" />
                                        </button>
                                    )}
                                </div>
                            ))}
                            {sourceItems.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400 text-sm gap-2 py-10">
                                    <CheckCircle2 size={32} className="opacity-50" />
                                    <p className="opacity-70">All items placed</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* TARGET COLUMN */}
                    <div
                        className={`
                            flex flex-col rounded-xl border-2 transition-colors min-h-[300px]
                            ${isCompleted ? 'border-gray-200 bg-gray-50/50' : 'border-dashed border-blue-300 bg-blue-50/10'}
                        `}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'target')}
                    >
                        <div className={`p-3 text-center border-b ${isCompleted ? 'border-gray-200 bg-gray-100/50 rounded-t-xl' : 'border-blue-200 bg-blue-100/50 rounded-t-[10px]'}`}>
                            <h4 className="font-semibold text-gray-700 m-0">Target</h4>
                        </div>
                        <div className="p-4 flex-1 flex flex-col space-y-3 relative">
                            {targetItems.map((item, index) => {
                                const isCorrectPosition = isItemInCorrectPair(index);
                                const isWrongPosition = isCompleted && !isCorrectPosition;

                                return (
                                    <div
                                        key={item.id}
                                        draggable={!isCompleted}
                                        onDragStart={(e) => handleDragStart(e, 'target', index)}
                                        onDragOver={handleDragOver}
                                        onDrop={(e) => {
                                            e.stopPropagation()
                                            handleDrop(e, 'target', index)
                                        }}
                                        className={`
                                            flex items-stretch min-h-[56px] rounded-xl border transition-all bg-white
                                            ${!isCompleted ? 'cursor-grab active:cursor-grabbing hover:border-blue-300 shadow-sm border-gray-200' : ''}
                                            ${isCorrectPosition ? 'border-green-500 bg-green-50 shadow-sm' : ''}
                                            ${isWrongPosition ? 'border-red-400 bg-red-50/30' : ''}
                                        `}
                                    >
                                        {!isCompleted ? (
                                            <button
                                                onClick={() => moveItem('target', index, 'source')}
                                                className="px-3 border-r border-gray-100 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-l-xl transition-colors flex items-center justify-center"
                                                aria-label="Remove from target"
                                                title="Remove from target"
                                            >
                                                <ArrowLeft size={18} className="rotate-90 md:rotate-0" />
                                            </button>
                                        ) : (
                                            <div className={`
                                                flex items-center justify-center w-10 sm:w-12 border-r
                                                ${isCorrectPosition ? 'border-green-200 text-green-600' : ''}
                                                ${isWrongPosition ? 'border-red-200 text-red-500' : ''}
                                            `}>
                                                {isCorrectPosition ? (
                                                    <CheckCircle2 size={20} />
                                                ) : (
                                                    <div className="w-5 h-5 rounded-full border border-red-500 text-red-500 flex items-center justify-center text-xs font-bold">X</div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex-1 px-3 py-3 text-gray-800 text-sm font-medium">
                                            {item.text}
                                        </div>

                                        {!isCompleted && (
                                            <div className="flex flex-col border-l border-gray-100 w-10 sm:w-12 items-center justify-center bg-gray-50/50 rounded-r-xl">
                                                <button
                                                    onClick={() => moveUpTarget(index)}
                                                    disabled={index === 0}
                                                    className="flex-1 flex w-full items-center justify-center text-gray-400 hover:text-[#08507f] hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-tr-xl pb-0.5 pt-1 transition-colors"
                                                    aria-label="Move up"
                                                >
                                                    <ChevronUp size={16} />
                                                </button>
                                                <div className="w-full h-px bg-gray-200" />
                                                <button
                                                    onClick={() => moveDownTarget(index)}
                                                    disabled={index === targetItems.length - 1}
                                                    className="flex-1 flex w-full items-center justify-center text-gray-400 hover:text-[#08507f] hover:bg-blue-50 disabled:opacity-30 disabled:hover:bg-transparent rounded-br-xl pt-0.5 pb-1 transition-colors"
                                                    aria-label="Move down"
                                                >
                                                    <ChevronDown size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}

                            {targetItems.length === 0 && !isCompleted && (
                                <div className="h-full flex flex-col items-center justify-center text-blue-400/80 text-sm gap-3 py-10">
                                    <div className="w-12 h-12 rounded-full bg-blue-100/50 flex items-center justify-center mb-2">
                                        <GripVertical size={24} className="opacity-60" />
                                    </div>
                                    <p className="font-medium text-blue-800/60">Drag items here to order them</p>
                                </div>
                            )}
                        </div>
                    </div>

                </div>
            </div>

            <div className="border-t border-gray-200 bg-gray-50 p-6 flex flex-col md:flex-row items-center justify-between gap-4 mt-auto">
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <button
                        onClick={checkAnswers}
                        disabled={!hasStarted || isCompleted || targetItems.length !== config.items.length}
                        className={`
                            w-full md:w-auto px-6 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 flex items-center justify-center gap-2
                            ${!hasStarted || isCompleted || targetItems.length !== config.items.length
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-[#08507f] text-white hover:bg-[#063a5c] shadow-sm hover:shadow-md active:scale-95'
                            }
                        `}
                    >
                        Check Answers
                    </button>

                    {(hasStarted || isCompleted) && (
                        <button
                            onClick={resetGame}
                            className="p-3 text-gray-500 hover:text-[#08507f] hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
                            title="Reset Activity"
                        >
                            <RotateCcw size={20} />
                        </button>
                    )}
                </div>

                {isCompleted && (
                    <div className="flex items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-500 w-full md:w-auto justify-center md:justify-end">
                        <div className="text-center md:text-right">
                            <p className="text-sm text-gray-500 font-medium tracking-wide uppercase">Score</p>
                            <p className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#08507f] to-blue-600">
                                {score} <span className="text-lg text-gray-400">/ {Math.max(0, config.items.length - 1)}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {isCompleted && config.explanation && (
                <div className="border-t border-gray-200 bg-white p-6 animate-in fade-in slide-in-from-bottom-4">
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
