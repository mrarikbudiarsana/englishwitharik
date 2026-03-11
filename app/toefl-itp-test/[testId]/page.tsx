import { createAdminClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TestInterface from './TestInterface'

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
          <a href="/toefl-itp-test" className="text-blue-600 hover:text-blue-800 font-medium">&larr; Go back to sections</a>
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
        <p className="text-gray-600">The test template for "{attempt.section}" could not be loaded from the database.</p>
        <p className="text-sm text-gray-400 mt-4">Please contact the administrator or check the Supabase "toefl_templates" table.</p>
      </div>
    )
  }

  const sectionContent = {
    type: attempt.section,
    test: templateRecord.test_data
  } as any // Cast for now to match the expected interface

  // 3. Render the interactive test UI (Client Component)
  return (
    <TestInterface 
      attempt={attempt}
      template={sectionContent} 
    />
  )
}
