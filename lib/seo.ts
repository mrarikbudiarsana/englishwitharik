import type { Metadata } from 'next'

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://englishwitharik.com'
  return raw.startsWith('http') ? raw : `https://${raw}`
}

interface PageMetadataInput {
  title: string
  description?: string
  path: string
  image?: string
  type?: 'website' | 'article'
  noindex?: boolean
}

export function buildPageMetadata({
  title,
  description = 'English learning resources and tutoring by English with Arik.',
  path,
  image,
  type = 'website',
  noindex = false,
}: PageMetadataInput): Metadata {
  const canonicalPath = path.startsWith('/') ? path : `/${path}`
  const siteUrl = getSiteUrl()
  const absoluteUrl = `${siteUrl}${canonicalPath}`

  return {
    title,
    description,
    alternates: {
      canonical: canonicalPath,
    },
    openGraph: {
      type,
      title,
      description,
      url: absoluteUrl,
      images: image ? [image] : [],
    },
    twitter: {
      card: image ? 'summary_large_image' : 'summary',
      title,
      description,
      images: image ? [image] : [],
    },
    robots: {
      index: !noindex,
      follow: !noindex,
      googleBot: {
        index: !noindex,
        follow: !noindex,
      },
    },
  }
}

export function buildFaqJsonLd(items: Array<{ question: string; answer: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  }
}
