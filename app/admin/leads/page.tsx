import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Inbox, Download } from 'lucide-react'
import LeadStatusSelect from '@/components/admin/LeadStatusSelect'

interface LeadPost {
  title: string
  slug: string
}

interface LeadRow {
  id: string
  name: string | null
  email: string | null
  whatsapp: string | null
  source: string | null
  block_id: string | null
  submission: string | null
  status: 'new' | 'contacted' | 'closed'
  post_id: string | null
  created_at: string
  posts: LeadPost | LeadPost[] | null
}

function normalizePost(posts: LeadRow['posts']) {
  if (!posts) return null
  return Array.isArray(posts) ? posts[0] : posts
}

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; source?: string; status?: string; from?: string; to?: string }>
}) {
  const { q, source, status, from, to } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('leads')
    .select(`
      id, name, email, whatsapp, source, block_id, submission, status, post_id, created_at,
      posts(title, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(500)

  if (source && source !== 'all') {
    query = query.eq('source', source)
  }
  if (status && status !== 'all') {
    query = query.eq('status', status)
  }
  if (from) {
    query = query.gte('created_at', `${from}T00:00:00.000Z`)
  }
  if (to) {
    query = query.lte('created_at', `${to}T23:59:59.999Z`)
  }

  if (q) {
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,whatsapp.ilike.%${q}%,source.ilike.%${q}%,submission.ilike.%${q}%`)
  }

  const { data: leads } = await query
  const rows = (leads ?? []) as LeadRow[]

  const uniqueSources = Array.from(new Set(rows.map(row => row.source).filter(Boolean))).sort()
  const statuses: Array<'all' | 'new' | 'contacted' | 'closed'> = ['all', 'new', 'contacted', 'closed']
  const leadCount = rows.length
  const exportParams = new URLSearchParams()
  if (q) exportParams.set('q', q)
  if (source) exportParams.set('source', source)
  if (status) exportParams.set('status', status)
  if (from) exportParams.set('from', from)
  if (to) exportParams.set('to', to)

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leads</h1>
          <p className="text-sm text-gray-500 mt-0.5">{leadCount} leads</p>
        </div>
      </div>

      <div className="space-y-3 mb-5">
        <form className="flex flex-col lg:flex-row lg:items-center gap-3">
          <div className="relative w-full lg:max-w-sm">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              placeholder="Search leads..."
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#08507f]"
            />
          </div>
          <input
            type="date"
            name="from"
            defaultValue={from}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
          <input
            type="date"
            name="to"
            defaultValue={to}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
          {source && <input type="hidden" name="source" value={source} />}
          {status && <input type="hidden" name="status" value={status} />}
          <button
            type="submit"
            className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]"
          >
            Apply
          </button>
          <Link
            href={`/api/admin/leads/export?${exportParams.toString()}`}
            className="inline-flex items-center justify-center gap-1.5 text-sm font-medium px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <Download size={14} />
            Export CSV
          </Link>
        </form>

        <div className="flex flex-wrap gap-3">
          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-auto">
            <Link
              href={`/admin/leads?source=all${status ? `&status=${encodeURIComponent(status)}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}${from ? `&from=${encodeURIComponent(from)}` : ''}${to ? `&to=${encodeURIComponent(to)}` : ''}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap ${(source ?? 'all') === 'all'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              All Sources
            </Link>
            {uniqueSources.map(value => (
              <Link
                key={value}
                href={`/admin/leads?source=${encodeURIComponent(value as string)}${status ? `&status=${encodeURIComponent(status)}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}${from ? `&from=${encodeURIComponent(from)}` : ''}${to ? `&to=${encodeURIComponent(to)}` : ''}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap ${source === value
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {value}
              </Link>
            ))}
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg overflow-auto">
            {statuses.map(s => (
              <Link
                key={s}
                href={`/admin/leads?status=${s}${source ? `&source=${encodeURIComponent(source)}` : ''}${q ? `&q=${encodeURIComponent(q)}` : ''}${from ? `&from=${encodeURIComponent(from)}` : ''}${to ? `&to=${encodeURIComponent(to)}` : ''}`}
                className={`px-3 py-1.5 rounded-md text-sm font-medium whitespace-nowrap ${(status ?? 'all') === s
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!rows.length ? (
          <div className="py-20 text-center">
            <Inbox size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No leads found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Contact</th>
                <th className="px-6 py-3 text-left font-medium">Source</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Post</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(lead => {
                const post = normalizePost(lead.posts)
                return (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <p className="font-medium text-gray-800">{lead.name || 'Anonymous'}</p>
                      {lead.email && (
                        <a href={`mailto:${lead.email}`} className="block text-xs text-[#08507f] hover:underline">
                          {lead.email}
                        </a>
                      )}
                      {lead.whatsapp && (
                        <a href={`https://wa.me/${lead.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="block text-xs text-green-700 hover:underline">
                          {lead.whatsapp}
                        </a>
                      )}
                      {lead.submission && (
                        <details className="mt-2">
                          <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">View submission</summary>
                          <pre className="mt-1 max-h-28 overflow-y-auto whitespace-pre-wrap rounded-md bg-gray-50 p-2 text-[11px] text-gray-700">{lead.submission}</pre>
                        </details>
                      )}
                    </td>
                    <td className="px-6 py-3">
                      <p className="text-gray-700 text-xs">{lead.source ?? '-'}</p>
                      <p className="text-gray-400 text-xs">{lead.block_id ?? '-'}</p>
                    </td>
                    <td className="px-6 py-3">
                      <LeadStatusSelect leadId={lead.id} value={lead.status} />
                    </td>
                    <td className="px-6 py-3">
                      {post ? (
                        <Link href={`/blog/${post.slug}`} target="_blank" className="text-[#08507f] hover:underline text-xs">
                          {post.title}
                        </Link>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {new Date(lead.created_at).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
