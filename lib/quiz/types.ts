export type QuizType = 'grammar' | 'vocabulary' | 'reading' | 'listening'

export const QUIZ_TYPES: QuizType[] = ['grammar', 'vocabulary', 'reading', 'listening']

export const QUIZ_TYPE_LABELS: Record<QuizType, string> = {
  grammar: 'Grammar',
  vocabulary: 'Vocabulary',
  reading: 'Reading',
  listening: 'Listening',
}

export interface QuizQuestion {
  id: string
  text: string
  options: string[]
  correctAnswerIndex: number
  explanation?: string
}

export interface Quiz {
  id: string
  slug: string
  title: string
  description: string
  type: QuizType
  is_published: boolean
  cover_image_url: string | null
  passage: string | null
  audio_url: string | null
  questions: QuizQuestion[]
  created_at: string
  updated_at: string
}
