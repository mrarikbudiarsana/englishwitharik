import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { ElementType } from 'react'
import { Eye, Users, TrendingUp, TrendingDown, Layers, Globe } from 'lucide-react'
import StatsBarChart from '@/components/admin/StatsBarChart'
import StatsDonutChart from '@/components/admin/StatsDonutChart'
import StatsDatePicker from '@/components/admin/StatsDatePicker'
import StatsLocations from '@/components/admin/StatsLocations'
import StatsCsvDownloadButton from '@/components/admin/StatsCsvDownloadButton'
import PagePerformanceTable from '@/components/admin/PagePerformanceTable'

// ---------------------------------------------------------------------------
// Range parsing — supports presets + custom from/to
// ---------------------------------------------------------------------------

type Granularity = 'hour' | 'day' | 'month'
const PAGE_PERFORMANCE_PAGE_SIZE = 10

interface ParsedRange {
  from: Date
  to: Date
  preset: string       // preset key or 'custom'
  granularity: Granularity
}

const GMT8_OFFSET_MS = 8 * 60 * 60 * 1000
const DAY_MS = 86_400_000

function startOfGmt8Day(date: Date): Date {
  const shifted = new Date(date.getTime() + GMT8_OFFSET_MS)
  shifted.setUTCHours(0, 0, 0, 0)
  return new Date(shifted.getTime() - GMT8_OFFSET_MS)
}

function parseGmt8DateStart(dateStr: string): Date {
  return new Date(`${dateStr}T00:00:00+08:00`)
}

function parseGmt8DateEnd(dateStr: string): Date {
  return new Date(`${dateStr}T23:59:59.999+08:00`)
}

function toGmt8DateKey(date: Date): string {
  return new Date(date.getTime() + GMT8_OFFSET_MS).toISOString().substring(0, 10)
}

function toGmt8MonthKey(date: Date): string {
  return new Date(date.getTime() + GMT8_OFFSET_MS).toISOString().substring(0, 7)
}

function formatGmt8DayLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    timeZone: 'Asia/Singapore',
  }).format(date)
}

function formatGmt8MonthLabel(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    year: '2-digit',
    timeZone: 'Asia/Singapore',
  }).format(date)
}

function normalizeCampaign(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function getAttributionCampaign(raw: unknown): string | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const obj = raw as Record<string, unknown>
  return normalizeCampaign(obj.utm_campaign)
}

