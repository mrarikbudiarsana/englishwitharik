import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import AboutVision from './_components/AboutVision'
import AboutStory from './_components/AboutStory'
import AboutWhyChooseUs from './_components/AboutWhyChooseUs'
import AboutCTA from './_components/AboutCTA'

export const metadata: Metadata = buildPageMetadata({
  title: 'About Arik',
  description: 'Learn about Arik Budiarsana, professional English tutor from Bali, specializing in IELTS, PTE, TOEFL and Business English.',
  path: '/about',
})

export const revalidate = 3600

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white">
      <AboutVision />
      <AboutWhyChooseUs />
      <AboutStory />
      <AboutCTA />
    </main>
  )
}
