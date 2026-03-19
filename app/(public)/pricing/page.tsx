import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import PricingPageClient from '@/components/public/PricingPageClient'

import { createClient } from '@/lib/supabase/server'

export const metadata: Metadata = buildPageMetadata({
  title: 'Pricing',
  description: 'Affordable English tutoring packages for IELTS, PTE, TOEFL and Business English. Transparent pricing with Private and Semi-Private options.',
  path: '/pricing',
})

export const revalidate = 3600

interface PricingSectionView {
  name: string
  description: string
  packages: Array<{
    id: string
    hours: number
    rawPricePrivate: number
    rawPriceSemi: number
    pricePrivate: string
    priceSemi: string
    popular: boolean
  }>
}

export default async function PricingPage() {
  const supabase = await createClient()

  const [programsRes, packagesRes, perksRes] = await Promise.all([
    supabase.from('pricing_programs').select('*').order('sort_order', { ascending: true }),
    supabase.from('pricing_packages').select('*').order('sort_order', { ascending: true }),
    supabase.from('pricing_perks').select('*').order('sort_order', { ascending: true }),
  ])

  const programs = programsRes.data ?? []
  const packages = packagesRes.data ?? []
  const perks = perksRes.data ?? []

  const tabs = programs.map((prog) => {
    const progPackages = packages.filter((p) => p.program_id === prog.id)
    const sectionsMap = new Map<string, PricingSectionView>()
    for (const pkg of progPackages) {
      let section = sectionsMap.get(pkg.section_name)
      if (!section) {
        section = { name: pkg.section_name, description: pkg.section_desc, packages: [] }
        sectionsMap.set(pkg.section_name, section)
      }
      const pricePrivate = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.price_private)
      const priceSemi = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(pkg.price_semi)

      section.packages.push({
        id: pkg.id,
        hours: pkg.hours,
        rawPricePrivate: pkg.price_private,
        rawPriceSemi: pkg.price_semi,
        pricePrivate,
        priceSemi,
        popular: pkg.popular,
      })
    }
    const progPerks = Array.from(new Set(
      perks.filter((p) => p.program_id === prog.id).map((p) => p.perk_text)
    ))

    return {
      id: prog.id,
      label: prog.label,
      tier: prog.tier,
      features: progPerks,
      sections: Array.from(sectionsMap.values()),
    }
  })

  return <PricingPageClient tabs={tabs} />
}
