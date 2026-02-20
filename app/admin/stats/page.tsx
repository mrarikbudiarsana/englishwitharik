import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { ElementType } from 'react'
import { Eye, Users, TrendingUp, TrendingDown, Heart, MessageSquare } from 'lucide-react'
import StatsBarChart from '@/components/admin/StatsBarChart'
import StatsDonutChart from '@/components/admin/StatsDonutChart'
import StatsDatePicker from '@/components/admin/StatsDatePicker'
import StatsLocations from '@/components/admin/StatsLocations'

// ---------------------------------------------------------------------------
// Range parsing — supports presets + custom from/to
// ---------------------------------------------------------------------------

type Granularity = 'hour' | 'day' | 'month'

interface ParsedRange {
  from: Date
  to: Date
  preset: string       // preset key or 'custom'
  granularity: Granularity
}

function parseRange(sp: { range?: string; from?: string; to?: string }): ParsedRange {
  const now = new Date()
  const todayStart = new Date(now)
  todayStart.setHours(0, 0, 0, 0)

  // Custom date range (?from=YYYY-MM-DD&to=YYYY-MM-DD)
  if (sp.from && sp.to) {
    const from = new Date(sp.from + 'T00:00:00')
    const to = new Date(sp.to + 'T23:59:59')
    const diffDays = (to.getTime() - from.getTime()) / 86_400_000
    return {
      from, to, preset: 'custom',
      granularity: diffDays <= 1 ? 'hour' : diffDays <= 90 ? 'day' : 'month',
    }
  }

  const key = sp.range ?? '7d'

  switch (key) {
    case 'today':
      return { from: todayStart, to: now, preset: 'today', granularity: 'hour' }

    case '30':        // legacy
    case '30d': {
      const from = new Date(todayStart)
      from.setDate(from.getDate() - 30)
      return { from, to: now, preset: '30d', granularity: 'day' }
    }

    case 'mtd': {
      const from = new Date(todayStart)
      from.setDate(1)
      return { from, to: now, preset: 'mtd', granularity: 'day' }
    }

    case '12m': {
      const from = new Date(todayStart)
      from.setFullYear(from.getFullYear() - 1)
      return { from, to: now, preset: '12m', granularity: 'month' }
    }

    case 'ytd': {
      const from = new Date(todayStart)
      from.setMonth(0, 1)
      const diffDays = (now.getTime() - from.getTime()) / 86_400_000
      return { from, to: now, preset: 'ytd', granularity: diffDays <= 90 ? 'day' : 'month' }
    }

    case '3y': {
      const from = new Date(todayStart)
      from.setFullYear(from.getFullYear() - 3)
      return { from, to: now, preset: '3y', granularity: 'month' }
    }

    case '7':         // legacy
    case '7d':
    default: {
      const from = new Date(todayStart)
      from.setDate(from.getDate() - 7)
      return { from, to: now, preset: '7d', granularity: 'day' }
    }
  }
}

