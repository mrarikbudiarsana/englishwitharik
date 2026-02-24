import type { RefObject, ChangeEvent } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import type { BlockTemplate } from '../types'

interface BlockTemplatesPanelProps {
  isOpen: boolean
  onToggle: () => void
  templates: BlockTemplate[]
  selectedTemplateId: string
  onSelectTemplate: (id: string) => void
  query: string
  onQueryChange: (query: string) => void
  templateName: string
  onTemplateNameChange: (name: string) => void
  onInsertTemplate: () => void
  onDeleteTemplate: () => void
  onExport: () => void
  onImportClick: () => void
  fileInputRef: RefObject<HTMLInputElement | null>
  onImport: (event: ChangeEvent<HTMLInputElement>) => void
}

export function BlockTemplatesPanel({
  isOpen,
  onToggle,
  templates,
  selectedTemplateId,
  onSelectTemplate,
  query,
  onQueryChange,
  templateName,
  onTemplateNameChange,
  onInsertTemplate,
  onDeleteTemplate,
  onExport,
  onImportClick,
  fileInputRef,
  onImport,
}: BlockTemplatesPanelProps) {
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between rounded-md px-1 py-1 text-left cursor-pointer hover:bg-gray-100/70"
        aria-expanded={isOpen}
      >
        <span className="text-xs font-semibold text-gray-700">Block Templates</span>
        {isOpen ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
      </button>

      {isOpen && (
        <div className="rounded-lg border border-gray-200 bg-white p-2 space-y-2">
          <input
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
            placeholder="Search templates"
          />
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto] gap-2">
            <select
              value={selectedTemplateId}
              onChange={e => onSelectTemplate(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
            >
              <option value="">Select saved block template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} ({template.blockType.replaceAll('_', ' ')})
                </option>
              ))}
            </select>
            <button type="button" onClick={onInsertTemplate} className="px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer hover:bg-white">
              Insert
            </button>
            <button type="button" onClick={onDeleteTemplate} className="px-3 py-2 text-sm border border-red-300 text-red-700 rounded-lg cursor-pointer hover:bg-red-50">
              Delete
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onExport} className="px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer hover:bg-white">
              Export
            </button>
            <button type="button" onClick={onImportClick} className="px-3 py-2 text-sm border border-gray-300 rounded-lg cursor-pointer hover:bg-white">
              Import
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json"
              onChange={onImport}
              className="hidden"
            />
          </div>
          <div className="space-y-1">
            <input
              type="text"
              value={templateName}
              onChange={e => onTemplateNameChange(e.target.value)}
              className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
              placeholder="Template name (used by Save tpl)"
            />
            <p className="text-xs text-gray-500">Set a name, then click `Save tpl` on any block row.</p>
          </div>
        </div>
      )}
    </div>
  )
}