function parseRange(sp: { range?: string; from?: string; to?: string }): ParsedRange {
  const now = new Date()
  const todayStart = startOfGmt8Day(now)

  // Custom date range (?from=YYYY-MM-DD&to=YYYY-MM-DD)
  if (sp.from && sp.to) {
    const from = parseGmt8DateStart(sp.from)
    const to = parseGmt8DateEnd(sp.to)
    const diffDays = Math.floor((startOfGmt8Day(to).getTime() - startOfGmt8Day(from).getTime()) / DAY_MS) + 1
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
      from.setUTCDate(from.getUTCDate() - 30)
      return { from, to: now, preset: '30d', granularity: 'day' }
    }

    case 'mtd': {
      const from = new Date(todayStart)
      from.setUTCDate(1)
      return { from, to: now, preset: 'mtd', granularity: 'day' }
    }

    case '12m': {
      const from = new Date(todayStart)
      from.setUTCFullYear(from.getUTCFullYear() - 1)
      return { from, to: now, preset: '12m', granularity: 'month' }
    }

    case 'ytd': {
      const from = new Date(todayStart)
      from.setUTCMonth(0, 1)
      const diffDays = (now.getTime() - from.getTime()) / 86_400_000
      return { from, to: now, preset: 'ytd', granularity: diffDays <= 90 ? 'day' : 'month' }
    }

    case '3y': {
      const from = new Date(todayStart)
      from.setUTCFullYear(from.getUTCFullYear() - 3)
      return { from, to: now, preset: '3y', granularity: 'month' }
    }

    case '7':         // legacy
    case '7d':
    default: {
      const from = new Date(todayStart)
      from.setUTCDate(from.getUTCDate() - 7)
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
    prevFrom: toGmt8DateKey(prevFrom),
    prevTo: toGmt8DateKey(prevTo),
    nextFrom: toGmt8DateKey(nextFrom),
    nextTo: toGmt8DateKey(nextTo),
    canGoNext: nextFrom < now,
  }
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function getStats(range: ParsedRange, campaignFilter: string | null) {
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

  const { data: leadRows } = await supabase
    .from('leads')
    .select('post_id, utm_campaign, first_seen_attribution, last_seen_attribution')
    .gte('created_at', range.from.toISOString())
    .lte('created_at', range.to.toISOString())

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const allRows: any[] = currentRows ?? []
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = campaignFilter
    ? allRows.filter(v => normalizeCampaign(v.utm_campaign) === campaignFilter)
    : allRows

  // ── Chart data ────────────────────────────────────────────────────────────
  let chartData: { label: string; date?: string; views: number; visitors: number }[]

  if (range.granularity === 'hour') {
    const viewMap: Record<number, number> = {}
    const visitorMap: Record<number, Set<string>> = {}

    for (const v of rows) {
      // Adjust to GMT+8 for accurate local-hour grouping
      const date = new Date(v.viewed_at)
      const h = (date.getUTCHours() + 8) % 24
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
      // No date for hourly - already viewing single day
    }))
  } else if (range.granularity === 'day') {
    const viewMap: Record<string, number> = {}
    const visitorMap: Record<string, Set<string>> = {}

    for (const v of rows) {
      const day = toGmt8DateKey(new Date(v.viewed_at as string))
      viewMap[day] = (viewMap[day] ?? 0) + 1
      if (v.session_id) {
        if (!visitorMap[day]) visitorMap[day] = new Set()
        visitorMap[day].add(v.session_id)
      }
    }
    const fromDayStart = startOfGmt8Day(range.from)
    const toDayStart = startOfGmt8Day(range.to)
    const days = Math.floor((toDayStart.getTime() - fromDayStart.getTime()) / DAY_MS) + 1
    chartData = Array.from({ length: Math.min(days, 366) }, (_, i) => {
      const d = new Date(fromDayStart.getTime() + (i * DAY_MS))
      const key = toGmt8DateKey(d)
      return {
        label: formatGmt8DayLabel(d),
        date: key,  // YYYY-MM-DD for navigation
        views: viewMap[key] ?? 0,
        visitors: visitorMap[key]?.size ?? 0,
      }
    })
  } else {
    // monthly
    const viewMap: Record<string, number> = {}
    const visitorMap: Record<string, Set<string>> = {}

    for (const v of rows) {
      const m = toGmt8MonthKey(new Date(v.viewed_at as string))
      viewMap[m] = (viewMap[m] ?? 0) + 1
      if (v.session_id) {
        if (!visitorMap[m]) visitorMap[m] = new Set()
        visitorMap[m].add(v.session_id)
      }
    }
    const fromDayStart = startOfGmt8Day(range.from)
    const d = new Date(fromDayStart)
    d.setUTCDate(1)
    chartData = []
    while (d <= range.to) {
      const key = toGmt8MonthKey(d)
      chartData.push({
        label: formatGmt8MonthLabel(d),
        date: key,  // YYYY-MM for navigation
        views: viewMap[key] ?? 0,
        visitors: visitorMap[key]?.size ?? 0,
      })
      d.setUTCMonth(d.getUTCMonth() + 1)
    }
  }

  // ── Unique visitors ───────────────────────────────────────────────────────
  const sessionSet = new Set(rows.filter(v => v.session_id).map(v => v.session_id as string))
  const visitors = sessionSet.size  // Accurate count - don't fallback to views
  const prevSessions = new Set((prevSessionRows ?? []).map(v => v.session_id as string))
  const prevVisitors = prevSessions.size

  // ── Pages per visitor ────────────────────────────────────────────────────
  const pagesPerVisitor = visitors > 0 ? Math.round((rows.length / visitors) * 10) / 10 : 0
  const prevPagesPerVisitor = prevVisitors > 0 ? (prevCount ?? 0) / prevVisitors : 0
  const pagesPerVisitorChange = prevPagesPerVisitor > 0
    ? Math.round(((pagesPerVisitor - prevPagesPerVisitor) / prevPagesPerVisitor) * 100)
    : null

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
  // Show external traffic sources (Google, social media, etc.)
  // Exclude: internal navigation, direct visits, localhost/dev traffic
  const refMap = new Map<string, number>()
  let directTraffic = 0
  const ownDomains = ['englishwitharik.com', 'www.englishwitharik.com']
  const devDomains = ['localhost', '127.0.0.1', '192.168.']

  for (const v of rows) {
    if (!v.referrer) {
      // No referrer = direct traffic (typed URL, bookmark, etc.)
      directTraffic++
      continue
    }
    try {
      const domain = new URL(v.referrer as string).hostname.replace(/^www\./, '')
      // Skip internal navigation (same site)
      if (ownDomains.includes(domain) || ownDomains.includes(`www.${domain}`)) {
        continue
      }
      // Skip dev/localhost traffic
      if (devDomains.some(d => domain.includes(d))) {
        continue
      }
      if (domain) {
        refMap.set(domain, (refMap.get(domain) ?? 0) + 1)
      }
    } catch { /* skip */ }
  }

  // Build referrers list - external sources only, with direct at bottom
  const externalReferrers = Array.from(refMap.entries())
    .sort((a, b) => b[1] - a[1]).slice(0, 9)
    .map(([domain, count]) => ({ domain, count }))

  // Add direct traffic at the end if there are no external referrers, or as last item
  const referrers = externalReferrers.length > 0
    ? [...externalReferrers, ...(directTraffic > 0 ? [{ domain: 'Direct', count: directTraffic }] : [])]
    : (directTraffic > 0 ? [{ domain: 'Direct', count: directTraffic }] : [])

  // ── Campaign attribution (UTM + click IDs) ──────────────────────────────
  const campaignMap = new Map<string, {
    source: string
    medium: string
    campaign: string
    views: number
    visitors: Set<string>
  }>()

  for (const v of allRows) {
    let source = (v.utm_source as string | null) ?? null
    let medium = (v.utm_medium as string | null) ?? null
    const campaign = (v.utm_campaign as string | null) ?? '(not set)'
    const hasClickId = Boolean(v.gclid || v.fbclid || v.msclkid)

    if (!source && v.gclid) source = 'google'
    if (!medium && v.gclid) medium = 'cpc'
    if (!source && v.fbclid) source = 'facebook'
    if (!medium && v.fbclid) medium = 'paid_social'
    if (!source && v.msclkid) source = 'bing'
    if (!medium && v.msclkid) medium = 'cpc'

    if (!source && !medium && !campaign && !hasClickId) continue
    if (!source && !medium && campaign === '(not set)' && !hasClickId) continue

    const safeSource = source ?? '(unknown)'
    const safeMedium = medium ?? '(none)'
    const key = `${safeSource}|${safeMedium}|${campaign}`

    if (!campaignMap.has(key)) {
      campaignMap.set(key, {
        source: safeSource,
        medium: safeMedium,
        campaign,
        views: 0,
        visitors: new Set<string>(),
      })
    }

    const entry = campaignMap.get(key)!
    entry.views++
    if (v.session_id) entry.visitors.add(v.session_id as string)
  }

  const campaigns = Array.from(campaignMap.values())
    .map(entry => ({
      source: entry.source,
      medium: entry.medium,
      campaign: entry.campaign,
      views: entry.views,
      visitors: entry.visitors.size,
    }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 20)

  // ── Page performance ──────────────────────────────────────────────────────
  const leadCountByPostId = new Map<string, number>()
  for (const lead of leadRows ?? []) {
    if (!lead.post_id) continue
    const leadCampaign = normalizeCampaign(lead.utm_campaign)
      ?? getAttributionCampaign(lead.last_seen_attribution)
      ?? getAttributionCampaign(lead.first_seen_attribution)
    if (campaignFilter && leadCampaign !== campaignFilter) continue
    leadCountByPostId.set(lead.post_id, (leadCountByPostId.get(lead.post_id) ?? 0) + 1)
  }

  const pageMap = new Map<string, {
    title: string
    path: string
    views: number
    visitors: Set<string>
    leads: number
  }>()

  for (const v of rows) {
    const post = Array.isArray(v.posts) ? v.posts[0] : v.posts
    const postId = v.post_id as string | null
    const postSlug = (post?.slug as string | undefined) ?? null
    const postTitle = (post?.title as string | undefined) ?? null

    let key: string
    let path: string
    let title: string

    if (postId && postSlug) {
      key = `post:${postId}`
      path = `/blog/${postSlug}`
      title = postTitle ?? path
    } else {
      path = (v.path as string) || '/'
      key = `path:${path}`
      title = path
    }

    if (!pageMap.has(key)) {
      pageMap.set(key, { title, path, views: 0, visitors: new Set<string>(), leads: 0 })
    }

    const entry = pageMap.get(key)!
    entry.views++
    if (v.session_id) entry.visitors.add(v.session_id as string)
  }

  for (const [key, entry] of pageMap.entries()) {
    if (!key.startsWith('post:')) continue
    const postId = key.slice(5)
    entry.leads = leadCountByPostId.get(postId) ?? 0
  }

  const pagePerformance = Array.from(pageMap.values())
    .map(entry => {
      const visitorsCount = entry.visitors.size
      const conversionRate = visitorsCount > 0 ? (entry.leads / visitorsCount) * 100 : 0
      return {
        title: entry.title,
        path: entry.path,
        views: entry.views,
        visitors: visitorsCount,
        leads: entry.leads,
        conversionRate: Math.round(conversionRate * 10) / 10,
      }
    })
    .sort((a, b) => b.views - a.views)

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
    pagesPerVisitor, pagesPerVisitorChange,
    chartData, granularity: range.granularity,
    topPosts, referrers, campaigns, pagePerformance, countries, devices: deviceMap,
    campaignFilter,
  }
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function toDateStr(d: Date) { return toGmt8DateKey(d) }

