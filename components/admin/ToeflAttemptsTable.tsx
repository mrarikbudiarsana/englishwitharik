'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

export interface ToeflAttemptItem {
  id: string
  studentName: string
  email: string
  section: string
  score: number | null
  total: number | null
  status: 'Completed' | 'In Progress'
  startedAtLabel: string
  startedAtRaw: string
  completedAtRaw: string | null
}

interface ToeflAttemptsTableProps {
  attempts: ToeflAttemptItem[]
}

type SectionFilter = 'all' | 'listening' | 'structure' | 'reading'

function escapeCsv(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replaceAll('"', '""')}"`
  return value
}

function downloadCsv(filename: string, rows: ToeflAttemptItem[]) {
  const headers = [
    'attempt_id',
    'student_name',
    'student_email',
    'section',
    'score',
    'total',
    'status',
    'started_at',
    'completed_at',
  ]

  const lines = [headers.join(',')]
  for (const row of rows) {
    lines.push([
      escapeCsv(row.id),
      escapeCsv(row.studentName),
      escapeCsv(row.email),
      escapeCsv(row.section),
      row.score === null ? '' : String(row.score),
      row.total === null ? '' : String(row.total),
      escapeCsv(row.status),
      escapeCsv(row.startedAtRaw),
      escapeCsv(row.completedAtRaw ?? ''),
    ].join(','))
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}

export default function ToeflAttemptsTable({ attempts }: ToeflAttemptsTableProps) {
  const router = useRouter()
  const [sectionFilter, setSectionFilter] = useState<SectionFilter>('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deletingOneId, setDeletingOneId] = useState<string | null>(null)
  const [bulkDeleting, setBulkDeleting] = useState(false)

  const filteredAttempts = useMemo(() => {
    if (sectionFilter === 'all') return attempts
    return attempts.filter((attempt) => attempt.section.toLowerCase() === sectionFilter)
  }, [attempts, sectionFilter])

  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds])
  const selectedRows = filteredAttempts.filter((row) => selectedSet.has(row.id))

  const allSelected = filteredAttempts.length > 0 && selectedRows.length === filteredAttempts.length
  const hasSelection = selectedIds.length > 0

  useEffect(() => {
    setSelectedIds([])
  }, [sectionFilter])

  function toggleSelectAll() {
    if (allSelected) {
      setSelectedIds([])
      return
    }
    setSelectedIds(filteredAttempts.map((row) => row.id))
  }

  function toggleSelect(id: string) {
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    )
  }

  async function deleteAttempt(id: string, studentName: string) {
    const confirmed = window.confirm(
      `Delete this attempt for "${studentName}"? This cannot be undone.`
    )
    if (!confirmed) return

    setDeletingOneId(id)
    try {
      const res = await fetch(`/api/admin/toefl/attempts/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        window.alert(payload?.error ?? 'Failed to delete attempt.')
        return
      }

      setSelectedIds((current) => current.filter((value) => value !== id))
      router.refresh()
    } finally {
      setDeletingOneId(null)
    }
  }

  async function deleteSelected() {
    if (!hasSelection) return
    const confirmed = window.confirm(
      `Delete ${selectedIds.length} selected attempt(s)? This cannot be undone.`
    )
    if (!confirmed) return

    setBulkDeleting(true)
    try {
      const res = await fetch('/api/admin/toefl/attempts/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds }),
      })

      if (!res.ok) {
        const payload = await res.json().catch(() => null)
        window.alert(payload?.error ?? 'Failed to delete selected attempts.')
        return
      }

      setSelectedIds([])
      router.refresh()
    } finally {
      setBulkDeleting(false)
    }
  }

  const dateSuffix = new Date().toISOString().slice(0, 10)
  const filenameSuffix = sectionFilter === 'all' ? 'all-sections' : sectionFilter

  return (
    <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm overflow-hidden border-orange-100">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-orange-100 bg-orange-50/30">
        <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700">
          <span>Section</span>
          <select
            value={sectionFilter}
            onChange={(event) => setSectionFilter(event.target.value as SectionFilter)}
            className="rounded-md border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          >
            <option value="all">All</option>
            <option value="listening">Listening</option>
            <option value="structure">Structure</option>
            <option value="reading">Reading</option>
          </select>
        </label>
        <button
          type="button"
          onClick={deleteSelected}
          disabled={!hasSelection || bulkDeleting}
          className="inline-flex items-center rounded-md border border-red-200 px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {bulkDeleting ? 'Deleting...' : `Delete Selected (${selectedIds.length})`}
        </button>
        <button
          type="button"
          onClick={() => downloadCsv(`toefl-attempts-${filenameSuffix}-${dateSuffix}.csv`, filteredAttempts)}
          disabled={filteredAttempts.length === 0}
          className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Download CSV (Current Section)
        </button>
        <button
          type="button"
          onClick={() => downloadCsv(`toefl-attempts-selected-${filenameSuffix}-${dateSuffix}.csv`, selectedRows)}
          disabled={!hasSelection}
          className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Download CSV (Selected)
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-orange-100">
          <thead className="bg-orange-50/50">
            <tr>
              <th scope="col" className="w-12 px-3 py-4 align-middle">
                <div className="flex items-center justify-center">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 rounded border-gray-300 text-[#08507f] focus:ring-[#08507f]"
                    aria-label="Select all attempts"
                  />
                </div>
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Student</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Email</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Section</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Score</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Status</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Started</th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-orange-50">
            {filteredAttempts.map((attempt) => (
              <tr key={attempt.id} className="hover:bg-orange-50/30 transition-colors group">
                <td className="w-12 px-3 py-4 whitespace-nowrap align-middle">
                  <div className="flex items-center justify-center">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(attempt.id)}
                      onChange={() => toggleSelect(attempt.id)}
                      className="h-4 w-4 rounded border-gray-300 text-[#08507f] focus:ring-[#08507f]"
                      aria-label={`Select attempt ${attempt.id}`}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-900 group-hover:text-orange-900 transition-colors">
                    {attempt.studentName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {attempt.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                    {attempt.section}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  {attempt.score !== null ? `${attempt.score} / ${attempt.total}` : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {attempt.status === 'Completed' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Completed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      In Progress
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {attempt.startedAtLabel}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    type="button"
                    onClick={() => deleteAttempt(attempt.id, attempt.studentName)}
                    disabled={deletingOneId === attempt.id || bulkDeleting}
                    className="inline-flex items-center rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {deletingOneId === attempt.id ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}

            {filteredAttempts.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  No attempts found for this section.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
