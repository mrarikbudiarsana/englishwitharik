"use client"

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { TOEFLReadingTest } from '@/lib/toefl/types'

export default function ReadingInterface({
  test,
  answers,
  onAnswerSelect
}: {
  test: TOEFLReadingTest
  answers: Record<string, string | number>
  onAnswerSelect: (questionId: string, answerIndex: number) => void
}) {
  type ReadingSlide =
    | { type: 'instruction'; partName: 'Reading Comprehension'; instructions: string }
    | {
      type: 'question'
      passage: TOEFLReadingTest['passages'][number]
      question: TOEFLReadingTest['passages'][number]['questions'][number]
      passageIndex: number
    }

  const slides: ReadingSlide[] = []
  const allQuestionsData: { id: string, slideIndex: number, number: number, passageIndex: number }[] = []
  let questionCounter = 1

  // Push main section instruction
  slides.push({
    type: 'instruction',
    partName: 'Reading Comprehension',
    instructions: test.instructions
  })

  test.passages.forEach((p, pIdx) => {
    p.questions.forEach((q) => {
      const slideIdx = slides.length
      slides.push({
        type: 'question',
        passage: p,
        question: q,
        passageIndex: pIdx
      })
      allQuestionsData.push({ id: q.id, slideIndex: slideIdx, number: questionCounter++, passageIndex: pIdx })
    })
  })

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [flaggedSlides, setFlaggedSlides] = useState<Record<number, boolean>>({})
  const currentSlide = slides[currentSlideIndex]
  const canMarkCurrentSlide = currentSlide?.type === 'question'

  const handleAnswerSelection = (questionId: string, answerIndex: number) => {
    onAnswerSelect(questionId, answerIndex)
  }

  const toggleFlagForCurrentSlide = () => {
    if (!canMarkCurrentSlide) return

    setFlaggedSlides(prev => ({
      ...prev,
      [currentSlideIndex]: !prev[currentSlideIndex]
    }))
  }

  const answeredCount = allQuestionsData.filter((q) => answers[q.id] !== undefined).length
  const currentQuestionNumber = allQuestionsData.find(q => q.slideIndex === currentSlideIndex)?.number

  return (
    <div className="h-full w-full">
      <div className="h-full bg-white overflow-hidden">
        <div className="h-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-h-0 flex flex-col">
            <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">
                {currentSlide.type === 'instruction'
                  ? 'Reading Comprehension'
                  : `Passage ${currentSlide.passageIndex + 1}`}
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6">
              {currentSlide.type === 'instruction' && (
                <div className="flex flex-col items-center justify-center py-6 px-4 shadow-sm rounded-lg border border-blue-100 bg-blue-50/50">
                  <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Instructions</h3>
                  <p className="text-base text-gray-700 leading-relaxed text-center max-w-2xl">{currentSlide.instructions}</p>
                  <button
                    onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                    className="mt-6 px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300"
                  >
                    Start Reading Section
                  </button>
                </div>
              )}

              {currentSlide.type === 'question' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                  <section className="p-5 sm:p-6 lg:p-8 lg:border-r border-gray-200">
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentSlide.passage.title}</h3>
                    <div
                      className="prose max-w-none prose-blue text-gray-800 leading-loose"
                      dangerouslySetInnerHTML={{ __html: currentSlide.passage.content }}
                    />
                  </section>

                  <section className="p-5 sm:p-6 lg:p-8">
                    <div className="mb-6 text-lg font-medium text-gray-900 leading-relaxed w-full">
                      <span className="bg-gray-100 text-gray-700 w-8 h-8 inline-flex items-center justify-center rounded-full text-sm mr-3 font-bold align-middle">
                        {currentQuestionNumber}
                      </span>
                      <span className="align-middle">{currentSlide.question.text}</span>
                    </div>

                    <div className="space-y-3 w-full">
                      {currentSlide.question.options.map((opt: string, optIdx: number) => {
                        const isSelected = answers[currentSlide.question.id] === optIdx
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                              isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentSlide.question.id}`}
                              className="mt-1 w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300 shrink-0"
                              checked={isSelected}
                              onChange={() => handleAnswerSelection(currentSlide.question.id, optIdx)}
                            />
                            <span className="ml-4 text-gray-800 text-lg">{opt}</span>
                          </label>
                        )
                      })}
                    </div>
                  </section>
                </div>
              )}
            </div>

            <div className="shrink-0 border-t border-gray-200 bg-white/95 backdrop-blur px-4 sm:px-8 py-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm font-medium text-gray-700 transition"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {canMarkCurrentSlide && (
                  <button
                    onClick={toggleFlagForCurrentSlide}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-md text-sm font-medium transition ${
                      flaggedSlides[currentSlideIndex]
                        ? 'border-amber-300 bg-amber-50 text-amber-700'
                        : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <Flag className="w-4 h-4" />
                    {flaggedSlides[currentSlideIndex] ? 'Marked for Review' : 'Mark for Review'}
                  </button>
                )}

                <button
                  onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md disabled:opacity-50 hover:bg-blue-700 transition"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <aside className="w-full xl:w-[320px] min-h-0 shrink-0 border-t xl:border-t-0 xl:border-l border-gray-200 bg-gray-50/40">
            <div className="p-4 sm:p-6 h-full overflow-y-auto">
              <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider text-center">Question Progress</h3>

              <div className="flex xl:hidden gap-2 mb-5 overflow-x-auto pb-1">
                {allQuestionsData.map((q) => {
                  const isAnswered = answers[q.id] !== undefined
                  const isCurrentSlide = currentSlideIndex === q.slideIndex
                  const isFlagged = !!flaggedSlides[q.slideIndex]

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentSlideIndex(q.slideIndex)}
                      className={`h-9 min-w-9 px-2 rounded text-sm font-semibold flex items-center justify-center border transition-colors ${
                        isCurrentSlide ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      } ${
                        isAnswered
                          ? 'bg-green-500 text-white border-green-600'
                          : isFlagged
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      title={`Passage ${q.passageIndex + 1}, Question ${q.number}${isFlagged ? ' (Marked for review)' : ''}`}
                    >
                      {q.number}
                    </button>
                  )
                })}
              </div>

              <div className="hidden xl:grid grid-cols-6 gap-2 mb-5">
                {allQuestionsData.map((q) => {
                  const isAnswered = answers[q.id] !== undefined
                  const isCurrentSlide = currentSlideIndex === q.slideIndex
                  const isFlagged = !!flaggedSlides[q.slideIndex]

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentSlideIndex(q.slideIndex)}
                      className={`h-9 rounded text-sm font-semibold flex items-center justify-center border transition-colors ${
                        isCurrentSlide ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                      } ${
                        isAnswered
                          ? 'bg-green-500 text-white border-green-600'
                          : isFlagged
                            ? 'bg-amber-50 text-amber-700 border-amber-300'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                      title={`Passage ${q.passageIndex + 1}, Question ${q.number}${isFlagged ? ' (Marked for review)' : ''}`}
                    >
                      {q.number}
                    </button>
                  )
                })}
              </div>

              <div className="pt-4 border-t border-gray-100 text-xs text-gray-600 font-medium text-center">
                <span className="text-blue-600 font-bold">{answeredCount}</span> of {allQuestionsData.length} answered
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
