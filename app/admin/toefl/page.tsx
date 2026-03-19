import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import ToeflAttemptsTable, { type ToeflAttemptItem } from '@/components/admin/ToeflAttemptsTable'

export default async function TOEFLAdminPage() {
  const supabase = await createAdminClient()

  const { data: attempts, error } = await supabase
    .from('toefl_attempts')
    .select(`
      id,
      section,
      started_at,
      completed_at,
      score,
      total,
      toefl_participants (
        name,
        email
      )
    `)
    .order('started_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Error loading TOEFL data: {error.message}</div>
  }

  // Fetch available templates
  const { data: templates } = await supabase
    .from('toefl_templates')
    .select('id, type, updated_at')
    .order('id', { ascending: true })

  return (
    <div className="p-8 pb-32">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r md:text-black">
            TOEFL ITP Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Manage tests and review student performance.</p>
        </div>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Test Management
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['listening', 'structure', 'reading'].map((sectionId) => {
            const template = templates?.find(t => t.id === sectionId)
            return (
              <a 
                key={sectionId}
                href={`/admin/toefl/templates/${sectionId}`}
                className="bg-white p-6 border rounded-2xl shadow-sm hover:shadow-md hover:border-orange-200 transition-all group border-orange-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-orange-50 rounded-lg text-orange-600 group-hover:bg-orange-100 transition-colors capitalize">
                    {sectionId}
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-all transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
                <h3 className="font-bold text-gray-900 mb-1 capitalize">{sectionId} Test</h3>
                <p className="text-sm text-gray-500">
                  {template ? `Last updated: ${format(new Date(template.updated_at), 'MM/dd/yy')}` : 'No template created yet'}
                </p>
              </a>
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
          section: string
          started_at: string
          completed_at: string | null
          score: number | null
          total: number | null
          toefl_participants: { name: string | null; email: string | null } | Array<{ name: string | null; email: string | null }> | null
        }>).map((attempt): ToeflAttemptItem => {
          const participant = Array.isArray(attempt.toefl_participants)
            ? attempt.toefl_participants[0]
            : attempt.toefl_participants

          return {
            id: attempt.id,
            studentName: participant?.name ?? 'Unknown student',
            email: participant?.email ?? '-',
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
