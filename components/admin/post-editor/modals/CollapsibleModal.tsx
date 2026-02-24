import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import {
    Bold, Italic, UnderlineIcon, List, ListOrdered,
} from 'lucide-react'
import type { ModalPosition, CollapsibleFormState } from '../types'

interface CollapsibleModalProps {
    isOpen: boolean
    position: ModalPosition | null
    initialData: CollapsibleFormState
    onClose: () => void
    onInsert: (config: Record<string, unknown>) => void
}

function MiniToolbarButton({
    onClick,
    active,
    title,
    children,
}: {
    onClick: () => void
    active: boolean
    title: string
    children: React.ReactNode
}) {
    return (
        <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onClick() }}
            title={title}
            className={`p-1.5 rounded cursor-pointer transition-colors ${active ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
        >
            {children}
        </button>
    )
}

export function CollapsibleModal({
    isOpen,
    position,
    initialData,
    onClose,
    onInsert,
}: CollapsibleModalProps) {
    const [title, setTitle] = useState(initialData.title)

    const contentEditor = useEditor({
        extensions: [
            StarterKit.configure({ underline: false }),
            Underline,
        ],
        content: initialData.content || '',
        editorProps: {
            attributes: {
                class: 'prose max-w-none min-h-[140px] px-3 py-2.5 focus:outline-none text-base text-gray-800 leading-relaxed',
            },
        },
    })

    // Sync state when modal opens
    useEffect(() => {
        if (isOpen) {
            setTitle(initialData.title || '')
            if (contentEditor) {
                contentEditor.commands.setContent(initialData.content || '')
            }
        }
    }, [isOpen, initialData, contentEditor])

    if (!isOpen || !position) return null

    const handleSave = () => {
        const html = contentEditor?.getHTML() ?? ''
        const plainText = contentEditor?.getText().trim() ?? ''

        if (!title.trim() || !plainText) {
            alert('Please provide both the visible text (title) and the hidden content.')
            return
        }

        onInsert({
            title: title.trim(),
            content: html,
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
                    maxHeight: 'min(520px, calc(100vh - 40px))',
                }}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-semibold text-gray-900">Collapsible Text</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md cursor-pointer hover:bg-gray-100"
                    >
                        <span className="sr-only">Close</span>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Visible text */}
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

                    {/* Hidden content with mini rich-text editor */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Hidden Content
                        </label>
                        <div className="border border-gray-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 overflow-hidden">
                            {/* Mini toolbar */}
                            <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-200 bg-gray-50">
                                <MiniToolbarButton
                                    onClick={() => contentEditor?.chain().focus().toggleBold().run()}
                                    active={!!contentEditor?.isActive('bold')}
                                    title="Bold"
                                >
                                    <Bold size={14} />
                                </MiniToolbarButton>
                                <MiniToolbarButton
                                    onClick={() => contentEditor?.chain().focus().toggleItalic().run()}
                                    active={!!contentEditor?.isActive('italic')}
                                    title="Italic"
                                >
                                    <Italic size={14} />
                                </MiniToolbarButton>
                                <MiniToolbarButton
                                    onClick={() => contentEditor?.chain().focus().toggleUnderline().run()}
                                    active={!!contentEditor?.isActive('underline')}
                                    title="Underline"
                                >
                                    <UnderlineIcon size={14} />
                                </MiniToolbarButton>
                                <div className="w-px h-4 bg-gray-300 mx-1" />
                                <MiniToolbarButton
                                    onClick={() => contentEditor?.chain().focus().toggleBulletList().run()}
                                    active={!!contentEditor?.isActive('bulletList')}
                                    title="Bullet List"
                                >
                                    <List size={14} />
                                </MiniToolbarButton>
                                <MiniToolbarButton
                                    onClick={() => contentEditor?.chain().focus().toggleOrderedList().run()}
                                    active={!!contentEditor?.isActive('orderedList')}
                                    title="Numbered List"
                                >
                                    <ListOrdered size={14} />
                                </MiniToolbarButton>
                            </div>

                            {/* Editor area */}
                            <EditorContent editor={contentEditor} />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg cursor-pointer hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Save Block
                    </button>
                </div>
            </div>
        </>
    )
}
