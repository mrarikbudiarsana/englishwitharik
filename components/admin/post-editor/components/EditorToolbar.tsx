import { useRef, useState, useEffect } from 'react'
import type { Editor } from '@tiptap/react'
import {
  Bold, Italic, UnderlineIcon, Strikethrough,
  Heading2, Heading3, List, ListOrdered,
  Quote, LinkIcon, ImageIcon, Minus, SquarePlus,
  Table as TableIcon, Spline, Merge, Columns, Rows, Trash, ListCollapse
} from 'lucide-react'
import { ToolbarButton } from './ToolbarButton'
import { BlockPickerMenu } from './BlockPickerMenu'
import type { BlockModalType } from '../types'

interface EditorToolbarProps {
  editor: Editor
  onAddLink: () => void
  onAddImage: () => void
  onOpenBlockModal: (type: BlockModalType) => void
  onSetImageWidth: (width: string) => void
}

export function EditorToolbar({
  editor,
  onAddLink,
  onAddImage,
  onOpenBlockModal,
  onSetImageWidth,
}: EditorToolbarProps) {
  const [showBlockPicker, setShowBlockPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node
      if (!pickerRef.current?.contains(target)) {
        setShowBlockPicker(false)
      }
    }

    if (showBlockPicker) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showBlockPicker])

  const handleBlockSelect = (type: BlockModalType) => {
    setShowBlockPicker(false)
    onOpenBlockModal(type)
  }

  return (
    <div className="sticky top-0 z-10 flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-gray-200 bg-gray-50">
      <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
        <Bold size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
        <Italic size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
        <UnderlineIcon size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
        <Strikethrough size={15} />
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">
        <Heading2 size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">
        <Heading3 size={15} />
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
        <List size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List">
        <ListOrdered size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
        <Quote size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => onOpenBlockModal('collapsible')} active={false} title="Collapsible Block">
        <ListCollapse size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} active={false} title="Divider">
        <Minus size={15} />
      </ToolbarButton>

      <div className="w-px h-5 bg-gray-300 mx-1" />

      <ToolbarButton onClick={onAddLink} active={editor.isActive('link')} title="Add Link">
        <LinkIcon size={15} />
      </ToolbarButton>
      <ToolbarButton onClick={onAddImage} active={false} title="Add Image">
        <ImageIcon size={15} />
      </ToolbarButton>

      {editor.isActive('image') && (
        <div className="ml-1 inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-1 py-0.5">
          <button type="button" onClick={() => onSetImageWidth('40%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded cursor-pointer hover:bg-gray-100">S</button>
          <button type="button" onClick={() => onSetImageWidth('60%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded cursor-pointer hover:bg-gray-100">M</button>
          <button type="button" onClick={() => onSetImageWidth('80%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded cursor-pointer hover:bg-gray-100">L</button>
          <button type="button" onClick={() => onSetImageWidth('100%')} className="px-1.5 py-0.5 text-[11px] text-gray-700 rounded cursor-pointer hover:bg-gray-100">Full</button>
        </div>
      )}

      <div className="w-px h-5 bg-gray-300 mx-1" />

      <ToolbarButton onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} active={editor.isActive('table')} title="Insert Table">
        <TableIcon size={15} />
      </ToolbarButton>

      {editor.isActive('table') && (
        <div className="ml-1 inline-flex items-center gap-0.5 rounded-md border border-gray-300 bg-white px-1 py-0.5 shadow-sm">
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnBefore().run()}
            disabled={!editor.can().addColumnBefore()}
            className="p-1 text-gray-700 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Add Column Before"
          >
            <Columns size={13} className="rotate-90" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addColumnAfter().run()}
            disabled={!editor.can().addColumnAfter()}
            className="p-1 text-gray-700 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Add Column After"
          >
            <Columns size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            disabled={!editor.can().deleteColumn()}
            className="p-1 text-red-600 rounded cursor-pointer hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete Column"
          >
            <Trash size={13} />
          </button>
          <div className="w-px h-3 bg-gray-200 mx-0.5" />
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowBefore().run()}
            disabled={!editor.can().addRowBefore()}
            className="p-1 text-gray-700 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Add Row Before"
          >
            <Rows size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            disabled={!editor.can().addRowAfter()}
            className="p-1 text-gray-700 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Add Row After"
          >
            <Rows size={13} className="rotate-180" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            disabled={!editor.can().deleteRow()}
            className="p-1 text-red-600 rounded cursor-pointer hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete Row"
          >
            <Trash size={13} />
          </button>
          <div className="w-px h-3 bg-gray-200 mx-0.5" />
          <button
            type="button"
            onClick={() => editor.chain().focus().mergeCells().run()}
            disabled={!editor.can().mergeCells()}
            className="p-1 text-gray-700 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Merge Cells"
          >
            <Merge size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().splitCell().run()}
            disabled={!editor.can().splitCell()}
            className="p-1 text-gray-700 rounded cursor-pointer hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Split Cell"
          >
            <Spline size={13} />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            disabled={!editor.can().deleteTable()}
            className="p-1 text-red-600 rounded cursor-pointer hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete Table"
          >
            <Trash size={13} />
          </button>
        </div>
      )}

      <div className="w-px h-5 bg-gray-300 mx-1" />

      <div className="relative ml-1" ref={pickerRef}>
        <button
          type="button"
          onClick={() => setShowBlockPicker(prev => !prev)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-[#08507f]/30 text-[#08507f] bg-[#08507f]/5 hover:bg-[#08507f]/10 transition-colors"
        >
          <SquarePlus size={14} />
          Insert Block
        </button>

        {showBlockPicker && (
          <div className="absolute right-0 mt-2">
            <BlockPickerMenu onSelect={handleBlockSelect} />
          </div>
        )}
      </div>
    </div>
  )
}
