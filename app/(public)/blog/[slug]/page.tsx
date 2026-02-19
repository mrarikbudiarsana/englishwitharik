import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import PageViewTracker from '@/components/public/PageViewTracker'
import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import PostCard from '@/components/public/PostCard'
import InteractivePostContent from '@/components/public/blog/InteractivePostContent'
import ShareActions from '@/components/public/blog/ShareActions'
import ReadingProgressBar from '@/components/public/blog/ReadingProgressBar'
import PostTableOfContents from '@/components/public/blog/PostTableOfContents'
import PostRating from '@/components/public/blog/PostRating'

export const revalidate = 60

interface Props {
  params: Promise<{ slug: string }>
}

interface PostCategoryRow {
  category_id: string
  categories: unknown
}

interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

function decodeHtmlEntities(input: string) {
  return input
    .replaceAll('&nbsp;', ' ')
    .replaceAll('&amp;', '&')
    .replaceAll('&quot;', '"')
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
}

function stripHtml(input: string) {
  return decodeHtmlEntities(input.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim())
}

function slugifyHeading(text: string) {
  const normalized = text
    .toLowerCase()
    .replace(/['"]/g, '')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
  return normalized || 'section'
}

function enhancePostHtml(rawHtml: string) {
  const headings: TocHeading[] = []
  const usedIds = new Set<string>()
  const source = rawHtml ?? ''

  const html = source.replace(/<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi, (full, levelRaw, attrs, inner) => {
    const level = Number(levelRaw) as 2 | 3
    const text = stripHtml(inner)
    if (!text) return full

    const existingIdMatch = attrs.match(/\sid=(["'])([^"']+)\1/i)
    let id = existingIdMatch?.[2] ?? slugifyHeading(text)
    let suffix = 2
    while (usedIds.has(id)) {
      id = `${id}-${suffix}`
      suffix += 1
    }
    usedIds.add(id)
    headings.push({ id, text, level })

    if (existingIdMatch) return full
    return `<h${level}${attrs} id="${id}">${inner}</h${level}>`
  })

  const plainText = stripHtml(html)
  const words = plainText ? plainText.split(/\s+/).length : 0
  const readMinutes = Math.max(1, Math.ceil(words / 220))

  return { html, headings, readMinutes }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('posts')
    .select('title, excerpt, seo_title, seo_description, featured_image_url')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) return {}

  return {
    title: post.seo_title ?? `${post.title} | English with Arik`,
    description: post.seo_description ?? post.excerpt ?? '',
    openGraph: {
      title: post.seo_title ?? post.title,
      description: post.seo_description ?? post.excerpt ?? '',
      images: post.featured_image_url ? [post.featured_image_url] : [],
    },
  }
}

export async function generateStaticParams() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  try {
    const { createClient: createBrowserClient } = await import('@supabase/supabase-js')
    const supabase = createBrowserClient(url, key)
    const { data } = await supabase.from('posts').select('slug').eq('status', 'published')
    return (data ?? []).map(p => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      post_categories(category_id, categories(id, name, slug)),
      post_tags(tag_id, tags(id, name, slug))
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  const categories = (post.post_categories ?? []).flatMap((pc: { categories: unknown }) =>
    Array.isArray(pc.categories) ? pc.categories : [pc.categories]
  ).filter(Boolean)

  const tags = (post.post_tags ?? []).flatMap((pt: { tags: unknown }) =>
    Array.isArray(pt.tags) ? pt.tags : [pt.tags]
  ).filter(Boolean)

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : ''
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
    : 'https://englishwitharik.com'
  const postUrl = `${siteUrl}/blog/${post.slug}`
  const enhancedContent = enhancePostHtml(post.content ?? '')
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.seo_title ?? post.title,
    description: post.seo_description ?? post.excerpt ?? '',
    image: post.featured_image_url ? [post.featured_image_url] : [],
    datePublished: post.published_at ?? post.created_at,
    dateModified: post.updated_at ?? post.published_at ?? post.created_at,
    author: {
      '@type': 'Person',
      name: 'Arik Budiarsana',
    },
    publisher: {
      '@type': 'Organization',
      name: 'English with Arik',
      url: siteUrl,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': postUrl,
    },
    url: postUrl,
  }

  // Fetch related posts
  const categoryIds = (post.post_categories ?? []).map((pc: PostCategoryRow) => pc.category_id)

  let relatedPosts: Parameters<typeof PostCard>[0]['post'][] = []
  if (categoryIds.length > 0) {
    const { data } = await supabase
      .from('posts')
      .select(`
        id, title, slug, excerpt, featured_image_url, published_at, created_at,
        post_categories!inner(category_id, categories(id, name, slug))
      `)
      .eq('status', 'published')
      .neq('id', post.id) // Exclude current post
      .in('post_categories.category_id', categoryIds)
      .order('published_at', { ascending: false })
      .limit(3)

    if (data) {
      relatedPosts = data.map(p => ({
        ...p,
        categories: (p.post_categories ?? []).flatMap((pc: { categories: unknown }) =>
          Array.isArray(pc.categories) ? pc.categories : [pc.categories]
        ).filter(Boolean),
      }))
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageViewTracker path={`/blog/${post.slug}`} postId={post.id} />

      <main className="bg-white min-h-screen pb-20">
        <ReadingProgressBar />

        {/* Header Section */}
        <header className="pt-12 pb-12 sm:pt-16 sm:pb-16 bg-white">
          <div className="container max-w-4xl mx-auto px-4 sm:px-6">


            <div className="space-y-6 text-center sm:text-left">
              {categories.length > 0 && (
                <div className="flex flex-wrap justify-center sm:justify-start gap-2 mb-6">
                  {categories.map((cat: { id: string; name: string; slug: string }) => (
                    <Link
                      key={cat.id}
                      href={`/blog?category=${cat.slug}`}
                      className="text-xs font-bold tracking-wider uppercase text-[#08507f] bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-6 gap-y-3 text-sm text-slate-500 font-medium pt-2">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[#08507f] flex items-center justify-center text-white font-bold text-xs mr-3">AB</div>
                  <span className="text-slate-700">Arik Budiarsana</span>
                </div>
                {date && (
                  <div className="flex items-center">
                    <span className="w-1 h-1 rounded-full bg-slate-300 mx-2 hidden sm:block"></span>
                    <Calendar className="w-4 h-4 mr-2 text-slate-400" />
                    <span>{date}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <span className="w-1 h-1 rounded-full bg-slate-300 mx-2 hidden sm:block"></span>
                  <Clock className="w-4 h-4 mr-2 text-slate-400" />
                  <span>{enhancedContent.readMinutes} min read</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image_url && (
          <div className="container max-w-5xl mx-auto px-4 sm:px-6 mb-20">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-slate-900/5 aspect-[21/9]">
              <Image
                src={post.featured_image_url}
                alt={post.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>
          </div>
        )}

        {/* Content */}
        <article className="container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
            <div className='hidden lg:block'>
              <PostTableOfContents headings={enhancedContent.headings} />
            </div>

            <div className="min-w-0">
              <div
                className="prose prose-lg prose-slate max-w-none
                prose-headings:font-bold prose-headings:text-slate-900 prose-headings:scroll-mt-24
                prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6
                prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
                prose-p:text-slate-700 prose-p:leading-relaxed prose-p:mb-6
                prose-a:text-[#08507f] prose-a:no-underline prose-a:font-semibold hover:prose-a:underline
                prose-img:rounded-xl prose-img:shadow-lg prose-img:my-8
                prose-blockquote:border-l-4 prose-blockquote:border-[#08507f] prose-blockquote:pl-6 prose-blockquote:py-2 prose-blockquote:my-8 prose-blockquote:text-xl prose-blockquote:font-medium prose-blockquote:italic prose-blockquote:text-slate-800
                prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-6
                prose-li:mb-2"
              >
                <InteractivePostContent html={enhancedContent.html} postId={post.id} postSlug={post.slug} />
              </div>

              {/* Tags & Share */}
              <div className="mt-16 pt-8 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: { id: string; name: string; slug: string }) => (
                      <span key={tag.id} className="text-sm text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full font-medium transition-colors hover:bg-slate-200">
                        #{tag.name}
                      </span>
                    ))}
                  </div>

                  <ShareActions postUrl={postUrl} title={post.title} />
                </div>
              </div>

              <div className="mt-12">
                <PostRating postId={post.id} />
              </div>


              {/* Author Bio */}
              <div className="mt-16 bg-slate-50 rounded-2xl p-8 md:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left border border-slate-100">
                <div className="relative w-20 h-20 rounded-full overflow-hidden shrink-0 ring-4 ring-white shadow-sm">
                  {/* Placeholder for author image if available, else initials */}
                  <div className="w-full h-full bg-[#08507f] flex items-center justify-center text-white font-bold text-2xl">AB</div>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Written by Arik Budiarsana</h3>
                  <p className="text-slate-600 leading-relaxed">
                    English teacher and founder of English with Arik. Passionate about helping students achieve their language goals through personalized functional training.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="mt-16 bg-gradient-to-br from-[#08507f] to-[#0a6abf] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
                {/* Decorative background elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col items-center text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold mb-4 tracking-tight">Ready to Master English?</h2>
                  <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto font-medium">
                    Join hundreds of students who have improved their English skills with our personalized coaching sessions.
                  </p>
                  <a
                    href="https://wa.me/628214422358"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center bg-white text-[#08507f] font-bold text-lg px-8 py-4 rounded-xl hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
                  >
                    Book Your Free Trial
                    <ArrowLeft className="w-5 h-5 ml-2 rotate-180" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Posts Section */}
        {relatedPosts.length > 0 && (
          <section className="bg-slate-50 mt-24 py-20 border-t border-slate-200">
            <div className="container max-w-6xl mx-auto px-4 sm:px-6">
              <div className="flex items-center justify-between mb-12">
                <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Related Articles</h2>
                <Link href="/blog" className="text-base font-semibold text-[#08507f] hover:text-[#0a6abf] transition-colors">
                  View all posts &rarr;
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {relatedPosts.map(post => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  )
}
