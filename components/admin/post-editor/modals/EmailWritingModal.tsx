import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ModalPosition, EmailWritingFormState } from '../types'
import {
  DEFAULT_EMAIL_WRITING_TITLE,
  DEFAULT_EMAIL_WRITING_SUBMIT_LABEL,
  DEFAULT_EMAIL_WRITING_SUCCESS_MESSAGE,
  DEFAULT_EMAIL_WRITING_SOURCE,
  DEFAULT_EMAIL_WRITING_PLACEHOLDER,
} from '../constants'
import { generateBlockId } from '../utils'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'

interface EmailWritingModalProps {
  isOpen: boolean
  position: ModalPosition | null
  initialData?: Partial<EmailWritingFormState>
  onClose: () => void
  onInsert: (config: Record<string, unknown>) => void
}

const defaultState: EmailWritingFormState = {
  title: DEFAULT_EMAIL_WRITING_TITLE,
  prompt: '',
  recipient: '',
  subject: '',
  instructions: [''],
  placeholder: DEFAULT_EMAIL_WRITING_PLACEHOLDER,
  submitLabel: DEFAULT_EMAIL_WRITING_SUBMIT_LABEL,
  successMessage: DEFAULT_EMAIL_WRITING_SUCCESS_MESSAGE,
  source: DEFAULT_EMAIL_WRITING_SOURCE,
  blockId: '',
  collectName: true,
  collectEmail: true,
  collectWhatsapp: true,
}

export function EmailWritingModal({ isOpen, position, initialData, onClose, onInsert }: EmailWritingModalProps) {
  const [form, setForm] = useState<EmailWritingFormState>(defaultState)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData ? { ...defaultState, ...initialData } : defaultState)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleInsert = () => {
    if (!form.prompt.trim()) {
      window.alert('Prompt is required.')
      return
    }
    if (!form.collectEmail && !form.collectWhatsapp) {
      window.alert('Enable at least Email or WhatsApp collection.')
      return
    }

    const blockId = form.blockId.trim() || generateBlockId(form.title.trim() || 'email-writing', 'email-writing')
    const instructions = form.instructions.map(i => i.trim()).filter(Boolean)

    const config = {
      title: form.title.trim() || undefined,
      prompt: form.prompt.trim(),
      recipient: form.recipient.trim() || undefined,
      subject: form.subject.trim() || undefined,
      instructions: instructions.length > 0 ? instructions : undefined,
      placeholder: form.placeholder.trim() || undefined,
      submitLabel: form.submitLabel.trim() || undefined,
      successMessage: form.successMessage.trim() || undefined,
      source: form.source.trim() || undefined,
      blockId,
      collectName: form.collectName,
      collectEmail: form.collectEmail,
      collectWhatsapp: form.collectWhatsapp,
    }

    onInsert(config)
    onClose()
  }

  const updateInstruction = (index: number, value: string) => {
    setForm(f => ({ ...f, instructions: f.instructions.map((r, i) => i === index ? value : r) }))
  }

  const removeInstruction = (index: number) => {
    setForm(f => ({
      ...f,
      instructions: f.instructions.length > 1 ? f.instructions.filter((_, i) => i !== index) : f.instructions,
    }))
  }

  const addInstruction = () => {
    setForm(f => ({ ...f, instructions: [...f.instructions, ''] }))
  }

  return (
    <ModalWrapper
      title="Insert Email Writing Block"
      description="Creates a writing task and collects contact details before sending the response."
      position={position}
      maxWidth="max-w-3xl"
      footer={
        <>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={handleInsert} variant="primary">Insert block</ModalButton>
        </>
      }
    >
      <FormField label="Block title (optional)">
        <FormInput
          value={form.title}
          onChange={v => setForm(f => ({ ...f, title: v }))}
          placeholder="Email Writing Practice"
        />
      </FormField>

      <FormField label="Prompt">
        <FormTextarea
          value={form.prompt}
          onChange={v => setForm(f => ({ ...f, prompt: v }))}
          rows={4}
          placeholder="Write an email to explain your issue and ask for clarification."
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormField label="To (optional)">
          <FormInput
            value={form.recipient}
            onChange={v => setForm(f => ({ ...f, recipient: v }))}
            placeholder="editor@example.com"
          />
        </FormField>
        <FormField label="Subject (optional)">
          <FormInput
            value={form.subject}
            onChange={v => setForm(f => ({ ...f, subject: v }))}
            placeholder="Problem using submission form"
          />
        </FormField>
      </div>

      <FormField label="Instructions (optional)">
        <div className="space-y-2">
          {form.instructions.map((item, index) => (
            <div key={`email-writing-instruction-${index}`} className="flex items-start gap-2">
              <input
                type="text"
                value={item}
                onChange={e => updateInstruction(index, e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                placeholder="Tell the editor what you like about the magazine."
              />
              <button
                type="button"
                onClick={() => removeInstruction(index)}
                className="px-2 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Remove instruction"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addInstruction}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
          >
            <Plus size={14} />
            Add instruction
          </button>
        </div>
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormField label="Textarea placeholder">
          <FormInput
            value={form.placeholder}
            onChange={v => setForm(f => ({ ...f, placeholder: v }))}
            placeholder="Write your email response here..."
          />
        </FormField>
        <FormField label="Source tag">
          <FormInput
            value={form.source}
            onChange={v => setForm(f => ({ ...f, source: v }))}
            placeholder="blog-email-writing"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormField label="First button label">
          <FormInput
            value={form.submitLabel}
            onChange={v => setForm(f => ({ ...f, submitLabel: v }))}
            placeholder="Submit response"
          />
        </FormField>
        <FormField label="Success message">
          <FormInput
            value={form.successMessage}
            onChange={v => setForm(f => ({ ...f, successMessage: v }))}
            placeholder="Thanks. Your response has been submitted."
          />
        </FormField>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-gray-600">Collect contact fields on submit</p>
        <div className="flex flex-wrap gap-3 text-sm text-gray-700">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.collectName}
              onChange={e => setForm(f => ({ ...f, collectName: e.target.checked }))}
            />
            Name
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.collectEmail}
              onChange={e => setForm(f => ({ ...f, collectEmail: e.target.checked }))}
            />
            Email
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.collectWhatsapp}
              onChange={e => setForm(f => ({ ...f, collectWhatsapp: e.target.checked }))}
            />
            WhatsApp
          </label>
        </div>
      </div>
    </ModalWrapper>
  )
}
