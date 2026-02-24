import { useState, useEffect } from 'react'
import type { ModalPosition, CollapsibleFormState } from '../types'

interface CollapsibleModalProps {
    isOpen: boolean
    position: ModalPosition | null
    initialData: CollapsibleFormState
    onClose: () => void
    onInsert: (config: Record<string, unknown>) => void
}

export function CollapsibleModal({
    isOpen,
    position,
    initialData,
    onClose,
    onInsert,
}: CollapsibleModalProps) {
    const [title, setTitle] = useState(initialData.title)
    const [content, setContent] = useState(initialData.content)

    // Sync state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData.title || '')
            setContent(initialData.content || '')
        }
    }, [isOpen, initialData])

    if (!isOpen || !position) return null

    const handleSave = () => {
        if (!title.trim() || !content.trim()) {
            alert('Please provide both the visible text (title) and the hidden content.')
            return
        }

        onInsert({
            title: title.trim(),
            content: content.trim(),
        })
        onClose()
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-gray-900/20 backdrop-blur-sm transition-opacity"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Modal Container */}
            <div
                className="fixed z-50 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
                style={{
                    top: Math.max(20, position.top),
                    left: Math.max(20, position.left),
                    width: '768px',
                    maxHeight: 'min(480px, calc(100vh - 40px))',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-900">Collapsible Text</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Visible Text
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                placeholder="e.g. Click to see the translation..."
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Hidden Content
                            </label>
                            <textarea
                                value={content}
                                onChange={e => setContent(e.target.value)}
                                placeholder="Write the hidden extra information here..."
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm leading-relaxed whitespace-pre-wrap"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3 mt-auto">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!title.trim() || !content.trim()}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Save Block
                    </button>
                </div>
            </div>
        </>
    )
}
