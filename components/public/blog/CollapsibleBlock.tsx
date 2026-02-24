'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface CollapsibleConfig {
    title: string
    content: string
}

export default function CollapsibleBlock({ config }: { config: CollapsibleConfig }) {
    const [open, setOpen] = useState(false)

    return (
        <div className="my-4 rounded-lg border border-gray-200 overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(prev => !prev)}
                className="w-full flex items-center justify-between gap-3 px-4 py-3 text-left font-medium text-gray-800 hover:bg-gray-50 transition-colors"
                aria-expanded={open}
            >
                <span>{config.title}</span>
                <ChevronDown
                    size={18}
                    className={`flex-shrink-0 text-gray-500 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {open && (
                <div className="px-4 py-3 border-t border-gray-100 text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50">
                    {config.content}
                </div>
            )}
        </div>
    )
}
