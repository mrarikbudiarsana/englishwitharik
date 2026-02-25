import { useState, useEffect } from 'react'
import type { ModalPosition, ReadingMcqFormState } from '../types'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'

interface ReadingMcqModalProps {
    isOpen: boolean
    position: ModalPosition | null
    initialData?: Partial<ReadingMcqFormState>
    onClose: () => void
    onInsert: (config: Record<string, unknown>) => void
}

const defaultState: ReadingMcqFormState = {
    text: '',
    question: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    correctIndex: 0,
    explanation: '',
}

export function ReadingMcqModal({ isOpen, position, initialData, onClose, onInsert }: ReadingMcqModalProps) {
    const [form, setForm] = useState<ReadingMcqFormState>(defaultState)

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setForm(initialData ? { ...defaultState, ...initialData } : defaultState)
        }
    }, [isOpen, initialData])

    if (!isOpen) return null

    const handleInsert = () => {
        const options = [form.optionA, form.optionB, form.optionC, form.optionD]
            .map(opt => opt.trim())
            .filter(Boolean)

        if (!form.text.trim()) {
            window.alert('Reading text is required.')
            return
        }

        if (!form.question.trim()) {
            window.alert('Question is required.')
            return
        }

        if (options.length < 2) {
            window.alert('Add at least 2 options.')
            return
        }

        const safeAnswer = Math.min(Math.max(form.correctIndex, 0), options.length - 1)
        const config = {
            text: form.text.trim(),
            question: form.question.trim(),
            options,
            answer: safeAnswer,
            explanation: form.explanation.trim() || undefined,
        }

        onInsert(config)
        onClose()
    }

    return (
        <ModalWrapper
            title="Insert Reading MCQ Block"
            description="Creates a reading passage with a multiple choice question."
            position={position}
            maxWidth="max-w-2xl"
            footer={
                <>
                    <ModalButton onClick={onClose}>Cancel</ModalButton>
                    <ModalButton onClick={handleInsert} variant="primary">Insert block</ModalButton>
                </>
            }
        >
            <FormField label="Reading Text">
                <FormTextarea
                    value={form.text}
                    onChange={v => setForm(f => ({ ...f, text: v }))}
                    placeholder="Enter the reading passage..."
                    rows={6}
                />
            </FormField>

            <FormField label="Question">
                <FormInput
                    value={form.question}
                    onChange={v => setForm(f => ({ ...f, question: v }))}
                    placeholder="E.g., What is the main idea of the passage?"
                />
            </FormField>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                    type="text"
                    value={form.optionA}
                    onChange={e => setForm(f => ({ ...f, optionA: e.target.value }))}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Option 1"
                />
                <input
                    type="text"
                    value={form.optionB}
                    onChange={e => setForm(f => ({ ...f, optionB: e.target.value }))}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Option 2"
                />
                <input
                    type="text"
                    value={form.optionC}
                    onChange={e => setForm(f => ({ ...f, optionC: e.target.value }))}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Option 3 (optional)"
                />
                <input
                    type="text"
                    value={form.optionD}
                    onChange={e => setForm(f => ({ ...f, optionD: e.target.value }))}
                    className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                    placeholder="Option 4 (optional)"
                />
            </div>

            <FormField label="Correct answer index">
                <select
                    value={form.correctIndex}
                    onChange={e => setForm(f => ({ ...f, correctIndex: Number(e.target.value) }))}
                    className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                >
                    <option value={0}>Option 1</option>
                    <option value={1}>Option 2</option>
                    <option value={2}>Option 3</option>
                    <option value={3}>Option 4</option>
                </select>
            </FormField>

            <FormField label="Explanation (optional)">
                <FormTextarea
                    value={form.explanation}
                    onChange={v => setForm(f => ({ ...f, explanation: v }))}
                    placeholder="Explain why this is correct."
                />
            </FormField>
        </ModalWrapper>
    )
}
