import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ModalPosition, MissingLettersFormState } from '../types'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'

interface MissingLettersModalProps {
  isOpen: boolean
  position: ModalPosition | null
  initialData?: Partial<MissingLettersFormState>
  onClose: () => void
  onInsert: (config: Record<string, unknown>) => void
}

const defaultState: MissingLettersFormState = {
  title: '',
  items: [''],
  explanation: '',
}

export function MissingLettersModal({ isOpen, position, initialData, onClose, onInsert }: MissingLettersModalProps) {
  const [form, setForm] = useState<MissingLettersFormState>(defaultState)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData ? { ...defaultState, ...initialData } : defaultState)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleInsert = () => {
    const items = form.items.map(r => r.trim()).filter(Boolean)
    if (items.length === 0 || !items.some(item => item.includes('[[') && item.includes(']]'))) {
      window.alert('Add at least one item with [[missing]] letters.')
      return
    }

    const config = {
      items,
      title: form.title.trim() || undefined,
      explanation: form.explanation.trim() || undefined,
    }

    onInsert(config)
    onClose()
  }

  const updateItem = (index: number, value: string) => {
    setForm(f => ({ ...f, items: f.items.map((r, i) => i === index ? value : r) }))
  }

  const removeItem = (index: number) => {
    setForm(f => ({ ...f, items: f.items.length > 1 ? f.items.filter((_, i) => i !== index) : f.items }))
  }

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, ''] }))
  }

  return (
    <ModalWrapper
      title="Insert Missing Letters Block"
      description="Use one line per item. Wrap missing letters in [[letters]]."
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
          placeholder="Complete the words"
        />
      </FormField>

      <FormField label="Items">
        <div className="space-y-2">
          {form.items.map((row, index) => (
            <div key={`missing-row-${index}`} className="flex items-start gap-2">
              <input
                type="text"
                value={row}
                onChange={e => updateItem(index, e.target.value)}
                className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                placeholder="Archaeologists deter[[mined]] that..."
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="px-2 py-2 text-gray-500 border border-gray-300 rounded-lg hover:bg-gray-50"
                title="Remove row"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
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
