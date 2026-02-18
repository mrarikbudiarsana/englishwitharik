import { createClient } from '@/lib/supabase/server'
import { FileText, Eye, TrendingUp, PenSquare } from 'lucide-react'
import Link from 'next/link'
import MetricsDashboard from '@/components/admin/MetricsDashboard'

async function getStats() {
  const supabase = await createClient()

  const [postsRes, publishedRes, viewsRes, topPostsRes] = await Promise.all([
    supabase.from('posts').select('id', { count: 'exact', head: true }),
    supabase.from('posts').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('page_views').select('id', { count: 'exact', head: true }),
    supabase
      .from('page_views')
      .select('post_id, posts(title, slug)')
      .not('post_id', 'is', null)
      .limit(100),
  ])

  // Top 5 posts by view count
  const postViewMap: Record<string, { title: string; slug: string; count: number }> = {}
  for (const row of topPostsRes.data ?? []) {
    if (!row.post_id) continue
    const post = Array.isArray(row.posts) ? row.posts[0] : row.posts
    if (!post) continue
    if (!postViewMap[row.post_id]) {
      postViewMap[row.post_id] = { title: post.title, slug: post.slug, count: 0 }
    }
    postViewMap[row.post_id].count++
  }
  const topPosts = Object.entries(postViewMap)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Last 5 posts
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('id, title, slug, status, created_at')
    .order('created_at', { ascending: false })
    .limit(5)

  // Views by day (last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: dailyViews } = await supabase
    .from('page_views')
    .select('viewed_at')
    .gte('viewed_at', thirtyDaysAgo.toISOString())

  // Group by day
  const viewsByDay: Record<string, number> = {}
  for (const v of dailyViews ?? []) {
    const day = v.viewed_at.substring(0, 10)
    viewsByDay[day] = (viewsByDay[day] ?? 0) + 1
  }
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (29 - i))
    const key = d.toISOString().substring(0, 10)
    return { date: key, views: viewsByDay[key] ?? 0 }
  })

  return {
    totalPosts: postsRes.count ?? 0,
    publishedPosts: publishedRes.count ?? 0,
    totalViews: viewsRes.count ?? 0,
    topPosts,
    recentPosts: recentPosts ?? [],
    chartData,
  }
}

export default async function AdminDashboardPage() {
  const stats = await getStats()

  const cards = [
    { label: 'Total Posts', value: stats.totalPosts, icon: FileText, color: 'bg-blue-500' },
    { label: 'Published Posts', value: stats.publishedPosts, icon: PenSquare, color: 'bg-[#08507f]' },
    { label: 'Total Page Views', value: stats.totalViews, icon: Eye, color: 'bg-purple-500' },
    { label: 'Draft Posts', value: stats.totalPosts - stats.publishedPosts, icon: TrendingUp, color: 'bg-amber-500' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back, Arik! Here&apos;s what&apos;s happening on your site.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {cards.map(card => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">{card.label}</span>
              <div className={`w-8 h-8 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value.toLocaleString()}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Page Views — Last 30 Days</h2>
          <MetricsDashboard data={stats.chartData} />
        </div>

        {/* Top Posts */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">Top Posts</h2>
          {stats.topPosts.length === 0 ? (
            <p className="text-sm text-gray-400">No data yet. Views will appear here once visitors arrive.</p>
          ) : (
            <ul className="space-y-3">
              {stats.topPosts.map((post, i) => (
                <li key={post.id} className="flex items-start gap-3">
                  <span className="text-xs font-bold text-gray-400 w-4 pt-0.5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm font-medium text-gray-800 hover:text-[#08507f] line-clamp-1">
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-400">{post.count} views</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Posts */}
      <div className="mt-6 bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Recent Posts</h2>
          <Link href="/admin/posts" className="text-sm text-[#08507f] hover:underline">View all</Link>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Title</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
              <th className="px-6 py-3 text-left font-medium">Date</th>
              <th className="px-6 py-3 text-right font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {stats.recentPosts.map(post => (
              <tr key={post.id} className="hover:bg-gray-50">
                <td className="px-6 py-3 font-medium text-gray-800 max-w-xs truncate">{post.title}</td>
                <td className="px-6 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${post.status === 'published'
                    ? 'bg-[#08507f]/10 text-[#08507f]'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    {post.status}
                  </span>
                </td>
                <td className="px-6 py-3 text-gray-500">
                  {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-6 py-3 text-right">
                  <Link href={`/admin/posts/${post.id}`} className="text-[#08507f] hover:underline text-xs">Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
