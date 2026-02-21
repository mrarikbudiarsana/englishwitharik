import { useState, useEffect } from 'react'
import type { ModalPosition, AudioFormState } from '../types'
import { ModalWrapper, ModalButton, FormField, FormInput, FormTextarea } from './ModalWrapper'

interface AudioModalProps {
  isOpen: boolean
  position: ModalPosition | null
  initialData?: Partial<AudioFormState>
  onClose: () => void
  onInsert: (config: Record<string, unknown>) => void
}

const defaultState: AudioFormState = {
  src: '',
  title: '',
  transcript: '',
}

export function AudioModal({ isOpen, position, initialData, onClose, onInsert }: AudioModalProps) {
  const [form, setForm] = useState<AudioFormState>(defaultState)

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm(initialData ? { ...defaultState, ...initialData } : defaultState)
    }
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleInsert = () => {
    if (!form.src.trim()) {
      window.alert('Audio URL is required.')
      return
    }

    const config = {
      src: form.src.trim(),
      title: form.title.trim() || undefined,
      transcript: form.transcript.trim() || undefined,
    }

    onInsert(config)
    onClose()
  }

  return (
    <ModalWrapper
      title="Insert Audio Block"
      description="Embed an audio player with optional title and transcript."
      position={position}
      maxWidth="max-w-xl"
      footer={
        <>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={handleInsert} variant="primary">Insert block</ModalButton>
        </>
      }
    >
      <FormField label="Audio URL">
        <FormInput
          value={form.src}
          onChange={v => setForm(f => ({ ...f, src: v }))}
          placeholder="https://..."
          type="url"
        />
      </FormField>

      <FormField label="Title (optional)">
        <FormInput
          value={form.title}
          onChange={v => setForm(f => ({ ...f, title: v }))}
          placeholder="Listen and answer"
        />
      </FormField>

      <FormField label="Transcript (optional)">
        <FormTextarea
          value={form.transcript}
          onChange={v => setForm(f => ({ ...f, transcript: v }))}
          rows={4}
        />
      </FormField>
    </ModalWrapper>
  )
}
