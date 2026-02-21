import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ModalPosition, DropdownGapsFormState } from '../types'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'

interface DropdownGapsModalProps {
  isOpen: boolean
  position: ModalPosition | null
  initialData?: Partial<DropdownGapsFormState>
  onClose: () => void
  onInsert: (config: Record<string, unknown>) => void
}

const defaultState: DropdownGapsFormState = {
  mode: 'sentences',
  title: '',
  rows: [''],
  explanation: '',
}

export function DropdownGapsModal({ isOpen, position, initialData, onClose, onInsert }: DropdownGapsModalProps) {
  const [form, setForm] = useState<DropdownGapsFormState>(defaultState)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData ? { ...defaultState, ...initialData } : defaultState)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleInsert = () => {
    const items = form.rows.map(r => r.trim()).filter(Boolean)
    if (items.length === 0 || !items.some(item => item.includes('[[') && item.includes('|') && item.includes(']]'))) {
      window.alert('Add at least one dropdown marker like [[correct|option2|option3]].')
      return
    }

    const config = {
      mode: form.mode,
      title: form.title.trim() || undefined,
      items,
      explanation: form.explanation.trim() || undefined,
    }

    onInsert(config)
    onClose()
  }

  const updateRow = (index: number, value: string) => {
    setForm(f => ({ ...f, rows: f.rows.map((r, i) => i === index ? value : r) }))
  }

  const removeRow = (index: number) => {
    setForm(f => ({ ...f, rows: f.rows.length > 1 ? f.rows.filter((_, i) => i !== index) : f.rows }))
  }

  const addRow = () => {
    setForm(f => ({ ...f, rows: [...f.rows, ''] }))
  }

  return (
    <ModalWrapper
      title="Insert Dropdown Gaps Block"
      description="Use one line per item. Write gaps as [[correct|option2|option3]]."
      position={position}
      maxWidth="max-w-2xl"
      footer={
        <>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={handleInsert} variant="primary">Insert block</ModalButton>
        </>
      }
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <FormField label="Mode">
          <select
            value={form.mode}
            onChange={e => setForm(f => ({ ...f, mode: e.target.value as 'paragraph' | 'sentences' }))}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          >
            <option value="sentences">Sentences</option>
            <option value="paragraph">Paragraph</option>
          </select>
        </FormField>
        <FormField label="Title (optional)">
          <FormInput
            value={form.title}
            onChange={v => setForm(f => ({ ...f, title: v }))}
            placeholder="Choose the correct word"
          />
        </FormField>
      </div>

      <FormField label="Items">
        <div className="space-y-2">
          {form.rows.map((row, index) => (
            <div key={`dropdown-row-${index}`} className="flex items-start gap-2">
              <input
                type="text"
                value={row}
                onChange={e => updateRow(index, e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                placeholder="She [[goes|go|gone]] to school every day."
              />
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
            Add item
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
