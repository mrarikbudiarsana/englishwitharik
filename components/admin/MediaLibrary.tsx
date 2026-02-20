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

export interface CloudinaryResource {
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

function getTypeStyles(type: Exclude<MediaTypeFilter, 'all'>) {
    switch (type) {
        case 'image':
            return 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
        case 'audio':
            return 'bg-sky-50 text-sky-700 ring-1 ring-sky-200'
        case 'video':
            return 'bg-violet-50 text-violet-700 ring-1 ring-violet-200'
        case 'other':
        default:
            return 'bg-slate-100 text-slate-700 ring-1 ring-slate-200'
    }
}

function getMediaIcon(type: Exclude<MediaTypeFilter, 'all'>, size = 16) {
    if (type === 'image') return <ImageIcon size={size} />
    if (type === 'audio') return <Music2 size={size} />
    if (type === 'video') return <Video size={size} />
    return <File size={size} />
}

interface MediaLibraryProps {
    onSelect?: (url: string) => void
    embedded?: boolean
}

export default function MediaLibrary({ onSelect, embedded = false }: MediaLibraryProps) {
    const [resources, setResources] = useState<CloudinaryResource[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [copied, setCopied] = useState<string | null>(null)
    const [query, setQuery] = useState('')
    const [typeFilter, setTypeFilter] = useState<MediaTypeFilter>('all')
    const [sortBy, setSortBy] = useState<SortOption>('newest')
    const [viewMode, setViewMode] = useState<ViewMode>(embedded ? 'grid' : 'list')
    const fileRef = useRef<HTMLInputElement>(null)

    async function requestMedia() {
        const res = await fetch('/api/admin/media')
        const data = await res.json()
        return data.resources ?? []
    }

    useEffect(() => {
        let active = true

        void requestMedia()
            .then((items) => {
                if (!active) return
                setResources(items)
                setLoading(false)
            })
            .catch(() => {
                if (!active) return
                setResources([])
                setLoading(false)
            })

        return () => {
            active = false
        }
    }, [])

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files
        if (!files?.length) return
        setUploading(true)
        setLoading(true)
        const formData = new FormData()
        Array.from(files).forEach((file) => formData.append('file', file))
        try {
            await fetch('/api/admin/media', { method: 'POST', body: formData })
            const items = await requestMedia()
            setResources(items)
        } finally {
            setLoading(false)
            setUploading(false)
        }
        if (fileRef.current) fileRef.current.value = ''
    }

    async function handleDelete(resource: CloudinaryResource, e: React.MouseEvent) {
        e.stopPropagation()
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

    function handleCopy(url: string, e: React.MouseEvent) {
        e.stopPropagation()
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
        <div className={`space-y-6 ${embedded ? '' : 'min-h-screen bg-slate-50/70 p-4 md:p-8'}`}>
            <div className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${embedded ? 'p-4' : 'px-5 py-4 md:px-6 md:py-5'}`}>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h1 className={`${embedded ? 'text-xl' : 'text-3xl'} font-bold tracking-tight text-slate-900`}>Media Library</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {filteredResources.length} shown of {resources.length} files
                        </p>
                    </div>
                    <label
                        className={`inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#08507f] px-4 text-sm font-medium text-white transition-colors hover:bg-[#063a5c] ${uploading ? 'cursor-not-allowed opacity-50' : ''
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
            </div>

            <div className={`rounded-2xl border border-slate-200 bg-white p-3 shadow-sm ${embedded ? '' : 'md:p-4'}`}>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                    <div className="relative min-w-[200px] flex-1">
                        <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search..."
                            className="h-10 w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-[#08507f] focus:ring-2 focus:ring-[#08507f]/20"
                        />
                    </div>

                    <select
                        value={typeFilter}
                        onChange={(event) => setTypeFilter(event.target.value as MediaTypeFilter)}
                        className="h-10 w-[130px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#08507f] focus:ring-2 focus:ring-[#08507f]/20"
                    >
                        <option value="all">All Types</option>
                        <option value="image">Images</option>
                        <option value="audio">Audio</option>
                        <option value="video">Video</option>
                        <option value="other">Other</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(event) => setSortBy(event.target.value as SortOption)}
                        className="h-10 w-[130px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-[#08507f] focus:ring-2 focus:ring-[#08507f]/20"
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                        <option value="name-asc">A-Z</option>
                        <option value="name-desc">Z-A</option>
                        <option value="size-desc">Size (L)</option>
                        <option value="size-asc">Size (S)</option>
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
                        className="h-10 rounded-xl border border-slate-300 bg-white px-4 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Clear
                    </button>

                    {!embedded && (
                        <div className="inline-flex h-10 shrink-0 items-center rounded-xl border border-slate-300 p-1">
                            <button
                                type="button"
                                onClick={() => setViewMode('grid')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${viewMode === 'grid' ? 'bg-[#08507f] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                Grid
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('list')}
                                className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${viewMode === 'list' ? 'bg-[#08507f] text-white shadow-sm' : 'text-slate-700 hover:bg-slate-100'
                                    }`}
                            >
                                List
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} className="h-44 animate-pulse rounded-xl border border-slate-200 bg-slate-100" />
                    ))}
                </div>
            ) : filteredResources.length === 0 ? (
                <div className="py-20 text-center">
                    <ImageIcon size={44} className="mx-auto mb-3 text-slate-300" />
                    <p className="text-sm font-medium text-slate-600">No matching files</p>
                    <p className="mt-1 text-sm text-slate-400">Try changing the search text, type filter, or sort order.</p>
                </div>
            ) : viewMode === 'grid' ? (
                <div className={`${embedded ? 'grid grid-cols-2 sm:grid-cols-3 gap-3' : 'grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'}`}>
                    {filteredResources.map((resource) => {
                        const mediaType = inferMediaType(resource)
                        const filename = getFilename(resource.public_id)
                        const dimensions = resource.width && resource.height ? `${resource.width}x${resource.height}` : null
                        const commonMeta = `${resource.format?.toUpperCase() ?? 'FILE'} | ${formatBytes(resource.bytes)}`

                        return (
                            <div
                                key={resource.public_id}
                                onClick={() => onSelect?.(resource.secure_url)}
                                className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#08507f]/40 hover:shadow-md ${onSelect ? 'cursor-pointer hover:ring-2 hover:ring-[#08507f]' : ''
                                    }`}
                            >
                                <div className="relative h-28 bg-slate-100">
                                    {mediaType === 'image' ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            src={resource.secure_url}
                                            alt={filename}
                                            className="h-full w-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-50 to-slate-200 text-slate-600">
                                            {getMediaIcon(mediaType, 28)}
                                        </div>
                                    )}
                                    <span className={`absolute right-2 top-2 rounded-md px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getTypeStyles(mediaType)}`}>
                                        {mediaType}
                                    </span>
                                </div>

                                <div className="p-2.5">
                                    <p className="truncate text-xs font-medium text-slate-800" title={filename}>
                                        {filename}
                                    </p>
                                    {!embedded && (
                                        <>
                                            <p className="mt-1 truncate text-[11px] text-slate-500" title={resource.public_id}>
                                                {resource.public_id}
                                            </p>
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                {dimensions ? `${dimensions} | ${commonMeta}` : commonMeta}
                                            </p>
                                            <p className="mt-0.5 text-[11px] text-slate-400">{formatDate(resource.created_at)}</p>

                                            <div className="mt-2 flex items-center gap-1.5">
                                                <button
                                                    onClick={(e) => handleCopy(resource.secure_url, e)}
                                                    title="Copy URL"
                                                    className="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-slate-200 bg-white text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                                                >
                                                    {copied === resource.secure_url ? <Check size={12} /> : <Copy size={12} />}
                                                    {copied === resource.secure_url ? 'Copied' : 'Copy'}
                                                </button>
                                                <button
                                                    onClick={(e) => handleDelete(resource, e)}
                                                    title="Delete file"
                                                    className="inline-flex h-7 w-8 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50"
                                                >
                                                    <Trash2 size={12} />
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="w-full overflow-x-auto">
                        <table className="w-full text-left text-sm text-slate-600">
                            <thead className="bg-slate-50 text-xs uppercase text-slate-500">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">File</th>
                                    <th className="px-4 py-3 font-semibold text-center w-24">Format</th>
                                    <th className="px-4 py-3 font-semibold text-right w-24">Size</th>
                                    <th className="hidden px-4 py-3 font-semibold md:table-cell w-32">Dimensions</th>
                                    <th className="hidden px-4 py-3 font-semibold lg:table-cell w-32">Date</th>
                                    <th className="px-4 py-3 font-semibold text-right w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredResources.map((resource) => {
                                    const mediaType = inferMediaType(resource)
                                    const filename = getFilename(resource.public_id)
                                    const dimensions = resource.width && resource.height ? `${resource.width}x${resource.height}` : '—'
                                    const format = resource.format?.toUpperCase() ?? 'FILE'

                                    return (
                                        <tr
                                            key={resource.public_id}
                                            onClick={() => onSelect?.(resource.secure_url)}
                                            className={`group transition-colors hover:bg-slate-50 ${onSelect ? 'cursor-pointer' : ''}`}
                                        >
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
                                                        {mediaType === 'image' ? (
                                                            // eslint-disable-next-line @next/next/no-img-element
                                                            <img
                                                                src={resource.secure_url}
                                                                alt={filename}
                                                                className="h-full w-full object-cover"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="flex h-full w-full items-center justify-center text-slate-500">
                                                                {getMediaIcon(mediaType, 18)}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="truncate font-medium text-slate-900" title={filename}>
                                                            {filename}
                                                        </p>
                                                        <p className="truncate text-xs text-slate-400" title={resource.public_id}>
                                                            {resource.public_id}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex rounded px-2 py-0.5 text-[10px] font-bold uppercase ${getTypeStyles(mediaType)}`}>
                                                    {format}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right font-mono text-xs">
                                                {formatBytes(resource.bytes)}
                                            </td>
                                            <td className="hidden px-4 py-3 text-xs text-slate-500 md:table-cell">
                                                {dimensions}
                                            </td>
                                            <td className="hidden px-4 py-3 text-xs text-slate-500 lg:table-cell">
                                                {formatDate(resource.created_at)}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!onSelect && (
                                                        <>
                                                            <button
                                                                onClick={(e) => handleCopy(resource.secure_url, e)}
                                                                title="Copy URL"
                                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                            >
                                                                {copied === resource.secure_url ? <Check size={14} /> : <Copy size={14} />}
                                                            </button>
                                                            <button
                                                                onClick={(e) => handleDelete(resource, e)}
                                                                title="Delete file"
                                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
