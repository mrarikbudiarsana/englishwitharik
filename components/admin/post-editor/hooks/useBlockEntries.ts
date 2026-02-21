import { useState, useEffect, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import type { ShortcodeEntry, BlockModalType } from '../types'
import { BLOCK_TYPE_TO_MODAL } from '../constants'
import { getShortcodeEntries } from '../utils'

interface UseBlockEntriesOptions {
  onOpenBlockModal?: (type: BlockModalType) => void
}

export function useBlockEntries(editor: Editor | null, options: UseBlockEntriesOptions = {}) {
  const { onOpenBlockModal } = options
  const [blockEntries, setBlockEntries] = useState<ShortcodeEntry[]>([])

  const updateEntries = useCallback(() => {
    if (!editor) return
    setBlockEntries(getShortcodeEntries(editor))
  }, [editor])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    updateEntries()
    if (!editor) return

    function handleUpdate() {
      updateEntries()
    }

    editor.on('update', handleUpdate)
    return () => {
      editor.off('update', handleUpdate)
    }
  }, [editor, updateEntries])

  const focusShortcode = useCallback((entry: ShortcodeEntry) => {
    if (!editor) return
    editor.chain().focus().setTextSelection({ from: entry.from, to: entry.to }).run()
  }, [editor])

  const duplicateShortcode = useCallback((entry: ShortcodeEntry) => {
    if (!editor) return
    editor.chain().focus().insertContentAt(entry.to, `<p>${entry.shortcode}</p>`).run()
  }, [editor])

  const moveShortcode = useCallback((index: number, direction: -1 | 1) => {
    if (!editor) return
    const source = blockEntries[index]
    const target = blockEntries[index + direction]
    if (!source || !target) return

    const tr = editor.state.tr
    tr.insertText(source.shortcode, target.from, target.to)
    const mappedFrom = tr.mapping.map(source.from)
    const mappedTo = tr.mapping.map(source.to)
    tr.insertText(target.shortcode, mappedFrom, mappedTo)
    editor.view.dispatch(tr)
  }, [editor, blockEntries])

  const deleteShortcode = useCallback((entry: ShortcodeEntry) => {
    if (!editor) return
    const ok = window.confirm(`Delete this ${entry.blockType.replaceAll('_', ' ')} block?`)
    if (!ok) return
    editor.chain().focus().insertContentAt({ from: entry.from, to: entry.to }, '').run()
  }, [editor])

  const editShortcode = useCallback((entry: ShortcodeEntry) => {
    const targetModal = BLOCK_TYPE_TO_MODAL[entry.blockType] as BlockModalType | undefined
    if (!targetModal) {
      window.alert(`Unsupported block type: ${entry.blockType}`)
      return
    }
    focusShortcode(entry)
    onOpenBlockModal?.(targetModal)
  }, [focusShortcode, onOpenBlockModal])

  return {
    blockEntries,
    updateEntries,
    focusShortcode,
    editShortcode,
    duplicateShortcode,
    moveShortcode,
    deleteShortcode,
  }
}
