import Image from 'next/image'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { TOEFL_SECTION_LABELS } from '@/lib/toefl/catalog'

interface TestSetRow {
  id: string
  slug: string
  title: string
  description: string
  cta_label: string
  cover_image_url: string | null
  toefl_test_set_sections: Array<{
    id: string
    section: 'listening' | 'structure' | 'reading'
    is_enabled: boolean
    sort_order: number
  }> | null
}

export default async function TOEFLITPLandingPage() {
  const supabase = await createAdminClient()
  const { data: testSets, error } = await supabase
    .from('toefl_test_sets')
    .select(`
      id,
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
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Error loading TOEFL test catalog: {error.message}</div>
  }

  const publishedSets = ((testSets ?? []) as TestSetRow[]).map((set) => ({
    ...set,
    sections: (set.toefl_test_set_sections ?? [])
      .filter((section) => section.is_enabled)
      .sort((a, b) => a.sort_order - b.sort_order),
  }))

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#08507f]">TOEFL ITP Practice</p>
          <h1 className="mt-3 text-4xl font-extrabold text-gray-900">Choose a TOEFL ITP test set</h1>
          <p className="mt-3 text-base text-gray-600">
            Use one shareable URL per set, or send students straight to a specific section.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {publishedSets.map((testSet) => (
            <Link
              key={testSet.id}
              href={`/toefl-itp-test/sets/${testSet.slug}`}
              className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              {testSet.cover_image_url ? (
                <div className="relative aspect-[16/9] w-full bg-slate-100">
                  <Image
                    src={testSet.cover_image_url}
                    alt={testSet.title}
                    fill
                    className="object-cover"
                    sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
                  />
                </div>
              ) : null}

              <div className="p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#08507f]">{testSet.slug}</p>
                    <h2 className="mt-2 text-2xl font-bold text-slate-900">{testSet.title}</h2>
                  </div>
                  <span className="rounded-full bg-[#08507f]/10 px-3 py-1 text-xs font-semibold text-[#08507f]">
                    {testSet.sections.length} sections
                  </span>
                </div>
                <p className="mt-4 text-sm leading-6 text-slate-600">
                  {testSet.description || 'Shareable TOEFL ITP practice set.'}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {testSet.sections.map((section) => (
                    <span
                      key={section.id}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                    >
                      {TOEFL_SECTION_LABELS[section.section]}
                    </span>
                  ))}
                </div>
                <p className="mt-6 text-sm font-semibold text-[#08507f]">{testSet.cta_label} →</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
