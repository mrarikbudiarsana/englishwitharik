import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, Star } from 'lucide-react'

interface RatingPost {
  title: string
  slug: string
}

interface RatingRow {
  id: string
  post_id: string
  rating: number
  session_id: string
  path: string | null
  created_at: string
  posts: RatingPost | RatingPost[] | null
}

function normalizePost(posts: RatingRow['posts']) {
  if (!posts) return null
  return Array.isArray(posts) ? posts[0] : posts
}

export default async function AdminRatingsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; rating?: string; from?: string; to?: string }>
}) {
  const { q, rating, from, to } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('post_ratings')
    .select(`
      id, post_id, rating, session_id, path, created_at,
      posts(title, slug)
    `)
    .order('created_at', { ascending: false })
    .limit(1000)

  if (rating && rating !== 'all') {
    query = query.eq('rating', Number(rating))
  }
  if (from) {
    query = query.gte('created_at', `${from}T00:00:00.000Z`)
  }
  if (to) {
    query = query.lte('created_at', `${to}T23:59:59.999Z`)
  }

  const { data } = await query
  let rows = (data ?? []) as RatingRow[]

  if (q) {
    const keyword = q.toLowerCase()
    rows = rows.filter(row => {
      const post = normalizePost(row.posts)
      return (
        row.session_id.toLowerCase().includes(keyword)
        || (row.path ?? '').toLowerCase().includes(keyword)
        || (post?.title ?? '').toLowerCase().includes(keyword)
        || (post?.slug ?? '').toLowerCase().includes(keyword)
      )
    })
  }

  const avg = rows.length
    ? (rows.reduce((sum, row) => sum + row.rating, 0) / rows.length).toFixed(1)
    : '0.0'

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ratings</h1>
          <p className="text-sm text-gray-500 mt-0.5">{rows.length} ratings • {avg}/5 average</p>
        </div>
      </div>

      <form className="flex flex-col lg:flex-row lg:items-center gap-3 mb-5">
        <div className="relative w-full lg:max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search ratings..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
        </div>

        <select
          name="rating"
          defaultValue={rating ?? 'all'}
          className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#08507f]"
        >
          <option value="all">All ratings</option>
          <option value="5">5 stars</option>
          <option value="4">4 stars</option>
          <option value="3">3 stars</option>
          <option value="2">2 stars</option>
          <option value="1">1 star</option>
        </select>

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
        <button
          type="submit"
          className="inline-flex items-center justify-center text-sm font-medium px-4 py-2 rounded-lg bg-[#08507f] text-white hover:bg-[#063a5c]"
        >
          Apply
        </button>
      </form>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!rows.length ? (
          <div className="py-16 text-center">
            <Star size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No ratings found.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Rating</th>
                <th className="px-6 py-3 text-left font-medium">Post</th>
                <th className="px-6 py-3 text-left font-medium">Path</th>
                <th className="px-6 py-3 text-left font-medium">Session</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(row => {
                const post = normalizePost(row.posts)
                return (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center gap-1 font-medium text-amber-600">
                        <Star size={14} className="fill-current" />
                        {row.rating}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      {post ? (
                        <Link href={`/blog/${post.slug}`} target="_blank" className="text-[#08507f] hover:underline">
                          {post.title}
                        </Link>
                      ) : (
                        <span className="text-gray-400">Unknown post</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500 max-w-[320px] truncate">{row.path ?? '-'}</td>
                    <td className="px-6 py-3 text-gray-500 font-mono text-xs">{row.session_id}</td>
                    <td className="px-6 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(row.created_at).toLocaleString('en-US', {
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
