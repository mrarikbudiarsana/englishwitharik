import type { ModalPosition } from '../types'
import { ModalWrapper, ModalButton, FormField, FormInput } from './ModalWrapper'

interface UrlInputModalProps {
  isOpen: boolean
  position: ModalPosition | null
  title: string
  description: string
  label?: string
  value: string
  placeholder?: string
  submitLabel?: string
  onChange: (value: string) => void
  onSubmit: () => void
  onClose: () => void
}

export function UrlInputModal({
  isOpen,
  position,
  title,
  description,
  label = 'URL',
  value,
  placeholder,
  submitLabel = 'Insert',
  onChange,
  onSubmit,
  onClose,
}: UrlInputModalProps) {
  if (!isOpen) return null

  return (
    <ModalWrapper
      title={title}
      description={description}
      position={position}
      maxWidth="max-w-xl"
      footer={(
        <>
          <ModalButton onClick={onClose}>Cancel</ModalButton>
          <ModalButton onClick={onSubmit} variant="primary">{submitLabel}</ModalButton>
        </>
      )}
    >
      <FormField label={label}>
        <FormInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
      </FormField>
    </ModalWrapper>
  )
}
