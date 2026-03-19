import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import ToeflAttemptsTable, { type ToeflAttemptItem } from '@/components/admin/ToeflAttemptsTable'
import CopyToClipboardButton from '@/components/admin/CopyToClipboardButton'

export default async function TOEFLAdminPage() {
  const supabase = await createAdminClient()

  const [
    attemptsResponse,
    testSetsResponse,
  ] = await Promise.all([
    supabase
      .from('toefl_attempts')
      .select(`
        id,
        test_set_id,
        section,
        started_at,
        completed_at,
        score,
        total,
        toefl_participants (
          name,
          email,
          user_id
        ),
        toefl_test_sets (
          title,
          slug
        )
      `)
      .order('started_at', { ascending: false }),
    supabase
      .from('toefl_test_sets')
      .select(`
        id,
        slug,
        title,
        is_published,
        updated_at,
        toefl_test_set_sections (
          id,
          section,
          is_enabled
        )
      `)
      .order('updated_at', { ascending: false }),
  ])

  let attempts: unknown[] | null = attemptsResponse.data as unknown[] | null
  let attemptsError = attemptsResponse.error

  if (attemptsError?.message?.includes('toefl_participants.user_id does not exist')) {
    const fallback = await supabase
      .from('toefl_attempts')
      .select(`
        id,
        test_set_id,
        section,
        started_at,
        completed_at,
        score,
        total,
        toefl_participants (
          name,
          email
        ),
        toefl_test_sets (
          title,
          slug
        )
      `)
      .order('started_at', { ascending: false })

    attempts = fallback.data as unknown[] | null
    attemptsError = fallback.error
  }

  if (attemptsError) {
    return <div className="p-8 text-red-500">Error loading TOEFL data: {attemptsError.message}</div>
  }

  if (testSetsResponse.error) {
    return <div className="p-8 text-red-500">Error loading TOEFL test sets: {testSetsResponse.error.message}</div>
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
    ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http')
      ? process.env.NEXT_PUBLIC_SITE_URL
      : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
    : 'https://englishwitharik.com'

  return (
    <div className="p-8 pb-32">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r md:text-black">
            TOEFL ITP Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Manage shareable test sets and review student performance.</p>
        </div>
        <Link
          href="/admin/toefl/test-sets/new"
          className="inline-flex items-center rounded-xl bg-[#08507f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#063a5c]"
        >
          Create Test Set
        </Link>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Test Management
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {((testSetsResponse.data ?? []) as Array<{
            id: string
            slug: string
            title: string
            is_published: boolean
            updated_at: string
            toefl_test_set_sections: Array<{ id: string; section: string; is_enabled: boolean }> | null
          }>).map((testSet) => {
            const enabledSectionCount = (testSet.toefl_test_set_sections ?? []).filter((section) => section.is_enabled).length
            const publicPath = `/toefl-itp-test/sets/${testSet.slug}`

            return (
              <div
                key={testSet.id}
                className="bg-white p-6 border rounded-2xl shadow-sm border-orange-100"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${testSet.is_published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                    {testSet.is_published ? 'Published' : 'Draft'}
                  </div>
                  <span className="text-xs text-slate-500">{enabledSectionCount} sections enabled</span>
                </div>
                <h3 className="font-bold text-gray-900 text-xl">{testSet.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{testSet.slug}</p>
                <p className="mt-4 text-sm text-slate-500">
                  Last updated: {format(new Date(testSet.updated_at), 'dd MMM yyyy, HH:mm')}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/toefl/test-sets/${testSet.id}`}
                    className="inline-flex items-center rounded-md bg-[#08507f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#063a5c]"
                  >
                    Manage Set
                  </Link>
                  <a
                    href={publicPath}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Open Public Page
                  </a>
                  <CopyToClipboardButton value={`${baseUrl}${publicPath}`} label="Copy share link" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
          Student Performance
        </h2>
      </div>

      <ToeflAttemptsTable
        attempts={((attempts ?? []) as Array<{
          id: string
          test_set_id: string
          section: string
          started_at: string
          completed_at: string | null
          score: number | null
          total: number | null
          toefl_participants:
            | { name: string | null; email: string | null; user_id?: string | null }
            | Array<{ name: string | null; email: string | null; user_id?: string | null }>
            | null
          toefl_test_sets:
            | { title: string | null; slug: string | null }
            | Array<{ title: string | null; slug: string | null }>
            | null
        }>).map((attempt): ToeflAttemptItem => {
          const participant = Array.isArray(attempt.toefl_participants)
            ? attempt.toefl_participants[0]
            : attempt.toefl_participants
          const testSet = Array.isArray(attempt.toefl_test_sets)
            ? attempt.toefl_test_sets[0]
            : attempt.toefl_test_sets

          return {
            id: attempt.id,
            studentName: participant?.name ?? 'Unknown student',
            email: participant?.email ?? '-',
            userId: participant?.user_id ?? '-',
            testSetId: attempt.test_set_id,
            testSetTitle: testSet?.title ?? 'Unknown set',
            testSetSlug: testSet?.slug ?? '-',
            section: attempt.section,
            score: attempt.score,
            total: attempt.total,
            status: attempt.completed_at ? 'Completed' : 'In Progress',
            startedAtLabel: format(new Date(attempt.started_at), 'MMM d, yyyy h:mm a'),
            startedAtRaw: attempt.started_at,
            completedAtRaw: attempt.completed_at,
          }
        })}
      />
    </div>
  )
}
