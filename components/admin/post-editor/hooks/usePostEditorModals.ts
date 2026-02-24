import { useCallback, useState } from 'react'
import type { Editor } from '@tiptap/react'
import type { BlockModalType, ModalPosition } from '../types'
import { computeModalPosition } from '../utils'

interface UsePostEditorModalsParams {
  editor: Editor | null
  onBeforeOpenBlockModal: (type: BlockModalType) => void
  onBeforeOpenAnyModal?: () => void
}

export function usePostEditorModals({
  editor,
  onBeforeOpenBlockModal,
  onBeforeOpenAnyModal,
}: UsePostEditorModalsParams) {
  const [modalPosition, setModalPosition] = useState<ModalPosition | null>(null)
  const [showMcqModal, setShowMcqModal] = useState(false)
  const [showAudioModal, setShowAudioModal] = useState(false)
  const [showFillGapsModal, setShowFillGapsModal] = useState(false)
  const [showDropdownGapsModal, setShowDropdownGapsModal] = useState(false)
  const [showTrueFalseModal, setShowTrueFalseModal] = useState(false)
  const [showMatchingModal, setShowMatchingModal] = useState(false)
  const [showCtaModal, setShowCtaModal] = useState(false)
  const [showEmailWritingModal, setShowEmailWritingModal] = useState(false)
  const [showMissingLettersModal, setShowMissingLettersModal] = useState(false)
  const [showDragSentenceModal, setShowDragSentenceModal] = useState(false)
  const [showCollapsibleModal, setShowCollapsibleModal] = useState(false)
  const [showImageLibraryModal, setShowImageLibraryModal] = useState(false)

  const openNearCursor = useCallback((open: () => void, panelWidth: number, panelHeight: number) => {
    setModalPosition(computeModalPosition(editor, panelWidth, panelHeight))
    open()
  }, [editor])

  const openBlockModal = useCallback((type: BlockModalType) => {
    onBeforeOpenAnyModal?.()
    onBeforeOpenBlockModal(type)
    if (type === 'mcq') openNearCursor(() => setShowMcqModal(true), 640, 620)
    if (type === 'audio') openNearCursor(() => setShowAudioModal(true), 640, 560)
    if (type === 'fill') openNearCursor(() => setShowFillGapsModal(true), 768, 760)
    if (type === 'dropdown') openNearCursor(() => setShowDropdownGapsModal(true), 768, 760)
    if (type === 'truefalse') openNearCursor(() => setShowTrueFalseModal(true), 768, 760)
    if (type === 'matching') openNearCursor(() => setShowMatchingModal(true), 768, 760)
    if (type === 'cta') openNearCursor(() => setShowCtaModal(true), 640, 520)
    if (type === 'emailwriting') openNearCursor(() => setShowEmailWritingModal(true), 900, 760)
    if (type === 'missingletters') openNearCursor(() => setShowMissingLettersModal(true), 768, 760)
    if (type === 'dragsentence') openNearCursor(() => setShowDragSentenceModal(true), 768, 760)
    if (type === 'collapsible') openNearCursor(() => setShowCollapsibleModal(true), 768, 480)
  }, [onBeforeOpenAnyModal, onBeforeOpenBlockModal, openNearCursor])

  const openImageLibraryModal = useCallback(() => {
    onBeforeOpenAnyModal?.()
    openNearCursor(() => setShowImageLibraryModal(true), 900, 680)
  }, [onBeforeOpenAnyModal, openNearCursor])

  return {
    modalPosition,
    showMcqModal,
    showAudioModal,
    showFillGapsModal,
    showDropdownGapsModal,
    showTrueFalseModal,
    showMatchingModal,
    showCtaModal,
    showEmailWritingModal,
    showMissingLettersModal,
    showDragSentenceModal,
    showCollapsibleModal,
    showImageLibraryModal,
    openBlockModal,
    openImageLibraryModal,
    closeMcqModal: () => setShowMcqModal(false),
    closeAudioModal: () => setShowAudioModal(false),
    closeFillGapsModal: () => setShowFillGapsModal(false),
    closeDropdownGapsModal: () => setShowDropdownGapsModal(false),
    closeTrueFalseModal: () => setShowTrueFalseModal(false),
    closeMatchingModal: () => setShowMatchingModal(false),
    closeCtaModal: () => setShowCtaModal(false),
    closeEmailWritingModal: () => setShowEmailWritingModal(false),
    closeMissingLettersModal: () => setShowMissingLettersModal(false),
    closeDragSentenceModal: () => setShowDragSentenceModal(false),
    closeCollapsibleModal: () => setShowCollapsibleModal(false),
    closeImageLibraryModal: () => setShowImageLibraryModal(false),
  }
}
