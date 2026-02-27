import { useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import type { BlockTemplate, CtaTemplate } from '../types'
import { normalizeTemplateShortcode } from '../utils'

type EditingShortcode = { from: number; to: number; blockType: string } | null

interface UsePostEditorActionsParams {
  editor: Editor | null
  editingShortcode: EditingShortcode
  setEditingShortcode: (value: EditingShortcode) => void
  getCtaConfig: () => { blockId: string; config: Record<string, unknown> }
  ctaTemplateName: string
  setCtaTemplateName: (value: string) => void
  ctaTitle: string
  setCtaTitle: (value: string) => void
  ctaDescription: string
  setCtaDescription: (value: string) => void
  ctaSubmitLabel: string
  setCtaSubmitLabel: (value: string) => void
  ctaSource: string
  setCtaSource: (value: string) => void
  setCtaBlockId: (value: string) => void
  setCtaCollectName: (value: boolean) => void
  setCtaCollectEmail: (value: boolean) => void
  setCtaCollectWhatsapp: (value: boolean) => void
  selectedCtaTemplateId: string
  saveCtaTemplate: (
    name: string,
    title: string,
    description: string,
    submitLabel: string,
    source: string
  ) => boolean
  loadCtaTemplate: (templateId: string) => CtaTemplate | null
  deleteCtaTemplate: (templateId: string) => void
  openImageLibraryModal: () => void
  closeImageLibraryModal: () => void
  openLinkModal: () => void
  loadMediaResources: () => Promise<void>
  blockTemplates: BlockTemplate[]
  selectedBlockTemplateId: string
}

export function usePostEditorActions({
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
  openLinkModal,
  loadMediaResources,
  blockTemplates,
  selectedBlockTemplateId,
}: UsePostEditorActionsParams) {
  const addLink = useCallback(() => {
    openLinkModal()
  }, [openLinkModal])

  const insertLinkFromUrl = useCallback((url: string) => {
    if (!editor) return
    const href = url.trim()
    if (!href) return
    editor.chain().focus().setLink({ href }).run()
  }, [editor])

  const addImage = useCallback(() => {
    if (!editor) return
    openImageLibraryModal()
    void loadMediaResources()
  }, [editor, loadMediaResources, openImageLibraryModal])

  const setSelectedImageWidth = useCallback((width: string) => {
    if (!editor || !editor.isActive('image')) return
    editor.chain().focus().updateAttributes('image', { width }).run()
  }, [editor])

  const insertImageFromMedia = useCallback((url: string) => {
    if (!editor || !url.trim()) return
    editor.chain().focus().setImage({ src: url.trim() }).updateAttributes('image', { width: '100%' }).run()
    closeImageLibraryModal()
  }, [closeImageLibraryModal, editor])

  const copyCtaShortcode = useCallback(async (config?: Record<string, unknown>) => {
    const fallback = getCtaConfig().config
    const shortcode = `[block:cta:${encodeURIComponent(JSON.stringify(config ?? fallback))}]`

    try {
      await navigator.clipboard.writeText(shortcode)
      window.alert('CTA shortcode copied. You can paste it in another blog post.')
    } catch {
      window.alert('Could not copy automatically. Please insert and copy manually.')
    }
  }, [getCtaConfig])

  const insertShortcodeBlock = useCallback((blockType: string, config: Record<string, unknown>) => {
    if (!editor) return
    const shortcode = `[block:${blockType}:${encodeURIComponent(JSON.stringify(config))}]`
    if (editingShortcode && editingShortcode.blockType === blockType) {
      editor.chain().focus().insertContentAt({ from: editingShortcode.from, to: editingShortcode.to }, shortcode).run()
      setEditingShortcode(null)
      return
    }
    editor.chain().focus().insertContent(`<p>${shortcode}</p>`).run()
  }, [editingShortcode, editor, setEditingShortcode])

  const saveCurrentCtaTemplate = useCallback(() => {
    const name = ctaTemplateName.trim()
    const didSave = saveCtaTemplate(
      name,
      ctaTitle,
      ctaDescription,
      ctaSubmitLabel,
      ctaSource
    )
    if (didSave) setCtaTemplateName('')
  }, [
    ctaDescription,
    ctaSource,
    ctaSubmitLabel,
    ctaTemplateName,
    ctaTitle,
    saveCtaTemplate,
    setCtaTemplateName,
  ])

  const loadSelectedCtaTemplate = useCallback(() => {
    const template = loadCtaTemplate(selectedCtaTemplateId)
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
  }, [
    loadCtaTemplate,
    selectedCtaTemplateId,
    setCtaBlockId,
    setCtaCollectEmail,
    setCtaCollectName,
    setCtaCollectWhatsapp,
    setCtaDescription,
    setCtaSource,
    setCtaSubmitLabel,
    setCtaTemplateName,
    setCtaTitle,
  ])

  const deleteSelectedCtaTemplate = useCallback(() => {
    deleteCtaTemplate(selectedCtaTemplateId)
  }, [deleteCtaTemplate, selectedCtaTemplateId])

  const insertSelectedBlockTemplate = useCallback(() => {
    if (!editor) return
    const template = blockTemplates.find(item => item.id === selectedBlockTemplateId)
    if (!template) {
      window.alert('Select a block template first.')
      return
    }

    const shortcode = normalizeTemplateShortcode(template.shortcode)
    editor.chain().focus().insertContent(`<p>${shortcode}</p>`).run()
  }, [blockTemplates, editor, selectedBlockTemplateId])

  return {
    addLink,
    insertLinkFromUrl,
    addImage,
    setSelectedImageWidth,
    insertImageFromMedia,
    copyCtaShortcode,
    insertShortcodeBlock,
    saveCurrentCtaTemplate,
    loadSelectedCtaTemplate,
    deleteSelectedCtaTemplate,
    insertSelectedBlockTemplate,
  }
}
