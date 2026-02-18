import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-8">About Me</h1>
      {page?.content ? (
        <div
          className="prose prose-lg max-w-none prose-headings:font-bold prose-a:text-[#08507f]"
          dangerouslySetInnerHTML={{ __html: page.content }}
        />
      ) : (
        <div className="space-y-5 text-gray-600">
          <p className="text-lg">
            Hi! I&apos;m <strong className="text-gray-900">Arik Budiarsana</strong>, a professional English tutor
            based in Bali, Indonesia. I specialize in helping students achieve their target scores in
            IELTS, PTE Academic, TOEFL iBT/ITP, Business English, and General English.
          </p>
          <p>
            I have years of experience tutoring students from Indonesia and internationally, helping them
            reach their goals — whether that&apos;s immigration, university admission, career advancement, or
            personal development.
          </p>
          <p>
            📍 <strong>Location:</strong> Banjar Dinas Sema, Sangsit Village, Sawan District, Buleleng, Bali
          </p>
          <p>
            🕐 <strong>Hours:</strong> Daily 07:00 – 23:00 WITA
          </p>
          <div className="mt-8">
            <a
              href="https://wa.me/628214422358"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              📱 Contact on WhatsApp
            </a>
          </div>
        </div>
      )}
    </div>
  )
}
