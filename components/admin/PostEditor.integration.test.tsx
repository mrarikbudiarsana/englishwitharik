import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import PostEditor from './PostEditor'

const chainMock = {
  focus: vi.fn(),
  insertContentAt: vi.fn(),
  insertContent: vi.fn(),
  setLink: vi.fn(),
  setImage: vi.fn(),
  updateAttributes: vi.fn(),
  run: vi.fn(),
}

chainMock.focus.mockReturnValue(chainMock)
chainMock.insertContentAt.mockReturnValue(chainMock)
chainMock.insertContent.mockReturnValue(chainMock)
chainMock.setLink.mockReturnValue(chainMock)
chainMock.setImage.mockReturnValue(chainMock)
chainMock.updateAttributes.mockReturnValue(chainMock)
chainMock.run.mockReturnValue(true)

const editorMock = {
  chain: vi.fn(() => chainMock),
  isActive: vi.fn(() => false),
  state: { selection: { from: 1 } },
  view: { coordsAtPos: vi.fn(() => ({ top: 10, left: 10, bottom: 20 })) },
}

const setEditingShortcodeMock = vi.fn()
let editingShortcodeState: { from: number; to: number; blockType: string } | null = null

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => editorMock),
  EditorContent: () => <div data-testid="editor-content" />,
}))

vi.mock('@tiptap/starter-kit', () => ({
  default: { configure: vi.fn(() => ({})) },
}))

vi.mock('@tiptap/extension-link', () => ({
  default: { configure: vi.fn(() => ({})) },
}))

vi.mock('@tiptap/extension-underline', () => ({
  default: {},
}))

vi.mock('@tiptap/extension-image', () => ({
  default: { extend: vi.fn(() => ({ configure: vi.fn(() => ({})) })) },
}))

vi.mock('@tiptap/extension-placeholder', () => ({
  default: { configure: vi.fn(() => ({})) },
}))

vi.mock('@tiptap/extension-table', () => ({
  Table: { configure: vi.fn(() => ({})) },
}))

vi.mock('@tiptap/extension-table-row', () => ({
  TableRow: {},
}))

vi.mock('@tiptap/extension-table-cell', () => ({
  TableCell: {},
}))

vi.mock('@tiptap/extension-table-header', () => ({
  TableHeader: {},
}))

vi.mock('@/lib/interactive/editorSanitizer', () => ({
  sanitizeEditorArtifacts: (html: string) => html,
}))

vi.mock('./post-editor/components/EditorToolbar', () => ({
  EditorToolbar: () => <div data-testid="toolbar" />,
}))

vi.mock('./post-editor/components/BlocksPanel', () => ({
  BlocksPanel: () => <div data-testid="blocks-panel" />,
}))

vi.mock('./post-editor/components/BlockTemplatesPanel', () => ({
  BlockTemplatesPanel: () => <div data-testid="block-templates-panel" />,
}))

vi.mock('./post-editor/components/FloatingToolbar', () => ({
  FloatingToolbar: () => null,
}))

vi.mock('./post-editor/components/FloatingBlockPicker', () => ({
  FloatingBlockPicker: () => null,
}))

vi.mock('./post-editor/modals', () => ({
  McqModal: (props: { isOpen: boolean; onInsert: (config: Record<string, unknown>) => void }) => (
    props.isOpen ? <button onClick={() => props.onInsert({ question: 'Edited Q' })}>Insert MCQ</button> : null
  ),
  ReadingMcqModal: () => null,
  AudioModal: () => null,
  FillGapsModal: () => null,
  DropdownGapsModal: () => null,
  TrueFalseModal: () => null,
  MatchingModal: () => null,
  CtaModal: () => null,
  EmailWritingModal: () => null,
  MissingLettersModal: () => null,
  DragSentenceModal: () => null,
  CollapsibleModal: () => null,
  ImageLibraryModal: () => null,
}))

