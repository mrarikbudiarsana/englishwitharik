interface UsePostEditorModalBindingsParams {
  mcqQuestion: string
  mcqOptionA: string
  mcqOptionB: string
  mcqOptionC: string
  mcqOptionD: string
  mcqCorrectIndex: number
  mcqExplanation: string
  resetMcqForm: () => void
  closeMcqModal: () => void
  audioSrc: string
  audioTitle: string
  audioTranscript: string
  resetAudioForm: () => void
  closeAudioModal: () => void
  fillMode: 'paragraph' | 'sentences'
  fillTitle: string
  fillRows: string[]
  fillExplanation: string
  resetFillForm: () => void
  closeFillGapsModal: () => void
  dropdownMode: 'paragraph' | 'sentences'
  dropdownTitle: string
  dropdownRows: string[]
  dropdownExplanation: string
  resetDropdownForm: () => void
  closeDropdownGapsModal: () => void
  trueFalseTitle: string
  trueFalseRows: Array<{ text: string; answer: boolean }>
  trueFalseExplanation: string
  resetTrueFalseForm: () => void
  closeTrueFalseModal: () => void
  matchingTitle: string
  matchingPrompt: string
  matchingRows: Array<{ left: string; right: string }>
  matchingExplanation: string
  resetMatchingForm: () => void
  closeMatchingModal: () => void
  ctaTitle: string
  ctaDescription: string
  ctaSubmitLabel: string
  ctaSource: string
  ctaBlockId: string
  ctaCollectName: boolean
  ctaCollectEmail: boolean
  ctaCollectWhatsapp: boolean
  ctaTemplateName: string
  resetCtaForm: () => void
  closeCtaModal: () => void
  emailWritingTitle: string
  emailWritingPrompt: string
  emailWritingRecipient: string
  emailWritingSubject: string
  emailWritingInstructions: string[]
  emailWritingPlaceholder: string
  emailWritingSubmitLabel: string
  emailWritingSuccessMessage: string
  emailWritingSource: string
  emailWritingBlockId: string
  emailWritingCollectName: boolean
  emailWritingCollectEmail: boolean
  emailWritingCollectWhatsapp: boolean
  resetEmailWritingForm: () => void
  closeEmailWritingModal: () => void
  missingLettersTitle: string
  missingLettersItems: string[]
  missingLettersExplanation: string
  resetMissingLettersForm: () => void
  closeMissingLettersModal: () => void
  dragSentenceTitle: string
  dragSentenceItems: Array<{
    speaker1Image?: string
    speaker1Text?: string
    speaker2Image?: string
    speaker2Text: string
    distractors: string[]
  }>
  dragSentenceExplanation: string
  resetDragSentenceForm: () => void
  closeDragSentenceModal: () => void
  closeImageLibraryModal: () => void
  setMediaQuery: (value: string) => void
}

export function usePostEditorModalBindings(params: UsePostEditorModalBindingsParams) {
  const mcqInitialData = {
    question: params.mcqQuestion,
    optionA: params.mcqOptionA,
    optionB: params.mcqOptionB,
    optionC: params.mcqOptionC,
    optionD: params.mcqOptionD,
    correctIndex: params.mcqCorrectIndex,
    explanation: params.mcqExplanation,
  }

  const audioInitialData = {
    src: params.audioSrc,
    title: params.audioTitle,
    transcript: params.audioTranscript,
  }

  const fillInitialData = {
    mode: params.fillMode,
    title: params.fillTitle,
    rows: params.fillRows,
    explanation: params.fillExplanation,
  }

  const dropdownInitialData = {
    mode: params.dropdownMode,
    title: params.dropdownTitle,
    rows: params.dropdownRows,
    explanation: params.dropdownExplanation,
  }

  const trueFalseInitialData = {
    title: params.trueFalseTitle,
    rows: params.trueFalseRows,
    explanation: params.trueFalseExplanation,
  }

  const ctaInitialData = {
    title: params.ctaTitle,
    description: params.ctaDescription,
    submitLabel: params.ctaSubmitLabel,
    source: params.ctaSource,
    blockId: params.ctaBlockId,
    collectName: params.ctaCollectName,
    collectEmail: params.ctaCollectEmail,
    collectWhatsapp: params.ctaCollectWhatsapp,
    templateName: params.ctaTemplateName,
  }

  const emailWritingInitialData = {
    title: params.emailWritingTitle,
    prompt: params.emailWritingPrompt,
    recipient: params.emailWritingRecipient,
    subject: params.emailWritingSubject,
    instructions: params.emailWritingInstructions,
    placeholder: params.emailWritingPlaceholder,
    submitLabel: params.emailWritingSubmitLabel,
    successMessage: params.emailWritingSuccessMessage,
    source: params.emailWritingSource,
    blockId: params.emailWritingBlockId,
    collectName: params.emailWritingCollectName,
    collectEmail: params.emailWritingCollectEmail,
    collectWhatsapp: params.emailWritingCollectWhatsapp,
  }

  const missingLettersInitialData = {
    title: params.missingLettersTitle,
    items: params.missingLettersItems,
    explanation: params.missingLettersExplanation,
  }

  const matchingInitialData = {
    title: params.matchingTitle,
    prompt: params.matchingPrompt,
    rows: params.matchingRows,
    explanation: params.matchingExplanation,
  }

  const dragSentenceInitialData = {
    title: params.dragSentenceTitle,
    items: params.dragSentenceItems,
    explanation: params.dragSentenceExplanation,
  }

  function closeImageLibrary() {
    params.closeImageLibraryModal()
    params.setMediaQuery('')
  }

  function closeMcq() {
    params.resetMcqForm()
    params.closeMcqModal()
  }

  function closeAudio() {
    params.resetAudioForm()
    params.closeAudioModal()
  }

  function closeFill() {
    params.resetFillForm()
    params.closeFillGapsModal()
  }

  function closeDropdown() {
    params.resetDropdownForm()
    params.closeDropdownGapsModal()
  }

  function closeTrueFalse() {
    params.resetTrueFalseForm()
    params.closeTrueFalseModal()
  }

  function closeCta() {
    params.resetCtaForm()
    params.closeCtaModal()
  }

  function closeEmailWriting() {
    params.resetEmailWritingForm()
    params.closeEmailWritingModal()
  }

  function closeMissingLetters() {
    params.resetMissingLettersForm()
    params.closeMissingLettersModal()
  }

  function closeMatching() {
    params.resetMatchingForm()
    params.closeMatchingModal()
  }

  function closeDragSentence() {
    params.resetDragSentenceForm()
    params.closeDragSentenceModal()
  }

  return {
    mcqInitialData,
    audioInitialData,
    fillInitialData,
    dropdownInitialData,
    trueFalseInitialData,
    ctaInitialData,
    emailWritingInitialData,
    missingLettersInitialData,
    matchingInitialData,
    dragSentenceInitialData,
    closeImageLibrary,
    closeMcq,
    closeAudio,
    closeFill,
    closeDropdown,
    closeTrueFalse,
    closeCta,
    closeEmailWriting,
    closeMissingLetters,
    closeMatching,
    closeDragSentence,
  }
}
