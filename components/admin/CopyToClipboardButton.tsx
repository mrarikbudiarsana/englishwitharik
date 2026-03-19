'use client'

import { useState } from 'react'

interface CopyToClipboardButtonProps {
  value: string
  label?: string
}

export default function CopyToClipboardButton({
  value,
  label = 'Copy link',
}: CopyToClipboardButtonProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch (error) {
      console.error(error)
      window.alert('Failed to copy link.')
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
    >
      {copied ? 'Copied' : label}
    </button>
  )
}
