import { Metadata } from 'next'
import PricingEditor from '@/components/admin/PricingEditor'
import { createAdminClient } from '@/lib/supabase/server'

export const metadata: Metadata = {
    title: 'Manage Pricing | Admin',
}

export default async function AdminPricingPage() {
    const supabase = await createAdminClient()

    // We can fetch data via the API route logic directly or by calling it.
    // It's cleaner to reuse the GET fetching logic.
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
        const sectionsMap = new Map<string, any>()

        for (const pkg of progPackages) {
            if (!sectionsMap.has(pkg.section_name)) {
                sectionsMap.set(pkg.section_name, {
                    name: pkg.section_name,
                    description: pkg.section_desc,
                    packages: [],
                })
            }
            sectionsMap.get(pkg.section_name).packages.push({
                id: pkg.id,
                hours: pkg.hours,
                rawPricePrivate: pkg.price_private,
                rawPriceSemi: pkg.price_semi,
                popular: pkg.popular,
            })
        }

        const progPerks = perks
            .filter((p) => p.program_id === prog.id)
            .map((p) => p.perk_text)

        return {
            id: prog.id,
            label: prog.label,
            tier: prog.tier,
            features: progPerks,
            sections: Array.from(sectionsMap.values()),
        }
    })

    return (
        <div className="p-6 md:p-8 max-w-5xl">
            <h1 className="text-2xl font-bold text-gray-900 mb-1">Pricing & Packages</h1>
            <p className="text-sm text-gray-500 mb-6">
                Manage the prices and included perks for your tutoring programs.
                Changes here will reflect instantly on the public pricing page.
            </p>

            <PricingEditor initialTabs={tabs} />
        </div>
    )
}