vi.mock('./post-editor/hooks', async () => {
  const actual = await vi.importActual<typeof import('./post-editor/hooks')>('./post-editor/hooks')
  return {
    ...actual,
    usePostEditorForms: vi.fn(() => ({
      dragSentenceTitle: '',
      dragSentenceItems: [{ speaker2Text: '', distractors: [] }],
      dragSentenceExplanation: '',
      mcqQuestion: '',
      mcqOptionA: '',
      mcqOptionB: '',
      mcqOptionC: '',
      mcqOptionD: '',
      mcqCorrectIndex: 0,
      mcqExplanation: '',
      audioSrc: '',
      audioTitle: '',
      audioTranscript: '',
      fillMode: 'sentences',
      fillTitle: '',
      fillRows: [''],
      fillExplanation: '',
      dropdownMode: 'sentences',
      dropdownTitle: '',
      dropdownRows: [''],
      dropdownExplanation: '',
      trueFalseTitle: '',
      trueFalseRows: [{ text: '', answer: true }],
      trueFalseExplanation: '',
      matchingTitle: '',
      matchingPrompt: '',
      matchingRows: [{ left: '', right: '' }],
      matchingExplanation: '',
      ctaTitle: 'CTA',
      setCtaTitle: vi.fn(),
      ctaDescription: '',
      setCtaDescription: vi.fn(),
      ctaSubmitLabel: '',
      setCtaSubmitLabel: vi.fn(),
      ctaSource: '',
      setCtaSource: vi.fn(),
      ctaBlockId: '',
      setCtaBlockId: vi.fn(),
      ctaCollectName: true,
      setCtaCollectName: vi.fn(),
      ctaCollectEmail: true,
      setCtaCollectEmail: vi.fn(),
      ctaCollectWhatsapp: true,
      setCtaCollectWhatsapp: vi.fn(),
      ctaTemplateName: '',
      setCtaTemplateName: vi.fn(),
      emailWritingTitle: '',
      emailWritingPrompt: '',
      emailWritingRecipient: '',
      emailWritingSubject: '',
      emailWritingInstructions: [''],
      emailWritingPlaceholder: '',
      emailWritingSubmitLabel: '',
      emailWritingSuccessMessage: '',
      emailWritingSource: '',
      emailWritingBlockId: '',
      emailWritingCollectName: true,
      emailWritingCollectEmail: true,
      emailWritingCollectWhatsapp: true,
      missingLettersTitle: '',
      missingLettersItems: [''],
      missingLettersExplanation: '',
      editingShortcode: editingShortcodeState,
      setEditingShortcode: setEditingShortcodeMock,
      resetMcqForm: vi.fn(),
      resetAudioForm: vi.fn(),
      resetFillForm: vi.fn(),
      resetDropdownForm: vi.fn(),
      resetTrueFalseForm: vi.fn(),
      resetMatchingForm: vi.fn(),
      resetCtaForm: vi.fn(),
      resetEmailWritingForm: vi.fn(),
      resetMissingLettersForm: vi.fn(),
      resetDragSentenceForm: vi.fn(),
      prepareModalForType: vi.fn(),
      getCtaConfig: vi.fn(() => ({ blockId: 'cta-1', config: { title: 'CTA' } })),
    })),
    usePostEditorModals: vi.fn(() => ({
      modalPosition: null,
      showMcqModal: true,
      showReadingMcqModal: false,
      showAudioModal: false,
      showFillGapsModal: false,
      showDropdownGapsModal: false,
      showTrueFalseModal: false,
      showMatchingModal: false,
      showCtaModal: false,
      showEmailWritingModal: false,
      showMissingLettersModal: false,
      showDragSentenceModal: false,
      showCollapsibleModal: false,
      showImageLibraryModal: false,
      openBlockModal: vi.fn(),
      openImageLibraryModal: vi.fn(),
      closeMcqModal: vi.fn(),
      closeReadingMcqModal: vi.fn(),
      closeAudioModal: vi.fn(),
      closeFillGapsModal: vi.fn(),
      closeDropdownGapsModal: vi.fn(),
      closeTrueFalseModal: vi.fn(),
      closeMatchingModal: vi.fn(),
      closeCtaModal: vi.fn(),
      closeEmailWritingModal: vi.fn(),
      closeMissingLettersModal: vi.fn(),
      closeDragSentenceModal: vi.fn(),
      closeCollapsibleModal: vi.fn(),
      closeImageLibraryModal: vi.fn(),
    })),
    useBlockEntries: vi.fn(() => ({
      blockEntries: [],
      focusShortcode: vi.fn(),
      editShortcode: vi.fn(),
      duplicateShortcode: vi.fn(),
      moveShortcode: vi.fn(),
      deleteShortcode: vi.fn(),
    })),
    useCtaTemplates: vi.fn(() => ({
      ctaTemplates: [],
      selectedCtaTemplateId: '',
      setSelectedCtaTemplateId: vi.fn(),
      saveCtaTemplate: vi.fn(() => true),
      loadCtaTemplate: vi.fn(() => null),
      deleteCtaTemplate: vi.fn(),
    })),
    useBlockTemplates: vi.fn(() => ({
      blockTemplates: [],
      filteredBlockTemplates: [],
      selectedBlockTemplateId: '',
      setSelectedBlockTemplateId: vi.fn(),
      blockTemplateQuery: '',
      setBlockTemplateQuery: vi.fn(),
      blockTemplateName: '',
      setBlockTemplateName: vi.fn(),
      fileInputRef: { current: null },
      saveBlockTemplate: vi.fn(),
      deleteBlockTemplate: vi.fn(),
      exportBlockTemplates: vi.fn(),
      importBlockTemplates: vi.fn(),
    })),
    useMediaLibrary: vi.fn(() => ({
      filteredMediaResources: [],
      mediaLoading: false,
      mediaQuery: '',
      setMediaQuery: vi.fn(),
      mediaError: null,
      loadMediaResources: vi.fn(async () => { }),
    })),
    usePostEditorModalBindings: vi.fn(() => ({
      mcqInitialData: {
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctIndex: 0,
        explanation: '',
      },
      readingMcqInitialData: {
        text: '',
        question: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctIndex: 0,
        explanation: '',
      },
      audioInitialData: { src: '', title: '', transcript: '' },
      fillInitialData: { mode: 'sentences', title: '', rows: [''], explanation: '' },
      dropdownInitialData: { mode: 'sentences', title: '', rows: [''], explanation: '' },
      trueFalseInitialData: { title: '', rows: [{ text: '', answer: true }], explanation: '' },
      ctaInitialData: {
        title: '',
        description: '',
        submitLabel: '',
        source: '',
        blockId: '',
        collectName: true,
        collectEmail: true,
        collectWhatsapp: true,
        templateName: '',
      },
      emailWritingInitialData: {
        title: '',
        prompt: '',
        recipient: '',
        subject: '',
        instructions: [''],
        placeholder: '',
        submitLabel: '',
        successMessage: '',
        source: '',
        blockId: '',
        collectName: true,
        collectEmail: true,
        collectWhatsapp: true,
      },
      missingLettersInitialData: { title: '', items: [''], explanation: '' },
      matchingInitialData: { title: '', prompt: '', rows: [{ left: '', right: '' }], explanation: '' },
      dragSentenceInitialData: { title: '', items: [{ speaker2Text: '', distractors: [] }], explanation: '' },
      collapsibleInitialData: { title: '', content: '' },
      closeImageLibrary: vi.fn(),
      closeMcq: vi.fn(),
      closeReadingMcq: vi.fn(),
      closeAudio: vi.fn(),
      closeFill: vi.fn(),
      closeDropdown: vi.fn(),
      closeTrueFalse: vi.fn(),
      closeCta: vi.fn(),
      closeEmailWriting: vi.fn(),
      closeMissingLetters: vi.fn(),
      closeMatching: vi.fn(),
      closeDragSentence: vi.fn(),
      closeCollapsible: vi.fn(),
    })),
  }
})

