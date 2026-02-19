'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  Quote, LinkIcon, ImageIcon, Minus, SquarePlus, Send, Headphones, FileQuestion, ListChecks, ToggleLeft, GitCompareArrows, Plus, Trash2,
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
  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const [showMcqModal, setShowMcqModal] = useState(false)
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [showFillGapsModal, setShowFillGapsModal] = useState(false)
  const [showDropdownGapsModal, setShowDropdownGapsModal] = useState(false)
  const [showTrueFalseModal, setShowTrueFalseModal] = useState(false)
  const [showMatchingModal, setShowMatchingModal] = useState(false)
  const [mcqQuestion, setMcqQuestion] = useState('')
  const [mcqOptionA, setMcqOptionA] = useState('')
  const [mcqOptionB, setMcqOptionB] = useState('')
  const [mcqOptionC, setMcqOptionC] = useState('')
  const [mcqOptionD, setMcqOptionD] = useState('')
  const [mcqCorrectIndex, setMcqCorrectIndex] = useState(0)
  const [mcqExplanation, setMcqExplanation] = useState('')
  const [audioSrc, setAudioSrc] = useState('')
  const [audioTitle, setAudioTitle] = useState('')
  const [audioTranscript, setAudioTranscript] = useState('')
  const [fillMode, setFillMode] = useState<'paragraph' | 'sentences'>('sentences')
  const [fillTitle, setFillTitle] = useState('')
  const [fillRows, setFillRows] = useState<string[]>([''])
  const [fillExplanation, setFillExplanation] = useState('')
  const [dropdownMode, setDropdownMode] = useState<'paragraph' | 'sentences'>('sentences')
  const [dropdownTitle, setDropdownTitle] = useState('')
  const [dropdownRows, setDropdownRows] = useState<string[]>([''])
  const [dropdownExplanation, setDropdownExplanation] = useState('')
  const [trueFalseTitle, setTrueFalseTitle] = useState('')
  const [trueFalseRows, setTrueFalseRows] = useState<Array<{ text: string; answer: boolean }>>([{ text: '', answer: true }])
  const [trueFalseExplanation, setTrueFalseExplanation] = useState('')
  const [matchingTitle, setMatchingTitle] = useState('')
  const [matchingPrompt, setMatchingPrompt] = useState('')
  const [matchingRows, setMatchingRows] = useState<Array<{ left: string; right: string }>>([{ left: '', right: '' }, { left: '', right: '' }])
  const [matchingExplanation, setMatchingExplanation] = useState('')
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const editorShellRef = useRef<HTMLDivElement | null>(null)

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

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (!pickerRef.current) return
      if (!pickerRef.current.contains(event.target as Node)) {
        setShowBlockPicker(false)
      }
    }

    if (showBlockPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showBlockPicker])

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

  function insertShortcodeBlock(blockType: string, config: Record<string, unknown>) {
    if (!editor) return
    const shortcode = `[block:${blockType}:${encodeURIComponent(JSON.stringify(config))}]`
    editor.chain().focus().insertContent(`<p>${shortcode}</p>`).run()
  }

  function resetAudioForm() {
    setAudioSrc('')
    setAudioTitle('')
    setAudioTranscript('')
  }

  function resetFillForm() {
    setFillTitle('')
    setFillRows([''])
    setFillExplanation('')
    setFillMode('sentences')
  }

  function resetDropdownForm() {
    setDropdownTitle('')
    setDropdownRows([''])
    setDropdownExplanation('')
    setDropdownMode('sentences')
  }

  function resetTrueFalseForm() {
    setTrueFalseTitle('')
    setTrueFalseRows([{ text: '', answer: true }])
    setTrueFalseExplanation('')
  }

  function resetMatchingForm() {
    setMatchingTitle('')
    setMatchingPrompt('')
    setMatchingRows([{ left: '', right: '' }, { left: '', right: '' }])
    setMatchingExplanation('')
  }

  function insertAudioBlock() {
    if (!audioSrc.trim()) {
      window.alert('Audio URL is required.')
      return
    }

    insertShortcodeBlock('audio', {
      src: audioSrc.trim(),
      title: audioTitle.trim() || undefined,
      transcript: audioTranscript.trim() || undefined,
    })

    resetAudioForm()
    setShowAudioModal(false)
  }

  function insertFillGapsBlock() {
    const items = fillRows.map(item => item.trim()).filter(Boolean)
    if (items.length === 0 || !items.some(item => item.includes('[[') && item.includes(']]'))) {
      window.alert('Add at least one item with [[answer]] markers.')
      return
    }

    insertShortcodeBlock('fill_gaps', {
      mode: fillMode,
      title: fillTitle.trim() || undefined,
      items,
      explanation: fillExplanation.trim() || undefined,
    })

    resetFillForm()
    setShowFillGapsModal(false)
  }

  function insertDropdownGapsBlock() {
    const items = dropdownRows.map(item => item.trim()).filter(Boolean)
    if (items.length === 0 || !items.some(item => item.includes('[[') && item.includes('|') && item.includes(']]'))) {
      window.alert('Add at least one dropdown marker like [[correct|option2|option3]].')
      return
    }

    insertShortcodeBlock('dropdown_gaps', {
      mode: dropdownMode,
      title: dropdownTitle.trim() || undefined,
      items,
      explanation: dropdownExplanation.trim() || undefined,
    })

    resetDropdownForm()
    setShowDropdownGapsModal(false)
  }

  function insertTrueFalseBlock() {
    const statements = trueFalseRows
      .map(row => ({ text: row.text.trim(), answer: row.answer }))
      .filter(item => item.text.length > 0)

    if (statements.length === 0) {
      window.alert('Add at least one valid statement.')
      return
    }

    insertShortcodeBlock('true_false', {
      title: trueFalseTitle.trim() || undefined,
      statements,
      explanation: trueFalseExplanation.trim() || undefined,
    })

    resetTrueFalseForm()
    setShowTrueFalseModal(false)
  }

  function insertMatchingBlock() {
    const pairs = matchingRows
      .map(row => ({ left: row.left.trim(), right: row.right.trim() }))
      .filter(pair => pair.left && pair.right)

    if (pairs.length < 2) {
      window.alert('Add at least 2 valid pairs.')
      return
    }

    insertShortcodeBlock('matching', {
      title: matchingTitle.trim() || undefined,
      prompt: matchingPrompt.trim() || undefined,
      pairs,
      explanation: matchingExplanation.trim() || undefined,
    })

    resetMatchingForm()
    setShowMatchingModal(false)
  }

  function openBlockModal(type: 'mcq' | 'audio' | 'fill' | 'dropdown' | 'truefalse' | 'matching' | 'cta') {
    setShowBlockPicker(false)
    if (type === 'mcq') setShowMcqModal(true)
    if (type === 'audio') setShowAudioModal(true)
    if (type === 'fill') setShowFillGapsModal(true)
    if (type === 'dropdown') setShowDropdownGapsModal(true)
    if (type === 'truefalse') setShowTrueFalseModal(true)
    if (type === 'matching') setShowMatchingModal(true)
    if (type === 'cta') insertCtaBlock()
  }

  function jumpToToolbarAndOpenPicker() {
    editorShellRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    setTimeout(() => setShowBlockPicker(true), 200)
  }

  return (
    <div ref={editorShellRef} className="border border-gray-200 rounded-xl overflow-hidden bg-white relative">
      {/* Toolbar */}
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
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

        <div className="relative ml-1" ref={pickerRef}>
          <button
            type="button"
            onClick={() => setShowBlockPicker(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#08507f]/30 text-[#08507f] bg-[#08507f]/5 hover:bg-[#08507f]/10 transition-colors"
          >
            <SquarePlus size={14} />
            Insert Block
          </button>

          {showBlockPicker && (
            <div className="absolute right-0 mt-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-20 p-2 space-y-1">
              <button type="button" onClick={() => openBlockModal('mcq')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><SquarePlus size={14} />MCQ</button>
              <button type="button" onClick={() => openBlockModal('audio')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><Headphones size={14} />Audio Player</button>
              <button type="button" onClick={() => openBlockModal('fill')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><FileQuestion size={14} />Fill In The Gaps</button>
              <button type="button" onClick={() => openBlockModal('dropdown')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><ListChecks size={14} />Dropdown Gaps</button>
              <button type="button" onClick={() => openBlockModal('truefalse')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><ToggleLeft size={14} />True / False</button>
              <button type="button" onClick={() => openBlockModal('matching')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><GitCompareArrows size={14} />Matching</button>
              <button type="button" onClick={() => openBlockModal('cta')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><Send size={14} />CTA Form</button>
            </div>
          )}
        </div>
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      <div className="fixed bottom-6 right-6 z-20">
        <button
          type="button"
          onClick={jumpToToolbarAndOpenPicker}
          className="inline-flex items-center gap-2 rounded-full bg-[#08507f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#063a5c]"
        >
          <SquarePlus size={16} />
          Insert Block
        </button>
      </div>

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

      {showAudioModal && (
        <div className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Insert Audio Block</h3>
              <p className="text-xs text-gray-500 mt-1">Embed an audio player with optional title and transcript.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Audio URL</label>
                <input
                  type="url"
                  value={audioSrc}
                  onChange={e => setAudioSrc(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  placeholder="https://..."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={audioTitle}
                  onChange={e => setAudioTitle(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  placeholder="Listen and answer"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Transcript (optional)</label>
                <textarea
                  value={audioTranscript}
                  onChange={e => setAudioTranscript(e.target.value)}
                  rows={4}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button type="button" onClick={() => { resetAudioForm(); setShowAudioModal(false) }} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50">
                Cancel
              </button>
              <button type="button" onClick={insertAudioBlock} className="px-3 py-2 text-sm rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]">
                Insert block
              </button>
            </div>
          </div>
        </div>
      )}

      {showFillGapsModal && (
        <div className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Insert Fill In The Gaps Block</h3>
              <p className="text-xs text-gray-500 mt-1">Use one line per item. Write gaps as [[answer]].</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
                  <select
                    value={fillMode}
                    onChange={e => setFillMode(e.target.value === 'paragraph' ? 'paragraph' : 'sentences')}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  >
                    <option value="sentences">Sentences</option>
                    <option value="paragraph">Paragraph</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
                  <input
                    type="text"
                    value={fillTitle}
                    onChange={e => setFillTitle(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Fill in the gaps"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Items</label>
                <div className="space-y-2">
                  {fillRows.map((row, index) => (
                    <div key={`fill-row-${index}`} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={row}
                        onChange={e => setFillRows(prev => prev.map((item, i) => (i === index ? e.target.value : item)))}
                        className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                        placeholder="She [[goes]] to school every day."
                      />
                      <button
                        type="button"
                        onClick={() => setFillRows(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))}
                        className="px-2 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setFillRows(prev => [...prev, ''])}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
                  >
                    <Plus size={14} />
                    Add item
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Explanation (optional)</label>
                <textarea
                  value={fillExplanation}
                  onChange={e => setFillExplanation(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetFillForm()
                  setShowFillGapsModal(false)
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="button" onClick={insertFillGapsBlock} className="px-3 py-2 text-sm rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]">
                Insert block
              </button>
            </div>
          </div>
        </div>
      )}

      {showDropdownGapsModal && (
        <div className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Insert Dropdown Gaps Block</h3>
              <p className="text-xs text-gray-500 mt-1">Use one line per item. Write gaps as [[correct|option2|option3]].</p>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Mode</label>
                  <select
                    value={dropdownMode}
                    onChange={e => setDropdownMode(e.target.value === 'paragraph' ? 'paragraph' : 'sentences')}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  >
                    <option value="sentences">Sentences</option>
                    <option value="paragraph">Paragraph</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
                  <input
                    type="text"
                    value={dropdownTitle}
                    onChange={e => setDropdownTitle(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Choose the correct word"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Items</label>
                <div className="space-y-2">
                  {dropdownRows.map((row, index) => (
                    <div key={`dropdown-row-${index}`} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={row}
                        onChange={e => setDropdownRows(prev => prev.map((item, i) => (i === index ? e.target.value : item)))}
                        className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                        placeholder="She [[goes|go|gone]] to school every day."
                      />
                      <button
                        type="button"
                        onClick={() => setDropdownRows(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))}
                        className="px-2 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setDropdownRows(prev => [...prev, ''])}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
                  >
                    <Plus size={14} />
                    Add item
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Explanation (optional)</label>
                <textarea
                  value={dropdownExplanation}
                  onChange={e => setDropdownExplanation(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetDropdownForm()
                  setShowDropdownGapsModal(false)
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="button" onClick={insertDropdownGapsBlock} className="px-3 py-2 text-sm rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]">
                Insert block
              </button>
            </div>
          </div>
        </div>
      )}

      {showTrueFalseModal && (
        <div className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Insert True / False Block</h3>
              <p className="text-xs text-gray-500 mt-1">Use one line per statement: sentence :: true or false</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={trueFalseTitle}
                  onChange={e => setTrueFalseTitle(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  placeholder="True or False"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Statements</label>
                <div className="space-y-2">
                  {trueFalseRows.map((row, index) => (
                    <div key={`tf-row-${index}`} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
                      <input
                        type="text"
                        value={row.text}
                        onChange={e => setTrueFalseRows(prev => prev.map((item, i) => (i === index ? { ...item, text: e.target.value } : item)))}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                        placeholder="English is difficult."
                      />
                      <select
                        value={row.answer ? 'true' : 'false'}
                        onChange={e => setTrueFalseRows(prev => prev.map((item, i) => (i === index ? { ...item, answer: e.target.value === 'true' } : item)))}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                      >
                        <option value="true">True</option>
                        <option value="false">False</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => setTrueFalseRows(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))}
                        className="px-2 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setTrueFalseRows(prev => [...prev, { text: '', answer: true }])}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
                  >
                    <Plus size={14} />
                    Add statement
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Explanation (optional)</label>
                <textarea
                  value={trueFalseExplanation}
                  onChange={e => setTrueFalseExplanation(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetTrueFalseForm()
                  setShowTrueFalseModal(false)
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="button" onClick={insertTrueFalseBlock} className="px-3 py-2 text-sm rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]">
                Insert block
              </button>
            </div>
          </div>
        </div>
      )}

      {showMatchingModal && (
        <div className="absolute inset-0 z-20 bg-black/30 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Insert Matching Block</h3>
              <p className="text-xs text-gray-500 mt-1">Use one line per pair: left :: right</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={matchingTitle}
                  onChange={e => setMatchingTitle(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  placeholder="Match the pairs"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prompt (optional)</label>
                <input
                  type="text"
                  value={matchingPrompt}
                  onChange={e => setMatchingPrompt(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  placeholder="Match each item on the left with the best option."
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Pairs</label>
                <div className="space-y-2">
                  {matchingRows.map((row, index) => (
                    <div key={`matching-row-${index}`} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
                      <input
                        type="text"
                        value={row.left}
                        onChange={e => setMatchingRows(prev => prev.map((item, i) => (i === index ? { ...item, left: e.target.value } : item)))}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                        placeholder="Left item"
                      />
                      <input
                        type="text"
                        value={row.right}
                        onChange={e => setMatchingRows(prev => prev.map((item, i) => (i === index ? { ...item, right: e.target.value } : item)))}
                        className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                        placeholder="Right match"
                      />
                      <button
                        type="button"
                        onClick={() => setMatchingRows(prev => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev))}
                        className="px-2 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMatchingRows(prev => [...prev, { left: '', right: '' }])}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
                  >
                    <Plus size={14} />
                    Add pair
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Explanation (optional)</label>
                <textarea
                  value={matchingExplanation}
                  onChange={e => setMatchingExplanation(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetMatchingForm()
                  setShowMatchingModal(false)
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button type="button" onClick={insertMatchingBlock} className="px-3 py-2 text-sm rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]">
                Insert block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
