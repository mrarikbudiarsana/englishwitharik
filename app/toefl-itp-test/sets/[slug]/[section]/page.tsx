import Link from 'next/link'
import { notFound } from 'next/navigation'
import StartTestForm from '@/components/toefl/StartTestForm'
import { createAdminClient } from '@/lib/supabase/server'
import { TOEFL_SECTION_LABELS, isTOEFLSection } from '@/lib/toefl/catalog'

export default async function TOEFLTestSectionStartPage({
  params,
}: {
  params: Promise<{ slug: string; section: string }>
}) {
  const { slug, section } = await params

  if (!isTOEFLSection(section)) {
    notFound()
  }

  const supabase = await createAdminClient()
  const { data: testSet, error } = await supabase
    .from('toefl_test_sets')
    .select(`
      id,
      slug,
      title,
      description,
      toefl_test_set_sections (
        id,
        section,
        title,
        description,
        is_enabled
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !testSet) notFound()

  const currentSection = ((testSet.toefl_test_set_sections ?? []) as Array<{
    id: string
    section: string
    title: string
    description: string
    is_enabled: boolean
  }>).find((entry) => entry.section === section && entry.is_enabled)

  if (!currentSection) notFound()

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-br from-[#08507f]/5 via-transparent to-orange-50" />
      <div className="relative z-10 w-full max-w-5xl">
        <div className="mb-6 text-center">
          <Link href={`/toefl-itp-test/sets/${slug}`} className="text-sm font-semibold text-[#08507f] hover:underline">
            &larr; Back to {testSet.title}
          </Link>
          <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[#08507f]">
            {testSet.title} • {TOEFL_SECTION_LABELS[section]}
          </p>
        </div>

        <div className="flex justify-center">
          <StartTestForm
            testSetSlug={slug}
            section={section}
            title={currentSection.title || `${testSet.title} ${TOEFL_SECTION_LABELS[section]}`}
            description={currentSection.description || `Enter your details to begin ${TOEFL_SECTION_LABELS[section].toLowerCase()} for this TOEFL ITP set.`}
          />
        </div>
      </div>
    </div>
  )
}
