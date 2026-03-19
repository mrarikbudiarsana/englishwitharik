import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

interface PricingPayload {
    tabs: Array<{
        id: string
        label: string
        tier: 'premium' | 'standard'
        sortOrder?: number
        features: string[]
        sections: Array<{
            name: string
            description: string
            packages: Array<{
                hours: number
                rawPricePrivate: number
                rawPriceSemi: number
                popular?: boolean
            }>
        }>
    }>
}

// The incoming payload shape matches what PricingEditor sends
export async function POST(request: Request) {
    const supabase = await createAdminClient()

    // Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const payload = await request.json() as PricingPayload

        // 1. Delete all existing packages and perks to replace them cleanly
        // Wait, it's safer to just delete and insert to handle removed items.
        // Or we can just upsert. But since we might delete perks/packages, a clean wipe of packages/perks per program is easier.
        // Wait, if we wipe and recreate, we lose the IDs of packages, but they are just UUIDs not referenced elsewhere.

        for (const tab of payload.tabs) {
            // Update program basic info
            await supabase.from('pricing_programs').upsert({
                id: tab.id,
                label: tab.label,
                tier: tab.tier,
                sort_order: tab.sortOrder ?? 0,
            })

            // Wipe old packages and perks for this program
            await supabase.from('pricing_packages').delete().eq('program_id', tab.id)
            await supabase.from('pricing_perks').delete().eq('program_id', tab.id)

            // Insert new perks
            const perksToInsert = tab.features.map((perkText: string, idx: number) => ({
                program_id: tab.id,
                perk_text: perkText,
                sort_order: idx + 1,
            }))
            if (perksToInsert.length > 0) {
                await supabase.from('pricing_perks').insert(perksToInsert)
            }

            // Insert new packages
            let pkgSort = 1
            for (const section of tab.sections) {
                const pkgsToInsert = section.packages.map((pkg) => ({
                    program_id: tab.id,
                    section_name: section.name,
                    section_desc: section.description,
                    hours: pkg.hours,
                    price_private: pkg.rawPricePrivate,
                    price_semi: pkg.rawPriceSemi,
                    popular: pkg.popular || false,
                    sort_order: pkgSort++,
                }))
                if (pkgsToInsert.length > 0) {
                    await supabase.from('pricing_packages').insert(pkgsToInsert)
                }
            }
        }

        return NextResponse.json({ success: true })

    } catch (e: unknown) {
        console.error('Pricing Update Error:', e)
        const message = e instanceof Error ? e.message : 'Internal error'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
