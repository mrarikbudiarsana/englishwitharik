import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { QUIZ_TYPE_LABELS } from '@/lib/quiz/types'
import type { QuizType } from '@/lib/quiz/types'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const TYPE_BADGE_COLORS: Record<QuizType, string> = {
  grammar: 'bg-purple-100 text-purple-800',
  vocabulary: 'bg-amber-100 text-amber-800',
  reading: 'bg-blue-100 text-blue-800',
  listening: 'bg-green-100 text-green-800',
}

export default async function QuizzesAdminPage() {
  const supabase = await createAdminClient()

  const { data: quizzes, error } = await supabase
    .from('quizzes')
    .select('id, slug, title, description, type, is_published, cover_image_url, passage, audio_url, questions, created_at, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Error loading quizzes: {error.message}</div>
  }

  return (
    <div className="p-8 pb-32">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r md:text-black">
            Practice Quizzes
          </h1>
          <p className="text-gray-500 mt-1">Create and manage practice quizzes for grammar, vocabulary, reading, and listening.</p>
        </div>
        <Link
          href="/admin/quizzes/new"
          className="inline-flex items-center rounded-xl bg-[#08507f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#063a5c]"
        >
          Create Quiz
        </Link>
      </div>

      <div className="mb-12">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
          Quiz Management
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {((quizzes ?? []) as Array<{
            id: string
            slug: string
            title: string
            description: string | null
            type: string
            is_published: boolean
            cover_image_url: string | null
            passage: string | null
            audio_url: string | null
            questions: unknown
            created_at: string
            updated_at: string
          }>).map((quiz) => {
            const quizType = quiz.type as QuizType
            const questionsArray = Array.isArray(quiz.questions) ? quiz.questions : []
            const badgeColor = TYPE_BADGE_COLORS[quizType] ?? 'bg-slate-100 text-slate-800'

            return (
              <div
                key={quiz.id}
                className="bg-white p-6 border rounded-2xl shadow-sm border-orange-100"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${badgeColor}`}>
                    {QUIZ_TYPE_LABELS[quizType] ?? quiz.type}
                  </div>
                  <div className={`rounded-full px-3 py-1 text-xs font-semibold ${quiz.is_published ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'}`}>
                    {quiz.is_published ? 'Published' : 'Draft'}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 text-xl">{quiz.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{quiz.slug}</p>
                <div className="mt-3 flex items-center gap-3 text-sm text-slate-500">
                  <span>{questionsArray.length} question{questionsArray.length !== 1 ? 's' : ''}</span>
                </div>
                <p className="mt-4 text-sm text-slate-500">
                  Last updated: {format(new Date(quiz.updated_at), 'dd MMM yyyy, HH:mm')}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  <Link
                    href={`/admin/quizzes/${quiz.id}`}
                    className="inline-flex items-center rounded-md bg-[#08507f] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#063a5c]"
                  >
                    Edit Quiz
                  </Link>
                  <a
                    href={`/practice/${quiz.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Open Public Page
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
