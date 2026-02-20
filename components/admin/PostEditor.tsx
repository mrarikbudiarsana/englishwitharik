'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  Quote, LinkIcon, ImageIcon, Minus, SquarePlus, Send, Headphones, FileQuestion, ListChecks, ToggleLeft, GitCompareArrows, Plus, Trash2,
  ChevronDown, ChevronRight, Mail, AlignJustify, Type, X,
  Table as TableIcon, Spline, Merge, Columns, Rows, Trash,
} from 'lucide-react'
import { cn } from '@/components/ui/cn'
import { SHORTCODE_REGEX, validateShortcode } from '@/lib/interactive/shortcodes'
import { createClient } from '@/lib/supabase/client'
import { sanitizeEditorArtifacts } from '@/lib/interactive/editorSanitizer'

interface PostEditorProps {
  content: string
  onChange: (html: string) => void
}

interface CtaTemplate {
  id: string
  name: string
  title: string
  description: string
  submitLabel: string
  source: string
}

const CTA_TEMPLATES_KEY = 'post-editor-cta-templates-v1'
const BLOCK_TEMPLATES_KEY = 'post-editor-block-templates-v1'
const BLOCKS_PANEL_COLLAPSED_KEY = 'post-editor-blocks-panel-collapsed-v1'
const BLOCK_TEMPLATES_PANEL_COLLAPSED_KEY = 'post-editor-block-templates-panel-collapsed-v1'
const DEFAULT_CTA_TITLE = 'Need help with IELTS or PTE?'
const DEFAULT_CTA_DESCRIPTION = 'Leave your contact and we will reach out shortly.'
const DEFAULT_CTA_SUBMIT_LABEL = 'Get Free Consultation'
const DEFAULT_CTA_SOURCE = 'blog-cta'
const DEFAULT_EMAIL_WRITING_SUBMIT_LABEL = 'Submit response'
const DEFAULT_EMAIL_WRITING_SUCCESS_MESSAGE = 'Thanks. Your response has been submitted.'
const DEFAULT_EMAIL_WRITING_SOURCE = 'blog-email-writing'

interface BlockTemplate {
  id: string
  name: string
  blockType: string
  shortcode: string
  remote?: boolean
}

interface ShortcodeEntry {
  id: string
  blockType: string
  shortcode: string
  from: number
  to: number
  validationError?: string
}

interface CloudinaryResource {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
}

function getShortcodeEntries(editor: NonNullable<ReturnType<typeof useEditor>>): ShortcodeEntry[] {
  const entries: ShortcodeEntry[] = []

  editor.state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text) return

    for (const match of node.text.matchAll(SHORTCODE_REGEX)) {
      const matchIndex = match.index ?? 0
      const shortcode = match[0]
      const from = pos + matchIndex + 1
      const to = from + shortcode.length

      entries.push({
        id: `${from}-${to}-${entries.length}`,
        blockType: match[1] ?? 'unknown',
        shortcode,
        from,
        to,
        validationError: validateShortcode(shortcode) ?? undefined,
      })
    }
  })

  return entries
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

const ResizableImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: '100%',
        parseHTML: element => {
          const dataWidth = element.getAttribute('data-width')
          if (dataWidth) return dataWidth
          const styleWidth = (element as HTMLElement).style?.width
          if (styleWidth) return styleWidth
          const widthAttr = element.getAttribute('width')
          return widthAttr ? `${widthAttr}px` : '100%'
        },
        renderHTML: attributes => {
          const width = typeof attributes.width === 'string' && attributes.width.trim()
            ? attributes.width.trim()
            : '100%'
          return {
            'data-width': width,
            style: `width:${width};height:auto;`,
          }
        },
      },
    }
  },
})

