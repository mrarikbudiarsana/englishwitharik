import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'

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

      <div className="bg-white/80 backdrop-blur-sm border rounded-2xl shadow-sm overflow-hidden border-orange-100">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-orange-100">
            <thead className="bg-orange-50/50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Student</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Section</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Score</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-orange-800 uppercase tracking-wider">Started</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-orange-50">
              {attempts?.map((attempt) => (
                <tr key={attempt.id} className="hover:bg-orange-50/30 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="font-medium text-gray-900 group-hover:text-orange-900 transition-colors">
                       {/* @ts-ignore - Supabase nested joins typing isn't perfect here */}
                      {attempt.toefl_participants?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {/* @ts-ignore */}
                    {attempt.toefl_participants?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                      {attempt.section}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                    {attempt.score !== null ? `${attempt.score} / ${attempt.total}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {attempt.completed_at ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Completed
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        In Progress
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(attempt.started_at), 'MMM d, yyyy h:mm a')}
                  </td>
                </tr>
              ))}
              
              {(!attempts || attempts.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No test attempts recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
