import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TestInterface from './TestInterface'
import { TOEFLReadingTest, TOEFLStructureTest, TOEFLTestTemplate, TOEFLListeningTest } from '@/lib/toefl/types'

function normalizeTemplateData(
  section: string,
  rawTestData: unknown,
): TOEFLListeningTest | TOEFLStructureTest | TOEFLReadingTest | null {
  if (!rawTestData || typeof rawTestData !== 'object') {
    return null
  }

  const candidate = rawTestData as Record<string, unknown>

  if ('title' in candidate) {
    return rawTestData as unknown as TOEFLListeningTest | TOEFLStructureTest | TOEFLReadingTest
  }

  if (
    candidate.type === section &&
    'test' in candidate &&
    candidate.test &&
    typeof candidate.test === 'object'
  ) {
    return candidate.test as unknown as TOEFLListeningTest | TOEFLStructureTest | TOEFLReadingTest
  }

  return null
}

export default async function TOEFLTestPage({
  params,
}: {
  params: Promise<{ testId: string }>
}) {
  const resolvedParams = await params
  const { testId } = resolvedParams

  const supabase = await createAdminClient()

  // 1. Fetch the attempt to see which section they are taking
  const { data: attempt, error } = await supabase
    .from('toefl_attempts')
    .select(`*, toefl_participants(name)`)
    .eq('id', testId)
    .single()

  if (error || !attempt) {
    console.error('Error fetching attempt:', error)
    redirect('/toefl-itp-test')
  }

  if (attempt.completed_at) {
    // If they already finished, show results instead or redirect
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="bg-white p-10 rounded-xl shadow-md max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Completed!</h1>
          <p className="text-gray-600 mb-8">You have already submitted this test section.</p>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
            <span className="block text-sm text-blue-600 font-semibold mb-1">Your Score</span>
            <span className="text-5xl font-extrabold text-blue-900">{attempt.score} <span className="text-2xl text-blue-600">/ {attempt.total}</span></span>
          </div>
          <a
            href="https://wa.me/6282144223581?text=Halo%2C%20saya%20sudah%20selesai%20TOEFL%20ITP%20section%20dan%20ingin%20daftar%20kelas%20TOEFL%20ITP."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center mb-5 px-6 py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 transition"
          >
            Daftar kelas TOEFL ITP sekarang.
          </a>
          <div>
            <Link href="/toefl-itp-test" className="text-blue-600 hover:text-blue-800 font-medium">&larr; Go back to sections</Link>
          </div>
        </div>
      </div>
    )
  }

  // 2. Load the corresponding dynamic template from DB
  const { data: templateRecord, error: templateError } = await supabase
    .from('toefl_templates')
    .select('test_data')
    .eq('id', attempt.section)
    .single()

  if (templateError || !templateRecord) {
    console.error('Error fetching template:', templateError)
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm border m-6">
        <h2 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h2>
        <p className="text-gray-600">The test template for &quot;{attempt.section}&quot; could not be loaded from the database.</p>
        <p className="text-sm text-gray-400 mt-4">Please contact the administrator or check the Supabase &quot;toefl_templates&quot; table.</p>
      </div>
    )
  }

  const normalizedTest = normalizeTemplateData(attempt.section, templateRecord.test_data)

  if (!normalizedTest) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm border m-6">
        <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Template Data</h2>
        <p className="text-gray-600">The stored template for &quot;{attempt.section}&quot; is not in a supported format.</p>
        <p className="text-sm text-gray-400 mt-4">Open the template editor and save only the inner test object, or let the app normalize a wrapped template.</p>
      </div>
    )
  }

  const sectionContent = {
    type: attempt.section,
    test: normalizedTest,
  } as TOEFLTestTemplate

  // 3. Render the interactive test UI (Client Component)
  return (
    <TestInterface 
      attempt={attempt}
      template={sectionContent} 
    />
  )
}
