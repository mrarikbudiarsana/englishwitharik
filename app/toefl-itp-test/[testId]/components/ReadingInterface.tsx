"use client"

import { useState } from 'react'
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
  const slides: any[] = []
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
  const currentSlide = slides[currentSlideIndex]

  const handleAnswerSelection = (questionId: string, answerIndex: number) => {
    onAnswerSelect(questionId, answerIndex)
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-gray-100">

      {/* Main Content Area */}
      {currentSlide.type === 'instruction' ? (
        <div className="flex-1 overflow-y-auto p-6 flex items-center justify-center">
            <div className="max-w-2xl w-full flex flex-col items-center justify-center py-12 px-8 shadow-sm rounded-xl border border-blue-100 bg-white">
              <svg className="w-16 h-16 text-blue-500 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">Reading Comprehension</h3>
              <p className="text-lg text-gray-700 leading-relaxed text-center max-w-xl">{currentSlide.instructions}</p>
              <button
                onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                className="mt-10 px-10 py-3.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-md"
              >
                Start Reading Section
              </button>
            </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col overflow-hidden max-h-full">
          
          {/* Top Panel: Navigation & Progress Grid */}
          <div className="w-full bg-white border-b border-gray-200 px-6 py-3 shadow-sm z-10 shrink-0 flex items-center justify-between gap-6">
            
            {/* Left: Previous / Next & Counter */}
             <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => setCurrentSlideIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentSlideIndex === 0}
                  className="px-4 py-1.5 border border-gray-300 rounded-md disabled:opacity-50 hover:bg-gray-50 text-sm font-medium text-gray-700 transition"
                >
                  &larr; Prev
                </button>
                <button
                  onClick={() => setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))}
                  disabled={currentSlideIndex === slides.length - 1}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md disabled:opacity-50 hover:bg-blue-700 transition"
                >
                  Next &rarr;
                </button>
             </div>

             {/* Right: Scrollable Question Grid */}
             <div className="flex-1 flex gap-2 overflow-x-auto p-1 items-center justify-end scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {allQuestionsData.map((q) => {
                  const isAnswered = answers[q.id] !== undefined
                  const isCurrentSlide = currentSlideIndex === q.slideIndex
                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentSlideIndex(q.slideIndex)}
                      className={`w-8 h-8 rounded text-sm font-medium flex items-center justify-center border transition-colors shrink-0 ${
                        isCurrentSlide ? 'ring-2 ring-blue-500 ring-offset-1 z-10' : ''
                      } ${
                        isAnswered ? 'bg-green-500 text-white border-green-600 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                      }`}
                      title={`Passage ${q.passageIndex + 1}, Question ${q.number}`}
                    >
                      {q.number}
                    </button>
                  )
                })}
             </div>
          </div>

          {/* Bottom Panel: Two Columns */}
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">
            
            {/* Left Panel: Reading Passage */}
            <div className="w-full lg:w-1/2 h-1/2 lg:h-full overflow-y-auto bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-6 lg:p-10 shrink-0 lg:shrink">
              <div className="max-w-3xl mx-auto">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">{currentSlide.passage.title}</h3>
                  <div 
                    className="prose max-w-none prose-blue text-gray-800 leading-loose"
                    dangerouslySetInnerHTML={{ __html: currentSlide.passage.content }}
                  />
              </div>
            </div>

            {/* Right Panel: Single Question Display */}
            <div className="w-full lg:w-1/2 h-1/2 lg:h-full overflow-y-auto bg-white p-6 lg:p-10 shrink-0 lg:shrink">
              <div className="max-w-xl mx-auto flex flex-col gap-6">
                  
                  {/* Single Question Display */}
                  <div className="w-full">
                    <div className="mb-6 text-lg font-medium text-gray-900 leading-relaxed w-full">
                      <span className="bg-gray-100 text-gray-700 w-8 h-8 inline-flex items-center justify-center rounded-full text-sm mr-3 font-bold align-middle">
                          {allQuestionsData.find(q => q.slideIndex === currentSlideIndex)?.number}
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
                  </div>

              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  )
}
