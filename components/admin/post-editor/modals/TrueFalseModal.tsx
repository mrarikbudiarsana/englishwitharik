import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ModalPosition, TrueFalseFormState } from '../types'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'

interface TrueFalseModalProps {
  isOpen: boolean
  position: ModalPosition | null
  initialData?: Partial<TrueFalseFormState>
  onClose: () => void
  onInsert: (config: Record<string, unknown>) => void
}

const defaultState: TrueFalseFormState = {
  title: '',
  rows: [{ text: '', answer: true }],
  explanation: '',
}

export function TrueFalseModal({ isOpen, position, initialData, onClose, onInsert }: TrueFalseModalProps) {
  const [form, setForm] = useState<TrueFalseFormState>(defaultState)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData ? { ...defaultState, ...initialData } : defaultState)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleInsert = () => {
    const statements = form.rows
      .map(row => ({ text: row.text.trim(), answer: row.answer }))
      .filter(item => item.text.length > 0)

    if (statements.length === 0) {
      window.alert('Add at least one valid statement.')
      return
    }

    const config = {
      title: form.title.trim() || undefined,
      statements,
      explanation: form.explanation.trim() || undefined,
    }

    onInsert(config)
    onClose()
  }

  const updateRowText = (index: number, text: string) => {
    setForm(f => ({
      ...f,
      rows: f.rows.map((r, i) => i === index ? { ...r, text } : r),
    }))
  }

  const updateRowAnswer = (index: number, answer: boolean) => {
    setForm(f => ({
      ...f,
      rows: f.rows.map((r, i) => i === index ? { ...r, answer } : r),
    }))
  }

  const removeRow = (index: number) => {
    setForm(f => ({
      ...f,
      rows: f.rows.length > 1 ? f.rows.filter((_, i) => i !== index) : f.rows,
    }))
  }

  const addRow = () => {
    setForm(f => ({ ...f, rows: [...f.rows, { text: '', answer: true }] }))
  }

  return (
    <ModalWrapper
      title="Insert True / False Block"
      description="Use one line per statement: sentence :: true or false"
      position={position}
      maxWidth="max-w-2xl"
      footer={
        <>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={handleInsert} variant="primary">Insert block</ModalButton>
        </>
      }
    >
      <FormField label="Title (optional)">
        <FormInput
          value={form.title}
          onChange={v => setForm(f => ({ ...f, title: v }))}
          placeholder="True or False"
        />
      </FormField>

      <FormField label="Statements">
        <div className="space-y-2">
          {form.rows.map((row, index) => (
            <div key={`tf-row-${index}`} className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
              <input
                type="text"
                value={row.text}
                onChange={e => updateRowText(index, e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                placeholder="English is difficult."
              />
              <select
                value={row.answer ? 'true' : 'false'}
                onChange={e => updateRowAnswer(index, e.target.value === 'true')}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
              >
                <option value="true">True</option>
                <option value="false">False</option>
              </select>
              <button
                type="button"
                onClick={() => removeRow(index)}
                className="px-2 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Remove row"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
          >
            <Plus size={14} />
            Add statement
          </button>
        </div>
      </FormField>

      <FormField label="Explanation (optional)">
        <FormTextarea
          value={form.explanation}
          onChange={v => setForm(f => ({ ...f, explanation: v }))}
        />
      </FormField>
    </ModalWrapper>
  )
}
