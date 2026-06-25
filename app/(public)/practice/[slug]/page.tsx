import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/server'
import QuizPlayer from '@/components/public/quiz/QuizPlayer'
import type { Quiz } from '@/lib/quiz/types'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const supabase = await createAdminClient()
  const { data } = await supabase
    .from('quizzes')
    .select('title, description')
    .eq('slug', slug)
    .single()

  if (!data) return { title: 'Quiz Not Found' }

  return {
    title: `${data.title} — English Practice Quiz`,
    description: data.description || 'Test your English skills with this practice quiz.',
    alternates: {
      canonical: `https://englishwitharik.com/practice/${slug}`,
    },
  }
}

export default async function PracticeQuizPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createAdminClient()

  const { data: quiz, error } = await supabase
    .from('quizzes')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !quiz) {
    notFound()
  }

  // Cast the Supabase data to our Quiz type
  const quizData = quiz as unknown as Quiz

  return (
    <div className="min-h-screen bg-gray-50 py-8 sm:py-12 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <QuizPlayer quiz={quizData} />
      </div>
    </div>
  )
}