// Prev / Next navigation ranges (offset by the same duration)
function navRanges(from: Date, to: Date) {
  const dur = to.getTime() - from.getTime()
  const prevFrom = new Date(from.getTime() - dur)
  const prevTo = new Date(to.getTime() - dur)
  const nextFrom = new Date(from.getTime() + dur)
  const nextTo = new Date(to.getTime() + dur)
  const now = new Date()
  return {
    prevFrom: prevFrom.toISOString().substring(0, 10),
    prevTo: prevTo.toISOString().substring(0, 10),
    nextFrom: nextFrom.toISOString().substring(0, 10),
    nextTo: nextTo.toISOString().substring(0, 10),
    canGoNext: nextFrom < now,
  }
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getStats(range: ParsedRange) {
  const supabase = await createClient()

  const dur = range.to.getTime() - range.from.getTime()
  const prevEnd = new Date(range.from)
  const prevStart = new Date(range.from.getTime() - dur)

  // Current period
  const { data: currentRows } = await supabase
    .from('page_views')
    .select('*, posts(title, slug)')
    .gte('viewed_at', range.from.toISOString())
    .lte('viewed_at', range.to.toISOString())
    .order('viewed_at', { ascending: true })
    .limit(10000)

  // Previous period — counts only
  const { count: prevCount } = await supabase
    .from('page_views')
    .select('id', { count: 'exact', head: true })
    .gte('viewed_at', prevStart.toISOString())
    .lt('viewed_at', prevEnd.toISOString())

  const { data: prevSessionRows } = await supabase
    .from('page_views')
    .select('session_id')
    .gte('viewed_at', prevStart.toISOString())
    .lt('viewed_at', prevEnd.toISOString())
    .not('session_id', 'is', null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = currentRows ?? []

  // ── Chart data ────────────────────────────────────────────────────────────
  let chartData: { label: string; views: number; visitors: number }[]

  if (range.granularity === 'hour') {
    const viewMap: Record<number, number> = {}
    const visitorMap: Record<number, Set<string>> = {}

    for (const v of rows) {
      const h = new Date(v.viewed_at).getHours()
      viewMap[h] = (viewMap[h] ?? 0) + 1
      if (v.session_id) {
        if (!visitorMap[h]) visitorMap[h] = new Set()
        visitorMap[h].add(v.session_id)
      }
    }
    chartData = Array.from({ length: 24 }, (_, h) => ({
      label: `${h.toString().padStart(2, '0')}:00`,
      views: viewMap[h] ?? 0,
      visitors: visitorMap[h]?.size ?? 0,
    }))
  } else if (range.granularity === 'day') {
    const viewMap: Record<string, number> = {}
    const visitorMap: Record<string, Set<string>> = {}

    for (const v of rows) {
      const day = (v.viewed_at as string).substring(0, 10)
      viewMap[day] = (viewMap[day] ?? 0) + 1
      if (v.session_id) {
        if (!visitorMap[day]) visitorMap[day] = new Set()
        visitorMap[day].add(v.session_id)
      }
    }
    const days = Math.ceil(dur / 86_400_000)
    chartData = Array.from({ length: Math.min(days, 366) }, (_, i) => {
      const d = new Date(range.from)
      d.setDate(d.getDate() + i)
      const key = d.toISOString().substring(0, 10)
      return {
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        views: viewMap[key] ?? 0,
        visitors: visitorMap[key]?.size ?? 0,
      }
    })
  } else {
    // monthly
    const viewMap: Record<string, number> = {}
    const visitorMap: Record<string, Set<string>> = {}

    for (const v of rows) {
      const m = (v.viewed_at as string).substring(0, 7)
      viewMap[m] = (viewMap[m] ?? 0) + 1
      if (v.session_id) {
        if (!visitorMap[m]) visitorMap[m] = new Set()
        visitorMap[m].add(v.session_id)
      }
    }
    const d = new Date(range.from)
    d.setDate(1)
    chartData = []
    while (d <= range.to) {
      const key = d.toISOString().substring(0, 7)
      chartData.push({
        label: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        views: viewMap[key] ?? 0,
        visitors: visitorMap[key]?.size ?? 0,
      })
      d.setMonth(d.getMonth() + 1)
    }
  }

  // ── Unique visitors ───────────────────────────────────────────────────────
  const sessionSet = new Set(rows.filter(v => v.session_id).map(v => v.session_id as string))
  const visitors = sessionSet.size || rows.length
  const prevSessions = new Set((prevSessionRows ?? []).map(v => v.session_id as string))
  const prevVisitors = prevSessions.size || (prevCount ?? 0)

  // ── % changes ─────────────────────────────────────────────────────────────
  const viewsChange = prevCount && prevCount > 0
    ? Math.round(((rows.length - prevCount) / prevCount) * 100)
    : null
  const visitorsChange = prevVisitors > 0
    ? Math.round(((visitors - prevVisitors) / prevVisitors) * 100)
    : null

  // ── Top posts ─────────────────────────────────────────────────────────────
  const postMap = new Map<string, { title: string; slug: string; count: number }>()
  for (const v of rows) {
    if (!v.post_id) continue
    const post = Array.isArray(v.posts) ? v.posts[0] : v.posts
    if (!post) continue
    const existing = postMap.get(v.post_id)
    if (existing) { existing.count++ }
    else { postMap.set(v.post_id, { title: post.title as string, slug: post.slug as string, count: 1 }) }
  }
  const topPosts = Array.from(postMap.values()).sort((a, b) => b.count - a.count).slice(0, 10)

  // ── Referrers ─────────────────────────────────────────────────────────────
  const refMap = new Map<string, number>()
  for (const v of rows) {
    if (!v.referrer) continue
    try {
      const domain = new URL(v.referrer as string).hostname.replace(/^www\./, '')
      if (domain) refMap.set(domain, (refMap.get(domain) ?? 0) + 1)
    } catch { /* skip */ }
  }
  const referrers = Array.from(refMap.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 10)
    .map(([domain, count]) => ({ domain, count }))

  // ── Countries & Cities ────────────────────────────────────────────────────
  interface CityData { name: string; count: number }
  interface CountryData { code: string; count: number; cities: CityData[] }

  const countryMap = new Map<string, { count: number; cities: Map<string, number> }>()

  for (const v of rows) {
    if (!v.country) continue
    const code = v.country as string
    const city = v.city as string || 'Unknown'

    if (!countryMap.has(code)) {
      countryMap.set(code, { count: 0, cities: new Map() })
    }

    const entry = countryMap.get(code)!
    entry.count++
    entry.cities.set(city, (entry.cities.get(city) ?? 0) + 1)
  }

  const countries: CountryData[] = Array.from(countryMap.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([code, data]) => ({
      code,
      count: data.count,
      cities: Array.from(data.cities.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([name, count]) => ({ name, count }))
    }))

  // ── Devices ───────────────────────────────────────────────────────────────
  const deviceMap: Record<string, number> = {}
  for (const v of rows) {
    if (v.device) deviceMap[v.device as string] = (deviceMap[v.device as string] ?? 0) + 1
  }

  return {
    views: rows.length, viewsChange,
    visitors, visitorsChange,
    chartData, topPosts, referrers, countries, devices: deviceMap,
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function countryFlag(code: string) {
  return [...code.toUpperCase()]
    .map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
    .join('')
}

function countryName(code: string) {
  try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code }
  catch { return code }
}

function toDateStr(d: Date) { return d.toISOString().substring(0, 10) }

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ChangeLabel({ change, context }: { change: number | null; context: string }) {
  if (change === null) return null
  const up = change >= 0
  return (
    <div className={`flex items-center gap-1 mt-1 text-sm ${up ? 'text-green-600' : 'text-red-500'}`}>
      {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      <span>{Math.abs(change)}%</span>
      <span className="text-gray-400 text-xs ml-0.5">{context}</span>
    </div>
  )
}

function StatCard({
  label, value, change, context, icon: Icon,
}: { label: string; value: number; change?: number | null; context?: string; icon: ElementType }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center gap-2 mb-2">
        <Icon size={14} className="text-gray-400" />
        <span className="text-sm text-gray-500">{label}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value.toLocaleString()}</p>
      {change !== undefined && <ChangeLabel change={change ?? null} context={context ?? ''} />}
    </div>
  )
}

function Rows({ children }: { children: React.ReactNode }) {
  return <div className="divide-y divide-gray-50">{children}</div>
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default async function StatsPage({
  searchParams,
}: {
  searchParams: Promise<{ range?: string; from?: string; to?: string }>
}) {
  const sp = await searchParams
  const range = parseRange(sp)
  const data = await getStats(range)
  const nav = navRanges(range.from, range.to)

  const fromStr = toDateStr(range.from)
  const toStr = toDateStr(range.to)

  const cmpLabel = range.preset === 'today' ? 'vs yesterday'
    : range.preset === 'custom' ? 'vs prev period'
      : `vs prev period`

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Stats</h1>
        <StatsDatePicker
          preset={range.preset}
          from={fromStr}
          to={toStr}
          prevFrom={nav.prevFrom}
          prevTo={nav.prevTo}
          nextFrom={nav.nextFrom}
          nextTo={nav.nextTo}
          canGoNext={nav.canGoNext}
        />
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Views" value={data.views} change={data.viewsChange} context={cmpLabel} icon={Eye} />
        <StatCard label="Visitors" value={data.visitors} change={data.visitorsChange} context={cmpLabel} icon={Users} />
        <StatCard label="Likes" value={0} icon={Heart} />
        <StatCard label="Comments" value={0} icon={MessageSquare} />
      </div>

      {/* Views chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-1">Views</h2>
        <StatsBarChart data={data.chartData} />
      </div>

      {/* Most Viewed + Referrers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Most Viewed</h2>
          {data.topPosts.length === 0 ? (
            <p className="text-sm text-gray-400">No post views in this period.</p>
          ) : (
            <Rows>
              {data.topPosts.map(post => (
                <div key={post.slug} className="flex items-center justify-between py-2">
                  <Link href={`/blog/${post.slug}`} target="_blank"
                    className="text-sm text-gray-700 hover:text-[#08507f] truncate flex-1 mr-4">
                    {post.title}
                  </Link>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{post.count}</span>
                </div>
              ))}
            </Rows>
          )}
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Referrers</h2>
          {data.referrers.length === 0 ? (
            <p className="text-sm text-gray-400">No referrer data in this period.</p>
          ) : (
            <Rows>
              {data.referrers.map(ref => (
                <div key={ref.domain} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700 truncate flex-1 mr-4">{ref.domain}</span>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{ref.count}</span>
                </div>
              ))}
            </Rows>
          )}
        </div>
      </div>

      {/* Locations + Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Locations</h2>
          <StatsLocations data={data.countries} />
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Devices</h2>
          {Object.keys(data.devices).length === 0 ? (
            <p className="text-sm text-gray-400">
              Device data will appear here after the next visitor arrives.
            </p>
          ) : (
            <StatsDonutChart devices={data.devices} />
          )}
        </div>
      </div>
    </div>
  )
}
