import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { BlockTemplate, ShortcodeEntry } from '../types'
import { BLOCK_TEMPLATES_KEY } from '../constants'
import { isUuid } from '../utils'

export function useBlockTemplates() {
  const [blockTemplates, setBlockTemplates] = useState<BlockTemplate[]>([])
  const [selectedBlockTemplateId, setSelectedBlockTemplateId] = useState('')
  const [blockTemplateQuery, setBlockTemplateQuery] = useState('')
  const [blockTemplateName, setBlockTemplateName] = useState('')
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadTemplates() {
      const localTemplates = (() => {
        try {
          const raw = window.localStorage.getItem(BLOCK_TEMPLATES_KEY)
          if (!raw) return [] as BlockTemplate[]
          const parsed = JSON.parse(raw) as BlockTemplate[]
          return Array.isArray(parsed) ? parsed : []
        } catch {
          return [] as BlockTemplate[]
        }
      })()

      const supabase = createClient()
      const { data, error } = await supabase
        .from('interactive_block_templates')
        .select('id, name, block_type, shortcode')
        .order('created_at', { ascending: false })

      if (!cancelled && !error && Array.isArray(data)) {
        const mapped = data.map(item => ({
          id: item.id,
          name: item.name,
          blockType: item.block_type,
          shortcode: item.shortcode,
          remote: true,
        }))
        const merged = [...mapped]
        for (const localTemplate of localTemplates) {
          const hasSameRemoteId = localTemplate.remote && isUuid(localTemplate.id)
            ? mapped.some(t => t.id === localTemplate.id)
            : false
          const duplicateByContent = mapped.some(t =>
            t.blockType === localTemplate.blockType
            && t.shortcode === localTemplate.shortcode
            && t.name === localTemplate.name
          )
          if (!hasSameRemoteId && !duplicateByContent) {
            merged.push({ ...localTemplate, remote: false })
          }
        }

        setBlockTemplates(merged)
        window.localStorage.setItem(BLOCK_TEMPLATES_KEY, JSON.stringify(merged))
        return
      }

      if (!cancelled && localTemplates.length > 0) setBlockTemplates(localTemplates)
    }

    loadTemplates()
    return () => { cancelled = true }
  }, [])

  const saveBlockTemplates = useCallback((next: BlockTemplate[]) => {
    setBlockTemplates(next)
    window.localStorage.setItem(BLOCK_TEMPLATES_KEY, JSON.stringify(next))
  }, [])

  const saveBlockTemplate = useCallback(async (entry: ShortcodeEntry, fallbackName?: string) => {
    const name = blockTemplateName.trim() || fallbackName || ''
    if (!name) {
      window.alert('Template name is required.')
      return
    }

    const supabase = createClient()
    const { data: authData } = await supabase.auth.getUser()
    const createdBy = authData.user?.id ?? null
    const { data, error } = await supabase
      .from('interactive_block_templates')
      .insert({
        name,
        block_type: entry.blockType,
        shortcode: entry.shortcode,
        created_by: createdBy,
      })
      .select('id, name, block_type, shortcode')
      .single()

    const nextTemplate: BlockTemplate = data && !error
      ? {
        id: data.id,
        name: data.name,
        blockType: data.block_type,
        shortcode: data.shortcode,
        remote: true,
      }
      : {
        id: `local-${Date.now()}`,
        name,
        blockType: entry.blockType,
        shortcode: entry.shortcode,
        remote: false,
      }

    saveBlockTemplates([nextTemplate, ...blockTemplates])
    setSelectedBlockTemplateId(nextTemplate.id)
    setBlockTemplateName('')
    if (error) {
      window.alert('Saved locally. Supabase sync failed.')
    } else {
      window.alert('Block template saved.')
    }
  }, [blockTemplateName, blockTemplates, saveBlockTemplates])

  const deleteBlockTemplate = useCallback(async () => {
    const template = blockTemplates.find(t => t.id === selectedBlockTemplateId)
    if (!template) {
      window.alert('Select a block template first.')
      return
    }

    if (template.remote && isUuid(template.id)) {
      const supabase = createClient()
      const { error } = await supabase
        .from('interactive_block_templates')
        .delete()
        .eq('id', template.id)
      if (error) {
        window.alert('Could not delete on Supabase.')
        return
      }
    }

    const next = blockTemplates.filter(t => t.id !== selectedBlockTemplateId)
    saveBlockTemplates(next)
    setSelectedBlockTemplateId('')
    window.alert(`Deleted template "${template.name}".`)
  }, [blockTemplates, selectedBlockTemplateId, saveBlockTemplates])

  const exportBlockTemplates = useCallback(() => {
    if (blockTemplates.length === 0) {
      window.alert('No block templates to export.')
      return
    }
    const blob = new Blob([JSON.stringify(blockTemplates, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `block-templates-${Date.now()}.json`
    anchor.click()
    URL.revokeObjectURL(url)
  }, [blockTemplates])

  const importBlockTemplates = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as BlockTemplate[]
        if (!Array.isArray(parsed)) throw new Error('invalid-format')

        const sanitized = parsed
          .filter(item => item && typeof item === 'object')
          .map(item => ({
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: String((item as { name?: unknown }).name ?? 'Imported template'),
            blockType: String((item as { blockType?: unknown }).blockType ?? 'unknown'),
            shortcode: String((item as { shortcode?: unknown }).shortcode ?? ''),
          }))
          .filter(item => item.shortcode.startsWith('[block:'))

        saveBlockTemplates([...sanitized, ...blockTemplates])
        window.alert(`Imported ${sanitized.length} templates.`)
      } catch {
        window.alert('Invalid template file.')
      } finally {
        event.target.value = ''
      }
    }
    reader.readAsText(file)
  }, [blockTemplates, saveBlockTemplates])

  const filteredBlockTemplates = blockTemplates.filter(template => {
    if (!blockTemplateQuery.trim()) return true
    const query = blockTemplateQuery.toLowerCase()
    return (
      template.name.toLowerCase().includes(query)
      || template.blockType.toLowerCase().includes(query)
    )
  })

  return {
    blockTemplates,
    filteredBlockTemplates,
    selectedBlockTemplateId,
    setSelectedBlockTemplateId,
    blockTemplateQuery,
    setBlockTemplateQuery,
    blockTemplateName,
    setBlockTemplateName,
    fileInputRef,
    saveBlockTemplate,
    deleteBlockTemplate,
    exportBlockTemplates,
    importBlockTemplates,
  }
}