describe('PostEditor integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    editingShortcodeState = { from: 11, to: 33, blockType: 'mcq' }
    vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
      const msg = String(args[0] ?? '')
      if (msg.includes('non-boolean attribute `jsx`') || msg.includes('non-boolean attribute `global`')) {
        return
      }
      console.warn(...args)
    })
  })

  it('replaces an existing shortcode in place when saving the edited MCQ block', () => {
    render(<PostEditor content="<p>initial</p>" onChange={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Insert MCQ' }))

    const expectedShortcode = `[block:mcq:${encodeURIComponent(JSON.stringify({ question: 'Edited Q' }))}]`
    expect(chainMock.insertContentAt).toHaveBeenCalledWith({ from: 11, to: 33 }, expectedShortcode)
    expect(setEditingShortcodeMock).toHaveBeenCalledWith(null)
    expect(chainMock.insertContent).not.toHaveBeenCalled()
  })

  it('inserts a new shortcode paragraph when not editing an existing block', () => {
    editingShortcodeState = null
    render(<PostEditor content="<p>initial</p>" onChange={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Insert MCQ' }))

    const expectedShortcode = `[block:mcq:${encodeURIComponent(JSON.stringify({ question: 'Edited Q' }))}]`
    expect(chainMock.insertContent).toHaveBeenCalledWith(`<p>${expectedShortcode}</p>`)
    expect(chainMock.insertContentAt).not.toHaveBeenCalled()
  })
})
