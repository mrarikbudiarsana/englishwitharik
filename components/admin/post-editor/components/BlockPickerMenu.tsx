import {
  SquarePlus,
  Headphones,
  FileQuestion,
  ListChecks,
  ToggleLeft,
  GitCompareArrows,
  AlignJustify,
  Mail,
  GripHorizontal,
  Send,
} from 'lucide-react'
import type { BlockModalType } from '../types'

interface BlockPickerMenuProps {
  onSelect: (type: BlockModalType) => void
}

const BLOCK_OPTIONS: Array<{ type: BlockModalType; label: string; icon: React.ReactNode }> = [
  { type: 'mcq', label: 'MCQ', icon: <SquarePlus size={14} /> },
  { type: 'audio', label: 'Audio Player', icon: <Headphones size={14} /> },
  { type: 'fill', label: 'Fill In The Gaps', icon: <FileQuestion size={14} /> },
  { type: 'dropdown', label: 'Dropdown Gaps', icon: <ListChecks size={14} /> },
  { type: 'truefalse', label: 'True / False', icon: <ToggleLeft size={14} /> },
  { type: 'matching', label: 'Matching', icon: <GitCompareArrows size={14} /> },
  { type: 'missingletters', label: 'Missing Letters', icon: <AlignJustify size={14} /> },
  { type: 'emailwriting', label: 'Email Writing', icon: <Mail size={14} /> },
  { type: 'dragsentence', label: 'Drag Sentence', icon: <GripHorizontal size={14} /> },
  { type: 'cta', label: 'CTA Form', icon: <Send size={14} /> },
]

export function BlockPickerMenu({ onSelect }: BlockPickerMenuProps) {
  return (
    <div className="w-64 rounded-lg border border-gray-200 bg-white shadow-lg z-20 p-2 space-y-1">
      {BLOCK_OPTIONS.map(option => (
        <button
          key={option.type}
          type="button"
          onClick={() => onSelect(option.type)}
          className="w-full text-left px-2.5 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-700 inline-flex items-center gap-2"
        >
          {option.icon}
          {option.label}
        </button>
      ))}
    </div>
  )
}
