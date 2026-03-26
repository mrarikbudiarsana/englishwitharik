"use client"

import { useState, useRef, useEffect, useMemo } from 'react'
import { ListeningPassage, TOEFLListeningTest } from '@/lib/toefl/types'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'

export default function ListeningTestInterface({
  test,
  answers,
  onAnswerSelect,
  volume
}: {
  test: TOEFLListeningTest
  answers: Record<string, string | number>
  onAnswerSelect: (questionId: string, answerIndex: number) => void
  volume: number
}) {
  type ListeningSlide =
    | { type: 'instruction'; partName: 'Part A' | 'Part B' | 'Part C'; instructions: string }
    | { type: 'part-a'; partName: 'Part A'; question: TOEFLListeningTest['parts']['A']['questions'][number] }
    | { type: 'part-bc'; partName: 'Part B' | 'Part C'; passage: ListeningPassage }

  const slides = useMemo<ListeningSlide[]>(() => {
    const builtSlides: ListeningSlide[] = []

    if (test.parts.A.questions.length > 0) {
      builtSlides.push({
        type: 'instruction',
        partName: 'Part A',
        instructions: test.parts.A.instructions
      })
    }

    test.parts.A.questions.forEach((q) => {
      builtSlides.push({
        type: 'part-a',
        partName: 'Part A',
        question: q
      })
    })

    if (test.parts.B.passages.length > 0) {
      builtSlides.push({
        type: 'instruction',
        partName: 'Part B',
        instructions: test.parts.B.instructions
      })
    }

    test.parts.B.passages.forEach((p) => {
      builtSlides.push({
        type: 'part-bc',
        partName: 'Part B',
        passage: p
      })
    })

    if (test.parts.C.passages.length > 0) {
      builtSlides.push({
        type: 'instruction',
        partName: 'Part C',
        instructions: test.parts.C.instructions
      })
    }

    test.parts.C.passages.forEach((p) => {
      builtSlides.push({
        type: 'part-bc',
        partName: 'Part C',
        passage: p
      })
    })

    return builtSlides
  }, [test])

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasPlayed, setHasPlayed] = useState<Record<string, boolean>>({})
  const [audioError, setAudioError] = useState<string | null>(null)
  const [flaggedSlides, setFlaggedSlides] = useState<Record<number, boolean>>({})
  
  const currentSlide = slides[currentSlideIndex]
  const canMarkCurrentSlide = currentSlide?.type === 'part-a' || currentSlide?.type === 'part-bc'
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const allQuestionsData = useMemo(() => {
    const questions: { id: string, slideIndex: number, number: number }[] = []
    let questionCounter = 1

    slides.forEach((slide, idx) => {
      if (slide.type === 'part-a') {
        questions.push({ id: slide.question.id, slideIndex: idx, number: questionCounter++ })
      } else if (slide.type === 'part-bc') {
        slide.passage.questions.forEach((q) => {
          questions.push({ id: q.id, slideIndex: idx, number: questionCounter++ })
        })
      }
    })

    return questions
  }, [slides])

  const getCurrentAudioId = () => {
    if (currentSlide.type === 'part-a') return currentSlide.question.id
    if (currentSlide.type === 'part-bc') return currentSlide.passage.id
    return null
  }

  const startPlayback = async () => {
    const audioId = getCurrentAudioId()
    if (!audioRef.current || !audioId) return
    if (hasPlayed[audioId]) return

    setAudioError(null)
    audioRef.current.currentTime = 0
    audioRef.current.volume = volume

    try {
      await audioRef.current.play()
      setIsPlaying(true)
      setHasPlayed((prev) => ({ ...prev, [audioId]: true }))
    } catch (error) {
      setIsPlaying(false)
      setAudioError('Click Play Audio to start playback.')
      console.error('Audio playback failed:', error)
    }
  }

  useEffect(() => {
    // Reset audio state when slide changes
    setIsPlaying(false)
    setAudioError(null)
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current.volume = volume
    }

    // Autoplay for current slide
    if (currentSlide?.type === 'part-a' || currentSlide?.type === 'part-bc') {
      const audioId = currentSlide.type === 'part-a' ? currentSlide.question.id : currentSlide.passage.id
      const timer = setTimeout(() => {
        if (!hasPlayed[audioId]) {
          void startPlayback()
        }
      }, 250)
      return () => clearTimeout(timer)
    }
  }, [currentSlide, currentSlideIndex, volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume, currentSlideIndex])

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

  const toggleFlagForCurrentSlide = () => {
    if (!canMarkCurrentSlide) return

    setFlaggedSlides(prev => ({
      ...prev,
      [currentSlideIndex]: !prev[currentSlideIndex]
    }))
  }

  const answeredCount = allQuestionsData.filter((q) => answers[q.id] !== undefined).length
  const questionNumberById = useMemo(() => {
    return new Map(allQuestionsData.map((q) => [q.id, q.number]))
  }, [allQuestionsData])

  return (
    <div className="h-full w-full">
      <div className="h-full bg-white overflow-hidden">
        <div className="h-full grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-h-0 flex flex-col">
          <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">{currentSlide.partName}</h2>
          </div>

          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-5 sm:py-6">
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
                    onLoadedMetadata={() => {
                      if (audioRef.current) audioRef.current.volume = volume
                    }}
                    onError={() => {
                      setIsPlaying(false)
                      setAudioError('Audio failed to load. Please check the audio URL.')
                    }}
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
                    <button
                      type="button"
                      onClick={() => void startPlayback()}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 shrink-0 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                      Play Audio
                    </button>
                  )}
                </div>
                {audioError && <div className="text-sm text-red-600">{audioError}</div>}

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
                <div className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
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
                    onLoadedMetadata={() => {
                      if (audioRef.current) audioRef.current.volume = volume
                    }}
                    onError={() => {
                      setIsPlaying(false)
                      setAudioError('Audio failed to load. Please check the audio URL.')
                    }}
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
                    <button
                      type="button"
                      onClick={() => void startPlayback()}
                      className="px-4 sm:px-6 py-2 sm:py-2.5 shrink-0 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition"
                    >
                      Play Audio
                    </button>
                  )}
                </div>
                {audioError && <div className="text-sm text-red-600">{audioError}</div>}

                <div className="w-full space-y-8 mt-4">
                  {currentSlide.passage.questions.map((q, qIdx: number) => (
                    <div key={q.id} className="bg-white">
                      <p className="text-lg font-medium text-gray-900 mb-4">{questionNumberById.get(q.id) ?? qIdx + 1}. {q.text}</p>
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
                    title={`Go to Question ${q.number}${isFlagged ? ' (Marked for review)' : ''}`}
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
                    title={`Go to Question ${q.number}${isFlagged ? ' (Marked for review)' : ''}`}
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
