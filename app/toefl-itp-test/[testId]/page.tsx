import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import TestInterface from './TestInterface'
import { isTOEFLSection, toTemplate, TOEFL_SECTION_LABELS } from '@/lib/toefl/catalog'
import type { TOEFLTestSection } from '@/lib/toefl/types'

export default async function TOEFLTestPage({
  params,
}: {
  params: Promise<{ testId: string }>
}) {
  const resolvedParams = await params
  const { testId } = resolvedParams

  const supabase = await createAdminClient()

  const { data: attempt, error } = await supabase
    .from('toefl_attempts')
    .select(`
      *,
      toefl_participants(name),
      toefl_test_sets(title, slug)
    `)
    .eq('id', testId)
    .single()

  if (error || !attempt || !isTOEFLSection(attempt.section)) {
    console.error('Error fetching attempt:', error)
    redirect('/toefl-itp-test')
  }

  const section = attempt.section as TOEFLTestSection

  if (attempt.completed_at) {
    const testSet = Array.isArray(attempt.toefl_test_sets) ? attempt.toefl_test_sets[0] : attempt.toefl_test_sets
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="bg-white p-10 rounded-xl shadow-md max-w-lg w-full text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Test Completed!</h1>
          <p className="text-gray-600 mb-3">
            You have already submitted {TOEFL_SECTION_LABELS[section]} for {testSet?.title ?? 'this test set'}.
          </p>
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
            <Link
              href={testSet?.slug ? `/toefl-itp-test/sets/${testSet.slug}` : '/toefl-itp-test'}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              &larr; Go back to test set
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const { data: templateRecord, error: templateError } = await supabase
    .from('toefl_test_set_sections')
    .select('test_data, title, description')
    .eq('test_set_id', attempt.test_set_id)
    .eq('section', section)
    .eq('is_enabled', true)
    .single()

  if (templateError || !templateRecord) {
    console.error('Error fetching template:', templateError)
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm border m-6">
        <h2 className="text-xl font-bold text-red-600 mb-2">Configuration Error</h2>
        <p className="text-gray-600">The test template for &quot;{section}&quot; could not be loaded from the database.</p>
        <p className="text-sm text-gray-400 mt-4">Please contact the administrator or check the TOEFL test set section records.</p>
      </div>
    )
  }

  const sectionContent = toTemplate(section, templateRecord.test_data)

  if (!sectionContent) {
    return (
      <div className="p-8 text-center bg-white rounded-lg shadow-sm border m-6">
        <h2 className="text-xl font-bold text-red-600 mb-2">Invalid Template Data</h2>
        <p className="text-gray-600">The stored template for &quot;{section}&quot; is not in a supported format.</p>
        <p className="text-sm text-gray-400 mt-4">Open the section editor and save only the inner test object, or let the app normalize a wrapped template.</p>
      </div>
    )
  }

  return (
    <TestInterface
      attempt={attempt}
      template={sectionContent}
      testSetTitle={(Array.isArray(attempt.toefl_test_sets) ? attempt.toefl_test_sets[0] : attempt.toefl_test_sets)?.title ?? 'TOEFL ITP'}
    />
  )
}
