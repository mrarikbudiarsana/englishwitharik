import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import AboutHero from './_components/AboutHero'
import AboutStats from './_components/AboutStats'
import AboutBio from './_components/AboutBio'
import AboutCTA from './_components/AboutCTA'

export const metadata: Metadata = {
  title: 'About Arik | English with Arik',
  description: 'Learn about Arik Budiarsana, professional English tutor from Bali, specializing in IELTS, PTE, TOEFL and Business English.',
}

export const revalidate = 3600

export default async function AboutPage() {
  const supabase = await createClient()
  const { data: page } = await supabase
    .from('blog_pages')
    .select('content')
    .eq('slug', 'about')
    .eq('status', 'published')
    .single()

  return (
    <main className="min-h-screen bg-gray-50/50">
      <AboutHero />
      <AboutStats />
      <AboutBio content={page?.content} />
      <AboutCTA />
    </main>
  )
}
