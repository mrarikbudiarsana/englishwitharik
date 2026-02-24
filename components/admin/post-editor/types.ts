import type { Editor } from '@tiptap/react'

export interface PostEditorProps {
  content: string
  onChange: (html: string) => void
}

export interface CtaTemplate {
  id: string
  name: string
  title: string
  description: string
  submitLabel: string
  source: string
}

export interface BlockTemplate {
  id: string
  name: string
  blockType: string
  shortcode: string
  remote?: boolean
}

export interface ShortcodeEntry {
  id: string
  blockType: string
  shortcode: string
  from: number
  to: number
  validationError?: string
}

export interface CloudinaryResource {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
}

export interface ModalPosition {
  top: number
  left: number
}

export type BlockModalType =
  | 'mcq'
  | 'audio'
  | 'fill'
  | 'dropdown'
  | 'truefalse'
  | 'matching'
  | 'cta'
  | 'emailwriting'
  | 'missingletters'
  | 'dragsentence'
  | 'collapsible'

export interface McqFormState {
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctIndex: number
  explanation: string
}

export interface AudioFormState {
  src: string
  title: string
  transcript: string
}

export interface FillGapsFormState {
  mode: 'paragraph' | 'sentences'
  title: string
  rows: string[]
  explanation: string
}

export interface DropdownGapsFormState {
  mode: 'paragraph' | 'sentences'
  title: string
  rows: string[]
  explanation: string
}

export interface TrueFalseFormState {
  title: string
  rows: Array<{ text: string; answer: boolean }>
  explanation: string
}

export interface MatchingFormState {
  title: string
  prompt: string
  rows: Array<{ left: string; right: string }>
  explanation: string
}

export interface CtaFormState {
  title: string
  description: string
  submitLabel: string
  source: string
  blockId: string
  collectName: boolean
  collectEmail: boolean
  collectWhatsapp: boolean
  templateName: string
}

export interface EmailWritingFormState {
  title: string
  prompt: string
  recipient: string
  subject: string
  instructions: string[]
  placeholder: string
  submitLabel: string
  successMessage: string
  source: string
  blockId: string
  collectName: boolean
  collectEmail: boolean
  collectWhatsapp: boolean
}

export interface MissingLettersFormState {
  title: string
  items: string[]
  explanation: string
}

export interface DragSentenceItem {
  speaker1Image?: string
  speaker1Text?: string
  speaker2Image?: string
  speaker2Text: string
  distractors: string[]
}

export interface DragSentenceFormState {
  title: string
  items: DragSentenceItem[]
  explanation: string
}

export interface CollapsibleFormState {
  title: string
  content: string
}

export interface EditorContextValue {
  editor: Editor | null
  insertShortcodeBlock: (blockType: string, config: Record<string, unknown>) => void
  openBlockModal: (type: BlockModalType) => void
  editingShortcode: { from: number; to: number; blockType: string } | null
  setEditingShortcode: (value: { from: number; to: number; blockType: string } | null) => void
  modalPosition: ModalPosition | null
}
