import type { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://englishwitharik.com'
  return raw.startsWith('http') ? raw : `https://${raw}`
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const now = new Date()

  const staticRoutes = [
    '',
    '/about',
    '/blog',
    '/business-english',
    '/contact',
    '/english-for-specific-purposes',
    '/general-english',
    '/ielts-preparation',
    '/pricing',
    '/privacy-policy',
    '/pte-academic',
    '/test-preparation',
    '/toefl-ibt',
    '/toefl-itp',
    '/id/kursus-bahasa-inggris-indonesia',
    '/id/persiapan-ielts-indonesia',
    '/id/kursus-toefl-ibt-online-indonesia',
    '/id/kursus-pte-academic-indonesia',
    '/id/kursus-business-english-indonesia',
  ]

  const entries: MetadataRoute.Sitemap = staticRoutes.map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: now,
    changeFrequency: path === '' || path === '/blog' ? 'weekly' : 'monthly',
    priority: path === '' ? 1 : path === '/blog' ? 0.9 : 0.7,
  }))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) return entries

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey)
    const { data: posts } = await supabase
      .from('posts')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .lte('published_at', now.toISOString())

    if (!posts) return entries

    return [
      ...entries,
      ...posts
        .filter((post) => post.slug)
        .map((post) => ({
          url: `${siteUrl}/blog/${post.slug}`,
          lastModified: new Date(post.updated_at ?? post.published_at ?? now),
          changeFrequency: 'weekly' as const,
          priority: 0.8,
        })),
    ]
  } catch {
    return entries
  }
}
