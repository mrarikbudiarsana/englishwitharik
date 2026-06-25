import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/server'
import { QUIZ_TYPE_LABELS } from '@/lib/quiz/types'
import type { QuizType } from '@/lib/quiz/types'

export const metadata = {
  title: 'Practice Quizzes — Grammar, Vocabulary, Reading & Listening',
  description: 'Free English practice quizzes to test your grammar, vocabulary, reading comprehension, and listening skills. Get instant feedback on every question.',
  alternates: {
    canonical: 'https://englishwitharik.com/practice',
  },
}

interface QuizRow {
  id: string
  slug: string
  title: string
  description: string
  type: QuizType
  cover_image_url: string | null
  questions: unknown[]
  updated_at: string
}

const TYPE_COLORS: Record<QuizType, string> = {
  grammar: 'bg-purple-100 text-purple-800',
  vocabulary: 'bg-amber-100 text-amber-800',
  reading: 'bg-blue-100 text-blue-800',
  listening: 'bg-green-100 text-green-800',
}

const TYPE_ICONS: Record<QuizType, string> = {
  grammar: '✏️',
  vocabulary: '📖',
  reading: '📚',
  listening: '🎧',
}

export default async function PracticeQuizCatalogPage() {
  const supabase = await createAdminClient()
  const { data: quizzes, error } = await supabase
    .from('practice_quizzes')
    .select('id, slug, title, description, type, cover_image_url, questions, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    return <div className="p-8 text-red-500">Error loading quizzes: {error.message}</div>
  }

  const publishedQuizzes = (quizzes ?? []) as QuizRow[]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#08507f] to-[#063a5c] text-white py-16 sm:py-20 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-white/70 mb-3">Practice & Learn</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight">
            English Practice Quizzes
          </h1>
          <p className="mt-4 text-lg text-white/80 max-w-2xl leading-relaxed">
            Test your English skills with instant feedback on every question. 
            Choose a quiz below and start practicing — no sign-up required.
          </p>
        </div>
      </section>

      {/* Quiz grid */}
      <section className="py-12 sm:py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-6xl">
          {publishedQuizzes.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-6xl mb-4">📝</p>
              <h2 className="text-xl font-bold text-gray-800 mb-2">No quizzes available yet</h2>
              <p className="text-gray-500">Check back soon — new practice quizzes are on the way!</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {publishedQuizzes.map((quiz) => {
                const questionCount = Array.isArray(quiz.questions) ? quiz.questions.length : 0
                return (
                  <Link
                    key={quiz.id}
                    href={`/practice/${quiz.slug}`}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#08507f]/30"
                  >
                    {/* Type icon band */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-7 py-5 border-b border-gray-100 flex items-center justify-between">
                      <span className="text-3xl">{TYPE_ICONS[quiz.type]}</span>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${TYPE_COLORS[quiz.type]}`}>
                        {QUIZ_TYPE_LABELS[quiz.type]}
                      </span>
                    </div>

                    <div className="p-7">
                      <h2 className="text-xl font-bold text-gray-900 group-hover:text-[#08507f] transition-colors leading-snug">
                        {quiz.title}
                      </h2>
                      {quiz.description && (
                        <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-2">
                          {quiz.description}
                        </p>
                      )}

                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs font-medium text-gray-500">
                          {questionCount} {questionCount === 1 ? 'question' : 'questions'}
                        </span>
                        <span className="text-sm font-semibold text-[#08507f] group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                          Start Quiz →
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl text-center bg-white rounded-2xl border border-gray-200 shadow-sm p-10">
          <h2 className="text-2xl font-bold text-gray-900">Want structured English lessons?</h2>
          <p className="mt-3 text-gray-600 leading-relaxed">
            Our practice quizzes are just the start. Get personalised tutoring for IELTS, TOEFL, Business English, and more.
          </p>
          <a
            href="/pricing"
            className="mt-6 inline-block bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold px-8 py-3 rounded-xl transition-colors"
          >
            View Programmes & Pricing
          </a>
        </div>
      </section>
    </div>
  )
}
