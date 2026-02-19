import type { MetadataRoute } from 'next'

function getSiteUrl() {
  const raw = process.env.NEXT_PUBLIC_SITE_URL || 'https://englishwitharik.com'
  return raw.startsWith('http') ? raw : `https://${raw}`
}

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
