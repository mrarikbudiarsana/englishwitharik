import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'
import type { OrderingFormState } from '../types'

interface OrderingModalProps {
    isOpen: boolean
    position: { top: number; left: number } | null
    initialData: OrderingFormState
    onClose: () => void
    onInsert: (config: OrderingFormState) => void
}

export function OrderingModal({
    isOpen,
    position,
    initialData,
    onClose,
    onInsert,
}: OrderingModalProps) {
    const [title, setTitle] = useState(initialData.title)
    const [items, setItems] = useState<string[]>(initialData.items)
    const [explanation, setExplanation] = useState(initialData.explanation)

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTitle(initialData.title)
            setItems(initialData.items.length > 0 ? initialData.items : [''])
            setExplanation(initialData.explanation)
        }
    }, [isOpen, initialData])

    function handleSubmit() {
        onInsert({ title, items: items.filter(i => i.trim()), explanation })
        onClose()
    }

    function addItem() {
        setItems([...items, ''])
    }

    function removeItem(index: number) {
        setItems(items.filter((_, i) => i !== index))
    }

    function updateItem(index: number, value: string) {
        const newItems = [...items]
        newItems[index] = value
        setItems(newItems)
    }

    if (!isOpen) return null

    return (
        <ModalWrapper
            title="Ordering Block"
            description="Create a drag-and-drop ordering activity. Students will arrange the items in the correct sequence."
            position={position}
            footer={
                <>
                    <ModalButton onClick={onClose}>Cancel</ModalButton>
                    <ModalButton onClick={handleSubmit} variant="primary">Insert Block</ModalButton>
                </>
            }
        >
            <div className="space-y-4">
                <FormField label="Title / Instructions">
                    <FormInput
                        value={title}
                        onChange={setTitle}
                        placeholder="e.g. Put these sentences in the correct order."
                    />
                </FormField>

                <div className="space-y-2 relative isolate block w-full rounded-md border border-gray-300 p-3">
                    <label className="block text-xs font-medium text-gray-600 mb-2">Ordered Items (Correct sequence)</label>
                    {items.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs w-4">{index + 1}.</span>
                            <FormInput
                                value={item}
                                onChange={val => updateItem(index, val)}
                                placeholder="Item text"
                            />
                            <button
                                type="button"
                                onClick={() => removeItem(index)}
                                disabled={items.length <= 1}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-md disabled:opacity-50 cursor-pointer"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={addItem}
                        className="mt-2 flex items-center gap-1 text-sm text-[#08507f] hover:text-[#063a5c] cursor-pointer"
                    >
                        <Plus size={16} /> Add Item
                    </button>
                </div>

                <FormField label="Explanation (Optional)">
                    <FormTextarea
                        value={explanation}
                        onChange={setExplanation}
                        placeholder="Explain the correct order"
                        rows={2}
                    />
                </FormField>
            </div>
        </ModalWrapper>
    )
}
