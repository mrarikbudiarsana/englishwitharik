'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

type LeadStatus = 'new' | 'contacted' | 'closed'

interface LeadStatusSelectProps {
  leadId: string
  value: LeadStatus
}

export default function LeadStatusSelect({ leadId, value }: LeadStatusSelectProps) {
  const router = useRouter()
  const [status, setStatus] = useState<LeadStatus>(value)
  const [saving, setSaving] = useState(false)

  async function onChange(nextStatus: LeadStatus) {
    setStatus(nextStatus)
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/leads/${leadId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      })

      if (!res.ok) {
        setStatus(value)
        return
      }

      router.refresh()
    } finally {
      setSaving(false)
    }
  }

  return (
    <select
      value={status}
      disabled={saving}
      onChange={event => onChange(event.target.value as LeadStatus)}
      className="text-xs border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[#08507f] disabled:opacity-60"
    >
      <option value="new">new</option>
      <option value="contacted">contacted</option>
      <option value="closed">closed</option>
    </select>
  )
}
