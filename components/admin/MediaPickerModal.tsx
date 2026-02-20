'use client'

import { X } from 'lucide-react'
import MediaLibrary from './MediaLibrary'

interface MediaPickerModalProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
}

export default function MediaPickerModal({ isOpen, onClose, onSelect }: MediaPickerModalProps) {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="relative h-[85vh] w-full max-w-5xl overflow-hidden rounded-2xl bg-white shadow-2xl">
                <div className="absolute right-4 top-4 z-10">
                    <button
                        onClick={onClose}
                        className="rounded-full bg-white/80 p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700 backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="h-full overflow-y-auto p-4 sm:p-6">
                    <MediaLibrary
                        embedded
                        onSelect={(url) => {
                            onSelect(url)
                            onClose()
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
