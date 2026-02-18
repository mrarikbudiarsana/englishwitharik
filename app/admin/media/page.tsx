'use client'

import { useEffect, useState, useRef } from 'react'
import { Upload, Copy, Trash2, Image as ImageIcon } from 'lucide-react'

interface CloudinaryResource {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
  created_at: string
}

export default function AdminMediaPage() {
  const [resources, setResources] = useState<CloudinaryResource[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function fetchMedia() {
    setLoading(true)
    const res = await fetch('/api/admin/media')
    const data = await res.json()
    setResources(data.resources ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchMedia() }, [])

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length) return
    setUploading(true)
    const formData = new FormData()
    Array.from(files).forEach(f => formData.append('file', f))
    await fetch('/api/admin/media', { method: 'POST', body: formData })
    await fetchMedia()
    setUploading(false)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleDelete(publicId: string) {
    if (!confirm('Delete this image? This cannot be undone.')) return
    await fetch('/api/admin/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ public_id: publicId }),
    })
    setResources(r => r.filter(x => x.public_id !== publicId))
  }

  function handleCopy(url: string) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => {
          setCopied(url)
          setTimeout(() => setCopied(null), 2000)
        })
        .catch(() => fallbackCopy(url))
    } else {
      fallbackCopy(url)
    }
  }

  function fallbackCopy(text: string) {
    const textArea = document.createElement("textarea")
    textArea.value = text
    textArea.style.position = "fixed" // Avoid scrolling to bottom
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    try {
      document.execCommand('copy')
      setCopied(text)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Fallback: Oops, unable to copy', err)
    }

    document.body.removeChild(textArea)
  }

  function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{resources.length} files in Cloudinary</p>
        </div>
        <label className={`flex items-center gap-2 bg-[#08507f] hover:bg-[#063a5c] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors cursor-pointer ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Upload size={16} />
          {uploading ? 'Uploading…' : 'Upload Images'}
          <input
            ref={fileRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-square bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : resources.length === 0 ? (
        <div className="py-24 text-center">
          <ImageIcon size={48} className="text-gray-300 mx-auto mb-3" />
          <p className="text-gray-400 text-sm">No images yet. Upload your first image.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {resources.map(r => (
            <div key={r.public_id} className="group relative bg-gray-100 rounded-xl overflow-hidden border border-gray-200 hover:border-[#08507f]/50 transition-colors">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={r.secure_url}
                alt={r.public_id}
                className="w-full aspect-square object-cover"
                loading="lazy"
              />
              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => handleCopy(r.secure_url)}
                    title="Copy URL"
                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-white/40 flex items-center justify-center"
                  >
                    {copied === r.secure_url ? (
                      <span className="text-white text-xs">✓</span>
                    ) : (
                      <Copy size={13} className="text-white" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(r.public_id)}
                    title="Delete"
                    className="w-7 h-7 rounded-lg bg-white/20 hover:bg-red-500 flex items-center justify-center"
                  >
                    <Trash2 size={13} className="text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-white text-xs truncate">{r.public_id.split('/').pop()}</p>
                  <p className="text-white/60 text-xs">{r.width}×{r.height} · {formatBytes(r.bytes)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
