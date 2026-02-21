import type { ReactNode } from 'react'
import { cn } from '@/components/ui/cn'

interface ToolbarButtonProps {
  onClick: () => void
  active?: boolean
  title: string
  children: ReactNode
  disabled?: boolean
  className?: string
}

export function ToolbarButton({
  onClick,
  active = false,
  title,
  children,
  disabled = false,
  className,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={cn(
        'p-1.5 rounded hover:bg-gray-100 transition-colors',
        active && 'bg-gray-200 text-gray-900',
        !active && 'text-gray-600',
        disabled && 'opacity-30 cursor-not-allowed',
        className
      )}
    >
      {children}
    </button>
  )
}
