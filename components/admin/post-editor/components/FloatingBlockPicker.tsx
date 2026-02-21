import { useEffect, useRef } from 'react'
import { SquarePlus } from 'lucide-react'
import type { BlockModalType } from '../types'
import { BlockPickerMenu } from './BlockPickerMenu'

interface FloatingBlockPickerProps {
  isOpen: boolean
  onToggle: () => void
  onSelect: (type: BlockModalType) => void
}

export function FloatingBlockPicker({
  isOpen,
  onToggle,
  onSelect,
}: FloatingBlockPickerProps) {
  const pickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (!pickerRef.current?.contains(target) && isOpen) {
        onToggle()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onToggle])

  return (
    <div className="fixed bottom-6 right-6 z-20" ref={pickerRef}>
      {isOpen && (
        <div className="mb-2">
          <BlockPickerMenu onSelect={onSelect} />
        </div>
      )}

      <button
        type="button"
        onClick={onToggle}
        className="inline-flex items-center gap-2 rounded-full bg-[#08507f] px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-[#063a5c]"
      >
        <SquarePlus size={16} />
        Insert Block
      </button>
    </div>
  )
}
