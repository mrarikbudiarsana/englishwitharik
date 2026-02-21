import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ModalPosition, MatchingFormState } from '../types'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'

interface MatchingModalProps {
  isOpen: boolean
  position: ModalPosition | null
  initialData?: Partial<MatchingFormState>
  onClose: () => void
  onInsert: (config: Record<string, unknown>) => void
}

const defaultState: MatchingFormState = {
  title: '',
  prompt: '',
  rows: [{ left: '', right: '' }, { left: '', right: '' }],
  explanation: '',
}

export function MatchingModal({ isOpen, position, initialData, onClose, onInsert }: MatchingModalProps) {
  const [form, setForm] = useState<MatchingFormState>(defaultState)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData ? { ...defaultState, ...initialData } : defaultState)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleInsert = () => {
    const pairs = form.rows
      .map(row => ({ left: row.left.trim(), right: row.right.trim() }))
      .filter(pair => pair.left && pair.right)

    if (pairs.length < 2) {
      window.alert('Add at least 2 valid pairs.')
      return
    }

    const config = {
      title: form.title.trim() || undefined,
      prompt: form.prompt.trim() || undefined,
      pairs,
      explanation: form.explanation.trim() || undefined,
    }

    onInsert(config)
    onClose()
  }

  const updateRowLeft = (index: number, left: string) => {
    setForm(f => ({
      ...f,
      rows: f.rows.map((r, i) => i === index ? { ...r, left } : r),
    }))
  }

  const updateRowRight = (index: number, right: string) => {
    setForm(f => ({
      ...f,
      rows: f.rows.map((r, i) => i === index ? { ...r, right } : r),
    }))
  }

  const removeRow = (index: number) => {
    setForm(f => ({
      ...f,
      rows: f.rows.length > 2 ? f.rows.filter((_, i) => i !== index) : f.rows,
    }))
  }

  const addRow = () => {
    setForm(f => ({ ...f, rows: [...f.rows, { left: '', right: '' }] }))
  }

  return (
    <ModalWrapper
      title="Insert Matching Block"
      description="Use one line per pair: left :: right"
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
          placeholder="Match the pairs"
        />
      </FormField>

      <FormField label="Prompt (optional)">
        <FormInput
          value={form.prompt}
          onChange={v => setForm(f => ({ ...f, prompt: v }))}
          placeholder="Match each item on the left with the best option."
        />
      </FormField>

      <FormField label="Pairs">
        <div className="space-y-2">
          {form.rows.map((row, index) => (
            <div key={`matching-row-${index}`} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-2">
              <input
                type="text"
                value={row.left}
                onChange={e => updateRowLeft(index, e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                placeholder="Left item"
              />
              <input
                type="text"
                value={row.right}
                onChange={e => updateRowRight(index, e.target.value)}
                className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                placeholder="Right match"
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
            Add pair
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
