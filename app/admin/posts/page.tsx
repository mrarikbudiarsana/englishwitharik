import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { PenSquare, Plus, Search } from 'lucide-react'

export default async function AdminPostsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>
}) {
  const { status, q } = await searchParams
  const supabase = await createClient()
  const nowIso = new Date().toISOString()

  let query = supabase
    .from('posts')
    .select('id, title, slug, status, published_at, created_at')
    .order('created_at', { ascending: false })

  if (status === 'published') {
    query = query.eq('status', 'published').lte('published_at', nowIso)
  } else if (status === 'scheduled') {
    query = query.eq('status', 'published').gt('published_at', nowIso)
  } else if (status === 'draft') {
    query = query.eq('status', 'draft')
  }
  if (q) query = query.ilike('title', `%${q}%`)

  const { data: posts } = await query

  const tabs = ['all', 'published', 'scheduled', 'draft']

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">{posts?.length ?? 0} posts</p>
        </div>
        <Link
          href="/admin/posts/new"
          className="flex items-center gap-2 bg-[#08507f] hover:bg-[#063a5c] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
        >
          <Plus size={16} />
          New Post
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-5">
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {tabs.map(tab => (
            <Link
              key={tab}
              href={`/admin/posts?status=${tab}`}
              className={`px-3 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${(status ?? 'all') === tab
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab}
            </Link>
          ))}
        </div>

        <form className="relative flex-1 max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            name="q"
            type="search"
            defaultValue={q}
            placeholder="Search posts…"
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#08507f]"
          />
        </form>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {!posts?.length ? (
          <div className="py-20 text-center">
            <PenSquare size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No posts found.</p>
            <Link href="/admin/posts/new" className="text-[#08507f] text-sm hover:underline mt-1 inline-block">
              Create your first post →
            </Link>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Title</th>
                <th className="px-6 py-3 text-left font-medium">Status</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map(post => (
                <tr key={post.id} className="hover:bg-gray-50 group">
                  <td className="px-6 py-3">
                    <Link href={`/admin/posts/${post.id}`} className="font-medium text-gray-800 hover:text-[#08507f] group-hover:text-[#08507f]">
                      {post.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">/blog/{post.slug}</p>
                  </td>
                  <td className="px-6 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${post.status === 'published'
                        ? 'bg-[#08507f]/10 text-[#08507f]'
                        : 'bg-gray-100 text-gray-600'
                      }`}>
                      {post.status === 'published' && post.published_at && post.published_at > nowIso
                        ? 'scheduled'
                        : post.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 text-gray-500 text-xs">
                    {new Date(post.published_at ?? post.created_at).toLocaleDateString('en-US', {
                      year: 'numeric', month: 'short', day: 'numeric',
                    })}
                  </td>
                  <td className="px-6 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <Link href={`/admin/posts/${post.id}`} className="text-[#08507f] hover:underline text-xs">Edit</Link>
                      <Link href={`/blog/${post.slug}`} target="_blank" className="text-gray-400 hover:text-gray-600 text-xs">View</Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
