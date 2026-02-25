import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import PricingPageClient from '@/components/public/PricingPageClient'

export const metadata: Metadata = buildPageMetadata({
  title: 'Pricing',
  description: 'Affordable English tutoring packages for IELTS, PTE, TOEFL and Business English. Transparent pricing with Private and Semi-Private options.',
  path: '/pricing',
})

export const revalidate = 3600

export default function PricingPage() {
  return <PricingPageClient />
}
