import { useState } from 'react'
import type { Editor } from '@tiptap/react'
import type { BlockModalType } from '../types'
import {
  DEFAULT_CTA_TITLE,
  DEFAULT_CTA_DESCRIPTION,
  DEFAULT_CTA_SUBMIT_LABEL,
  DEFAULT_CTA_SOURCE,
  DEFAULT_EMAIL_WRITING_TITLE,
  DEFAULT_EMAIL_WRITING_PLACEHOLDER,
  DEFAULT_EMAIL_WRITING_SUBMIT_LABEL,
  DEFAULT_EMAIL_WRITING_SUCCESS_MESSAGE,
  DEFAULT_EMAIL_WRITING_SOURCE,
  BLOCK_TYPE_MAP,
} from '../constants'
import { parseShortcodeConfig } from '../utils'

export function usePostEditorForms(editor: Editor | null) {
  const [dragSentenceTitle, setDragSentenceTitle] = useState('')
  const [dragSentenceItems, setDragSentenceItems] = useState<Array<{ speaker1Image?: string, speaker1Text?: string, speaker2Image?: string, speaker2Text: string, distractors: string[] }>>([
    { speaker2Text: '', distractors: [] },
  ])
  const [dragSentenceExplanation, setDragSentenceExplanation] = useState('')
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
  const [emailWritingTitle, setEmailWritingTitle] = useState(DEFAULT_EMAIL_WRITING_TITLE)
  const [emailWritingPrompt, setEmailWritingPrompt] = useState('')
  const [emailWritingRecipient, setEmailWritingRecipient] = useState('')
  const [emailWritingSubject, setEmailWritingSubject] = useState('')
  const [emailWritingInstructions, setEmailWritingInstructions] = useState<string[]>([''])
  const [emailWritingPlaceholder, setEmailWritingPlaceholder] = useState(DEFAULT_EMAIL_WRITING_PLACEHOLDER)
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
  const [collapsibleTitle, setCollapsibleTitle] = useState('')
  const [collapsibleContent, setCollapsibleContent] = useState('')
  const [editingShortcode, setEditingShortcode] = useState<{ from: number; to: number; blockType: string } | null>(null)

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
    setEmailWritingTitle(DEFAULT_EMAIL_WRITING_TITLE)
    setEmailWritingPrompt('')
    setEmailWritingRecipient('')
    setEmailWritingSubject('')
    setEmailWritingInstructions([''])
    setEmailWritingPlaceholder(DEFAULT_EMAIL_WRITING_PLACEHOLDER)
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

  function resetDragSentenceForm() {
    setDragSentenceTitle('')
    setDragSentenceItems([{ speaker2Text: '', distractors: [] }])
    setDragSentenceExplanation('')
    setEditingShortcode(null)
  }

  function resetCollapsibleForm() {
    setCollapsibleTitle('')
    setCollapsibleContent('')
    setEditingShortcode(null)
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

  function prepareModalForType(type: BlockModalType) {
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
      if (type === 'dragsentence') resetDragSentenceForm()
      if (type === 'collapsible') resetCollapsibleForm()
      return
    }

    if (context.blockType !== BLOCK_TYPE_MAP[type] || !context.config) {
      if (type === 'mcq') resetMcqForm()
      if (type === 'audio') resetAudioForm()
      if (type === 'fill') resetFillForm()
      if (type === 'dropdown') resetDropdownForm()
      if (type === 'truefalse') resetTrueFalseForm()
      if (type === 'matching') resetMatchingForm()
      if (type === 'cta') resetCtaForm()
      if (type === 'emailwriting') resetEmailWritingForm()
      if (type === 'missingletters') resetMissingLettersForm()
      if (type === 'dragsentence') resetDragSentenceForm()
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
      setEmailWritingTitle(typeof c.title === 'string' ? c.title : DEFAULT_EMAIL_WRITING_TITLE)
      setEmailWritingPrompt(typeof c.prompt === 'string' ? c.prompt : '')
      setEmailWritingRecipient(typeof c.recipient === 'string' ? c.recipient : '')
      setEmailWritingSubject(typeof c.subject === 'string' ? c.subject : '')
      setEmailWritingInstructions(instructions.length > 0 ? instructions : [''])
      setEmailWritingPlaceholder(typeof c.placeholder === 'string' ? c.placeholder : DEFAULT_EMAIL_WRITING_PLACEHOLDER)
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

    if (type === 'dragsentence') {
      setDragSentenceTitle(typeof c.title === 'string' ? c.title : '')
      const items = Array.isArray(c.items)
        ? c.items.map(item => {
          const i = item as Record<string, unknown>
          return {
            speaker1Image: String(i.speaker1Image || ''),
            speaker1Text: String(i.speaker1Text || ''),
            speaker2Image: String(i.speaker2Image || ''),
            speaker2Text: String(i.speaker2Text || ''),
            distractors: Array.isArray(i.distractors) ? i.distractors.map(String) : [],
          }
        })
        : [{ speaker2Text: '', distractors: [] }]
      setDragSentenceItems(items.length > 0 ? items : [{ speaker2Text: '', distractors: [] }])
      setDragSentenceExplanation(typeof c.explanation === 'string' ? c.explanation : '')
    }

    if (type === 'collapsible') {
      setCollapsibleTitle(typeof c.title === 'string' ? c.title : '')
      setCollapsibleContent(typeof c.content === 'string' ? c.content : '')
    }
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

  return {
    dragSentenceTitle,
    setDragSentenceTitle,
    dragSentenceItems,
    setDragSentenceItems,
    dragSentenceExplanation,
    setDragSentenceExplanation,
    mcqQuestion,
    setMcqQuestion,
    mcqOptionA,
    setMcqOptionA,
    mcqOptionB,
    setMcqOptionB,
    mcqOptionC,
    setMcqOptionC,
    mcqOptionD,
    setMcqOptionD,
    mcqCorrectIndex,
    setMcqCorrectIndex,
    mcqExplanation,
    setMcqExplanation,
    audioSrc,
    setAudioSrc,
    audioTitle,
    setAudioTitle,
    audioTranscript,
    setAudioTranscript,
    fillMode,
    setFillMode,
    fillTitle,
    setFillTitle,
    fillRows,
    setFillRows,
    fillExplanation,
    setFillExplanation,
    dropdownMode,
    setDropdownMode,
    dropdownTitle,
    setDropdownTitle,
    dropdownRows,
    setDropdownRows,
    dropdownExplanation,
    setDropdownExplanation,
    trueFalseTitle,
    setTrueFalseTitle,
    trueFalseRows,
    setTrueFalseRows,
    trueFalseExplanation,
    setTrueFalseExplanation,
    matchingTitle,
    setMatchingTitle,
    matchingPrompt,
    setMatchingPrompt,
    matchingRows,
    setMatchingRows,
    matchingExplanation,
    setMatchingExplanation,
    ctaTitle,
    setCtaTitle,
    ctaDescription,
    setCtaDescription,
    ctaSubmitLabel,
    setCtaSubmitLabel,
    ctaSource,
    setCtaSource,
    ctaBlockId,
    setCtaBlockId,
    ctaCollectName,
    setCtaCollectName,
    ctaCollectEmail,
    setCtaCollectEmail,
    ctaCollectWhatsapp,
    setCtaCollectWhatsapp,
    ctaTemplateName,
    setCtaTemplateName,
    emailWritingTitle,
    setEmailWritingTitle,
    emailWritingPrompt,
    setEmailWritingPrompt,
    emailWritingRecipient,
    setEmailWritingRecipient,
    emailWritingSubject,
    setEmailWritingSubject,
    emailWritingInstructions,
    setEmailWritingInstructions,
    emailWritingPlaceholder,
    setEmailWritingPlaceholder,
    emailWritingSubmitLabel,
    setEmailWritingSubmitLabel,
    emailWritingSuccessMessage,
    setEmailWritingSuccessMessage,
    emailWritingSource,
    setEmailWritingSource,
    emailWritingBlockId,
    setEmailWritingBlockId,
    emailWritingCollectName,
    setEmailWritingCollectName,
    emailWritingCollectEmail,
    setEmailWritingCollectEmail,
    emailWritingCollectWhatsapp,
    setEmailWritingCollectWhatsapp,
    missingLettersTitle,
    setMissingLettersTitle,
    missingLettersItems,
    setMissingLettersItems,
    missingLettersExplanation,
    setMissingLettersExplanation,
    collapsibleTitle,
    setCollapsibleTitle,
    collapsibleContent,
    setCollapsibleContent,
    editingShortcode,
    setEditingShortcode,
    resetMcqForm,
    resetAudioForm,
    resetFillForm,
    resetDropdownForm,
    resetTrueFalseForm,
    resetMatchingForm,
    resetCtaForm,
    resetEmailWritingForm,
    resetMissingLettersForm,
    resetDragSentenceForm,
    resetCollapsibleForm,
    prepareModalForType,
    getCtaConfig,
  }
}
