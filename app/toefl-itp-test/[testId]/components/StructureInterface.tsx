"use client"

import { useState } from 'react'
import { TOEFLStructureTest } from '@/lib/toefl/types'

export default function StructureInterface({
  test,
  answers,
  onAnswerSelect
}: {
  test: TOEFLStructureTest
  answers: Record<string, string | number>
  onAnswerSelect: (questionId: string, answerIndex: number) => void
}) {
  const slides: any[] = []
  const allQuestionsData: { id: string, slideIndex: number, number: number }[] = []
  let questionCounter = 1

  if (test.parts.A.questions.length > 0) {
    slides.push({
      type: 'instruction',
      partName: 'Part A',
      instructions: test.parts.A.instructions
    })
  }
  test.parts.A.questions.forEach((q) => {
    const slideIdx = slides.length
    slides.push({
      type: 'question',
      partName: 'Part A',
      question: q
    })
    allQuestionsData.push({ id: q.id, slideIndex: slideIdx, number: questionCounter++ })
  })

  if (test.parts.B.questions.length > 0) {
    slides.push({
      type: 'instruction',
      partName: 'Part B',
      instructions: test.parts.B.instructions
    })
  }
  test.parts.B.questions.forEach((q) => {
    const slideIdx = slides.length
    slides.push({
      type: 'question',
      partName: 'Part B',
      question: q
    })
    allQuestionsData.push({ id: q.id, slideIndex: slideIdx, number: questionCounter++ })
  })

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const currentSlide = slides[currentSlideIndex]
  
  const handleAnswerSelection = (questionId: string, answerIndex: number) => {
    onAnswerSelect(questionId, answerIndex)
  }

  // Determine if we need to show instructions (only show on first question of the part, or constantly at the top?)
  // Standard TOEFL shows them prominently at the start of a section. We'll show a small reminder at the top.

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      {/* Left Column: Main Content Card */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200 w-full min-h-[400px]">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-3">
            {currentSlide.partName}
          </h2>

          {currentSlide.type === 'instruction' && (
            <div className="flex flex-col items-center justify-center py-6 px-4 shadow-sm rounded-lg border border-blue-100 bg-blue-50/50">
              <svg className="w-12 h-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Instructions</h3>
              <p className="text-base text-gray-700 leading-relaxed text-center max-w-2xl">{currentSlide.instructions}</p>
              <button
                onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                className="mt-6 px-8 py-3 bg-blue-600 text-white font-medium rounded-full hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300"
              >
                Start {currentSlide.partName}
              </button>
            </div>
          )}

          {currentSlide.type === 'question' && (
            <div className="flex flex-col gap-6">
              <div className="mb-6 text-lg font-medium text-gray-900 leading-relaxed w-full">
                {currentSlide.partName === 'Part B' ? (
                  currentSlide.question.text.split(/(\[[A-D]\].*?\[\/[A-D]\])/g).map((part: string, i: number) => {
                    const match = part.match(/\[([A-D])\](.*?)\[\/[A-D]\]/)
                    if (match) {
                      const [_, letter, text] = match
                      return (
                        <span key={i} className="underline decoration-gray-400 underline-offset-4 relative mx-1 font-medium">
                           {text}
                           <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-500">({letter})</span>
                        </span>
                      )
                    }
                    return <span key={i}>{part}</span>
                  })
                ) : (
                  <span>{currentSlide.question.text}</span>
                )}
              </div>

              {/* The Options */}
              <div className="space-y-3 w-full">
                {currentSlide.question.options.map((opt: string, optIdx: number) => {
                  const isSelected = answers[currentSlide.question.id] === optIdx
                  return (
                    <label 
                      key={optIdx} 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                        <input 
                        type="radio" 
                        name={`question-${currentSlide.question.id}`}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={isSelected}
                        onChange={() => handleAnswerSelection(currentSlide.question.id, optIdx)}
                      />
                      <span className="ml-4 text-gray-800 text-lg">{opt}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Sticky Progress Grid & Nav */}
      <div className="w-full lg:w-72 shrink-0 flex flex-col gap-6 lg:sticky lg:top-4">
        {/* Combined Navigation & Grid Block */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider text-center">Question Progress</h3>
        
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {allQuestionsData.map((q) => {
              const isAnswered = answers[q.id] !== undefined
              const isCurrentSlide = currentSlideIndex === q.slideIndex
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentSlideIndex(q.slideIndex)}
                  className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center border transition-colors ${
                    isCurrentSlide ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                  } ${
                    isAnswered ? 'bg-green-500 text-white border-green-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                  }`}
                  title={`Go to Question ${q.number}`}
                >
                  {q.number}
                </button>
              )
            })}
          </div>

          <div className="flex gap-2 mb-4">
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
              disabled={currentSlideIndex === 0}
              className="flex-1 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm font-medium text-gray-700 transition"
            >
              &larr; Prev
            </button>
            <button
              onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="flex-1 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md disabled:opacity-50 hover:bg-blue-700 transition"
            >
              Next &rarr;
            </button>
          </div>
        
          <div className="pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium text-center">
              <span className="text-blue-600 font-bold">{Object.keys(answers).length}</span> of {allQuestionsData.length} answered
          </div>
        </div>
      </div>
    </div>
  )
}
