import Link from 'next/link'
import { notFound } from 'next/navigation'
import { format } from 'date-fns'
import ToeflTestSetEditor from '@/components/admin/ToeflTestSetEditor'
import CopyToClipboardButton from '@/components/admin/CopyToClipboardButton'
import { createAdminClient } from '@/lib/supabase/server'
import { TOEFL_SECTION_LABELS, TOEFL_SECTIONS } from '@/lib/toefl/catalog'

export default async function ToeflTestSetAdminPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createAdminClient()

  const { data: testSet, error } = await supabase
    .from('toefl_test_sets')
    .select(`
      *,
      toefl_test_set_sections (
        id,
        section,
        title,
        description,
        sort_order,
        is_enabled,
        updated_at
      )
    `)
    .eq('id', id)
    .single()

  if (error || !testSet) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
    : 'https://englishwitharik.com'

  const sectionMap = new Map(
    ((testSet.toefl_test_set_sections ?? []) as Array<{
      id: string
      section: string
      title: string
      description: string
      sort_order: number
      is_enabled: boolean
      updated_at: string
    }>).map((entry) => [entry.section, entry])
  )

  return (
    <div className="p-8 pb-24">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin/toefl" className="text-sm font-semibold text-[#08507f] hover:underline">
          &larr; Back to TOEFL dashboard
        </Link>

        <div className="mt-6 mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{testSet.title}</h1>
            <p className="mt-2 text-sm text-slate-500">Manage metadata, publish state, and per-section content for this test set.</p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href={`/toefl-itp-test/sets/${testSet.slug}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Open public page
            </a>
            <CopyToClipboardButton value={`${baseUrl}/toefl-itp-test/sets/${testSet.slug}`} label="Copy set link" />
          </div>
        </div>

        <ToeflTestSetEditor
          mode="edit"
          initialValue={{
            id: testSet.id,
            slug: testSet.slug,
            title: testSet.title,
            description: testSet.description,
            cta_label: testSet.cta_label,
            is_published: testSet.is_published,
            cover_image_url: testSet.cover_image_url,
          }}
        />

        <div className="mt-10 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Sections</h2>
              <p className="mt-1 text-sm text-slate-500">Each section has its own public share link and JSON template.</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {TOEFL_SECTIONS.map((section) => {
              const existing = sectionMap.get(section)
              const publicPath = `/toefl-itp-test/sets/${testSet.slug}/${section}`

              return (
                <div key={section} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#08507f]">
                        {TOEFL_SECTION_LABELS[section]}
                      </p>
                      <h3 className="mt-2 text-lg font-bold text-slate-900">
                        {existing?.title || `${TOEFL_SECTION_LABELS[section]} Test`}
                      </h3>
                    </div>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${existing?.is_enabled ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                      {existing?.is_enabled ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    {existing?.description || 'Configure this section for the current test set.'}
                  </p>
                  <p className="mt-4 text-xs text-slate-500">
                    {existing?.updated_at ? `Updated ${format(new Date(existing.updated_at), 'dd MMM yyyy, HH:mm')}` : 'Not created yet'}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    <Link
                      href={`/admin/toefl/test-sets/${testSet.id}/sections/${section}/edit`}
                      className="inline-flex items-center rounded-md bg-[#08507f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#063a5c]"
                    >
                      Edit section
                    </Link>
                    <a
                      href={publicPath}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      Open page
                    </a>
                    <CopyToClipboardButton value={`${baseUrl}${publicPath}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
