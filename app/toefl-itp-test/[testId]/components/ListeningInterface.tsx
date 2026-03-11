"use client"

import { useState, useRef, useEffect } from 'react'
import { TOEFLListeningTest } from '@/lib/toefl/types'

export default function ListeningTestInterface({
  test,
  answers,
  onAnswerSelect
}: {
  test: TOEFLListeningTest
  answers: Record<string, string | number>
  onAnswerSelect: (questionId: string, answerIndex: number) => void
}) {
  // Flatten all parts into a single navigable array
  // Each item is either a single A question OR a B/C passage with multiple questions
  const slides: any[] = []

  // Push Part A Intro
  if (test.parts.A.questions.length > 0) {
    slides.push({
      type: 'instruction',
      partName: 'Part A',
      instructions: test.parts.A.instructions
    })
  }

  test.parts.A.questions.forEach((q, i) => {
    slides.push({
      type: 'part-a',
      partName: 'Part A',
      question: q
    })
  })

  // Push Part B Intro
  if (test.parts.B.passages.length > 0) {
    slides.push({
      type: 'instruction',
      partName: 'Part B',
      instructions: test.parts.B.instructions
    })
  }

  test.parts.B.passages.forEach((p, i) => {
    slides.push({
      type: 'part-bc',
      partName: 'Part B',
      passage: p
    })
  })

  // Push Part C Intro
  if (test.parts.C.passages.length > 0) {
    slides.push({
      type: 'instruction',
      partName: 'Part C',
      instructions: test.parts.C.instructions
    })
  }

  test.parts.C.passages.forEach((p, i) => {
    slides.push({
      type: 'part-bc',
      partName: 'Part C',
      passage: p
    })
  })

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState<Record<string, boolean>>({})
  
  const currentSlide = slides[currentSlideIndex]
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const allQuestionsData: { id: string, slideIndex: number, number: number }[] = []
  let questionCounter = 1

  slides.forEach((slide, idx) => {
    if (slide.type === 'part-a') {
      allQuestionsData.push({ id: slide.question.id, slideIndex: idx, number: questionCounter++ })
    } else if (slide.type === 'part-bc') {
      slide.passage.questions.forEach((q: any) => {
        allQuestionsData.push({ id: q.id, slideIndex: idx, number: questionCounter++ })
      })
    }
  })

  useEffect(() => {
    // Reset audio state when slide changes
    setIsPlaying(false)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
    }

    // Autoplay for current slide
    if (slides[currentSlideIndex]?.type === 'part-a' || slides[currentSlideIndex]?.type === 'part-bc') {
       const timer = setTimeout(() => {
         const slide = slides[currentSlideIndex];
         const audioId = slide.type === 'part-a' ? slide.question.id : slide.passage.id;
         
         if (!hasPlayed[audioId] && audioRef.current) {
            audioRef.current.play().catch(e => console.error("Autoplay prevented by browser:", e));
            setIsPlaying(true);
            setHasPlayed(prev => ({ ...prev, [audioId]: true }));
         }
       }, 500);
       return () => clearTimeout(timer);
    }
  }, [currentSlideIndex])

  const handlePlayAudio = (audioId: string) => {
    if (hasPlayed[audioId] || !audioRef.current) return
    
    audioRef.current.play()
    setIsPlaying(true)
    setHasPlayed(prev => ({ ...prev, [audioId]: true }))
  }

  const handleAudioEnded = () => {
    setIsPlaying(false)
  }

  const handleAnswerSelection = (questionId: string, answerIndex: number) => {
    onAnswerSelect(questionId, answerIndex)
    
    // Auto-advance for Part A after a short delay so user sees their selection
    if (currentSlide.type === 'part-a') {
      setTimeout(() => {
        setCurrentSlideIndex(prev => Math.min(slides.length - 1, prev + 1))
      }, 500)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-6 items-start">
      
      {/* Left Column: Test Content & Navigation */}
      <div className="flex-1 flex flex-col gap-6 min-w-0 w-full">
        
        {/* Main Content Card */}
        <div className="bg-white p-6 sm:p-8 rounded-xl shadow-sm border border-gray-200">
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

        {currentSlide.type === 'part-a' && (
          <div className="flex flex-col gap-6">
            {/* Audio Player (Only plays once, Compact) */}
            <div className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Audio Question</p>
                  <p className="text-sm text-gray-500 hidden sm:block">Audio will only play once.</p>
                </div>
              </div>
              
              <audio 
                ref={audioRef} 
                src={currentSlide.question.audioUrl} 
                onEnded={handleAudioEnded}
                className="hidden" 
              />
              
              {isPlaying ? (
                 <div className="px-4 sm:px-6 py-2 sm:py-2.5 shrink-0 rounded-full flex items-center justify-center gap-2 font-medium bg-blue-100 text-blue-800 pointer-events-none">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping shrink-0"></div>
                    Playing...
                 </div>
              ) : hasPlayed[currentSlide.question.id] ? (
                <div className="px-4 sm:px-6 py-2 sm:py-2.5 shrink-0 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center gap-2 font-medium border border-gray-300 pointer-events-none">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Finished
                </div>
              ) : (
                <div className="px-4 sm:px-6 py-2 sm:py-2.5 shrink-0 rounded-full bg-gray-100 text-gray-400 font-medium">Ready</div>
              )}
            </div>

            {/* Options (Question text is hidden for Part A) */}
            <div className="w-full">
              <div className="space-y-2">
                {currentSlide.question.options.map((opt: string, i: number) => {
                  const isSelected = answers[currentSlide.question.id] === i
                  return (
                    <label 
                      key={i} 
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input 
                        type="radio" 
                        name={`question-${currentSlide.question.id}`}
                        className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                        checked={isSelected}
                        onChange={() => handleAnswerSelection(currentSlide.question.id, i)}
                      />
                      <span className="ml-4 text-gray-800 text-lg">{opt}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        )}

        {currentSlide.type === 'part-bc' && (
          <div className="flex flex-col gap-6">
             {/* Audio Player for Passage */}
             <div className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm sticky top-0 z-10">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-full text-blue-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" /></svg>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">Passage Recording</p>
                  <p className="text-sm text-gray-500 hidden sm:block">Audio will only play once.</p>
                </div>
              </div>
              
              <audio 
                ref={audioRef} 
                src={currentSlide.passage.audioUrl} 
                onEnded={handleAudioEnded}
                className="hidden" 
              />
              
              {isPlaying ? (
                 <div className="px-4 sm:px-6 py-2 sm:py-2.5 shrink-0 rounded-full flex items-center justify-center gap-2 font-medium bg-blue-100 text-blue-800 pointer-events-none">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping shrink-0"></div>
                    Playing...
                 </div>
              ) : hasPlayed[currentSlide.passage.id] ? (
                <div className="px-4 sm:px-6 py-2 sm:py-2.5 shrink-0 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center gap-2 font-medium border border-gray-300 pointer-events-none">
                  <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Finished
                </div>
              ) : (
                <div className="px-4 sm:px-6 py-2 sm:py-2.5 shrink-0 rounded-full bg-gray-100 text-gray-400 font-medium">Ready</div>
              )}
            </div>

            {/* Questions List for Passage */}
            <div className="w-full space-y-8 mt-4">
              {currentSlide.passage.questions.map((q: any, qIdx: number) => (
                <div key={q.id} className="bg-white">
                  <p className="text-lg font-medium text-gray-900 mb-4">{qIdx + 1}. {q.text}</p>
                  <div className="space-y-3">
                    {q.options.map((opt: string, optIdx: number) => {
                      const isSelected = answers[q.id] === optIdx
                      return (
                        <label 
                          key={optIdx} 
                          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                           <input 
                            type="radio" 
                            name={`question-${q.id}`}
                            className="w-5 h-5 text-blue-600 focus:ring-blue-500 border-gray-300"
                            checked={isSelected}
                            onChange={() => onAnswerSelect(q.id, optIdx)}
                          />
                          <span className="ml-4 text-gray-800 text-lg">{opt}</span>
                        </label>
                      )
                    })}
                  </div>
                </div>
              ))}
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
