import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing | English with Arik',
  description: 'Affordable English tutoring packages for IELTS, PTE, TOEFL and Business English in Bali.',
}
export const revalidate = 3600

export default async function PricingPage() {
  const supabase = await createClient()
  const { data: page } = await supabase.from('blog_pages').select('content').eq('slug', 'pricing').eq('status', 'published').single()

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Pricing</h1>
        <p className="text-gray-500 text-lg">Flexible packages for every learning goal.</p>
      </div>

      {page?.content ? (
        <div className="prose prose-lg max-w-none mx-auto prose-a:text-[#08507f]"
          dangerouslySetInnerHTML={{ __html: page.content }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Trial', price: 'Free', sessions: '1 session', features: ['30-minute trial', 'Goal assessment', 'Study plan preview'] },
            { name: 'Regular', price: 'Contact', sessions: 'Per session', features: ['1-on-1 tutoring', 'Personalized materials', 'Progress tracking'], popular: true },
            { name: 'Package', price: 'Contact', sessions: 'Bundle', features: ['Bulk session discount', 'Mock exams included', 'Priority scheduling'] },
          ].map(plan => (
            <div key={plan.name} className={`rounded-2xl p-6 border ${plan.popular ? 'border-[#08507f]/30 bg-[#08507f]/5' : 'border-gray-200 bg-white'}`}>
              {plan.popular && <span className="inline-block bg-[#08507f] text-white text-xs font-semibold px-2 py-0.5 rounded-full mb-3">Most Popular</span>}
              <h3 className="text-xl font-bold text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-3xl font-bold text-[#08507f] mb-1">{plan.price}</p>
              <p className="text-sm text-gray-500 mb-4">{plan.sessions}</p>
              <ul className="space-y-2 mb-5">
                {plan.features.map(f => <li key={f} className="text-sm text-gray-600 flex items-center gap-2"><span className="text-[#08507f]">✓</span>{f}</li>)}
              </ul>
              <a href="https://wa.me/628214422358" target="_blank" rel="noopener noreferrer"
                className={`block text-center py-2.5 rounded-xl font-medium text-sm transition-colors ${plan.popular ? 'bg-[#08507f] hover:bg-[#063a5c] text-white' : 'border border-gray-300 hover:border-[#08507f]/50 text-gray-700'}`}>
                Get Started
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
