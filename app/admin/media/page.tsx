'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Upload,
  Copy,
  Trash2,
  Image as ImageIcon,
  Music2,
  Video,
  File,
  Search,
  Check,
} from 'lucide-react'

interface CloudinaryResource {
  public_id: string
  secure_url: string
  width?: number | null
  height?: number | null
  format?: string | null
  bytes: number
  created_at: string
  resource_type?: 'image' | 'video' | 'raw' | string
}

type MediaTypeFilter = 'all' | 'image' | 'audio' | 'video' | 'other'
type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'size-desc' | 'size-asc' | 'type'
type ViewMode = 'grid' | 'list'

const AUDIO_FORMATS = new Set(['mp3', 'wav', 'm4a', 'aac', 'ogg', 'oga', 'flac', 'opus', 'webm'])

function inferMediaType(resource: CloudinaryResource): Exclude<MediaTypeFilter, 'all'> {
  const format = (resource.format ?? '').toLowerCase()
  if (resource.resource_type === 'image') return 'image'
  if (resource.resource_type === 'video') return AUDIO_FORMATS.has(format) ? 'audio' : 'video'
  if (resource.resource_type === 'raw') return AUDIO_FORMATS.has(format) ? 'audio' : 'other'
  if (AUDIO_FORMATS.has(format)) return 'audio'
  return 'other'
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatDate(isoDate: string) {
  const value = new Date(isoDate)
  if (Number.isNaN(value.getTime())) return ''
  return value.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function getFilename(publicId: string) {
  return publicId.split('/').pop() ?? publicId
}

export default function AdminMediaPage() {
  const [resources, setResources] = useState<CloudinaryResource[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchMedia() {
    setLoading(true)
    const res = await fetch('/api/admin/media')
    const data = await res.json()
    setResources(data.resources ?? [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMedia()
  }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach((file) => formData.append('file', file))
    await fetch('/api/admin/media', { method: 'POST', body: formData })
    await fetchMedia()
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(resource: CloudinaryResource) {
    const mediaType = inferMediaType(resource)
    if (!confirm(`Delete this ${mediaType} file? This cannot be undone.`)) return

    await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        public_id: resource.public_id,
        resource_type: resource.resource_type,
      }),
    })

    setResources((current) => current.filter((item) => item.public_id !== resource.public_id))
  }

  function handleCopy(url: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(() => {
          setCopied(url)
          setTimeout(() => setCopied(null), 2000)
        })
        .catch(() => fallbackCopy(url))
      return
    }
    fallbackCopy(url)
  }

  function fallbackCopy(text: string) {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      setCopied(text)
      setTimeout(() => setCopied(null), 2000)
    } catch (error) {
      console.error('Unable to copy URL', error)
    }

    document.body.removeChild(textArea)
  }

  const filteredResources = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = resources.filter((resource) => {
      const mediaType = inferMediaType(resource)
      if (typeFilter !== 'all' && mediaType !== typeFilter) return false
      if (!normalizedQuery) return true
      const fileName = getFilename(resource.public_id).toLowerCase()
      const publicId = resource.public_id.toLowerCase()
      const format = (resource.format ?? '').toLowerCase()
      return fileName.includes(normalizedQuery) || publicId.includes(normalizedQuery) || format.includes(normalizedQuery)
    })

    filtered.sort((a, b) => {
      const aName = getFilename(a.public_id).toLowerCase()
      const bName = getFilename(b.public_id).toLowerCase()
      const aCreated = Date.parse(a.created_at) || 0
      const bCreated = Date.parse(b.created_at) || 0
      const aBytes = a.bytes ?? 0
      const bBytes = b.bytes ?? 0
      const aType = inferMediaType(a)
      const bType = inferMediaType(b)

      switch (sortBy) {
        case 'oldest':
          return aCreated - bCreated
        case 'name-asc':
          return aName.localeCompare(bName)
        case 'name-desc':
          return bName.localeCompare(aName)
        case 'size-desc':
          return bBytes - aBytes
        case 'size-asc':
          return aBytes - bBytes
        case 'type':
          return aType.localeCompare(bType) || bCreated - aCreated
        case 'newest':
        default:
          return bCreated - aCreated
      }
    })

    return filtered
  }, [query, resources, sortBy, typeFilter])

  const hasActiveFilters = query.trim().length > 0 || typeFilter !== 'all' || sortBy !== 'newest'

  return (
    <div className="p-6 md:p-8 space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            {filteredResources.length} shown of {resources.length} files
          </p>
        </div>
        <label
          className={`inline-flex items-center justify-center gap-2 bg-[#08507f] hover:bg-[#063a5c] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer ${
            uploading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload Files'}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*,audio/*,video/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-3 md:p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr),180px,180px,auto,auto] md:items-center">
          <div className="relative">
            <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by filename, id, or format..."
              className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-[#08507f] focus:ring-2 focus:ring-[#08507f]/20"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(event) => setTypeFilter(event.target.value as MediaTypeFilter)}
            className="rounded-lg border border-gray-300 py-2 px-3 text-sm outline-none focus:border-[#08507f] focus:ring-2 focus:ring-[#08507f]/20"
          >
            <option value="all">All Types</option>
            <option value="image">Images</option>
            <option value="audio">Audio</option>
            <option value="video">Video</option>
            <option value="other">Other Files</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortOption)}
            className="rounded-lg border border-gray-300 py-2 px-3 text-sm outline-none focus:border-[#08507f] focus:ring-2 focus:ring-[#08507f]/20"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="size-desc">Size (Largest)</option>
            <option value="size-asc">Size (Smallest)</option>
            <option value="type">Type</option>
          </select>

          <button
            type="button"
            onClick={() => {
              setQuery('')
              setTypeFilter('all')
              setSortBy('newest')
            }}
            disabled={!hasActiveFilters}
            className="rounded-lg border border-gray-300 py-2 px-3 text-sm text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Clear
          </button>

          <div className="inline-flex rounded-lg border border-gray-300 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === 'grid' ? 'bg-[#08507f] text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                viewMode === 'list' ? 'bg-[#08507f] text-white' : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {Array.from({ length: 18 }).map((_, index) => (
            <div key={index} className="h-44 rounded-xl border border-gray-200 bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredResources.length === 0 ? (
        <div className="py-20 text-center">
          <ImageIcon size={44} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 text-sm font-medium">No matching files</p>
          <p className="text-gray-400 text-sm mt-1">Try changing the search text, type filter, or sort order.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filteredResources.map((resource) => {
            const mediaType = inferMediaType(resource)
            const filename = getFilename(resource.public_id)
            const dimensions = resource.width && resource.height ? `${resource.width}x${resource.height}` : null
            const commonMeta = `${resource.format?.toUpperCase() ?? 'FILE'} · ${formatBytes(resource.bytes)}`

            return (
              <div
                key={resource.public_id}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden hover:border-[#08507f]/40 transition-colors"
              >
                <div className="relative h-28 bg-gray-100">
                  {mediaType === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={resource.secure_url}
                      alt={filename}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-50 to-gray-200 text-gray-600">
                      {mediaType === 'audio' ? (
                        <Music2 size={28} />
                      ) : mediaType === 'video' ? (
                        <Video size={28} />
                      ) : (
                        <File size={28} />
                      )}
                    </div>
                  )}
                  <span className="absolute right-2 top-2 rounded-md bg-black/65 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-white">
                    {mediaType}
                  </span>
                </div>

                <div className="p-2.5">
                  <p className="truncate text-xs font-medium text-gray-800" title={filename}>
                    {filename}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500 truncate" title={resource.public_id}>
                    {resource.public_id}
                  </p>
                  <p className="mt-1 text-[11px] text-gray-500">
                    {dimensions ? `${dimensions} · ${commonMeta}` : commonMeta}
                  </p>
                  <p className="mt-0.5 text-[11px] text-gray-400">{formatDate(resource.created_at)}</p>

                  <div className="mt-2 flex items-center gap-1.5">
                    <button
                      onClick={() => handleCopy(resource.secure_url)}
                      title="Copy URL"
                      className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-gray-200 bg-white text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {copied === resource.secure_url ? <Check size={12} /> : <Copy size={12} />}
                      {copied === resource.secure_url ? 'Copied' : 'Copy'}
                    </button>
                    <button
                      onClick={() => handleDelete(resource)}
                      title="Delete file"
                      className="inline-flex h-7 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="hidden grid-cols-[48px,1.4fr,0.7fr,0.8fr,0.7fr,140px] items-center gap-3 border-b border-gray-200 bg-gray-50 px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500 md:grid">
            <span>Type</span>
            <span>Name</span>
            <span>Format</span>
            <span>Details</span>
            <span>Date</span>
            <span className="text-right">Actions</span>
          </div>
          <div className="divide-y divide-gray-100">
            {filteredResources.map((resource) => {
              const mediaType = inferMediaType(resource)
              const filename = getFilename(resource.public_id)
              const dimensions = resource.width && resource.height ? `${resource.width}x${resource.height}` : '-'

              return (
                <div
                  key={resource.public_id}
                  className="grid grid-cols-[40px,minmax(0,1fr),auto] items-center gap-3 px-3 py-2.5 md:grid-cols-[48px,1.4fr,0.7fr,0.8fr,0.7fr,140px]"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-gray-600 md:h-10 md:w-10">
                    {mediaType === 'image' ? (
                      <ImageIcon size={16} />
                    ) : mediaType === 'audio' ? (
                      <Music2 size={16} />
                    ) : mediaType === 'video' ? (
                      <Video size={16} />
                    ) : (
                      <File size={16} />
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-gray-800" title={filename}>
                      {filename}
                    </p>
                    <p className="truncate text-[11px] text-gray-500" title={resource.public_id}>
                      {resource.public_id}
                    </p>
                  </div>

                  <p className="hidden text-xs text-gray-600 md:block">{resource.format?.toUpperCase() ?? 'FILE'}</p>
                  <p className="hidden text-xs text-gray-600 md:block">
                    {dimensions} · {formatBytes(resource.bytes)}
                  </p>
                  <p className="hidden text-xs text-gray-500 md:block">{formatDate(resource.created_at)}</p>

                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => handleCopy(resource.secure_url)}
                      title="Copy URL"
                      className="inline-flex h-7 items-center justify-center gap-1 rounded-md border border-gray-200 px-2 text-[11px] font-medium text-gray-700 hover:bg-gray-50"
                    >
                      {copied === resource.secure_url ? <Check size={12} /> : <Copy size={12} />}
                      <span className="hidden sm:inline">{copied === resource.secure_url ? 'Copied' : 'Copy'}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(resource)}
                      title="Delete file"
                      className="inline-flex h-7 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
