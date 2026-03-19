import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import { TOEFL_SECTION_LABELS, isTOEFLSection } from '@/lib/toefl/catalog'
import type { TOEFLTestSection } from '@/lib/toefl/types'
import { ArrowLeft, Clock, Layers, List, Headphones, PenTool, BookOpen, ArrowRight } from 'lucide-react'

export default async function TOEFLTestSetPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createAdminClient()

  const { data: testSet, error } = await supabase
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
        title,
        description,
        sort_order,
        is_enabled,
        test_data
      )
    `)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !testSet) notFound()

  const sections = ((testSet.toefl_test_set_sections ?? []) as Array<{
    id: string
    section: string
    title: string
    description: string
    sort_order: number
    is_enabled: boolean
    test_data: { durationMinutes?: number } | null
  }>)
    .filter((section): section is {
      id: string
      section: TOEFLTestSection
      title: string
      description: string
      sort_order: number
      is_enabled: boolean
      test_data: { durationMinutes?: number } | null
    } => section.is_enabled && isTOEFLSection(section.section))
    .sort((a, b) => a.sort_order - b.sort_order)

  const totalMinutes = sections.reduce((sum, section) => {
    return sum + (typeof section.test_data?.durationMinutes === 'number' ? section.test_data.durationMinutes : 0)
  }, 0)

  const getSectionIcon = (section: string) => {
    switch (section) {
      case 'listening': return <Headphones className="h-6 w-6 text-[#0eb5d6]" />
      case 'structure': return <PenTool className="h-6 w-6 text-[#8a2be2]" />
      case 'reading': return <BookOpen className="h-6 w-6 text-[#f59e0b]" />
      default: return <Layers className="h-6 w-6 text-slate-500" />
    }
  }

  const getSectionGradient = (section: string) => {
    switch (section) {
      case 'listening': return 'group-hover:border-[#0eb5d6]/40 group-hover:shadow-[0_12px_40px_rgba(14,181,214,0.12)]'
      case 'structure': return 'group-hover:border-[#8a2be2]/40 group-hover:shadow-[0_12px_40px_rgba(138,43,226,0.12)]'
      case 'reading': return 'group-hover:border-[#f59e0b]/40 group-hover:shadow-[0_12px_40px_rgba(245,158,11,0.12)]'
      default: return 'group-hover:border-[#08507f]/40 group-hover:shadow-[0_12px_40px_rgba(8,80,127,0.12)]'
    }
  }

  return (
    <div className="relative min-h-[100dvh] overflow-y-auto bg-[#fafcff] text-slate-900 selection:bg-[#08507f]/20 pb-16">
      {/* Animated Background Mesh */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden fixed">
        <div className="absolute -left-[10%] -top-[10%] h-[70vw] w-[70vw] rounded-full bg-gradient-to-br from-[#08507f]/[0.08] to-[#0eb5d6]/[0.08] blur-[100px] sm:blur-[140px]" />
        <div className="absolute -right-[10%] top-[20%] h-[60vw] w-[60vw] rounded-full bg-gradient-to-tl from-[#8a2be2]/[0.05] to-[#0eb5d6]/[0.08] blur-[100px] sm:blur-[140px]" />
        <div className="absolute bottom-[-10%] left-[20%] h-[50vw] w-[50vw] rounded-full bg-gradient-to-tr from-[#08507f]/[0.06] to-transparent blur-[120px]" />
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.015] mix-blend-overlay" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-full w-full max-w-6xl flex-col px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        {/* Back Link */}
        <Link
          href="/toefl-itp-test"
          className="group inline-flex w-fit items-center gap-2 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-semibold text-slate-600 backdrop-blur-md transition-all hover:bg-white hover:text-[#08507f] hover:shadow-sm"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span>Back to test catalog</span>
        </Link>

        <div className="mt-8 flex flex-1 flex-col gap-8 lg:min-h-0 lg:gap-10">
          {/* Main Hero Card (Glassmorphism) */}
          <section className="relative grid gap-6 rounded-[2rem] border border-white/80 bg-white/60 p-5 shadow-[0_8px_40px_rgba(8,80,127,0.06)] backdrop-blur-3xl sm:p-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(340px,0.8fr)] lg:items-stretch lg:gap-8 lg:rounded-[2.5rem] lg:p-8 overflow-hidden">
            {/* Inner subtle glow */}
            <div className="pointer-events-none absolute inset-0 rounded-[2.5rem] ring-1 ring-inset ring-white/90" />
            
            {testSet.cover_image_url ? (
               <div className="relative aspect-[16/10] overflow-hidden rounded-[1.5rem] bg-slate-100 lg:h-full lg:min-h-[300px] lg:aspect-auto xl:min-h-[360px] shadow-inner">
                <Image
                  src={testSet.cover_image_url}
                  alt={testSet.title}
                  fill
                  className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
                  sizes="(min-width: 1280px) 640px, (min-width: 1024px) 55vw, 100vw"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#081f36]/40 via-transparent to-white/10" />
              </div>
            ) : (
              <div className="relative flex aspect-[16/10] items-end overflow-hidden rounded-[1.5rem] bg-gradient-to-br from-[#08507f] via-[#0b6399] to-[#0eb5d6] p-6 text-white shadow-inner lg:h-full lg:min-h-[300px] lg:aspect-auto xl:min-h-[360px]">
                <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay"></div>
                <div className="absolute -left-10 -top-10 h-64 w-64 rounded-full bg-white/10 blur-3xl"></div>
                <div className="absolute right-0 bottom-0 h-40 w-40 rounded-full bg-[#0eb5d6]/30 blur-2xl"></div>
                <div className="relative z-10 w-full rounded-2xl bg-[#081f36]/20 p-5 backdrop-blur-sm border border-white/10">
                  <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-100">TOEFL ITP</p>
                  <p className="mt-2 text-3xl font-bold leading-tight sm:text-4xl text-white drop-shadow-md">
                    Practice set ready to start
                  </p>
                </div>
              </div>
            )}

            <div className="flex min-h-0 flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="flex items-center gap-1.5 rounded-full bg-[#08507f]/10 border border-[#08507f]/5 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.15em] text-[#08507f]">
                    <div className="h-1.5 w-1.5 rounded-full bg-[#08507f]"></div>
                    {testSet.slug}
                  </span>
                  <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-100 px-3.5 py-1.5 text-xs font-bold text-emerald-700">
                    <Layers className="h-3.5 w-3.5" />
                    {sections.length} sections
                  </span>
                </div>

                <h1 className="mt-5 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-[clamp(2.5rem,3vw,3.5rem)] leading-[1.1]">
                  {testSet.title}
                </h1>

                <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-600 sm:text-lg">
                  {testSet.description || 'Select a section below to start practicing and prepare for your TOEFL test.'}
                </p>
              </div>

              {/* Stats Grid */}
              <div className="mt-8 grid gap-4 grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
                <div className="relative flex flex-col rounded-2xl border border-white/80 bg-white/50 p-4 shadow-sm backdrop-blur-md overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 w-1 bg-[#08507f]/20 rounded-l-2xl group-hover:bg-[#08507f]/50 transition-colors" />
                  <div className="flex items-center gap-2 pl-2">
                    <Layers className="h-4 w-4 text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Sections</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-slate-900 pl-2">{sections.length}</p>
                </div>
                <div className="relative flex flex-col rounded-2xl border border-white/80 bg-white/50 p-4 shadow-sm backdrop-blur-md overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 w-1 bg-emerald-500/20 rounded-l-2xl group-hover:bg-emerald-500/50 transition-colors" />
                  <div className="flex items-center gap-2 pl-2">
                    <Clock className="h-4 w-4 text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Duration</p>
                  </div>
                  <p className="mt-2 text-3xl font-bold text-slate-900 pl-2">{totalMinutes || '--'} <span className="text-lg font-bold text-slate-500">min</span></p>
                </div>
                <div className="relative col-span-2 flex flex-col rounded-2xl border border-white/80 bg-white/50 p-4 shadow-sm backdrop-blur-md xl:col-span-1 overflow-hidden group">
                  <div className="absolute inset-y-0 left-0 w-1 bg-purple-500/20 rounded-l-2xl group-hover:bg-purple-500/50 transition-colors" />
                  <div className="flex items-center gap-2 pl-2">
                    <List className="h-4 w-4 text-slate-400" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">Format</p>
                  </div>
                  <p className="mt-2 text-lg font-bold leading-tight text-slate-900 pl-2">
                    Multiple Choice
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section Selection Cards */}
          <section className="grid gap-4 sm:grid-cols-2 lg:flex-1 lg:grid-cols-3 lg:gap-6">
            {sections.map((section, index) => (
              <Link
                key={section.id}
                href={`/toefl-itp-test/sets/${testSet.slug}/${section.section}`}
                className={`group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/80 bg-white/70 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-2 hover:bg-white sm:p-8 ${getSectionGradient(section.section)}`}
              >
                {/* Subtle gradient top border line on hover */}
                <div className="absolute inset-x-0 top-0 h-1.5 w-full scale-x-0 bg-gradient-to-r from-transparent via-current to-transparent opacity-0 transition-all duration-500 group-hover:scale-x-100 group-hover:opacity-100 text-slate-400" style={{ backgroundImage: section.section === 'listening' ? 'linear-gradient(to right, transparent, #0eb5d6, transparent)' : section.section === 'structure' ? 'linear-gradient(to right, transparent, #8a2be2, transparent)' : section.section === 'reading' ? 'linear-gradient(to right, transparent, #f59e0b, transparent)' : '' }} />

                <div>
                  <div className="flex items-start gap-5">
                    <div className="mt-1 rounded-[1.25rem] bg-white p-3.5 shadow-sm ring-1 ring-slate-100 group-hover:shadow-md transition-shadow">
                      {getSectionIcon(section.section)}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                        Part {index + 1}
                      </p>
                      <h2 className="mt-1.5 text-2xl font-bold leading-tight text-slate-900 transition-colors group-hover:text-[#08507f]">
                        {section.title || `${TOEFL_SECTION_LABELS[section.section]} Test`}
                      </h2>
                    </div>
                  </div>
                  
                  <p className="mt-5 text-sm leading-relaxed text-slate-600">
                    {section.description || `Prepare for the ${TOEFL_SECTION_LABELS[section.section].toLowerCase()} section in this comprehensive practice set.`}
                  </p>
                </div>

                <div className="mt-8 flex items-center justify-between border-t border-slate-200/60 pt-6">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-slate-500">
                    <Clock className="h-4 w-4 text-slate-400" />
                    {typeof section.test_data?.durationMinutes === 'number'
                      ? `${section.test_data.durationMinutes} mins`
                      : 'Practice'}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-600 transition-colors group-hover:text-[#08507f]">
                      {testSet.cta_label || 'Start Test'}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 ring-1 ring-slate-200 transition-all duration-300 group-hover:bg-[#08507f] group-hover:text-white group-hover:ring-transparent group-hover:shadow-[0_4px_12px_rgba(8,80,127,0.3)]">
                      <ArrowRight className="h-4.5 w-4.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </div>
    </div>
  )
}
