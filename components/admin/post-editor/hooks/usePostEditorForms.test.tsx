import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { usePostEditorForms } from './usePostEditorForms'
import {
  DEFAULT_CTA_DESCRIPTION,
  DEFAULT_CTA_SOURCE,
  DEFAULT_CTA_SUBMIT_LABEL,
  DEFAULT_CTA_TITLE,
} from '../constants'

function createEditorWithShortcode(shortcode: string, offsetShift = 2) {
  const text = `before ${shortcode} after`
  const startIndex = text.indexOf(shortcode)
  return {
    state: {
      selection: {
        $from: {
          parent: { textContent: text },
          parentOffset: startIndex + offsetShift,
          start: () => 10,
        },
      },
    },
  }
}

describe('usePostEditorForms', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('prefills mcq form when cursor is on matching shortcode', () => {
    const config = {
      question: 'Q?',
      options: ['A', 'B', 'C', 'D'],
      answer: 2,
      explanation: 'Because',
    }
    const shortcode = `[block:mcq:${encodeURIComponent(JSON.stringify(config))}]`
    const editor = createEditorWithShortcode(shortcode)

    const { result } = renderHook(() => usePostEditorForms(editor as never))

    act(() => {
      result.current.prepareModalForType('mcq')
    })

    expect(result.current.mcqQuestion).toBe('Q?')
    expect(result.current.mcqOptionA).toBe('A')
    expect(result.current.mcqOptionD).toBe('D')
    expect(result.current.mcqCorrectIndex).toBe(2)
    expect(result.current.mcqExplanation).toBe('Because')
    expect(result.current.editingShortcode).toEqual({
      from: 17,
      to: 17 + shortcode.length,
      blockType: 'mcq',
    })
  })

  it('resets mcq form when cursor shortcode type mismatches selected modal type', () => {
    const audioConfig = { src: 'x.mp3' }
    const shortcode = `[block:audio:${encodeURIComponent(JSON.stringify(audioConfig))}]`
    const editor = createEditorWithShortcode(shortcode)
    const { result } = renderHook(() => usePostEditorForms(editor as never))

    act(() => {
      result.current.setMcqQuestion('old value')
      result.current.setMcqOptionA('a')
      result.current.setEditingShortcode({ from: 1, to: 2, blockType: 'mcq' })
    })

    act(() => {
      result.current.prepareModalForType('mcq')
    })

    expect(result.current.mcqQuestion).toBe('')
    expect(result.current.mcqOptionA).toBe('')
    expect(result.current.mcqCorrectIndex).toBe(0)
    expect(result.current.editingShortcode).toBeNull()
  })

  it('builds CTA config with generated block id when block id is blank', () => {
    vi.spyOn(Date, 'now').mockReturnValue(1700000000000)
    const { result } = renderHook(() => usePostEditorForms(null))

    act(() => {
      result.current.setCtaTitle('  Free Trial  ')
      result.current.setCtaDescription('  Desc  ')
      result.current.setCtaSubmitLabel('  Submit  ')
      result.current.setCtaSource('  blog  ')
      result.current.setCtaBlockId('')
    })

    const cta = result.current.getCtaConfig()

    expect(cta.blockId).toBe('free-trial-1700000000000')
    expect(cta.config).toEqual({
      title: 'Free Trial',
      description: 'Desc',
      submitLabel: 'Submit',
      source: 'blog',
      blockId: 'free-trial-1700000000000',
      collectName: true,
      collectEmail: true,
      collectWhatsapp: true,
    })
  })

  it('resetCtaForm restores default CTA values', () => {
    const { result } = renderHook(() => usePostEditorForms(null))

    act(() => {
      result.current.setCtaTitle('Custom')
      result.current.setCtaDescription('Custom desc')
      result.current.setCtaSubmitLabel('Go')
      result.current.setCtaSource('custom-source')
      result.current.setCtaTemplateName('X')
      result.current.setCtaCollectEmail(false)
      result.current.resetCtaForm()
    })

    expect(result.current.ctaTitle).toBe(DEFAULT_CTA_TITLE)
    expect(result.current.ctaDescription).toBe(DEFAULT_CTA_DESCRIPTION)
    expect(result.current.ctaSubmitLabel).toBe(DEFAULT_CTA_SUBMIT_LABEL)
    expect(result.current.ctaSource).toBe(DEFAULT_CTA_SOURCE)
    expect(result.current.ctaTemplateName).toBe('')
    expect(result.current.ctaCollectEmail).toBe(true)
  })
})
