import { useState, useEffect, useCallback } from 'react'
import type { CtaTemplate } from '../types'
import { CTA_TEMPLATES_KEY } from '../constants'

export function useCtaTemplates() {
  const [ctaTemplates, setCtaTemplates] = useState<CtaTemplate[]>([])
  const [selectedCtaTemplateId, setSelectedCtaTemplateId] = useState('')

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CTA_TEMPLATES_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as CtaTemplate[]
      if (Array.isArray(parsed)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCtaTemplates(parsed)
      }
    } catch {
      // Ignore malformed local storage
    }
  }, [])

  const saveTemplates = useCallback((next: CtaTemplate[]) => {
    setCtaTemplates(next)
    window.localStorage.setItem(CTA_TEMPLATES_KEY, JSON.stringify(next))
  }, [])

  const saveCtaTemplate = useCallback((
    name: string,
    title: string,
    description: string,
    submitLabel: string,
    source: string
  ) => {
    if (!name.trim()) {
      window.alert('Template name is required.')
      return false
    }
    if (!title.trim()) {
      window.alert('CTA title is required.')
      return false
    }

    const existing = ctaTemplates.find(t => t.name.toLowerCase() === name.toLowerCase())
    const nextTemplate: CtaTemplate = {
      id: existing?.id ?? `${Date.now()}`,
      name,
      title,
      description,
      submitLabel,
      source,
    }

    const next = existing
      ? ctaTemplates.map(t => (t.id === existing.id ? nextTemplate : t))
      : [nextTemplate, ...ctaTemplates]

    saveTemplates(next)
    setSelectedCtaTemplateId(nextTemplate.id)
    window.alert('CTA template saved.')
    return true
  }, [ctaTemplates, saveTemplates])

  const loadCtaTemplate = useCallback((templateId: string): CtaTemplate | null => {
    return ctaTemplates.find(t => t.id === templateId) ?? null
  }, [ctaTemplates])

  const deleteCtaTemplate = useCallback((templateId: string) => {
    const template = ctaTemplates.find(t => t.id === templateId)
    if (!template) {
      window.alert('Select a template first.')
      return
    }
    const next = ctaTemplates.filter(t => t.id !== templateId)
    saveTemplates(next)
    setSelectedCtaTemplateId('')
    window.alert(`Deleted template "${template.name}".`)
  }, [ctaTemplates, saveTemplates])

  return {
    ctaTemplates,
    selectedCtaTemplateId,
    setSelectedCtaTemplateId,
    saveCtaTemplate,
    loadCtaTemplate,
    deleteCtaTemplate,
  }
}
