import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePostEditorActions } from './usePostEditorActions'

function createEditorMock() {
  const chain = {
    focus: vi.fn(),
    setLink: vi.fn(),
    updateAttributes: vi.fn(),
    setImage: vi.fn(),
    insertContentAt: vi.fn(),
    insertContent: vi.fn(),
    run: vi.fn(),
  }
  chain.focus.mockReturnValue(chain)
  chain.setLink.mockReturnValue(chain)
  chain.updateAttributes.mockReturnValue(chain)
  chain.setImage.mockReturnValue(chain)
  chain.insertContentAt.mockReturnValue(chain)
  chain.insertContent.mockReturnValue(chain)
  chain.run.mockReturnValue(true)

  const editor = {
    chain: vi.fn(() => chain),
    isActive: vi.fn(() => true),
  }

  return { editor, chain }
}

function createBaseParams() {
  const { editor, chain } = createEditorMock()

  const params = {
    editor: editor as never,
    editingShortcode: null as { from: number; to: number; blockType: string } | null,
    setEditingShortcode: vi.fn(),
    getCtaConfig: vi.fn(() => ({ blockId: 'cta-1', config: { title: 'CTA' } })),
    ctaTemplateName: 'Template A',
    setCtaTemplateName: vi.fn(),
    ctaTitle: 'Title',
    setCtaTitle: vi.fn(),
    ctaDescription: 'Desc',
    setCtaDescription: vi.fn(),
    ctaSubmitLabel: 'Submit',
    setCtaSubmitLabel: vi.fn(),
    ctaSource: 'source',
    setCtaSource: vi.fn(),
    setCtaBlockId: vi.fn(),
    setCtaCollectName: vi.fn(),
    setCtaCollectEmail: vi.fn(),
    setCtaCollectWhatsapp: vi.fn(),
    selectedCtaTemplateId: 't1',
    saveCtaTemplate: vi.fn(() => true),
    loadCtaTemplate: vi.fn(() => ({
      id: 't1',
      name: 'Template One',
      title: 'Loaded title',
      description: 'Loaded desc',
      submitLabel: 'Loaded submit',
      source: 'loaded-source',
    })),
    deleteCtaTemplate: vi.fn(),
    openImageLibraryModal: vi.fn(),
    closeImageLibraryModal: vi.fn(),
    loadMediaResources: vi.fn(async () => {}),
    blockTemplates: [{ id: 'b1', name: 'B1', blockType: 'mcq', shortcode: '[block:mcq:%7B%7D]' }],
    selectedBlockTemplateId: 'b1',
  }

  return { params, editor, chain }
}

describe('usePostEditorActions', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('replaces existing shortcode when editing the same block type', () => {
    const { params, chain } = createBaseParams()
    params.editingShortcode = { from: 5, to: 12, blockType: 'mcq' }
    const { result } = renderHook(() => usePostEditorActions(params))

    act(() => {
      result.current.insertShortcodeBlock('mcq', { question: 'Q1' })
    })

    const expected = `[block:mcq:${encodeURIComponent(JSON.stringify({ question: 'Q1' }))}]`
    expect(chain.insertContentAt).toHaveBeenCalledWith({ from: 5, to: 12 }, expected)
    expect(params.setEditingShortcode).toHaveBeenCalledWith(null)
  })

  it('copies CTA shortcode to clipboard using fallback config', async () => {
    const { params } = createBaseParams()
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(window.navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    })
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})
    const { result } = renderHook(() => usePostEditorActions(params))

    await act(async () => {
      await result.current.copyCtaShortcode()
    })

    expect(writeText).toHaveBeenCalledTimes(1)
    const copied = writeText.mock.calls[0][0] as string
    expect(copied.startsWith('[block:cta:')).toBe(true)
    expect(alertSpy).toHaveBeenCalledWith('CTA shortcode copied. You can paste it in another blog post.')
  })

  it('loads selected CTA template into form setters', () => {
    const { params } = createBaseParams()
    const { result } = renderHook(() => usePostEditorActions(params))

    act(() => {
      result.current.loadSelectedCtaTemplate()
    })

    expect(params.setCtaTemplateName).toHaveBeenCalledWith('Template One')
    expect(params.setCtaTitle).toHaveBeenCalledWith('Loaded title')
    expect(params.setCtaDescription).toHaveBeenCalledWith('Loaded desc')
    expect(params.setCtaSubmitLabel).toHaveBeenCalledWith('Loaded submit')
    expect(params.setCtaSource).toHaveBeenCalledWith('loaded-source')
    expect(params.setCtaCollectName).toHaveBeenCalledWith(true)
    expect(params.setCtaCollectEmail).toHaveBeenCalledWith(true)
    expect(params.setCtaCollectWhatsapp).toHaveBeenCalledWith(true)
  })
})
