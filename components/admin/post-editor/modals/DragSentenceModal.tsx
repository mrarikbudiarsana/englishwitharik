import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import type { ModalPosition, DragSentenceFormState, DragSentenceItem } from '../types'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'

interface DragSentenceModalProps {
  isOpen: boolean
  position: ModalPosition | null
  initialData?: Partial<DragSentenceFormState>
  onClose: () => void
  onInsert: (config: Record<string, unknown>) => void
}

const defaultItem: DragSentenceItem = { speaker2Text: '', distractors: [] }

const defaultState: DragSentenceFormState = {
  title: '',
  items: [{ ...defaultItem }],
  explanation: '',
}

export function DragSentenceModal({ isOpen, position, initialData, onClose, onInsert }: DragSentenceModalProps) {
  const [form, setForm] = useState<DragSentenceFormState>(defaultState)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData ? { ...defaultState, ...initialData } : defaultState)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleInsert = () => {
    const items = form.items
      .filter(item => item.speaker2Text.trim() !== '')
      .map(item => ({
        speaker1Image: item.speaker1Image?.trim() || undefined,
        speaker1Text: item.speaker1Text?.trim() || undefined,
        speaker2Image: item.speaker2Image?.trim() || undefined,
        speaker2Text: item.speaker2Text.trim(),
        distractors: item.distractors.map(d => d.trim()).filter(Boolean),
      }))

    if (items.length === 0) {
      window.alert('Add at least one item with a speaker 2 text/gaps.')
      return
    }

    if (!items.some(item => item.speaker2Text.includes('[[') && item.speaker2Text.includes(']]'))) {
      window.alert('At least one item must include a [[word]] placeholder to drag to.')
      return
    }

    const config = {
      title: form.title.trim() || undefined,
      items,
      explanation: form.explanation.trim() || undefined,
    }

    onInsert(config)
    onClose()
  }

  const updateItem = (index: number, field: keyof DragSentenceItem, value: string | string[]) => {
    setForm(f => ({
      ...f,
      items: f.items.map((item, i) => i === index ? { ...item, [field]: value } : item),
    }))
  }

  const removeItem = (index: number) => {
    setForm(f => ({
      ...f,
      items: f.items.filter((_, i) => i !== index),
    }))
  }

  const addItem = () => {
    setForm(f => ({ ...f, items: [...f.items, { ...defaultItem }] }))
  }

  return (
    <ModalWrapper
      title="Insert Drag Sentence Block"
      description="Users drag words to form sentences. Use [[word]] for draggable words."
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
          placeholder="Make an appropriate sentence."
        />
      </FormField>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-2">Items</label>
        <div className="space-y-4">
          {form.items.map((item, index) => (
            <div key={`param-row-${index}`} className="p-3 border border-gray-200 rounded-lg bg-gray-50 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
              >
                <Trash2 size={14} />
              </button>
              <p className="text-xs font-semibold text-gray-700">Item {index + 1}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Speaker 1 Image URL (optional)</label>
                  <input
                    type="text"
                    value={item.speaker1Image || ''}
                    onChange={e => updateItem(index, 'speaker1Image', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Speaker 1 Text (optional)</label>
                  <input
                    type="text"
                    value={item.speaker1Text || ''}
                    onChange={e => updateItem(index, 'speaker1Text', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none"
                    placeholder="What was the highlight..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Speaker 2 Image URL (optional)</label>
                  <input
                    type="text"
                    value={item.speaker2Image || ''}
                    onChange={e => updateItem(index, 'speaker2Image', e.target.value)}
                    className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-gray-500 mb-1">Speaker 2 Text / Gaps</label>
                  <textarea
                    value={item.speaker2Text}
                    onChange={e => updateItem(index, 'speaker2Text', e.target.value)}
                    rows={2}
                    className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none resize-none"
                    placeholder="The [[old city]] [[tour guides]] [[were]] fantastic."
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Distractors (comma separated)</label>
                <input
                  type="text"
                  value={item.distractors.join(', ')}
                  onChange={e => updateItem(index, 'distractors', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                  className="w-full text-sm border border-gray-300 rounded-md px-2.5 py-1.5 focus:outline-none"
                  placeholder="was, their, who"
                />
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md border border-gray-300 text-gray-700 hover:bg-white transition-colors"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>
      </div>

      <FormField label="Explanation (optional)">
        <FormTextarea
          value={form.explanation}
          onChange={v => setForm(f => ({ ...f, explanation: v }))}
        />
      </FormField>
    </ModalWrapper>
  )
}