export default function PostEditor({ content, onChange }: PostEditorProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const [showFloatingBlockPicker, setShowFloatingBlockPicker] = useState(false)
  const [showMcqModal, setShowMcqModal] = useState(false)
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [showFillGapsModal, setShowFillGapsModal] = useState(false)
  const [showDropdownGapsModal, setShowDropdownGapsModal] = useState(false)
  const [showTrueFalseModal, setShowTrueFalseModal] = useState(false)
  const [showMatchingModal, setShowMatchingModal] = useState(false)
  const [showCtaModal, setShowCtaModal] = useState(false)
  const [showEmailWritingModal, setShowEmailWritingModal] = useState(false)
  const [showMissingLettersModal, setShowMissingLettersModal] = useState(false)
  const [showImageLibraryModal, setShowImageLibraryModal] = useState(false)
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false)
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
  const [ctaTitle, setCtaTitle] = useState(DEFAULT_CTA_TITLE)
  const [ctaDescription, setCtaDescription] = useState(DEFAULT_CTA_DESCRIPTION)
  const [ctaSubmitLabel, setCtaSubmitLabel] = useState(DEFAULT_CTA_SUBMIT_LABEL)
  const [ctaSource, setCtaSource] = useState(DEFAULT_CTA_SOURCE)
  const [ctaBlockId, setCtaBlockId] = useState('')
  const [ctaCollectName, setCtaCollectName] = useState(true)
  const [ctaCollectEmail, setCtaCollectEmail] = useState(true)
  const [ctaCollectWhatsapp, setCtaCollectWhatsapp] = useState(true)
  const [ctaTemplateName, setCtaTemplateName] = useState('')
  const [ctaTemplates, setCtaTemplates] = useState<CtaTemplate[]>([])
  const [selectedCtaTemplateId, setSelectedCtaTemplateId] = useState('')
  const [emailWritingTitle, setEmailWritingTitle] = useState('Email Writing Practice')
  const [emailWritingPrompt, setEmailWritingPrompt] = useState('')
  const [emailWritingRecipient, setEmailWritingRecipient] = useState('')
  const [emailWritingSubject, setEmailWritingSubject] = useState('')
  const [emailWritingInstructions, setEmailWritingInstructions] = useState<string[]>([''])
  const [emailWritingPlaceholder, setEmailWritingPlaceholder] = useState('Write your email response here...')
  const [emailWritingSubmitLabel, setEmailWritingSubmitLabel] = useState(DEFAULT_EMAIL_WRITING_SUBMIT_LABEL)
  const [emailWritingSuccessMessage, setEmailWritingSuccessMessage] = useState(DEFAULT_EMAIL_WRITING_SUCCESS_MESSAGE)
  const [emailWritingSource, setEmailWritingSource] = useState(DEFAULT_EMAIL_WRITING_SOURCE)
  const [emailWritingBlockId, setEmailWritingBlockId] = useState('')
  const [emailWritingCollectName, setEmailWritingCollectName] = useState(true)
  const [emailWritingCollectEmail, setEmailWritingCollectEmail] = useState(true)
  const [emailWritingCollectWhatsapp, setEmailWritingCollectWhatsapp] = useState(true)
  const [missingLettersTitle, setMissingLettersTitle] = useState('')
  const [missingLettersItems, setMissingLettersItems] = useState<string[]>([''])
  const [missingLettersExplanation, setMissingLettersExplanation] = useState('')
  const [blockTemplateName, setBlockTemplateName] = useState('')
  const [blockTemplates, setBlockTemplates] = useState<BlockTemplate[]>([])
  const [selectedBlockTemplateId, setSelectedBlockTemplateId] = useState('')
  const [blockTemplateQuery, setBlockTemplateQuery] = useState('')
  const [modalPosition, setModalPosition] = useState<{ top: number; left: number } | null>(null)
  const [blockEntries, setBlockEntries] = useState<ShortcodeEntry[]>([])
  const [showBlocksPanel, setShowBlocksPanel] = useState(true)
  const [showBlockTemplatesPanel, setShowBlockTemplatesPanel] = useState(true)
  const [mediaResources, setMediaResources] = useState<CloudinaryResource[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaQuery, setMediaQuery] = useState('')
  const [mediaError, setMediaError] = useState<string | null>(null)
  const [editingShortcode, setEditingShortcode] = useState<{ from: number; to: number; blockType: string } | null>(null)
  const pickerRef = useRef<HTMLDivElement | null>(null)
  const floatingPickerRef = useRef<HTMLDivElement | null>(null)
  const editorShellRef = useRef<HTMLDivElement | null>(null)
  const blockTemplatesFileInputRef = useRef<HTMLInputElement | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        link: false,
        underline: false,
      }),
      Underline,
      Link.configure({ openOnClick: false }),
      ResizableImage.configure({ HTMLAttributes: { class: 'rounded-lg max-w-full' } }),
      Placeholder.configure({ placeholder: 'Start writing your post…' }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content,
    onUpdate({ editor }) {
      onChange(sanitizeEditorArtifacts(editor.getHTML()))
      setBlockEntries(getShortcodeEntries(editor))
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-5',
      },
    },
  })

  useEffect(() => {
    try {
      const blocksCollapsed = window.localStorage.getItem(BLOCKS_PANEL_COLLAPSED_KEY)
      const templatesCollapsed = window.localStorage.getItem(BLOCK_TEMPLATES_PANEL_COLLAPSED_KEY)
      if (blocksCollapsed === 'true') setShowBlocksPanel(false)
      if (templatesCollapsed === 'true') setShowBlockTemplatesPanel(false)
    } catch {
      // Ignore storage errors and keep defaults.
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem(BLOCKS_PANEL_COLLAPSED_KEY, showBlocksPanel ? 'false' : 'true')
      window.localStorage.setItem(BLOCK_TEMPLATES_PANEL_COLLAPSED_KEY, showBlockTemplatesPanel ? 'false' : 'true')
    } catch {
      // Ignore storage errors and continue.
    }
  }, [showBlocksPanel, showBlockTemplatesPanel])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      const clickedToolbarPicker = pickerRef.current?.contains(target)
      const clickedFloatingPicker = floatingPickerRef.current?.contains(target)

      if (!clickedToolbarPicker) {
        setShowBlockPicker(false)
      }
      if (!clickedFloatingPicker) {
        setShowFloatingBlockPicker(false)
      }
    }

    if (showBlockPicker || showFloatingBlockPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showBlockPicker, showFloatingBlockPicker])

  useEffect(() => {
    if (!editor) return
    setBlockEntries(getShortcodeEntries(editor))
  }, [editor])

  useEffect(() => {
    const root = editorShellRef.current?.querySelector('.ProseMirror')
    if (!root) return

    const paragraphs = root.querySelectorAll('p')
    let blockIndex = 0

    paragraphs.forEach(paragraph => {
      paragraph.classList.remove('shortcode-mask')
      paragraph.removeAttribute('data-block-label')
      paragraph.removeAttribute('data-block-id')
      paragraph.removeAttribute('role')
      paragraph.removeAttribute('tabindex')
      paragraph.removeAttribute('title')

      const text = paragraph.textContent?.trim() ?? ''
      const match = text.match(/^\[block:([a-z0-9_-]+):[^\]]+\]$/)
      if (!match) return

      blockIndex += 1
      const label = `Interactive block ${blockIndex}: ${match[1].replaceAll('_', ' ')}`
      const entry = blockEntries[blockIndex - 1]
      paragraph.classList.add('shortcode-mask')
      paragraph.setAttribute('data-block-label', label)
      if (entry) paragraph.setAttribute('data-block-id', entry.id)
      paragraph.setAttribute('role', 'button')
      paragraph.setAttribute('tabindex', '0')
      paragraph.setAttribute('title', 'Click to edit this block')
    })
  }, [blockEntries, content])

  useEffect(() => {
    const root = editorShellRef.current?.querySelector('.ProseMirror') as HTMLElement | null
    if (!root) return

    function handleInteractiveBlockClick(event: Event) {
      const target = event.target as HTMLElement | null
      const block = target?.closest('p.shortcode-mask') as HTMLElement | null
      if (!block) return
      const blockId = block.getAttribute('data-block-id')
      if (!blockId) return
      const entry = blockEntries.find(item => item.id === blockId)
      if (!entry) return
      event.preventDefault()
      editShortcode(entry)
    }

    function handleInteractiveBlockKeydown(event: KeyboardEvent) {
      if (event.key !== 'Enter' && event.key !== ' ') return
      const target = event.target as HTMLElement | null
      if (!target?.classList.contains('shortcode-mask')) return
      const blockId = target.getAttribute('data-block-id')
      if (!blockId) return
      const entry = blockEntries.find(item => item.id === blockId)
      if (!entry) return
      event.preventDefault()
      editShortcode(entry)
    }

    root.addEventListener('click', handleInteractiveBlockClick)
    root.addEventListener('keydown', handleInteractiveBlockKeydown)
    return () => {
      root.removeEventListener('click', handleInteractiveBlockClick)
      root.removeEventListener('keydown', handleInteractiveBlockKeydown)
    }
  }, [blockEntries])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CTA_TEMPLATES_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as CtaTemplate[]
      if (Array.isArray(parsed)) setCtaTemplates(parsed)
    } catch {
      // Ignore malformed local storage and continue with empty templates.
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    async function loadTemplates() {
      const localTemplates = (() => {
        try {
          const raw = window.localStorage.getItem(BLOCK_TEMPLATES_KEY)
          if (!raw) return [] as BlockTemplate[]
          const parsed = JSON.parse(raw) as BlockTemplate[]
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return [] as BlockTemplate[]
        }
      })()

      const supabase = createClient()
      const { data, error } = await supabase
        .from('interactive_block_templates')
        .select('id, name, block_type, shortcode')
        .order('created_at', { ascending: false })

      if (!cancelled && !error && Array.isArray(data)) {
        const mapped = data.map(item => ({
          id: item.id,
          name: item.name,
          blockType: item.block_type,
          shortcode: item.shortcode,
          remote: true,
        }))
        const merged = [...mapped]
        for (const localTemplate of localTemplates) {
          const hasSameRemoteId = localTemplate.remote && isUuid(localTemplate.id)
            ? mapped.some(template => template.id === localTemplate.id)
            : false
          const duplicateByContent = mapped.some(template =>
            template.blockType === localTemplate.blockType
            && template.shortcode === localTemplate.shortcode
            && template.name === localTemplate.name
          )
          if (!hasSameRemoteId && !duplicateByContent) {
            merged.push({ ...localTemplate, remote: false })
          }
        }

        setBlockTemplates(merged)
        window.localStorage.setItem(BLOCK_TEMPLATES_KEY, JSON.stringify(merged))
        return
      }

      if (!cancelled && localTemplates.length > 0) setBlockTemplates(localTemplates)
    }

    loadTemplates()
    return () => { cancelled = true }
  }, [])

  if (!editor) return null

  function addLink() {
    if (!editor) return
    const url = window.prompt('Enter URL')
    if (url) editor.chain().focus().setLink({ href: url }).run()
  }

  function addImage() {
    if (!editor) return
    openModalNearCursor(() => setShowImageLibraryModal(true), 900, 680)
    void loadMediaResources()
  }

  async function loadMediaResources() {
    setMediaLoading(true)
    setMediaError(null)
    try {
      const response = await fetch('/api/admin/media')
      if (!response.ok) throw new Error('failed')
      const data = await response.json()
      setMediaResources(Array.isArray(data.resources) ? data.resources : [])
    } catch {
      setMediaError('Could not load media library.')
      setMediaResources([])
    } finally {
      setMediaLoading(false)
    }
  }

  function setSelectedImageWidth(width: string) {
    if (!editor || !editor.isActive('image')) return
    editor.chain().focus().updateAttributes('image', { width }).run()
  }

  function insertImageFromMedia(url: string) {
    if (!editor || !url.trim()) return
    editor.chain().focus().setImage({ src: url.trim() }).updateAttributes('image', { width: '100%' }).run()
    setShowImageLibraryModal(false)
  }

  function resetMcqForm() {
    setMcqQuestion('')
    setMcqOptionA('')
    setMcqOptionB('')
    setMcqOptionC('')
    setMcqOptionD('')
    setMcqCorrectIndex(0)
    setMcqExplanation('')
    setEditingShortcode(null)
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
    if (!ctaTitle.trim()) {
      window.alert('CTA title is required.')
      return
    }

    const { config, blockId } = getCtaConfig()
    setCtaBlockId(blockId)
    insertShortcodeBlock('cta', config)
    resetCtaForm()
    setShowCtaModal(false)
  }

  function getCtaConfig() {
    const normalizedTitle = ctaTitle.trim()
    const slugBase = normalizedTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'cta'
    const blockId = ctaBlockId.trim() || `${slugBase}-${Date.now()}`
    return {
      blockId,
      config: {
        title: normalizedTitle,
        description: ctaDescription.trim() || undefined,
        submitLabel: ctaSubmitLabel.trim() || undefined,
        source: ctaSource.trim() || undefined,
        blockId,
        collectName: ctaCollectName,
        collectEmail: ctaCollectEmail,
        collectWhatsapp: ctaCollectWhatsapp,
      },
    }
  }

  function getCtaShortcode() {
    if (!ctaTitle.trim()) return ''

    const { config } = getCtaConfig()

    return `[block:cta:${encodeURIComponent(JSON.stringify(config))}]`
  }

  async function copyCtaShortcode() {
    const shortcode = getCtaShortcode()
    if (!shortcode) {
      window.alert('CTA title is required.')
      return
    }

    try {
      await navigator.clipboard.writeText(shortcode)
      window.alert('CTA shortcode copied. You can paste it in another blog post.')
    } catch {
      window.alert('Could not copy automatically. Please insert and copy manually.')
    }
  }

  function insertShortcodeBlock(blockType: string, config: Record<string, unknown>) {
    if (!editor) return
    const shortcode = `[block:${blockType}:${encodeURIComponent(JSON.stringify(config))}]`
    if (editingShortcode && editingShortcode.blockType === blockType) {
      editor.chain().focus().insertContentAt({ from: editingShortcode.from, to: editingShortcode.to }, shortcode).run()
      setEditingShortcode(null)
      return
    }
    editor.chain().focus().insertContent(`<p>${shortcode}</p>`).run()
  }

  function resetAudioForm() {
    setAudioSrc('')
    setAudioTitle('')
    setAudioTranscript('')
    setEditingShortcode(null)
  }

  function resetFillForm() {
    setFillTitle('')
    setFillRows([''])
    setFillExplanation('')
    setFillMode('sentences')
    setEditingShortcode(null)
  }

  function resetDropdownForm() {
    setDropdownTitle('')
    setDropdownRows([''])
    setDropdownExplanation('')
    setDropdownMode('sentences')
    setEditingShortcode(null)
  }

  function resetTrueFalseForm() {
    setTrueFalseTitle('')
    setTrueFalseRows([{ text: '', answer: true }])
    setTrueFalseExplanation('')
    setEditingShortcode(null)
  }

  function resetMatchingForm() {
    setMatchingTitle('')
    setMatchingPrompt('')
    setMatchingRows([{ left: '', right: '' }, { left: '', right: '' }])
    setMatchingExplanation('')
    setEditingShortcode(null)
  }

  function resetCtaForm() {
    setCtaTitle(DEFAULT_CTA_TITLE)
    setCtaDescription(DEFAULT_CTA_DESCRIPTION)
    setCtaSubmitLabel(DEFAULT_CTA_SUBMIT_LABEL)
    setCtaSource(DEFAULT_CTA_SOURCE)
    setCtaBlockId('')
    setCtaCollectName(true)
    setCtaCollectEmail(true)
    setCtaCollectWhatsapp(true)
    setCtaTemplateName('')
    setEditingShortcode(null)
  }

  function resetEmailWritingForm() {
    setEmailWritingTitle('Email Writing Practice')
    setEmailWritingPrompt('')
    setEmailWritingRecipient('')
    setEmailWritingSubject('')
    setEmailWritingInstructions([''])
    setEmailWritingPlaceholder('Write your email response here...')
    setEmailWritingSubmitLabel(DEFAULT_EMAIL_WRITING_SUBMIT_LABEL)
    setEmailWritingSuccessMessage(DEFAULT_EMAIL_WRITING_SUCCESS_MESSAGE)
    setEmailWritingSource(DEFAULT_EMAIL_WRITING_SOURCE)
    setEmailWritingBlockId('')
    setEmailWritingCollectName(true)
    setEmailWritingCollectEmail(true)
    setEmailWritingCollectWhatsapp(true)
    setEditingShortcode(null)
  }

  function resetMissingLettersForm() {
    setMissingLettersTitle('')
    setMissingLettersItems([''])
    setMissingLettersExplanation('')
    setEditingShortcode(null)
  }

  function saveTemplates(next: CtaTemplate[]) {
    setCtaTemplates(next)
    window.localStorage.setItem(CTA_TEMPLATES_KEY, JSON.stringify(next))
  }

  function saveCurrentCtaTemplate() {
    const name = ctaTemplateName.trim()
    if (!name) {
      window.alert('Template name is required.')
      return
    }
    if (!ctaTitle.trim()) {
      window.alert('CTA title is required.')
      return
    }

    const existing = ctaTemplates.find(template => template.name.toLowerCase() === name.toLowerCase())
    const nextTemplate: CtaTemplate = {
      id: existing?.id ?? `${Date.now()}`,
      name,
      title: ctaTitle,
      description: ctaDescription,
      submitLabel: ctaSubmitLabel,
      source: ctaSource,
    }

    const next = existing
      ? ctaTemplates.map(template => (template.id === existing.id ? nextTemplate : template))
      : [nextTemplate, ...ctaTemplates]

    saveTemplates(next)
    setSelectedCtaTemplateId(nextTemplate.id)
    window.alert('CTA template saved.')
  }

  function loadSelectedCtaTemplate() {
    const template = ctaTemplates.find(item => item.id === selectedCtaTemplateId)
    if (!template) {
      window.alert('Select a template first.')
      return
    }

    setCtaTemplateName(template.name)
    setCtaTitle(template.title)
    setCtaDescription(template.description)
    setCtaSubmitLabel(template.submitLabel)
    setCtaSource(template.source)
    setCtaBlockId('')
    setCtaCollectName(true)
    setCtaCollectEmail(true)
    setCtaCollectWhatsapp(true)
  }

  function deleteSelectedCtaTemplate() {
    const template = ctaTemplates.find(item => item.id === selectedCtaTemplateId)
    if (!template) {
      window.alert('Select a template first.')
      return
    }
    const next = ctaTemplates.filter(item => item.id !== selectedCtaTemplateId)
    saveTemplates(next)
    setSelectedCtaTemplateId('')
    window.alert(`Deleted template "${template.name}".`)
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

  function getEmailWritingConfig() {
    const prompt = emailWritingPrompt.trim()
    const title = emailWritingTitle.trim() || undefined
    const slugBase = (title ?? 'email-writing').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'email-writing'
    const blockId = emailWritingBlockId.trim() || `${slugBase}-${Date.now()}`
    const instructions = emailWritingInstructions.map(item => item.trim()).filter(Boolean)
    return {
      blockId,
      config: {
        title,
        prompt,
        recipient: emailWritingRecipient.trim() || undefined,
        subject: emailWritingSubject.trim() || undefined,
        instructions: instructions.length > 0 ? instructions : undefined,
        placeholder: emailWritingPlaceholder.trim() || undefined,
        submitLabel: emailWritingSubmitLabel.trim() || undefined,
        successMessage: emailWritingSuccessMessage.trim() || undefined,
        source: emailWritingSource.trim() || undefined,
        blockId,
        collectName: emailWritingCollectName,
        collectEmail: emailWritingCollectEmail,
        collectWhatsapp: emailWritingCollectWhatsapp,
      },
    }
  }

  function insertEmailWritingBlock() {
    if (!emailWritingPrompt.trim()) {
      window.alert('Prompt is required.')
      return
    }
    if (!emailWritingCollectEmail && !emailWritingCollectWhatsapp) {
      window.alert('Enable at least Email or WhatsApp collection.')
      return
    }

    const { config, blockId } = getEmailWritingConfig()
    setEmailWritingBlockId(blockId)
    insertShortcodeBlock('email_writing', config)
    resetEmailWritingForm()
    setShowEmailWritingModal(false)
  }

  function insertMissingLettersBlock() {
    const items = missingLettersItems.map(item => item.trim()).filter(Boolean)
    if (items.length === 0 || !items.some(item => item.includes('[[') && item.includes(']]'))) {
      window.alert('Add at least one item with [[missing]] letters.')
      return
    }

    insertShortcodeBlock('missing_letters', {
      items,
      title: missingLettersTitle.trim() || undefined,
      explanation: missingLettersExplanation.trim() || undefined,
    })

    resetMissingLettersForm()
    setShowMissingLettersModal(false)
  }

  function openBlockModal(type: 'mcq' | 'audio' | 'fill' | 'dropdown' | 'truefalse' | 'matching' | 'cta' | 'emailwriting' | 'missingletters') {
    setShowBlockPicker(false)
    setShowFloatingBlockPicker(false)
    prepareModalForType(type)
    if (type === 'mcq') openModalNearCursor(() => setShowMcqModal(true), 640, 620)
    if (type === 'audio') openModalNearCursor(() => setShowAudioModal(true), 640, 560)
    if (type === 'fill') openModalNearCursor(() => setShowFillGapsModal(true), 768, 760)
    if (type === 'dropdown') openModalNearCursor(() => setShowDropdownGapsModal(true), 768, 760)
    if (type === 'truefalse') openModalNearCursor(() => setShowTrueFalseModal(true), 768, 760)
    if (type === 'matching') openModalNearCursor(() => setShowMatchingModal(true), 768, 760)
    if (type === 'cta') openModalNearCursor(() => setShowCtaModal(true), 640, 520)
    if (type === 'emailwriting') openModalNearCursor(() => setShowEmailWritingModal(true), 900, 760)
    if (type === 'missingletters') openModalNearCursor(() => setShowMissingLettersModal(true), 768, 760)
  }

  function parseShortcodeConfig(encoded: string) {
    try {
      return JSON.parse(decodeURIComponent(encoded)) as Record<string, unknown>
    } catch {
      return null
    }
  }

  function getActiveShortcodeContext() {
    if (!editor) return null
    const { $from } = editor.state.selection
    const parent = $from.parent
    const text = parent.textContent ?? ''
    if (!text) return null

    const regex = /\[block:([a-z0-9_-]+):([^\]]+)\]/g
    const offset = $from.parentOffset

    for (const match of text.matchAll(regex)) {
      const start = match.index ?? 0
      const end = start + match[0].length
      if (offset >= start && offset <= end) {
        const from = $from.start() + start
        const to = from + match[0].length
        return {
          blockType: match[1],
          from,
          to,
          config: parseShortcodeConfig(match[2]),
        }
      }
    }

    return null
  }

  function prepareModalForType(type: 'mcq' | 'audio' | 'fill' | 'dropdown' | 'truefalse' | 'matching' | 'cta' | 'emailwriting' | 'missingletters') {
    const context = getActiveShortcodeContext()
    if (!context) {
      if (type === 'mcq') resetMcqForm()
      if (type === 'audio') resetAudioForm()
      if (type === 'fill') resetFillForm()
      if (type === 'dropdown') resetDropdownForm()
      if (type === 'truefalse') resetTrueFalseForm()
      if (type === 'matching') resetMatchingForm()
      if (type === 'cta') resetCtaForm()
      if (type === 'emailwriting') resetEmailWritingForm()
      if (type === 'missingletters') resetMissingLettersForm()
      return
    }

    const typeMap: Record<'mcq' | 'audio' | 'fill' | 'dropdown' | 'truefalse' | 'matching' | 'cta' | 'emailwriting' | 'missingletters', string> = {
      mcq: 'mcq',
      audio: 'audio',
      fill: 'fill_gaps',
      dropdown: 'dropdown_gaps',
      truefalse: 'true_false',
      matching: 'matching',
      cta: 'cta',
      emailwriting: 'email_writing',
      missingletters: 'missing_letters',
    }

    if (context.blockType !== typeMap[type] || !context.config) {
      if (type === 'mcq') resetMcqForm()
      if (type === 'audio') resetAudioForm()
      if (type === 'fill') resetFillForm()
      if (type === 'dropdown') resetDropdownForm()
      if (type === 'truefalse') resetTrueFalseForm()
      if (type === 'matching') resetMatchingForm()
      if (type === 'cta') resetCtaForm()
      if (type === 'emailwriting') resetEmailWritingForm()
      if (type === 'missingletters') resetMissingLettersForm()
      return
    }

    setEditingShortcode({ from: context.from, to: context.to, blockType: context.blockType })
    const c = context.config

    if (type === 'mcq') {
      const options = Array.isArray(c.options) ? c.options.map(item => String(item)) : []
      setMcqQuestion(typeof c.question === 'string' ? c.question : '')
      setMcqOptionA(options[0] ?? '')
      setMcqOptionB(options[1] ?? '')
      setMcqOptionC(options[2] ?? '')
      setMcqOptionD(options[3] ?? '')
      setMcqCorrectIndex(typeof c.answer === 'number' ? c.answer : 0)
      setMcqExplanation(typeof c.explanation === 'string' ? c.explanation : '')
    }

    if (type === 'audio') {
      setAudioSrc(typeof c.src === 'string' ? c.src : '')
      setAudioTitle(typeof c.title === 'string' ? c.title : '')
      setAudioTranscript(typeof c.transcript === 'string' ? c.transcript : '')
    }

    if (type === 'fill') {
      setFillMode(c.mode === 'paragraph' ? 'paragraph' : 'sentences')
      setFillTitle(typeof c.title === 'string' ? c.title : '')
      setFillRows(Array.isArray(c.items) ? c.items.map(item => String(item)) : [''])
      setFillExplanation(typeof c.explanation === 'string' ? c.explanation : '')
    }

    if (type === 'dropdown') {
      setDropdownMode(c.mode === 'paragraph' ? 'paragraph' : 'sentences')
      setDropdownTitle(typeof c.title === 'string' ? c.title : '')
      setDropdownRows(Array.isArray(c.items) ? c.items.map(item => String(item)) : [''])
      setDropdownExplanation(typeof c.explanation === 'string' ? c.explanation : '')
    }

    if (type === 'truefalse') {
      const statements = Array.isArray(c.statements)
        ? c.statements
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            text: String((item as { text?: unknown }).text ?? ''),
            answer: Boolean((item as { answer?: unknown }).answer),
          }))
          .filter(item => item.text.trim().length > 0)
        : []
      setTrueFalseTitle(typeof c.title === 'string' ? c.title : '')
      setTrueFalseRows(statements.length > 0 ? statements : [{ text: '', answer: true }])
      setTrueFalseExplanation(typeof c.explanation === 'string' ? c.explanation : '')
    }

    if (type === 'matching') {
      const pairs = Array.isArray(c.pairs)
        ? c.pairs
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            left: String((item as { left?: unknown }).left ?? ''),
            right: String((item as { right?: unknown }).right ?? ''),
          }))
          .filter(item => item.left.trim().length > 0 || item.right.trim().length > 0)
        : []
      setMatchingTitle(typeof c.title === 'string' ? c.title : '')
      setMatchingPrompt(typeof c.prompt === 'string' ? c.prompt : '')
      setMatchingRows(pairs.length > 0 ? pairs : [{ left: '', right: '' }, { left: '', right: '' }])
      setMatchingExplanation(typeof c.explanation === 'string' ? c.explanation : '')
    }

    if (type === 'cta') {
      setCtaTitle(typeof c.title === 'string' ? c.title : DEFAULT_CTA_TITLE)
      setCtaDescription(typeof c.description === 'string' ? c.description : DEFAULT_CTA_DESCRIPTION)
      setCtaSubmitLabel(typeof c.submitLabel === 'string' ? c.submitLabel : DEFAULT_CTA_SUBMIT_LABEL)
      setCtaSource(typeof c.source === 'string' ? c.source : DEFAULT_CTA_SOURCE)
      setCtaBlockId(typeof c.blockId === 'string' ? c.blockId : '')
      setCtaCollectName(typeof c.collectName === 'boolean' ? c.collectName : true)
      setCtaCollectEmail(typeof c.collectEmail === 'boolean' ? c.collectEmail : true)
      setCtaCollectWhatsapp(typeof c.collectWhatsapp === 'boolean' ? c.collectWhatsapp : true)
    }

    if (type === 'emailwriting') {
      const instructions = Array.isArray(c.instructions) ? c.instructions.map(item => String(item)) : []
      setEmailWritingTitle(typeof c.title === 'string' ? c.title : 'Email Writing Practice')
      setEmailWritingPrompt(typeof c.prompt === 'string' ? c.prompt : '')
      setEmailWritingRecipient(typeof c.recipient === 'string' ? c.recipient : '')
      setEmailWritingSubject(typeof c.subject === 'string' ? c.subject : '')
      setEmailWritingInstructions(instructions.length > 0 ? instructions : [''])
      setEmailWritingPlaceholder(typeof c.placeholder === 'string' ? c.placeholder : 'Write your email response here...')
      setEmailWritingSubmitLabel(typeof c.submitLabel === 'string' ? c.submitLabel : DEFAULT_EMAIL_WRITING_SUBMIT_LABEL)
      setEmailWritingSuccessMessage(typeof c.successMessage === 'string' ? c.successMessage : DEFAULT_EMAIL_WRITING_SUCCESS_MESSAGE)
      setEmailWritingSource(typeof c.source === 'string' ? c.source : DEFAULT_EMAIL_WRITING_SOURCE)
      setEmailWritingBlockId(typeof c.blockId === 'string' ? c.blockId : '')
      setEmailWritingCollectName(typeof c.collectName === 'boolean' ? c.collectName : true)
      setEmailWritingCollectEmail(typeof c.collectEmail === 'boolean' ? c.collectEmail : true)
      setEmailWritingCollectWhatsapp(typeof c.collectWhatsapp === 'boolean' ? c.collectWhatsapp : true)
    }

    if (type === 'missingletters') {
      setMissingLettersTitle(typeof c.title === 'string' ? c.title : '')
      setMissingLettersItems(Array.isArray(c.items) ? c.items.map(item => String(item)) : [''])
      setMissingLettersExplanation(typeof c.explanation === 'string' ? c.explanation : '')
    }
  }

  function computeModalPosition(panelWidth: number, panelHeight: number) {
    const viewportPadding = 16
    if (!editor) {
      return {
        top: 80,
        left: Math.max(viewportPadding, (window.innerWidth - panelWidth) / 2),
      }
    }

    try {
      const pos = editor.state.selection.from
      const coords = editor.view.coordsAtPos(pos)
      const maxLeft = window.innerWidth - panelWidth - viewportPadding
      const maxTop = Math.max(viewportPadding, window.innerHeight - panelHeight - viewportPadding)
      const left = Math.min(Math.max(viewportPadding, coords.left), Math.max(viewportPadding, maxLeft))
      const preferredBelow = coords.bottom + 12
      const preferredAbove = coords.top - panelHeight - 12
      const targetTop = preferredBelow <= maxTop ? preferredBelow : Math.max(viewportPadding, preferredAbove)
      const top = Math.min(Math.max(viewportPadding, targetTop), maxTop)
      return { top, left }
    } catch {
      return {
        top: 80,
        left: Math.max(viewportPadding, (window.innerWidth - panelWidth) / 2),
      }
    }
  }

  function openModalNearCursor(open: () => void, panelWidth: number, panelHeight: number) {
    setModalPosition(computeModalPosition(panelWidth, panelHeight))
    open()
  }

  function focusShortcode(entry: ShortcodeEntry) {
    if (!editor) return
    editor.chain().focus().setTextSelection({ from: entry.from, to: entry.to }).run()
  }

  function blockTypeToModal(blockType: string): 'mcq' | 'audio' | 'fill' | 'dropdown' | 'truefalse' | 'matching' | 'cta' | 'emailwriting' | 'missingletters' | null {
    if (blockType === 'mcq') return 'mcq'
    if (blockType === 'audio') return 'audio'
    if (blockType === 'fill_gaps') return 'fill'
    if (blockType === 'dropdown_gaps') return 'dropdown'
    if (blockType === 'true_false') return 'truefalse'
    if (blockType === 'matching') return 'matching'
    if (blockType === 'cta') return 'cta'
    if (blockType === 'email_writing') return 'emailwriting'
    if (blockType === 'missing_letters') return 'missingletters'
    return null
  }

  function editShortcode(entry: ShortcodeEntry) {
    const targetModal = blockTypeToModal(entry.blockType)
    if (!targetModal) {
      window.alert(`Unsupported block type: ${entry.blockType}`)
      return
    }
    focusShortcode(entry)
    openBlockModal(targetModal)
  }

  function duplicateShortcode(entry: ShortcodeEntry) {
    if (!editor) return
    editor.chain().focus().insertContentAt(entry.to, `<p>${entry.shortcode}</p>`).run()
  }

  function moveShortcode(index: number, direction: -1 | 1) {
    if (!editor) return
    const source = blockEntries[index]
    const target = blockEntries[index + direction]
    if (!source || !target) return

    const tr = editor.state.tr
    tr.insertText(source.shortcode, target.from, target.to)
    const mappedFrom = tr.mapping.map(source.from)
    const mappedTo = tr.mapping.map(source.to)
    tr.insertText(target.shortcode, mappedFrom, mappedTo)
    editor.view.dispatch(tr)
  }

  function deleteShortcode(entry: ShortcodeEntry) {
    if (!editor) return
    const ok = window.confirm(`Delete this ${entry.blockType.replaceAll('_', ' ')} block?`)
    if (!ok) return
    editor.chain().focus().insertContentAt({ from: entry.from, to: entry.to }, '').run()
  }

  const filteredBlockTemplates = blockTemplates.filter(template => {
    if (!blockTemplateQuery.trim()) return true
    const query = blockTemplateQuery.toLowerCase()
    return (
      template.name.toLowerCase().includes(query)
      || template.blockType.toLowerCase().includes(query)
    )
  })
  const filteredMediaResources = mediaResources.filter(resource => {
    if (!mediaQuery.trim()) return true
    const query = mediaQuery.trim().toLowerCase()
    return (
      resource.public_id.toLowerCase().includes(query)
      || resource.secure_url.toLowerCase().includes(query)
    )
  })

  function saveBlockTemplates(next: BlockTemplate[]) {
    setBlockTemplates(next)
    window.localStorage.setItem(BLOCK_TEMPLATES_KEY, JSON.stringify(next))
  }

  function isUuid(value: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  }

  async function saveBlockTemplate(entry: ShortcodeEntry, fallbackName?: string) {
    const name = blockTemplateName.trim() || fallbackName || ''
    if (!name) {
      window.alert('Template name is required.')
      return
    }

    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    const createdBy = authData.user?.id ?? null
    const { data, error } = await supabase
      .from('interactive_block_templates')
      .insert({
        name,
        block_type: entry.blockType,
        shortcode: entry.shortcode,
        created_by: createdBy,
      })
      .select('id, name, block_type, shortcode')
      .single()

    const nextTemplate: BlockTemplate = data && !error
      ? {
        id: data.id,
        name: data.name,
        blockType: data.block_type,
        shortcode: data.shortcode,
        remote: true,
      }
      : {
        id: `local-${Date.now()}`,
        name,
        blockType: entry.blockType,
        shortcode: entry.shortcode,
        remote: false,
      }

    saveBlockTemplates([nextTemplate, ...blockTemplates])
    setSelectedBlockTemplateId(nextTemplate.id)
    setBlockTemplateName('')
    if (error) {
      window.alert('Saved locally. Supabase sync failed.')
    } else {
      window.alert('Block template saved.')
    }
  }

  function normalizeTemplateShortcode(shortcode: string) {
    const match = shortcode.match(/^\[block:([a-z0-9_-]+):([^\]]+)\]$/)
    if (!match) return shortcode
    const blockType = match[1]
    const rawConfig = match[2]

    if (blockType !== 'cta' && blockType !== 'email_writing') return shortcode

    try {
      const config = JSON.parse(decodeURIComponent(rawConfig)) as Record<string, unknown>
      const fallbackTitle = blockType === 'email_writing' ? 'email-writing' : 'cta'
      const title = typeof config.title === 'string' ? config.title : fallbackTitle
      config.blockId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${Date.now()}`
      return `[block:${blockType}:${encodeURIComponent(JSON.stringify(config))}]`
    } catch {
      return shortcode
    }
  }

  function insertSelectedBlockTemplate() {
    if (!editor) return
    const template = blockTemplates.find(item => item.id === selectedBlockTemplateId)
    if (!template) {
      window.alert('Select a block template first.')
      return
    }

    const shortcode = normalizeTemplateShortcode(template.shortcode)
    editor.chain().focus().insertContent(`<p>${shortcode}</p>`).run()
  }

  async function deleteSelectedBlockTemplate() {
    const template = blockTemplates.find(item => item.id === selectedBlockTemplateId)
    if (!template) {
      window.alert('Select a block template first.')
      return
    }

    if (template.remote && isUuid(template.id)) {
      const supabase = createClient()
      const { error } = await supabase
        .from('interactive_block_templates')
        .delete()
        .eq('id', template.id)
      if (error) {
        window.alert('Could not delete on Supabase.')
        return
      }
    }

    const next = blockTemplates.filter(item => item.id !== selectedBlockTemplateId)
    saveBlockTemplates(next)
    setSelectedBlockTemplateId('')
    window.alert(`Deleted template "${template.name}".`)
  }

  function exportBlockTemplates() {
    if (blockTemplates.length === 0) {
      window.alert('No block templates to export.')
      return
    }
    const blob = new Blob([JSON.stringify(blockTemplates, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `block-templates-${Date.now()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  function importBlockTemplates(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as BlockTemplate[]
        if (!Array.isArray(parsed)) throw new Error('invalid-format')

        const sanitized = parsed
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: String((item as { name?: unknown }).name ?? 'Imported template'),
            blockType: String((item as { blockType?: unknown }).blockType ?? 'unknown'),
            shortcode: String((item as { shortcode?: unknown }).shortcode ?? ''),
          }))
          .filter(item => item.shortcode.startsWith('[block:'))

        saveBlockTemplates([...sanitized, ...blockTemplates])
        window.alert(`Imported ${sanitized.length} templates.`)
      } catch {
        window.alert('Invalid template file.')
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
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

        {editor.isActive('image') && (
          <div className="ml-1 inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-1 py-0.5">
            <button type="button" onClick={() => setSelectedImageWidth('40%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded hover:bg-gray-100">S</button>
            <button type="button" onClick={() => setSelectedImageWidth('60%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded hover:bg-gray-100">M</button>
            <button type="button" onClick={() => setSelectedImageWidth('80%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded hover:bg-gray-100">L</button>
            <button type="button" onClick={() => setSelectedImageWidth('100%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded hover:bg-gray-100">Full</button>
          </div>
        )}

        <div className="w-px h-5 bg-gray-300 mx-1" />

        <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={editor.isActive('table')} title="Insert Table">
          <TableIcon size={15} />
        </ToolbarButton>

        {editor.isActive('table') && (
          <div className="ml-1 inline-flex items-center gap-0.5 rounded-md border border-gray-300 bg-white px-1 py-0.5 shadow-sm">
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnBefore().run()}
              disabled={!editor.can().addColumnBefore()}
              className="p-1 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-30"
              title="Add Column Before"
            >
              <Columns size={13} className="rotate-90" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              disabled={!editor.can().addColumnAfter()}
              className="p-1 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-30"
              title="Add Column After"
            >
              <Columns size={13} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              disabled={!editor.can().deleteColumn()}
              className="p-1 text-red-600 rounded hover:bg-red-50 disabled:opacity-30"
              title="Delete Column"
            >
              <Trash size={13} />
            </button>
            <div className="w-px h-3 bg-gray-200 mx-0.5" />
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowBefore().run()}
              disabled={!editor.can().addRowBefore()}
              className="p-1 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-30"
              title="Add Row Before"
            >
              <Rows size={13} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              disabled={!editor.can().addRowAfter()}
              className="p-1 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-30"
              title="Add Row After"
            >
              <Rows size={13} className="rotate-180" />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              disabled={!editor.can().deleteRow()}
              className="p-1 text-red-600 rounded hover:bg-red-50 disabled:opacity-30"
              title="Delete Row"
            >
              <Trash size={13} />
            </button>
            <div className="w-px h-3 bg-gray-200 mx-0.5" />
            <button
              type="button"
              onClick={() => editor.chain().focus().mergeCells().run()}
              disabled={!editor.can().mergeCells()}
              className="p-1 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-30"
              title="Merge Cells"
            >
              <Merge size={13} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().splitCell().run()}
              disabled={!editor.can().splitCell()}
              className="p-1 text-gray-700 rounded hover:bg-gray-100 disabled:opacity-30"
              title="Split Cell"
            >
              <Spline size={13} />
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteTable().run()}
              disabled={!editor.can().deleteTable()}
              className="p-1 text-red-600 rounded hover:bg-red-50 disabled:opacity-30"
              title="Delete Table"
            >
              <Trash size={13} />
            </button>
          </div>
        )}

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
              <button type="button" onClick={() => openBlockModal('missingletters')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><AlignJustify size={14} />Missing Letters</button>
              <button type="button" onClick={() => openBlockModal('emailwriting')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><Mail size={14} />Email Writing</button>
              <button type="button" onClick={() => openBlockModal('cta')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><Send size={14} />CTA Form</button>
            </div>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200 bg-gray-50/70 px-3 py-2 space-y-2">
        <button
          type="button"
          onClick={() => setShowBlocksPanel(prev => !prev)}
          className="w-full flex items-center justify-between rounded-md px-1 py-1 text-left hover:bg-gray-100/70"
          aria-expanded={showBlocksPanel}
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-600">Blocks</span>
            {blockEntries.length === 0 && <span className="text-xs text-gray-500">No interactive blocks yet.</span>}
            {blockEntries.length > 0 && (
              <span className="text-xs text-gray-500">{blockEntries.length} block{blockEntries.length > 1 ? 's' : ''}</span>
            )}
          </div>
          {showBlocksPanel ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        </button>

        {showBlocksPanel && (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {blockEntries.map((entry, index) => (
                <button
                  key={entry.id}
                  type="button"
                  onClick={() => focusShortcode(entry)}
                  className={cn(
                    'inline-flex items-center rounded-full border bg-white px-2.5 py-1 text-xs hover:bg-gray-100',
                    entry.validationError ? 'border-amber-300 text-amber-800' : 'border-gray-300 text-gray-700'
                  )}
                >
                  {index + 1}. {entry.blockType.replaceAll('_', ' ')}
                </button>
              ))}
            </div>

            {blockEntries.length > 0 && (
              <div className="rounded-lg border border-gray-200 bg-white p-2">
                <div className="max-h-36 overflow-y-auto space-y-1">
                  {blockEntries.map((entry, index) => (
                    <div key={`row-${entry.id}`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50">
                      <div>
                        <p className="text-xs text-gray-700">
                          {index + 1}. {entry.blockType.replaceAll('_', ' ')}
                        </p>
                        {entry.validationError && (
                          <p className="text-[11px] text-amber-700">{entry.validationError}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <button type="button" onClick={() => focusShortcode(entry)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white">Go</button>
                        <button type="button" onClick={() => editShortcode(entry)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white">Edit</button>
                        <button type="button" onClick={() => duplicateShortcode(entry)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white">Duplicate</button>
                        <button type="button" onClick={() => saveBlockTemplate(entry, `${entry.blockType.replaceAll('_', ' ')} ${index + 1}`)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white">Save tpl</button>
                        <button type="button" onClick={() => moveShortcode(index, -1)} disabled={index === 0} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white disabled:opacity-40">Up</button>
                        <button type="button" onClick={() => moveShortcode(index, 1)} disabled={index === blockEntries.length - 1} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white disabled:opacity-40">Down</button>
                        <button type="button" onClick={() => deleteShortcode(entry)} className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50">Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="h-px bg-gray-200" />

        <button
          type="button"
          onClick={() => setShowBlockTemplatesPanel(prev => !prev)}
          className="w-full flex items-center justify-between rounded-md px-1 py-1 text-left hover:bg-gray-100/70"
          aria-expanded={showBlockTemplatesPanel}
        >
          <span className="text-xs font-semibold text-gray-700">Block Templates</span>
          {showBlockTemplatesPanel ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
        </button>

        {showBlockTemplatesPanel && (
          <div className="rounded-lg border border-gray-200 bg-white p-2 space-y-2">
            <input
              type="text"
              value={blockTemplateQuery}
              onChange={e => setBlockTemplateQuery(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
              placeholder="Search templates"
            />
            <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
              <select
                value={selectedBlockTemplateId}
                onChange={e => setSelectedBlockTemplateId(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
              >
                <option value="">Select saved block template</option>
                {filteredBlockTemplates.map(template => (
                  <option key={template.id} value={template.id}>
                    {template.name} ({template.blockType.replaceAll('_', ' ')})
                  </option>
                ))}
              </select>
              <button type="button" onClick={insertSelectedBlockTemplate} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">
                Insert
              </button>
              <button type="button" onClick={deleteSelectedBlockTemplate} className="px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50">
                Delete
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={exportBlockTemplates} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">
                Export
              </button>
              <button type="button" onClick={() => blockTemplatesFileInputRef.current?.click()} className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white">
                Import
              </button>
              <input
                ref={blockTemplatesFileInputRef}
                type="file"
                accept="application/json"
                onChange={importBlockTemplates}
                className="hidden"
              />
            </div>
            <div className="space-y-1">
              <input
                type="text"
                value={blockTemplateName}
                onChange={e => setBlockTemplateName(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                placeholder="Template name (used by Save tpl)"
              />
              <p className="text-xs text-gray-500">Set a name, then click `Save tpl` on any block row.</p>
            </div>
          </div>
        )}
      </div>

      {/* Editor Content */}
      <EditorContent editor={editor} />

      <div className="fixed bottom-6 left-6 z-20 flex items-end gap-2">
        <button
          type="button"
          onClick={() => setShowFormattingToolbar(prev => !prev)}
          className="rounded-full bg-white border border-gray-200 p-3 shadow-lg hover:bg-gray-50 text-gray-700 transition-colors"
          title="Toggle formatting toolbar"
        >
          {showFormattingToolbar ? <X size={20} /> : <Type size={20} />}
        </button>

        {showFormattingToolbar && (
          <div className="max-w-[calc(100vw-12rem)] overflow-x-auto rounded-2xl border border-gray-200 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200">
            <div className="flex items-center gap-0.5">
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

              {editor.isActive('image') && (
                <div className="ml-1 inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-1 py-0.5">
                  <button type="button" onClick={() => setSelectedImageWidth('40%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded hover:bg-gray-100">S</button>
                  <button type="button" onClick={() => setSelectedImageWidth('60%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded hover:bg-gray-100">M</button>
                  <button type="button" onClick={() => setSelectedImageWidth('80%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded hover:bg-gray-100">L</button>
                  <button type="button" onClick={() => setSelectedImageWidth('100%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded hover:bg-gray-100">Full</button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-6 right-6 z-20" ref={floatingPickerRef}>
        {showFloatingBlockPicker && (
          <div className="mb-2 w-64 rounded-lg border border-gray-200 bg-white shadow-lg p-2 space-y-1">
            <button type="button" onClick={() => openBlockModal('mcq')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><SquarePlus size={14} />MCQ</button>
            <button type="button" onClick={() => openBlockModal('audio')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><Headphones size={14} />Audio Player</button>
            <button type="button" onClick={() => openBlockModal('fill')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><FileQuestion size={14} />Fill In The Gaps</button>
            <button type="button" onClick={() => openBlockModal('dropdown')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><ListChecks size={14} />Dropdown Gaps</button>
            <button type="button" onClick={() => openBlockModal('truefalse')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><ToggleLeft size={14} />True / False</button>
            <button type="button" onClick={() => openBlockModal('matching')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><GitCompareArrows size={14} />Matching</button>
            <button type="button" onClick={() => openBlockModal('missingletters')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><AlignJustify size={14} />Missing Letters</button>
            <button type="button" onClick={() => openBlockModal('emailwriting')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><Mail size={14} />Email Writing</button>
            <button type="button" onClick={() => openBlockModal('cta')} className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"><Send size={14} />CTA Form</button>
          </div>
        )}
        <button
          type="button"
          onClick={() => setShowFloatingBlockPicker(prev => !prev)}
          className="inline-flex items-center gap-2 rounded-full bg-[#08507f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#063a5c]"
        >
          <SquarePlus size={16} />
          Insert Block
        </button>
      </div>

      {showImageLibraryModal && (
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Insert Image From Media</h3>
                <p className="text-xs text-gray-500 mt-1">Select an existing image from your media library.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const url = window.prompt('Enter image URL')
                    if (url) insertImageFromMedia(url)
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Use URL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowImageLibraryModal(false)
                    setMediaQuery('')
                  }}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Close
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={mediaQuery}
                onChange={e => setMediaQuery(e.target.value)}
                className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                placeholder="Search by filename..."
              />
              <button
                type="button"
                onClick={() => { void loadMediaResources() }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white"
              >
                Refresh
              </button>
            </div>

            {mediaError && (
              <p className="text-sm text-red-700">{mediaError}</p>
            )}

            {mediaLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, index) => (
                  <div key={`media-skeleton-${index}`} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
                ))}
              </div>
            ) : filteredMediaResources.length === 0 ? (
              <p className="text-sm text-gray-500 py-8 text-center">No images found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredMediaResources.map(resource => (
                  <button
                    key={resource.public_id}
                    type="button"
                    onClick={() => insertImageFromMedia(resource.secure_url)}
                    className="group text-left rounded-lg border border-gray-200 overflow-hidden hover:border-[#08507f]/50 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    title="Insert this image"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={resource.secure_url} alt={resource.public_id} className="w-full aspect-square object-cover bg-gray-100" />
                    <div className="px-2 py-1.5 bg-white">
                      <p className="text-[11px] text-gray-600 truncate">{resource.public_id.split('/').pop()}</p>
                      <p className="text-[10px] text-gray-400">{resource.width}x{resource.height}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {showMcqModal && (
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
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
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
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
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
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
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
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
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
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

      {showCtaModal && (
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
            <div>
              <h3 className="text-base font-semibold text-gray-900">Insert CTA Block</h3>
              <p className="text-xs text-gray-500 mt-1">Creates a lead form block inside your article.</p>
            </div>

            <div className="space-y-3">
              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                <p className="text-xs font-semibold text-gray-700">CTA Templates</p>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
                  <select
                    value={selectedCtaTemplateId}
                    onChange={e => setSelectedCtaTemplateId(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  >
                    <option value="">Select saved template</option>
                    {ctaTemplates.map(template => (
                      <option key={template.id} value={template.id}>{template.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={loadSelectedCtaTemplate}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white"
                  >
                    Load
                  </button>
                  <button
                    type="button"
                    onClick={deleteSelectedCtaTemplate}
                    className="px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
                  <input
                    type="text"
                    value={ctaTemplateName}
                    onChange={e => setCtaTemplateName(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Template name (e.g., IELTS Free Trial CTA)"
                  />
                  <button
                    type="button"
                    onClick={saveCurrentCtaTemplate}
                    className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white"
                  >
                    Save template
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title</label>
                <input
                  type="text"
                  value={ctaTitle}
                  onChange={e => setCtaTitle(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  placeholder="Need help with IELTS or PTE?"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={ctaDescription}
                  onChange={e => setCtaDescription(e.target.value)}
                  rows={3}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Button label</label>
                  <input
                    type="text"
                    value={ctaSubmitLabel}
                    onChange={e => setCtaSubmitLabel(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Get Free Consultation"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Source tag</label>
                  <input
                    type="text"
                    value={ctaSource}
                    onChange={e => setCtaSource(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="blog-cta"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={copyCtaShortcode}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Copy shortcode
              </button>
              <button
                type="button"
                onClick={() => {
                  resetCtaForm()
                  setShowCtaModal(false)
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertCtaBlock}
                className="px-3 py-2 text-sm rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]"
              >
                Insert block
              </button>
            </div>
          </div>
        </div>
      )}

      {showEmailWritingModal && (
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-3xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
            <div>
              <h3 className="text-base font-semibold text-gray-900">Insert Email Writing Block</h3>
              <p className="text-xs text-gray-500 mt-1">Creates a writing task and collects contact details before sending the response.</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Block title (optional)</label>
                <input
                  type="text"
                  value={emailWritingTitle}
                  onChange={e => setEmailWritingTitle(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  placeholder="Email Writing Practice"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prompt</label>
                <textarea
                  value={emailWritingPrompt}
                  onChange={e => setEmailWritingPrompt(e.target.value)}
                  rows={4}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
                  placeholder="Write an email to explain your issue and ask for clarification."
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">To (optional)</label>
                  <input
                    type="text"
                    value={emailWritingRecipient}
                    onChange={e => setEmailWritingRecipient(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="editor@example.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Subject (optional)</label>
                  <input
                    type="text"
                    value={emailWritingSubject}
                    onChange={e => setEmailWritingSubject(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Problem using submission form"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Instructions (optional)</label>
                <div className="space-y-2">
                  {emailWritingInstructions.map((item, index) => (
                    <div key={`email-writing-instruction-${index}`} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={item}
                        onChange={e => setEmailWritingInstructions(prev => prev.map((row, i) => (i === index ? e.target.value : row)))}
                        className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                        placeholder="Tell the editor what you like about the magazine."
                      />
                      <button
                        type="button"
                        onClick={() => setEmailWritingInstructions(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))}
                        className="px-2 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Remove instruction"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setEmailWritingInstructions(prev => [...prev, ''])}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
                  >
                    <Plus size={14} />
                    Add instruction
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Textarea placeholder</label>
                  <input
                    type="text"
                    value={emailWritingPlaceholder}
                    onChange={e => setEmailWritingPlaceholder(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Write your email response here..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Source tag</label>
                  <input
                    type="text"
                    value={emailWritingSource}
                    onChange={e => setEmailWritingSource(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="blog-email-writing"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">First button label</label>
                  <input
                    type="text"
                    value={emailWritingSubmitLabel}
                    onChange={e => setEmailWritingSubmitLabel(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Submit response"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Success message</label>
                  <input
                    type="text"
                    value={emailWritingSuccessMessage}
                    onChange={e => setEmailWritingSuccessMessage(e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Thanks. Your response has been submitted."
                  />
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-600">Collect contact fields on submit</p>
                <div className="flex flex-wrap gap-3 text-sm text-gray-700">
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={emailWritingCollectName} onChange={e => setEmailWritingCollectName(e.target.checked)} />
                    Name
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={emailWritingCollectEmail} onChange={e => setEmailWritingCollectEmail(e.target.checked)} />
                    Email
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input type="checkbox" checked={emailWritingCollectWhatsapp} onChange={e => setEmailWritingCollectWhatsapp(e.target.checked)} />
                    WhatsApp
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetEmailWritingForm()
                  setShowEmailWritingModal(false)
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertEmailWritingBlock}
                className="px-3 py-2 text-sm rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]"
              >
                Insert block
              </button>
            </div>
          </div>
        </div>
      )}

      {showMissingLettersModal && (
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
            <div>
              <h3 className="text-base font-semibold text-gray-900">Insert Missing Letters Block</h3>
              <p className="text-xs text-gray-500 mt-1">Use one line per item. Wrap missing letters in [[letters]].</p>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Title (optional)</label>
                <input
                  type="text"
                  value={missingLettersTitle}
                  onChange={e => setMissingLettersTitle(e.target.value)}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                  placeholder="Complete the words"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Items</label>
                <div className="space-y-2">
                  {missingLettersItems.map((row, index) => (
                    <div key={`missing-row-${index}`} className="flex items-start gap-2">
                      <input
                        type="text"
                        value={row}
                        onChange={e => setMissingLettersItems(prev => prev.map((item, i) => (i === index ? e.target.value : item)))}
                        className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                        placeholder="Archaeologists deter[[mined]] that..."
                      />
                      <button
                        type="button"
                        onClick={() => setMissingLettersItems(prev => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev))}
                        className="px-2 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => setMissingLettersItems(prev => [...prev, ''])}
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
                  value={missingLettersExplanation}
                  onChange={e => setMissingLettersExplanation(e.target.value)}
                  rows={2}
                  className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  resetMissingLettersForm()
                  setShowMissingLettersModal(false)
                }}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={insertMissingLettersBlock}
                className="px-3 py-2 text-sm rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]"
              >
                Insert block
              </button>
            </div>
          </div>
        </div>
      )}

      {showMatchingModal && (
        <div className="fixed inset-0 z-30 bg-black/30 p-4">
          <div
            className="absolute w-full max-w-2xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
            style={{ top: modalPosition?.top ?? 80, left: modalPosition?.left ?? 24 }}
          >
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

      <style jsx global>{`
        .ProseMirror p.shortcode-mask {
          color: transparent !important;
          background: #eef6fc;
          border: 1px solid #bfdaf1;
          border-radius: 0.75rem;
          padding: 0.65rem 0.8rem;
          margin: 0.75rem 0;
          min-height: 2.6rem;
          position: relative;
          user-select: none;
          cursor: pointer;
        }

        .ProseMirror p.shortcode-mask::before {
          content: attr(data-block-label);
          color: #08507f;
          font-size: 0.875rem;
          font-weight: 600;
          letter-spacing: 0.01em;
          position: absolute;
          left: 0.8rem;
          top: 0.62rem;
        }

        .ProseMirror p.shortcode-mask:hover {
          background: #e3f1fb;
          border-color: #8fbfe3;
        }

        .ProseMirror p.shortcode-mask:focus {
          outline: 2px solid #08507f;
          outline-offset: 1px;
        }

      `}</style>
    </div>
  )
}
