import { useState, useCallback, useMemo } from 'react'
import type { CloudinaryResource } from '../types'

export function useMediaLibrary() {
  const [mediaResources, setMediaResources] = useState<CloudinaryResource[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaQuery, setMediaQuery] = useState('')
  const [mediaError, setMediaError] = useState<string | null>(null)

  const loadMediaResources = useCallback(async () => {
    setMediaLoading(true)
    setMediaError(null)
    try {
      const response = await fetch('/api/admin/media')
      if (!response.ok) throw new Error('failed')
      const data = await response.json()
      setMediaResources(Array.isArray(data.resources) ? data.resources : [])
    } catch {
      setMediaError('Could not load media library.')
      setMediaResources([])
    } finally {
      setMediaLoading(false)
    }
  }, [])

  const filteredMediaResources = useMemo(() => {
    if (!mediaQuery.trim()) return mediaResources
    const query = mediaQuery.trim().toLowerCase()
    return mediaResources.filter(resource =>
      resource.public_id.toLowerCase().includes(query)
      || resource.secure_url.toLowerCase().includes(query)
    )
  }, [mediaResources, mediaQuery])

  return {
    mediaResources,
    filteredMediaResources,
    mediaLoading,
    mediaQuery,
    setMediaQuery,
    mediaError,
    loadMediaResources,
  }
}
