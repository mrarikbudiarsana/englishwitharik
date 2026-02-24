import {
  Type,
  X,
  Bold,
  Italic,
  UnderlineIcon,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  LinkIcon,
  ImageIcon,
  Minus,
  ListCollapse,
  Table as TableIcon,
} from 'lucide-react'
import type { Editor } from '@tiptap/react'
import { ToolbarButton } from './ToolbarButton'
import type { BlockModalType } from '../types'

interface FloatingToolbarProps {
  editor: Editor
  isOpen: boolean
  onToggle: () => void
  onAddLink: () => void
  onAddImage: () => void
  onSetImageWidth: (width: string) => void
  onOpenBlockModal: (type: BlockModalType) => void
}

export function FloatingToolbar({
  editor,
  isOpen,
  onToggle,
  onAddLink,
  onAddImage,
  onSetImageWidth,
  onOpenBlockModal,
}: FloatingToolbarProps) {
  return (
    <div className="fixed bottom-6 left-6 z-20 flex items-end gap-2">
      <button
        type="button"
        onClick={onToggle}
        className="rounded-full bg-white border border-gray-200 p-3 shadow-lg cursor-pointer hover:bg-gray-50 text-gray-700 transition-colors"
        title="Toggle formatting toolbar"
      >
        {isOpen ? <X size={20} /> : <Type size={20} />}
      </button>

      {isOpen && (
        <div className="max-w-[calc(100vw-12rem)] overflow-x-auto rounded-2xl border border-gray-200 bg-white/95 px-2 py-1.5 shadow-lg backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-0.5">
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
          </div>
        </div>
      )}
    </div>
  )
}
