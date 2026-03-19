'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { TOEFL_SECTION_LABELS } from '@/lib/toefl/catalog'

interface SectionPayload {
  title?: string
  description?: string
  sort_order?: number
  is_enabled?: boolean
  test_data?: unknown
}

export default function ToeflTestSetSectionEditorPage() {
  const params = useParams<{ id: string; section: 'listening' | 'structure' | 'reading' }>()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [jsonData, setJsonData] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [sortOrder, setSortOrder] = useState(0)
  const [enabled, setEnabled] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    async function fetchSection() {
      const res = await fetch(`/api/admin/toefl/test-sets/${params.id}/sections/${params.section}`)
      const data = await res.json().catch(() => null) as SectionPayload | null

      if (!res.ok) {
        setError('Failed to load section')
      } else if (data) {
        setTitle(data.title ?? '')
        setDescription(data.description ?? '')
        setSortOrder(data.sort_order ?? 0)
        setEnabled(data.is_enabled ?? true)
        setJsonData(data.test_data ? JSON.stringify(data.test_data, null, 2) : '')
      }

      setLoading(false)
    }

    fetchSection()
  }, [params.id, params.section])

  async function handleSave() {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const parsedData = JSON.parse(jsonData)
      const res = await fetch(`/api/admin/toefl/test-sets/${params.id}/sections/${params.section}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          sort_order: sortOrder,
          is_enabled: enabled,
          testData: parsedData,
        }),
      })

      const payload = await res.json().catch(() => null)
      if (!res.ok) {
        throw new Error(payload?.error ?? 'Failed to save section')
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON format or database error'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      <div className="mb-6 flex items-center gap-4">
        <Link
          href={`/admin/toefl/test-sets/${params.id}`}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold capitalize">Edit {TOEFL_SECTION_LABELS[params.section]} Section</h1>
          <p className="text-gray-500 text-sm">Modify JSON, metadata, and publish state for this test-set section.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Section updated successfully!
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
            placeholder="Section title"
          />
          <input
            type="number"
            value={sortOrder}
            onChange={(event) => setSortOrder(Number(event.target.value))}
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
            placeholder="Sort order"
          />
        </div>

        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-[#08507f] focus:outline-none focus:ring-2 focus:ring-[#08507f]/20"
          rows={3}
          placeholder="Section description"
        />

        <label className="inline-flex items-center gap-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(event) => setEnabled(event.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#08507f] focus:ring-[#08507f]"
          />
          <span>Section enabled</span>
        </label>

        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[700px]">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="text-xs font-mono text-gray-500 capitalize">JSON Content: {params.section}</div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            spellCheck={false}
            className="flex-1 p-6 font-mono text-sm focus:outline-none resize-none bg-white text-slate-900 leading-relaxed min-h-[600px]"
            placeholder="{ ... }"
          />
        </div>
      </div>
    </div>
  )
}
