import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/public/PostCard'
import BlogFilters from '@/components/public/blog/BlogFilters'
import Link from 'next/link'
import type { Metadata } from 'next'

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; category?: string; q?: string }>
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
  searchParams: Promise<{ page?: string; category?: string; q?: string }>
}) {
  const { page: pageParam, category: categorySlug, q: searchQuery } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1
  const nowIso = new Date().toISOString()

  const supabase = await createClient()

  // Fetch categories for the filter
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name, slug')
    .order('name')

  let query = supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image_url, published_at, created_at,
      post_categories!inner(category_id, categories!inner(id, name, slug))
    `, { count: 'exact' })
    .eq('status', 'published')
    .lte('published_at', nowIso)

  if (categorySlug) {
    query = query.eq('post_categories.categories.slug', categorySlug)
  }

  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,excerpt.ilike.%${searchQuery}%`)
  }

  const { data: rawPosts, count } = await query
    .order('published_at', { ascending: false })
    .range(from, to)

  const posts = (rawPosts ?? []).map((post: any) => ({
    ...post,
    categories: (post.post_categories ?? []).flatMap((pc: any) =>
      Array.isArray(pc.categories) ? pc.categories : [pc.categories]
    ).filter(Boolean),
  }))

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams()
    if (p > 1) params.set('page', p.toString())
    if (categorySlug) params.set('category', categorySlug)
    if (searchQuery) params.set('q', searchQuery)
    const qs = params.toString()
    return qs ? `/blog?${qs}` : '/blog'
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">Blog &amp; Articles</h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto">
          Tips, strategies, and guides to help you ace your English exams.
        </p>
      </div>

      <BlogFilters categories={categories ?? []} />

      {/* Posts grid */}
      {posts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">No posts found. Try adjusting your filters!</p>
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
            <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
              {/* Previous */}
              {page > 1 ? (
                <Link
                  href={buildPageUrl(page - 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  &larr; Previous
                </Link>
              ) : (
                <span className="px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
                  &larr; Previous
                </span>
              )}

              {/* Page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link
                  key={p}
                  href={buildPageUrl(p)}
                  className={`w-9 h-9 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${p === page
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
                  href={buildPageUrl(page + 1)}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Next &rarr;
                </Link>
              ) : (
                <span className="px-4 py-2 text-sm font-medium text-gray-300 bg-white border border-gray-200 rounded-lg cursor-not-allowed">
                  Next &rarr;
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
