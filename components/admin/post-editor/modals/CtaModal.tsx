import { useState, useEffect } from 'react'
import type { ModalPosition, CtaFormState, CtaTemplate } from '../types'
import {
  DEFAULT_CTA_TITLE,
  DEFAULT_CTA_DESCRIPTION,
  DEFAULT_CTA_SUBMIT_LABEL,
  DEFAULT_CTA_SOURCE,
} from '../constants'
import { generateBlockId } from '../utils'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'

interface CtaModalProps {
  isOpen: boolean
  position: ModalPosition | null
  initialData?: Partial<CtaFormState>
  ctaTemplates: CtaTemplate[]
  selectedCtaTemplateId: string
  onSelectTemplate: (id: string) => void
  onLoadTemplate: () => void
  onSaveTemplate: () => void
  onDeleteTemplate: () => void
  onClose: () => void
  onInsert: (config: Record<string, unknown>) => void
  onCopyShortcode: (config: Record<string, unknown>) => void
  templateName: string
  onTemplateNameChange: (name: string) => void
}

const defaultState: CtaFormState = {
  title: DEFAULT_CTA_TITLE,
  description: DEFAULT_CTA_DESCRIPTION,
  submitLabel: DEFAULT_CTA_SUBMIT_LABEL,
  source: DEFAULT_CTA_SOURCE,
  blockId: '',
  collectName: true,
  collectEmail: true,
  collectWhatsapp: true,
  templateName: '',
}

export function CtaModal({
  isOpen,
  position,
  initialData,
  ctaTemplates,
  selectedCtaTemplateId,
  onSelectTemplate,
  onLoadTemplate,
  onSaveTemplate,
  onDeleteTemplate,
  onClose,
  onInsert,
  onCopyShortcode,
  templateName,
  onTemplateNameChange,
}: CtaModalProps) {
  const [form, setForm] = useState<CtaFormState>(defaultState)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData ? { ...defaultState, ...initialData } : defaultState)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const buildConfig = () => {
    if (!form.title.trim()) {
      window.alert('CTA title is required.')
      return null
    }

    const blockId = form.blockId.trim() || generateBlockId(form.title.trim(), 'cta')
    return {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      submitLabel: form.submitLabel.trim() || undefined,
      source: form.source.trim() || undefined,
      blockId,
      collectName: form.collectName,
      collectEmail: form.collectEmail,
      collectWhatsapp: form.collectWhatsapp,
    }
  }

  const handleInsert = () => {
    const config = buildConfig()
    if (!config) return

    onInsert(config)
    onClose()
  }

  return (
    <ModalWrapper
      title="Insert CTA Block"
      description="Creates a lead form block inside your article."
      position={position}
      maxWidth="max-w-xl"
      footer={
        <>
          <ModalButton onClick={() => {
            const config = buildConfig()
            if (!config) return
            onCopyShortcode(config)
          }}
          >
            Copy shortcode
          </ModalButton>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={handleInsert} variant="primary">Insert block</ModalButton>
        </>
      }
    >
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
        <p className="text-xs font-semibold text-gray-700">CTA Templates</p>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
          <select
            value={selectedCtaTemplateId}
            onChange={e => onSelectTemplate(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          >
            <option value="">Select saved template</option>
            {ctaTemplates.map(template => (
              <option key={template.id} value={template.id}>{template.name}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={onLoadTemplate}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white"
          >
            Load
          </button>
          <button
            type="button"
            onClick={onDeleteTemplate}
            className="px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg hover:bg-red-50"
          >
            Delete
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-2">
          <input
            type="text"
            value={templateName}
            onChange={e => onTemplateNameChange(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
            placeholder="Template name (e.g., IELTS Free Trial CTA)"
          />
          <button
            type="button"
            onClick={onSaveTemplate}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white"
          >
            Save template
          </button>
        </div>
      </div>

      <FormField label="Title">
        <FormInput
          value={form.title}
          onChange={v => setForm(f => ({ ...f, title: v }))}
          placeholder="Need help with IELTS or PTE?"
        />
      </FormField>

      <FormField label="Description">
        <FormTextarea
          value={form.description}
          onChange={v => setForm(f => ({ ...f, description: v }))}
          rows={3}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormField label="Button label">
          <FormInput
            value={form.submitLabel}
            onChange={v => setForm(f => ({ ...f, submitLabel: v }))}
            placeholder="Get Free Consultation"
          />
        </FormField>
        <FormField label="Source tag">
          <FormInput
            value={form.source}
            onChange={v => setForm(f => ({ ...f, source: v }))}
            placeholder="blog-cta"
          />
        </FormField>
      </div>
    </ModalWrapper>
  )
}
