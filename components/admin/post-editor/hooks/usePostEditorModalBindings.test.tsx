import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { usePostEditorModalBindings } from './usePostEditorModalBindings'

function createParams() {
  return {
    mcqQuestion: 'What?',
    mcqOptionA: 'A',
    mcqOptionB: 'B',
    mcqOptionC: 'C',
    mcqOptionD: 'D',
    mcqCorrectIndex: 1,
    mcqExplanation: 'Because',
    resetMcqForm: vi.fn(),
    closeMcqModal: vi.fn(),
    audioSrc: 'audio.mp3',
    audioTitle: 'Audio',
    audioTranscript: 'Transcript',
    resetAudioForm: vi.fn(),
    closeAudioModal: vi.fn(),
    fillMode: 'sentences' as const,
    fillTitle: 'Fill',
    fillRows: ['row1'],
    fillExplanation: 'fill exp',
    resetFillForm: vi.fn(),
    closeFillGapsModal: vi.fn(),
    dropdownMode: 'paragraph' as const,
    dropdownTitle: 'Drop',
    dropdownRows: ['d1'],
    dropdownExplanation: 'drop exp',
    resetDropdownForm: vi.fn(),
    closeDropdownGapsModal: vi.fn(),
    trueFalseTitle: 'TF',
    trueFalseRows: [{ text: 'x', answer: true }],
    trueFalseExplanation: 'tf exp',
    resetTrueFalseForm: vi.fn(),
    closeTrueFalseModal: vi.fn(),
    matchingTitle: 'Match',
    matchingPrompt: 'Prompt',
    matchingRows: [{ left: 'L', right: 'R' }],
    matchingExplanation: 'match exp',
    resetMatchingForm: vi.fn(),
    closeMatchingModal: vi.fn(),
    ctaTitle: 'CTA',
    ctaDescription: 'Desc',
    ctaSubmitLabel: 'Submit',
    ctaSource: 'source',
    ctaBlockId: 'cta-1',
    ctaCollectName: true,
    ctaCollectEmail: false,
    ctaCollectWhatsapp: true,
    ctaTemplateName: 'tpl',
    resetCtaForm: vi.fn(),
    closeCtaModal: vi.fn(),
    emailWritingTitle: 'Email',
    emailWritingPrompt: 'Prompt',
    emailWritingRecipient: 'R',
    emailWritingSubject: 'S',
    emailWritingInstructions: ['i1'],
    emailWritingPlaceholder: 'ph',
    emailWritingSubmitLabel: 'send',
    emailWritingSuccessMessage: 'ok',
    emailWritingSource: 'es',
    emailWritingBlockId: 'e1',
    emailWritingCollectName: true,
    emailWritingCollectEmail: true,
    emailWritingCollectWhatsapp: false,
    resetEmailWritingForm: vi.fn(),
    closeEmailWritingModal: vi.fn(),
    missingLettersTitle: 'Missing',
    missingLettersItems: ['x'],
    missingLettersExplanation: 'm exp',
    resetMissingLettersForm: vi.fn(),
    closeMissingLettersModal: vi.fn(),
    dragSentenceTitle: 'Drag',
    dragSentenceItems: [{ speaker2Text: 'text', distractors: ['x'] }],
    dragSentenceExplanation: 'drag exp',
    resetDragSentenceForm: vi.fn(),
    closeDragSentenceModal: vi.fn(),
    closeImageLibraryModal: vi.fn(),
    setMediaQuery: vi.fn(),
  }
}

describe('usePostEditorModalBindings', () => {
  it('maps initial data for modal components', () => {
    const params = createParams()
    const { result } = renderHook(() => usePostEditorModalBindings(params))

    expect(result.current.mcqInitialData).toEqual({
      question: 'What?',
      optionA: 'A',
      optionB: 'B',
      optionC: 'C',
      optionD: 'D',
      correctIndex: 1,
      explanation: 'Because',
    })
    expect(result.current.ctaInitialData).toEqual({
      title: 'CTA',
      description: 'Desc',
      submitLabel: 'Submit',
      source: 'source',
      blockId: 'cta-1',
      collectName: true,
      collectEmail: false,
      collectWhatsapp: true,
      templateName: 'tpl',
    })
  })

  it('composes close handlers with reset and close side effects', () => {
    const params = createParams()
    const { result } = renderHook(() => usePostEditorModalBindings(params))

    act(() => {
      result.current.closeMcq()
      result.current.closeImageLibrary()
      result.current.closeDragSentence()
    })

    expect(params.resetMcqForm).toHaveBeenCalledOnce()
    expect(params.closeMcqModal).toHaveBeenCalledOnce()
    expect(params.closeImageLibraryModal).toHaveBeenCalledOnce()
    expect(params.setMediaQuery).toHaveBeenCalledWith('')
    expect(params.resetDragSentenceForm).toHaveBeenCalledOnce()
    expect(params.closeDragSentenceModal).toHaveBeenCalledOnce()
  })
})
