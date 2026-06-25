import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import QuizEditor from '@/components/admin/QuizEditor'

export default async function QuizEditorPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  if (id === 'new') {
    return (
      <div className="p-8 pb-24">
        <div className="mx-auto max-w-4xl">
          <Link href="/admin/quizzes" className="text-sm font-semibold text-[#08507f] hover:underline">
            &larr; Back to quizzes
          </Link>
          <div className="mt-6 mb-8">
            <h1 className="text-3xl font-bold text-slate-900">Create Quiz</h1>
            <p className="mt-2 text-sm text-slate-500">Create a new practice quiz, then add questions.</p>
          </div>

          <QuizEditor mode="create" />
        </div>
      </div>
    )
  }

  const supabase = await createAdminClient()
  const { data: quiz, error } = await supabase
    .from('practice_quizzes')
    .select('id, slug, title, description, type, is_published, cover_image_url, passage, audio_url, questions')
    .eq('id', id)
    .single()

  if (error || !quiz) notFound()

  return (
    <div className="p-8 pb-24">
      <div className="mx-auto max-w-4xl">
        <Link href="/admin/quizzes" className="text-sm font-semibold text-[#08507f] hover:underline">
          &larr; Back to quizzes
        </Link>
        <div className="mt-6 mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">{quiz.title}</h1>
            <p className="mt-2 text-sm text-slate-500">Edit quiz details and manage questions.</p>
          </div>
          <a
            href={`/practice/${quiz.slug}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Open public page
          </a>
        </div>

        <QuizEditor
          mode="edit"
          initialValue={{
            id: quiz.id,
            slug: quiz.slug,
            title: quiz.title,
            description: quiz.description ?? '',
            type: quiz.type,
            is_published: quiz.is_published,
            cover_image_url: quiz.cover_image_url ?? '',
            passage: quiz.passage ?? '',
            audio_url: quiz.audio_url ?? '',
            questions: quiz.questions as Array<{ id: string; text: string; options: string[]; correctAnswerIndex: number }>,
          }}
        />
      </div>
    </div>
  )
}
