'use client'

import { useEffect, useRef, useState } from 'react'
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
import { sanitizeEditorArtifacts } from '@/lib/interactive/editorSanitizer'
import type { PostEditorProps, ShortcodeEntry } from './post-editor/types'
import {
  BLOCKS_PANEL_COLLAPSED_KEY,
  BLOCK_TEMPLATES_PANEL_COLLAPSED_KEY,
} from './post-editor/constants'
import { useCtaTemplates, useBlockTemplates, useMediaLibrary, usePostEditorModals, useBlockEntries, usePostEditorForms, usePostEditorActions, usePostEditorModalBindings } from './post-editor/hooks'
import { EditorToolbar } from './post-editor/components/EditorToolbar'
import { BlocksPanel } from './post-editor/components/BlocksPanel'
import { BlockTemplatesPanel } from './post-editor/components/BlockTemplatesPanel'
import { FloatingToolbar } from './post-editor/components/FloatingToolbar'
import { FloatingBlockPicker } from './post-editor/components/FloatingBlockPicker'
import {
  McqModal,
  AudioModal,
  FillGapsModal,
  DropdownGapsModal,
  TrueFalseModal,
  MatchingModal,
  CtaModal,
  EmailWritingModal,
  MissingLettersModal,
  DragSentenceModal,
  ImageLibraryModal,
} from './post-editor/modals'

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
  const [showFloatingBlockPicker, setShowFloatingBlockPicker] = useState(false)
  const [showFormattingToolbar, setShowFormattingToolbar] = useState(false)
  // Editor instance and core HTML synchronization.
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
      Placeholder.configure({ placeholder: 'Start writing your post...' }),
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
    },
    editorProps: {
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-5',
      },
    },
  })
  // Interactive-block form state and reset/prefill helpers.
  const {
    dragSentenceTitle,
    dragSentenceItems,
    dragSentenceExplanation,
    mcqQuestion,
    mcqOptionA,
    mcqOptionB,
    mcqOptionC,
    mcqOptionD,
    mcqCorrectIndex,
    mcqExplanation,
    audioSrc,
    audioTitle,
    audioTranscript,
    fillMode,
    fillTitle,
    fillRows,
    fillExplanation,
    dropdownMode,
    dropdownTitle,
    dropdownRows,
    dropdownExplanation,
    trueFalseTitle,
    trueFalseRows,
    trueFalseExplanation,
    matchingTitle,
    matchingPrompt,
    matchingRows,
    matchingExplanation,
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
    emailWritingPrompt,
    emailWritingRecipient,
    emailWritingSubject,
    emailWritingInstructions,
    emailWritingPlaceholder,
    emailWritingSubmitLabel,
    emailWritingSuccessMessage,
    emailWritingSource,
    emailWritingBlockId,
    emailWritingCollectName,
    emailWritingCollectEmail,
    emailWritingCollectWhatsapp,
    missingLettersTitle,
    missingLettersItems,
    missingLettersExplanation,
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
    prepareModalForType,
    getCtaConfig,
  } = usePostEditorForms(editor)
  // Persisted panel visibility state.
  const [showBlocksPanel, setShowBlocksPanel] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      return window.localStorage.getItem(BLOCKS_PANEL_COLLAPSED_KEY) !== 'true'
    } catch {
      return true
    }
  })
  const [showBlockTemplatesPanel, setShowBlockTemplatesPanel] = useState(() => {
    if (typeof window === 'undefined') return true
    try {
      return window.localStorage.getItem(BLOCK_TEMPLATES_PANEL_COLLAPSED_KEY) !== 'true'
    } catch {
      return true
    }
  })
  const editorShellRef = useRef<HTMLDivElement | null>(null)

  // Template and media data sources.
  const {
    ctaTemplates,
    selectedCtaTemplateId,
    setSelectedCtaTemplateId,
    saveCtaTemplate,
    loadCtaTemplate,
    deleteCtaTemplate,
  } = useCtaTemplates()

  const {
    blockTemplates,
    filteredBlockTemplates,
    selectedBlockTemplateId,
    setSelectedBlockTemplateId,
    blockTemplateQuery,
    setBlockTemplateQuery,
    blockTemplateName,
    setBlockTemplateName,
    fileInputRef: blockTemplatesFileInputRef,
    saveBlockTemplate,
    deleteBlockTemplate,
    exportBlockTemplates,
    importBlockTemplates,
  } = useBlockTemplates()

  const {
    filteredMediaResources,
    mediaLoading,
    mediaQuery,
    setMediaQuery,
    mediaError,
    loadMediaResources,
  } = useMediaLibrary()

  // Modal visibility, placement, and open/close handlers.
  const {
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
    showImageLibraryModal,
    openBlockModal,
    openImageLibraryModal,
    closeMcqModal,
    closeAudioModal,
    closeFillGapsModal,
    closeDropdownGapsModal,
    closeTrueFalseModal,
    closeMatchingModal,
    closeCtaModal,
    closeEmailWritingModal,
    closeMissingLettersModal,
    closeDragSentenceModal,
    closeImageLibraryModal,
  } = usePostEditorModals({
    editor,
    onBeforeOpenBlockModal: prepareModalForType,
    onBeforeOpenAnyModal: () => setShowFloatingBlockPicker(false),
  })

  // Parsed shortcode entries and list operations.
  const {
    blockEntries,
    focusShortcode,
    editShortcode,
    duplicateShortcode,
    moveShortcode,
    deleteShortcode,
  } = useBlockEntries(editor, { onOpenBlockModal: openBlockModal })

  // Editor actions extracted from the orchestrator component.
  const {
    addLink,
    addImage,
    setSelectedImageWidth,
    insertImageFromMedia,
    copyCtaShortcode,
    insertShortcodeBlock,
    saveCurrentCtaTemplate,
    loadSelectedCtaTemplate,
    deleteSelectedCtaTemplate,
    insertSelectedBlockTemplate,
  } = usePostEditorActions({
    editor,
    editingShortcode,
    setEditingShortcode,
    getCtaConfig,
    ctaTemplateName,
    setCtaTemplateName,
    ctaTitle,
    setCtaTitle,
    ctaDescription,
    setCtaDescription,
    ctaSubmitLabel,
    setCtaSubmitLabel,
    ctaSource,
    setCtaSource,
    setCtaBlockId,
    setCtaCollectName,
    setCtaCollectEmail,
    setCtaCollectWhatsapp,
    selectedCtaTemplateId,
    saveCtaTemplate,
    loadCtaTemplate,
    deleteCtaTemplate,
    openImageLibraryModal,
    closeImageLibraryModal,
    loadMediaResources,
    blockTemplates,
    selectedBlockTemplateId,
  })

  // Modal initial values and close handlers composed for concise JSX.
  const {
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
  } = usePostEditorModalBindings({
    mcqQuestion,
    mcqOptionA,
    mcqOptionB,
    mcqOptionC,
    mcqOptionD,
    mcqCorrectIndex,
    mcqExplanation,
    resetMcqForm,
    closeMcqModal,
    audioSrc,
    audioTitle,
    audioTranscript,
    resetAudioForm,
    closeAudioModal,
    fillMode,
    fillTitle,
    fillRows,
    fillExplanation,
    resetFillForm,
    closeFillGapsModal,
    dropdownMode,
    dropdownTitle,
    dropdownRows,
    dropdownExplanation,
    resetDropdownForm,
    closeDropdownGapsModal,
    trueFalseTitle,
    trueFalseRows,
    trueFalseExplanation,
    resetTrueFalseForm,
    closeTrueFalseModal,
    matchingTitle,
    matchingPrompt,
    matchingRows,
    matchingExplanation,
    resetMatchingForm,
    closeMatchingModal,
    ctaTitle,
    ctaDescription,
    ctaSubmitLabel,
    ctaSource,
    ctaBlockId,
    ctaCollectName,
    ctaCollectEmail,
    ctaCollectWhatsapp,
    ctaTemplateName,
    resetCtaForm,
    closeCtaModal,
    emailWritingTitle,
    emailWritingPrompt,
    emailWritingRecipient,
    emailWritingSubject,
    emailWritingInstructions,
    emailWritingPlaceholder,
    emailWritingSubmitLabel,
    emailWritingSuccessMessage,
    emailWritingSource,
    emailWritingBlockId,
    emailWritingCollectName,
    emailWritingCollectEmail,
    emailWritingCollectWhatsapp,
    resetEmailWritingForm,
    closeEmailWritingModal,
    missingLettersTitle,
    missingLettersItems,
    missingLettersExplanation,
    resetMissingLettersForm,
    closeMissingLettersModal,
    dragSentenceTitle,
    dragSentenceItems,
    dragSentenceExplanation,
    resetDragSentenceForm,
    closeDragSentenceModal,
    closeImageLibraryModal,
    setMediaQuery,
  })

  // Persist panel collapse state between sessions.
  useEffect(() => {
    try {
      window.localStorage.setItem(BLOCKS_PANEL_COLLAPSED_KEY, showBlocksPanel ? 'false' : 'true')
      window.localStorage.setItem(BLOCK_TEMPLATES_PANEL_COLLAPSED_KEY, showBlockTemplatesPanel ? 'false' : 'true')
    } catch {
      // Ignore storage errors and continue.
    }
  }, [showBlocksPanel, showBlockTemplatesPanel])

  // Mark shortcode paragraphs so they are visible and interactive in the editor.
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

  // Forward click/keyboard interactions on rendered block masks.
  useEffect(() => {
    const root = editorShellRef.current?.querySelector('.ProseMirror') as HTMLElement | null
    if (!root) return

    function openEntryEditor(entry: ShortcodeEntry) {
      editShortcode(entry)
    }

    function handleInteractiveBlockClick(event: Event) {
      const target = event.target as HTMLElement | null
      const block = target?.closest('p.shortcode-mask') as HTMLElement | null
      if (!block) return
      const blockId = block.getAttribute('data-block-id')
      if (!blockId) return
      const entry = blockEntries.find(item => item.id === blockId)
      if (!entry) return
      event.preventDefault()
      openEntryEditor(entry)
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
      openEntryEditor(entry)
    }

    root.addEventListener('click', handleInteractiveBlockClick)
    root.addEventListener('keydown', handleInteractiveBlockKeydown)
    return () => {
      root.removeEventListener('click', handleInteractiveBlockClick)
      root.removeEventListener('keydown', handleInteractiveBlockKeydown)
    }
  }, [blockEntries, editShortcode])

  if (!editor) return null

  return (
    <div ref={editorShellRef} className="border border-gray-200 rounded-xl overflow-hidden bg-white relative">
      <EditorToolbar
        editor={editor}
        onAddLink={addLink}
        onAddImage={addImage}
        onOpenBlockModal={openBlockModal}
        onSetImageWidth={setSelectedImageWidth}
      />

      <div className="border-b border-gray-200 bg-gray-50/70 px-3 py-2 space-y-2">
        <BlocksPanel
          isOpen={showBlocksPanel}
          onToggle={() => setShowBlocksPanel(prev => !prev)}
          blockEntries={blockEntries}
          onFocus={focusShortcode}
          onEdit={editShortcode}
          onDuplicate={duplicateShortcode}
          onSaveTemplate={saveBlockTemplate}
          onMoveUp={index => moveShortcode(index, -1)}
          onMoveDown={index => moveShortcode(index, 1)}
          onDelete={deleteShortcode}
        />

        <div className="h-px bg-gray-200" />

        <BlockTemplatesPanel
          isOpen={showBlockTemplatesPanel}
          onToggle={() => setShowBlockTemplatesPanel(prev => !prev)}
          templates={filteredBlockTemplates}
          selectedTemplateId={selectedBlockTemplateId}
          onSelectTemplate={setSelectedBlockTemplateId}
          query={blockTemplateQuery}
          onQueryChange={setBlockTemplateQuery}
          templateName={blockTemplateName}
          onTemplateNameChange={setBlockTemplateName}
          onInsertTemplate={insertSelectedBlockTemplate}
          onDeleteTemplate={deleteBlockTemplate}
          onExport={exportBlockTemplates}
          onImportClick={() => blockTemplatesFileInputRef.current?.click()}
          fileInputRef={blockTemplatesFileInputRef}
          onImport={importBlockTemplates}
        />
      </div>

      <EditorContent editor={editor} />

      <FloatingToolbar
        editor={editor}
        isOpen={showFormattingToolbar}
        onToggle={() => setShowFormattingToolbar(prev => !prev)}
        onAddLink={addLink}
        onAddImage={addImage}
        onSetImageWidth={setSelectedImageWidth}
      />

      <FloatingBlockPicker
        isOpen={showFloatingBlockPicker}
        onToggle={() => setShowFloatingBlockPicker(prev => !prev)}
        onSelect={openBlockModal}
      />

      <ImageLibraryModal
        isOpen={showImageLibraryModal}
        position={modalPosition}
        resources={filteredMediaResources}
        loading={mediaLoading}
        error={mediaError}
        query={mediaQuery}
        onQueryChange={setMediaQuery}
        onRefresh={() => { void loadMediaResources() }}
        onSelect={insertImageFromMedia}
        onClose={closeImageLibrary}
      />

      <McqModal
        isOpen={showMcqModal}
        position={modalPosition}
        initialData={mcqInitialData}
        onClose={closeMcq}
        onInsert={config => insertShortcodeBlock('mcq', config)}
      />

      <AudioModal
        isOpen={showAudioModal}
        position={modalPosition}
        initialData={audioInitialData}
        onClose={closeAudio}
        onInsert={config => insertShortcodeBlock('audio', config)}
      />

      <FillGapsModal
        isOpen={showFillGapsModal}
        position={modalPosition}
        initialData={fillInitialData}
        onClose={closeFill}
        onInsert={config => insertShortcodeBlock('fill_gaps', config)}
      />

      <DropdownGapsModal
        isOpen={showDropdownGapsModal}
        position={modalPosition}
        initialData={dropdownInitialData}
        onClose={closeDropdown}
        onInsert={config => insertShortcodeBlock('dropdown_gaps', config)}
      />

      <TrueFalseModal
        isOpen={showTrueFalseModal}
        position={modalPosition}
        initialData={trueFalseInitialData}
        onClose={closeTrueFalse}
        onInsert={config => insertShortcodeBlock('true_false', config)}
      />

      <CtaModal
        isOpen={showCtaModal}
        position={modalPosition}
        initialData={ctaInitialData}
        ctaTemplates={ctaTemplates}
        selectedCtaTemplateId={selectedCtaTemplateId}
        onSelectTemplate={setSelectedCtaTemplateId}
        onLoadTemplate={loadSelectedCtaTemplate}
        onSaveTemplate={saveCurrentCtaTemplate}
        onDeleteTemplate={deleteSelectedCtaTemplate}
        onClose={closeCta}
        onInsert={config => insertShortcodeBlock('cta', config)}
        onCopyShortcode={copyCtaShortcode}
        templateName={ctaTemplateName}
        onTemplateNameChange={setCtaTemplateName}
      />
      <EmailWritingModal
        isOpen={showEmailWritingModal}
        position={modalPosition}
        initialData={emailWritingInitialData}
        onClose={closeEmailWriting}
        onInsert={config => insertShortcodeBlock('email_writing', config)}
      />
      <MissingLettersModal
        isOpen={showMissingLettersModal}
        position={modalPosition}
        initialData={missingLettersInitialData}
        onClose={closeMissingLetters}
        onInsert={config => insertShortcodeBlock('missing_letters', config)}
      />
      <MatchingModal
        isOpen={showMatchingModal}
        position={modalPosition}
        initialData={matchingInitialData}
        onClose={closeMatching}
        onInsert={config => insertShortcodeBlock('matching', config)}
      />
      <DragSentenceModal
        isOpen={showDragSentenceModal}
        position={modalPosition}
        initialData={dragSentenceInitialData}
        onClose={closeDragSentence}
        onInsert={config => insertShortcodeBlock('drag_sentence', config)}
      />
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

