import Image from 'next/image'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { TOEFL_SECTION_LABELS, isTOEFLSection } from '@/lib/toefl/catalog'
import type { TOEFLTestSection } from '@/lib/toefl/types'

interface ToeflTestCtaCardProps {
  slug: string
  title?: string
  description?: string
  variant?: 'default' | 'compact'
}

export default async function ToeflTestCtaCard({
  slug,
  title,
  description,
  variant = 'default',
}: ToeflTestCtaCardProps) {
  const supabase = await createAdminClient()
  const { data: testSet } = await supabase
    .from('toefl_test_sets')
    .select(`
      slug,
      title,
      description,
      cta_label,
      cover_image_url,
      toefl_test_set_sections (
        id,
        section,
        is_enabled,
        sort_order
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!testSet) return null

  const sections = ((testSet.toefl_test_set_sections ?? []) as Array<{
    id: string
    section: string
    is_enabled: boolean
    sort_order: number
  }>)
    .filter((section): section is {
      id: string
      section: TOEFLTestSection
      is_enabled: boolean
      sort_order: number
    } => section.is_enabled && isTOEFLSection(section.section))
    .sort((a, b) => a.sort_order - b.sort_order)

  return (
    <section className={`not-prose my-8 overflow-hidden rounded-3xl border border-[#08507f]/20 bg-gradient-to-br from-[#08507f]/10 via-white to-orange-50 ${variant === 'compact' ? 'p-5 sm:p-6' : 'p-6 sm:p-8'}`}>
      {testSet.cover_image_url ? (
        <div className="relative mb-6 aspect-[16/7] w-full overflow-hidden rounded-2xl bg-white/60">
          <Image
            src={testSet.cover_image_url}
            alt={title ?? testSet.title}
            fill
            className="object-cover"
            sizes="(min-width: 640px) 768px, 100vw"
          />
        </div>
      ) : null}
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#08507f]">TOEFL Practice Set</p>
      <h3 className={`mt-3 font-bold text-slate-900 ${variant === 'compact' ? 'text-2xl' : 'text-3xl'}`}>
        {title ?? testSet.title}
      </h3>
      <p className="mt-3 max-w-2xl text-slate-600 leading-7">
        {description ?? testSet.description ?? 'Open this TOEFL ITP test set and start with the section you want to practice first.'}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        {sections.map((section) => (
          <span key={section.id} className="rounded-full bg-white/80 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">
            {TOEFL_SECTION_LABELS[section.section]}
          </span>
        ))}
      </div>
      <div className="mt-6">
        <Link
          href={`/toefl-itp-test/sets/${testSet.slug}`}
          className="inline-flex items-center rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#063a5c]"
        >
          {testSet.cta_label}
        </Link>
      </div>
    </section>
  )
}
