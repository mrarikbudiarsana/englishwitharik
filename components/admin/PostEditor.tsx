'use client'

import { useState, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  Quote, LinkIcon, ImageIcon, Minus, SquarePlus, Send,
} from 'lucide-react'
import { cn } from '@/components/ui/cn'

interface PostEditorProps {
  content: string
  onChange: (html: string) => void
}

function ToolbarButton({
  onClick,
  active = false,
  title,
  children,
}: {
  onClick: () => void
  active?: boolean
  title: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        'p-1.5 rounded hover:bg-gray-100 transition-colors',
        active && 'bg-gray-200 text-gray-900',
        !active && 'text-gray-600'
      )}
    >
      {children}
    </button>
  )
}

export default function PostEditor({ content, onChange }: PostEditorProps) {
  const [showMcqModal, setShowMcqModal] = useState(false)
  const [mcqQuestion, setMcqQuestion] = useState('')
  const [mcqOptionA, setMcqOptionA] = useState('')
  const [mcqOptionB, setMcqOptionB] = useState('')
  const [mcqOptionC, setMcqOptionC] = useState('')
  const [mcqOptionD, setMcqOptionD] = useState('')
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState(0)
  const [mcqExplanation, setMcqExplanation] = useState('')

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      Image.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
      Placeholder.configure({ placeholder: 'Start writing your post…' }),
    ],
    content,
    onUpdate({ editor }) {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-5',
      },
    },
  })

  if (!editor) return null

  function addLink() {
    if (!editor) return
    const url = window.prompt('Enter URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  function addImage() {
    if (!editor) return
    const url = window.prompt('Enter image URL')
    if (url) editor.chain().focus().setImage({ src: url }).run()
  }

  function resetMcqForm() {
    setMcqQuestion('')
    setMcqOptionA('')
    setMcqOptionB('')
    setMcqOptionC('')
    setMcqOptionD('')
    setMcqCorrectIndex(0)
    setMcqExplanation('')
  }

  function insertMcqBlock() {
    if (!editor) return

    const options = [mcqOptionA, mcqOptionB, mcqOptionC, mcqOptionD]
      .map(option => option.trim())
      .filter(Boolean)

    if (!mcqQuestion.trim()) {
      window.alert('Question is required.')
      return
    }

    if (options.length < 2) {
      window.alert('Add at least 2 options.')
      return
    }

    const safeAnswer = Math.min(Math.max(mcqCorrectIndex, 0), options.length - 1)
    const config = {
      question: mcqQuestion.trim(),
      options,
      answer: safeAnswer,
      explanation: mcqExplanation.trim() || undefined,
    }

    const shortcode = `[block:mcq:${encodeURIComponent(JSON.stringify(config))}]`
    editor.chain().focus().insertContent(`<p>${shortcode}</p>`).run()
    resetMcqForm()
    setShowMcqModal(false)
  }

  function insertCtaBlock() {
    if (!editor) return

    const title = window.prompt('CTA title', 'Need help with IELTS or PTE?')
    if (!title?.trim()) return

    const description = window.prompt('CTA description', 'Leave your contact and we will reach out shortly.') ?? ''
    const submitLabel = window.prompt('Button label', 'Get Free Consultation') ?? 'Get Free Consultation'
    const source = window.prompt('Lead source label', 'blog-cta') ?? 'blog-cta'
    const blockId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`

    const config = {
      title: title.trim(),
      description: description.trim() || undefined,
      submitLabel: submitLabel.trim() || undefined,
      source: source.trim() || undefined,
      blockId,
      collectName: true,
      collectEmail: true,
      collectWhatsapp: true,
    }

    const shortcode = `[block:cta:${encodeURIComponent(JSON.stringify(config))}]`
    editor.chain().focus().insertContent(`<p>${shortcode}</p>`).run()
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white relative">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <Bold size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <Italic size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <UnderlineIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <Strikethrough size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
          <Heading2 size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
          <Heading3 size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
          <List size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
          <ListOrdered size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
          <Quote size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">
          <Minus size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={addLink} active={editor.isActive('link')} title="Add Link">
          <LinkIcon size={15} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} active={false} title="Add Image">
          <ImageIcon size={15} />
        </ToolbarButton>

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => setShowMcqModal(true)}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
        >
          <SquarePlus size={14} />
          Insert MCQ
        </button>
        <button
          type="button"
          onClick={insertCtaBlock}
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
        >
          <Send size={14} />
          Insert CTA
        </button>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      {showMcqModal && (
        <div className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Insert MCQ Block</h3>
              <p className="text-xs text-gray-500 mt-1">Creates a shortcode that hydrates on the blog page.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                <input
                  type="text"
                  value={mcqQuestion}
                  onChange={e => setMcqQuestion(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  placeholder="Which sentence is correct?"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input type="text" value={mcqOptionA} onChange={e => setMcqOptionA(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]" placeholder="Option 1" />
                <input type="text" value={mcqOptionB} onChange={e => setMcqOptionB(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]" placeholder="Option 2" />
                <input type="text" value={mcqOptionC} onChange={e => setMcqOptionC(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]" placeholder="Option 3 (optional)" />
                <input type="text" value={mcqOptionD} onChange={e => setMcqOptionD(e.target.value)} className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]" placeholder="Option 4 (optional)" />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Correct answer index</label>
                <select
                  value={mcqCorrectIndex}
                  onChange={e => setMcqCorrectIndex(Number(e.target.value))}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                >
                  <option value={0}>Option 1</option>
                  <option value={1}>Option 2</option>
                  <option value={2}>Option 3</option>
                  <option value={3}>Option 4</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Explanation (optional)</label>
                <textarea
                  value={mcqExplanation}
                  onChange={e => setMcqExplanation(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-none"
                  placeholder="Explain why this is correct."
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetMcqForm()
                  setShowMcqModal(false)
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertMcqBlock}
                className="px-3 py-2 text-sm rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]"
              >
                Insert block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
