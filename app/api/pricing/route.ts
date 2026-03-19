import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface PricingSectionResponse {
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

export async function GET() {
    const supabase = await createClient()

    // Fetch all pricing data
    const [programsRes, packagesRes, perksRes] = await Promise.all([
        supabase.from('pricing_programs').select('*').order('sort_order', { ascending: true }),
        supabase.from('pricing_packages').select('*').order('sort_order', { ascending: true }),
        supabase.from('pricing_perks').select('*').order('sort_order', { ascending: true }),
    ])

    if (programsRes.error) return NextResponse.json({ error: programsRes.error.message }, { status: 500 })

    const programs = programsRes.data ?? []
    const packages = packagesRes.data ?? []
    const perks = perksRes.data ?? []

    // Map into the TABS structure expected by PricingPageClient
    const tabs = programs.map((prog) => {
        // Find packages for this program
        const progPackages = packages.filter((p) => p.program_id === prog.id)

        // Group packages by section
        const sectionsMap = new Map<string, PricingSectionResponse>()
        for (const pkg of progPackages) {
            let section = sectionsMap.get(pkg.section_name)
            if (!section) {
                section = {
                    name: pkg.section_name,
                    description: pkg.section_desc,
                    packages: [],
                }
                sectionsMap.set(pkg.section_name, section)
            }

            const formattedPricePrivate = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(pkg.price_private)

            const formattedPriceSemi = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(pkg.price_semi)

            section.packages.push({
                id: pkg.id,
                hours: pkg.hours,
                rawPricePrivate: pkg.price_private,
                rawPriceSemi: pkg.price_semi,
                pricePrivate: formattedPricePrivate,
                priceSemi: formattedPriceSemi,
                popular: pkg.popular,
            })
        }

        const sections = Array.from(sectionsMap.values())

        // Find perks for this program
        const progPerks = Array.from(new Set(
            perks
                .filter((p) => p.program_id === prog.id)
                .map((p) => p.perk_text)
        ))

        return {
            id: prog.id,
            label: prog.label,
            tier: prog.tier,
            features: progPerks,
            sections,
        }
    })

    return NextResponse.json(tabs)
}
