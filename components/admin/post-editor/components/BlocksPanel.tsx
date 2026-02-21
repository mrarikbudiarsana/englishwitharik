import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/components/ui/cn'
import type { ShortcodeEntry } from '../types'

interface BlocksPanelProps {
  isOpen: boolean
  onToggle: () => void
  blockEntries: ShortcodeEntry[]
  onFocus: (entry: ShortcodeEntry) => void
  onEdit: (entry: ShortcodeEntry) => void
  onDuplicate: (entry: ShortcodeEntry) => void
  onSaveTemplate: (entry: ShortcodeEntry, fallbackName: string) => void
  onMoveUp: (index: number) => void
  onMoveDown: (index: number) => void
  onDelete: (entry: ShortcodeEntry) => void
}

export function BlocksPanel({
  isOpen,
  onToggle,
  blockEntries,
  onFocus,
  onEdit,
  onDuplicate,
  onSaveTemplate,
  onMoveUp,
  onMoveDown,
  onDelete,
}: BlocksPanelProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between rounded-md px-1 py-1 text-left hover:bg-gray-100/70"
        aria-expanded={isOpen}
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-gray-600">Blocks</span>
          {blockEntries.length === 0 && <span className="text-xs text-gray-500">No interactive blocks yet.</span>}
          {blockEntries.length > 0 && (
            <span className="text-xs text-gray-500">{blockEntries.length} block{blockEntries.length > 1 ? 's' : ''}</span>
          )}
        </div>
        {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
      </button>

      {isOpen && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            {blockEntries.map((entry, index) => (
              <button
                key={entry.id}
                type="button"
                onClick={() => onFocus(entry)}
                className={cn(
                  'inline-flex items-center rounded-full border bg-white px-2.5 py-1 text-xs hover:bg-gray-100',
                  entry.validationError ? 'border-amber-300 text-amber-800' : 'border-gray-300 text-gray-700'
                )}
              >
                {index + 1}. {entry.blockType.replaceAll('_', ' ')}
              </button>
            ))}
          </div>

          {blockEntries.length > 0 && (
            <div className="rounded-lg border border-gray-200 bg-white p-2">
              <div className="max-h-36 overflow-y-auto space-y-1">
                {blockEntries.map((entry, index) => (
                  <div key={`row-${entry.id}`} className="flex items-center justify-between gap-2 rounded-md px-2 py-1.5 hover:bg-gray-50">
                    <div>
                      <p className="text-xs text-gray-700">
                        {index + 1}. {entry.blockType.replaceAll('_', ' ')}
                      </p>
                      {entry.validationError && (
                        <p className="text-[11px] text-amber-700">{entry.validationError}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button type="button" onClick={() => onFocus(entry)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white">Go</button>
                      <button type="button" onClick={() => onEdit(entry)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white">Edit</button>
                      <button type="button" onClick={() => onDuplicate(entry)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white">Duplicate</button>
                      <button type="button" onClick={() => onSaveTemplate(entry, `${entry.blockType.replaceAll('_', ' ')} ${index + 1}`)} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white">Save tpl</button>
                      <button type="button" onClick={() => onMoveUp(index)} disabled={index === 0} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white disabled:opacity-40">Up</button>
                      <button type="button" onClick={() => onMoveDown(index)} disabled={index === blockEntries.length - 1} className="px-2 py-1 text-xs border border-gray-300 rounded hover:bg-white disabled:opacity-40">Down</button>
                      <button type="button" onClick={() => onDelete(entry)} className="px-2 py-1 text-xs border border-red-300 text-red-700 rounded hover:bg-red-50">Delete</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