function formatValue(value: number): string {
  // Format decimals nicely (e.g., 2.5 stays as "2.5", 10 becomes "10")
  return Number.isInteger(value) ? value.toLocaleString() : value.toFixed(1)
}

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
      <p className="text-3xl font-bold text-gray-900">{formatValue(value)}</p>
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
  searchParams: Promise<{ range?: string; from?: string; to?: string; campaign?: string }>
}) {
  const sp = await searchParams
  const range = parseRange(sp)
  const campaignFilter = normalizeCampaign(sp.campaign)
  const data = await getStats(range, campaignFilter)
  const nav = navRanges(range.from, range.to)

  const fromStr = toDateStr(range.from)
  const toStr = toDateStr(range.to)

  const cmpLabel = range.preset === 'today' ? 'vs yesterday'
    : range.preset === 'custom' ? 'vs prev period'
      : `vs prev period`

  const campaignCsvRows = data.campaigns.map(row => [
    row.source,
    row.medium,
    row.campaign,
    row.views,
    row.visitors,
  ])

  const pagePerformanceCsvRows = data.pagePerformance.map(row => [
    row.title,
    row.path,
    row.views,
    row.visitors,
    row.leads,
    `${row.conversionRate.toFixed(1)}%`,
  ])

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Stats</h1>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Timezone: GMT+8</span>
          <StatsDatePicker
            preset={range.preset}
            from={fromStr}
            to={toStr}
            campaign={campaignFilter ?? undefined}
            prevFrom={nav.prevFrom}
            prevTo={nav.prevTo}
            nextFrom={nav.nextFrom}
            nextTo={nav.nextTo}
            canGoNext={nav.canGoNext}
          />
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Views" value={data.views} change={data.viewsChange} context={cmpLabel} icon={Eye} />
        <StatCard label="Visitors" value={data.visitors} change={data.visitorsChange} context={cmpLabel} icon={Users} />
        <StatCard label="Pages / Visitor" value={data.pagesPerVisitor} change={data.pagesPerVisitorChange} context={cmpLabel} icon={Layers} />
        <StatCard label="Countries" value={data.countries.length} icon={Globe} />
      </div>

      {/* Views chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Views Over Time</h2>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span className="text-gray-600">Views ({data.views.toLocaleString()})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500" />
              <span className="text-gray-600">Visitors ({data.visitors.toLocaleString()})</span>
            </div>
          </div>
        </div>
        <StatsBarChart data={data.chartData} granularity={data.granularity} campaign={campaignFilter ?? undefined} />
      </div>

      {campaignFilter && (
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 text-sm">
            <span>Campaign filter: {campaignFilter}</span>
            <Link href={`/admin/stats?from=${fromStr}&to=${toStr}`} className="underline text-blue-700">
              Clear
            </Link>
          </div>
        </div>
      )}

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

      {/* Campaign attribution */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Campaign Attribution</h2>
          <StatsCsvDownloadButton
            filename={`campaign-attribution-${fromStr}_to_${toStr}.csv`}
            headers={['Source', 'Medium', 'Campaign', 'Views', 'Visitors']}
            rows={campaignCsvRows}
          />
        </div>
        {data.campaigns.length === 0 ? (
          <p className="text-sm text-gray-400">No UTM/campaign data in this period.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b border-gray-100">
                  <th className="py-2 pr-4 font-medium">Source</th>
                  <th className="py-2 pr-4 font-medium">Medium</th>
                  <th className="py-2 pr-4 font-medium">Campaign</th>
                  <th className="py-2 pr-4 font-medium text-right">Views</th>
                  <th className="py-2 font-medium text-right">Visitors</th>
                </tr>
              </thead>
              <tbody>
                {data.campaigns.map(row => (
                  <tr key={`${row.source}|${row.medium}|${row.campaign}`} className="border-b border-gray-50">
                    <td className="py-2 pr-4 text-gray-700">{row.source}</td>
                    <td className="py-2 pr-4 text-gray-700">{row.medium}</td>
                    <td className="py-2 pr-4 text-gray-700">
                      <Link
                        href={`/admin/stats?from=${fromStr}&to=${toStr}&campaign=${encodeURIComponent(row.campaign)}`}
                        className="hover:text-[#08507f] hover:underline"
                      >
                        {row.campaign}
                      </Link>
                    </td>
                    <td className="py-2 pr-4 text-right font-semibold text-gray-900">{row.views.toLocaleString()}</td>
                    <td className="py-2 text-right font-semibold text-gray-900">{row.visitors.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PagePerformanceTable
        data={data.pagePerformance}
        csvRows={pagePerformanceCsvRows}
        fromStr={fromStr}
        toStr={toStr}
      />

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
