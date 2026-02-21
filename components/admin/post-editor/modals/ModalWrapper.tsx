import type { ReactNode } from 'react'
import type { ModalPosition } from '../types'

interface ModalWrapperProps {
  title: string
  description: string
  position: ModalPosition | null
  maxWidth?: string
  children: ReactNode
  footer: ReactNode
}

export function ModalWrapper({
  title,
  description,
  position,
  maxWidth = 'max-w-xl',
  children,
  footer,
}: ModalWrapperProps) {
  return (
    <div className="fixed inset-0 z-30 bg-black/30 p-4">
      <div
        className={`absolute w-full ${maxWidth} max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4`}
        style={{ top: position?.top ?? 80, left: position?.left ?? 24 }}
      >
        <div>
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </div>

        <div className="space-y-3">
          {children}
        </div>

        <div className="flex items-center justify-end gap-2 pt-1">
          {footer}
        </div>
      </div>
    </div>
  )
}

interface ModalButtonProps {
  onClick: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  children: ReactNode
}

export function ModalButton({ onClick, variant = 'secondary', children }: ModalButtonProps) {
  const baseClass = 'px-3 py-2 text-sm rounded-lg'
  const variantClass = {
    primary: 'bg-[#08507f] text-white hover:bg-[#063a5c]',
    secondary: 'border border-gray-300 hover:bg-gray-50',
    danger: 'border border-red-300 text-red-700 hover:bg-red-50',
  }[variant]

  return (
    <button type="button" onClick={onClick} className={`${baseClass} ${variantClass}`}>
      {children}
    </button>
  )
}

interface FormFieldProps {
  label: string
  children: ReactNode
}

export function FormField({ label, children }: FormFieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
      {children}
    </div>
  )
}

export function FormInput({
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
      placeholder={placeholder}
    />
  )
}

export function FormTextarea({
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f] resize-y"
      placeholder={placeholder}
    />
  )
}

export function FormSelect<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T
  onChange: (value: T) => void
  options: Array<{ value: T; label: string }>
}) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value as T)}
      className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
    >
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  )
}
