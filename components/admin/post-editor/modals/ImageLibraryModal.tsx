import { useState } from 'react'
import type { ModalPosition, CloudinaryResource } from '../types'
import { UrlInputModal } from './UrlInputModal'

interface ImageLibraryModalProps {
  isOpen: boolean
  position: ModalPosition | null
  resources: CloudinaryResource[]
  loading: boolean
  error: string | null
  query: string
  onQueryChange: (query: string) => void
  onRefresh: () => void
  onSelect: (url: string) => void
  onClose: () => void
}

export function ImageLibraryModal({
  isOpen,
  position,
  resources,
  loading,
  error,
  query,
  onQueryChange,
  onRefresh,
  onSelect,
  onClose,
}: ImageLibraryModalProps) {
  const [showUrlModal, setShowUrlModal] = useState(false)
  const [urlValue, setUrlValue] = useState('')

  if (!isOpen) return null

  const handleUseUrl = () => {
    setShowUrlModal(true)
  }

  const handleCloseUrlModal = () => {
    setUrlValue('')
    setShowUrlModal(false)
  }

  const handleSubmitUrlModal = () => {
    if (!urlValue.trim()) {
      window.alert('Please enter an image URL.')
      return
    }
    onSelect(urlValue.trim())
    handleCloseUrlModal()
  }

  return (
    <div className="fixed inset-0 z-30 bg-black/30 p-4">
      <div
        className="absolute w-full max-w-4xl max-h-[calc(100vh-2rem)] overflow-y-auto rounded-xl bg-white border border-gray-200 shadow-xl p-5 space-y-4"
        style={{ top: position?.top ?? 80, left: position?.left ?? 24 }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Insert Image From Media</h3>
            <p className="text-xs text-gray-500 mt-1">Select an existing image from your media library.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleUseUrl}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Use URL
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={e => onQueryChange(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#08507f]"
            placeholder="Search by filename..."
          />
          <button
            type="button"
            onClick={onRefresh}
            className="px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white"
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="text-sm text-red-700">{error}</p>
        )}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={`media-skeleton-${index}`} className="aspect-square rounded-lg bg-gray-100 animate-pulse" />
            ))}
          </div>
        ) : resources.length === 0 ? (
          <p className="text-sm text-gray-500 py-8 text-center">No images found.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {resources.map(resource => (
              <button
                key={resource.public_id}
                type="button"
                onClick={() => onSelect(resource.secure_url)}
                className="group text-left rounded-lg border border-gray-200 overflow-hidden hover:border-[#08507f]/50 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
                title="Insert this image"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={resource.secure_url} alt={resource.public_id} className="w-full aspect-square object-cover bg-gray-100" />
                <div className="px-2 py-1.5 bg-white">
                  <p className="text-[11px] text-gray-600 truncate">{resource.public_id.split('/').pop()}</p>
                  <p className="text-[10px] text-gray-400">{resource.width}x{resource.height}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
      <UrlInputModal
        isOpen={showUrlModal}
        position={position}
        title="Insert Image by URL"
        description="Paste a public image URL."
        value={urlValue}
        onChange={setUrlValue}
        placeholder="https://example.com/image.jpg"
        submitLabel="Use image"
        onSubmit={handleSubmitUrlModal}
        onClose={handleCloseUrlModal}
      />
    </div>
  )
}
