'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react'

const PRESETS = [
  { label: 'Today',          value: 'today' },
  { label: 'Last 7 Days',    value: '7d'    },
  { label: 'Last 30 Days',   value: '30d'   },
  { label: 'Month to date',  value: 'mtd'   },
  { label: 'Last 12 months', value: '12m'   },
  { label: 'Year to date',   value: 'ytd'   },
  { label: 'Last 3 years',   value: '3y'    },
]

interface Props {
  preset:     string         // active preset name, or 'custom'
  from:       string         // YYYY-MM-DD  (display + arrow base)
  to:         string         // YYYY-MM-DD
  campaign?:  string
  prevFrom:   string         // ← arrow destination
  prevTo:     string
  nextFrom:   string         // → arrow destination
  nextTo:     string
  canGoNext:  boolean
}

const GMT8_OFFSET_MS = 8 * 60 * 60 * 1000

function getTodayGmt8Key() {
  return new Date(Date.now() + GMT8_OFFSET_MS).toISOString().substring(0, 10)
}

function fmtDisplay(dateStr: string) {
  const d = new Date(dateStr + 'T12:00:00') // noon avoids DST issues
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function StatsDatePicker({
  preset, from, to, campaign, prevFrom, prevTo, nextFrom, nextTo, canGoNext,
}: Props) {
  const router   = useRouter()
  const [open, setOpen]         = useState(false)
  const [cfrom, setCfrom]       = useState(from)
  const [cto, setCto]           = useState(to)
  const containerRef             = useRef<HTMLDivElement>(null)
  const today                    = getTodayGmt8Key()

  // Close on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function openPicker() {
    setCfrom(from)
    setCto(to)
    setOpen(v => !v)
  }

  function selectPreset(value: string) {
    const qs = new URLSearchParams({ range: value })
    if (campaign) qs.set('campaign', campaign)
    router.push(`/admin/stats?${qs.toString()}`)
    setOpen(false)
  }

  function applyCustom() {
    if (cfrom && cto && cfrom <= cto) {
      const qs = new URLSearchParams({ from: cfrom, to: cto })
      if (campaign) qs.set('campaign', campaign)
      router.push(`/admin/stats?${qs.toString()}`)
      setOpen(false)
    }
  }

  const displayLabel = from === to
    ? fmtDisplay(from)
    : `${fmtDisplay(from)} – ${fmtDisplay(to)}`

  return (
    <div className="flex items-center gap-1.5" ref={containerRef}>
      {/* ← arrow */}
      <button
        onClick={() => {
          const qs = new URLSearchParams({ from: prevFrom, to: prevTo })
          if (campaign) qs.set('campaign', campaign)
          router.push(`/admin/stats?${qs.toString()}`)
        }}
        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-800 transition-colors"
        title="Previous period"
      >
        <ChevronLeft size={16} />
      </button>

      {/* → arrow */}
      <button
        onClick={() => {
          if (!canGoNext) return
          const qs = new URLSearchParams({ from: nextFrom, to: nextTo })
          if (campaign) qs.set('campaign', campaign)
          router.push(`/admin/stats?${qs.toString()}`)
        }}
        disabled={!canGoNext}
        className={`p-1.5 rounded-lg transition-colors ${
          canGoNext
            ? 'hover:bg-gray-200 text-gray-500 hover:text-gray-800'
            : 'text-gray-300 cursor-not-allowed'
        }`}
        title="Next period"
      >
        <ChevronRight size={16} />
      </button>

      {/* Date range button */}
      <div className="relative">
        <button
          onClick={openPicker}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 shadow-sm transition-colors"
        >
          <span>{displayLabel}</span>
          <Calendar size={14} className="text-gray-400" />
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-2 bg-white rounded-xl border border-gray-200 shadow-xl z-50 flex overflow-hidden">
            {/* Left: custom date inputs */}
            <div className="p-5 border-r border-gray-100 w-64">
              <div className="mb-5">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  From
                </label>
                <input
                  type="date"
                  value={cfrom}
                  max={cto || today}
                  onChange={e => setCfrom(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#08507f] focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  To
                </label>
                <input
                  type="date"
                  value={cto}
                  min={cfrom}
                  max={today}
                  onChange={e => setCto(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#08507f] focus:border-transparent"
                />
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setOpen(false)}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={applyCustom}
                  disabled={!cfrom || !cto || cfrom > cto}
                  className="px-3 py-1.5 text-sm bg-[#08507f] text-white rounded-lg hover:bg-[#063a5c] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Apply
                </button>
              </div>
            </div>

            {/* Right: presets */}
            <div className="py-2 w-44">
              {PRESETS.map(p => (
                <button
                  key={p.value}
                  onClick={() => selectPreset(p.value)}
                  className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors ${
                    preset === p.value
                      ? 'bg-[#08507f]/10 text-[#08507f] font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span>{p.label}</span>
                  {preset === p.value && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
