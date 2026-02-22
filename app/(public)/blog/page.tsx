import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/public/PostCard'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}): Promise<Metadata> {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const title = page > 1 ? `Blog & Articles - Page ${page}` : 'Blog & Articles'
  const canonical = page > 1 ? `/blog?page=${page}` : '/blog'

  return {
    title,
    description: 'Tips, strategies and guides for IELTS, PTE, TOEFL, Business English and General English.',
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      title,
      description: 'Tips, strategies and guides for IELTS, PTE, TOEFL, Business English and General English.',
      url: canonical,
    },
    twitter: {
      card: 'summary',
      title,
      description: 'Tips, strategies and guides for IELTS, PTE, TOEFL, Business English and General English.',
    },
  }
}

export const revalidate = 60

const PAGE_SIZE = 9

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const nowIso = new Date().toISOString()

  const supabase = await createClient()

  const { data: rawPosts, count } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image_url, published_at, created_at,
      post_categories(category_id, categories(id, name, slug))
    `, { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', nowIso)
    .order('published_at', { ascending: false })
    .range(from, to)

  const posts = (rawPosts ?? []).map(post => ({
    ...post,
    categories: (post.post_categories ?? []).flatMap((pc: { categories: unknown }) =>
      Array.isArray(pc.categories) ? pc.categories : [pc.categories]
    ).filter(Boolean),
  }))

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Blog &amp; Articles</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Tips, strategies, and guides to help you ace your English exams.
        </p>
      </div>

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No posts yet. Check back soon!</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map(post => (
              <PostCard key={post.id} post={post as unknown as Parameters<typeof PostCard>[0]['post']} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              {/* Previous */}
              {page > 1 ? (
                <Link
                  href={`/blog?page=${page - 1}`}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  ← Previous
                </Link>
              ) : (
                <span className="px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
                  ← Previous
                </span>
              )}

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={`/blog?page=${p}`}
                  className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                    p === page
                      ? 'bg-[#08507f] text-white'
                      : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </Link>
              ))}

              {/* Next */}
              {page < totalPages ? (
                <Link
                  href={`/blog?page=${page + 1}`}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Next →
                </Link>
              ) : (
                <span className="px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
                  Next →
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
