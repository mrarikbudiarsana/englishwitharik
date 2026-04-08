import Link from 'next/link'
import { Globe, ArrowRight } from 'lucide-react'

// Hardcoded list of supported static landing pages
const LANDING_PAGES = [
  { slug: 'toefl-ibt', title: 'TOEFL iBT', description: 'Main TOEFL iBT preparation landing page.' },
  { slug: 'pte-academic', title: 'PTE Academic', description: 'PTE Academic preparation landing page.' },
  { slug: 'ielts-preparation', title: 'IELTS Preparation', description: 'IELTS preparation landing page.' },
  { slug: 'general-english', title: 'General English', description: 'General English landing page.' },
  { slug: 'business-english', title: 'Business English', description: 'Business English landing page.' },
  { slug: 'english-for-specific-purposes', title: 'English for Specific Purposes', description: 'ESP landing page.' }
]

export default function AdminLandingPagesPage() {
  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Landing Pages Configurator</h1>
        <p className="text-sm text-gray-500 mt-1">
          Update the titles, descriptions, and images of your primary landing pages while preserving their custom layouts.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {LANDING_PAGES.map((page) => (
          <div key={page.slug} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-[#08507f]/10 rounded-lg text-[#08507f]">
                  <Globe size={20} />
                </div>
                <h2 className="font-semibold text-gray-900">{page.title}</h2>
              </div>
              <p className="text-sm text-gray-500 mb-5">{page.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <Link 
                  href={`/${page.slug}`} 
                  target="_blank"
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  View live page
                </Link>
                <Link
                  href={`/admin/landing-pages/${page.slug}`}
                  className="flex items-center gap-1.5 text-sm font-medium text-[#08507f] hover:text-[#063a5c] bg-[#08507f]/5 hover:bg-[#08507f]/10 px-3 py-1.5 rounded-lg transition-colors"
                >
                  Edit Content <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
