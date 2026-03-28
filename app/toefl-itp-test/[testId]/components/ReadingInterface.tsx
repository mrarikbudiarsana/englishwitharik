"use client"

import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { ChevronLeft, ChevronRight, Flag } from 'lucide-react'
import { TOEFLReadingTest } from '@/lib/toefl/types'

function ReadingPassagePanel({
  title,
  content
}: {
  title: string
  content: string
}) {
  const contentRef = useRef<HTMLDivElement | null>(null)
  const [lineHeight, setLineHeight] = useState(36)
  const [lineMarkers, setLineMarkers] = useState<Array<{ line: number; top: number }>>([])

  useEffect(() => {
    const element = contentRef.current

    if (!element || typeof window === 'undefined') {
      return
    }

    let frameId = 0

    const updateLineMarkers = () => {
      const computedStyles = window.getComputedStyle(element)
      const computedLineHeight = Number.parseFloat(computedStyles.lineHeight)

      if (!Number.isFinite(computedLineHeight) || computedLineHeight <= 0) {
        return
      }

      const nextMarkers: Array<{ line: number; top: number }> = []
      const elementRect = element.getBoundingClientRect()
      const rawLineTops: number[] = []

      const textNodeWalker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            return node.textContent?.trim()
              ? NodeFilter.FILTER_ACCEPT
              : NodeFilter.FILTER_REJECT
          }
        }
      )

      let currentTextNode = textNodeWalker.nextNode()

      while (currentTextNode) {
        const range = document.createRange()
        range.selectNodeContents(currentTextNode)

        const rects = Array.from(range.getClientRects())
        for (const rect of rects) {
          if (rect.width > 0 && rect.height > 0) {
            rawLineTops.push(rect.top - elementRect.top)
          }
        }

        currentTextNode = textNodeWalker.nextNode()
      }

      const uniqueLineTops = rawLineTops
        .sort((a, b) => a - b)
        .reduce<number[]>((acc, top) => {
          const previousTop = acc[acc.length - 1]
          if (previousTop === undefined || Math.abs(top - previousTop) > 1) {
            acc.push(top)
          }
          return acc
        }, [])

      if (uniqueLineTops.length > 0) {
        for (let index = 4; index < uniqueLineTops.length; index += 5) {
          nextMarkers.push({ line: index + 1, top: uniqueLineTops[index] })
        }
      } else {
        const totalLines = Math.max(1, Math.round(element.scrollHeight / computedLineHeight))
        for (let line = 5; line <= totalLines; line += 5) {
          nextMarkers.push({ line, top: (line - 1) * computedLineHeight })
        }
      }

      setLineHeight(computedLineHeight)
      setLineMarkers(nextMarkers)
    }

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frameId)
      frameId = window.requestAnimationFrame(updateLineMarkers)
    }

    scheduleUpdate()

    let resizeObserver: ResizeObserver | null = null

    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(scheduleUpdate)
      resizeObserver.observe(element)
    }

    window.addEventListener('resize', scheduleUpdate)

    return () => {
      window.cancelAnimationFrame(frameId)
      resizeObserver?.disconnect()
      window.removeEventListener('resize', scheduleUpdate)
    }
  }, [content])

  return (
    <section className="h-full min-h-0 overflow-y-auto p-4 sm:p-6 lg:p-8 lg:border-r border-gray-200">
      <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">{title}</h3>

      <div className="relative pl-0 sm:pl-12">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-10 border-r border-gray-100 hidden sm:block">
          {lineMarkers.map(({ line, top }) => (
            <span
              key={line}
              className="absolute right-2 text-xs font-semibold tabular-nums text-gray-400"
              style={{ top: `${top}px` }}
            >
              {line}
            </span>
          ))}
        </div>

        <div
          ref={contentRef}
          className="prose max-w-none prose-blue text-gray-800 leading-8 sm:leading-9 text-[15px] sm:text-base"
          style={{ lineHeight: `${lineHeight}px` } as CSSProperties}
          dangerouslySetInnerHTML={{ __html: content }}
        />
      </div>
    </section>
  )
}

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
  const allQuestionsData: { id: string, slideIndex: number, number: number }[] = []
  let questionCounter = 1

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
      allQuestionsData.push({ id: q.id, slideIndex: slideIdx, number: questionCounter++ })
    })
  })

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [flaggedSlides, setFlaggedSlides] = useState<Record<number, boolean>>({})
  const [isProgressOpen, setIsProgressOpen] = useState(false)
  const [mobileView, setMobileView] = useState<'passage' | 'question'>('question')
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
        <div className={`h-full grid grid-cols-1 ${isProgressOpen ? 'xl:grid-cols-[minmax(0,1fr)_300px]' : ''}`}>
          <div className="min-h-0 flex flex-col">
            <div className="px-4 sm:px-8 py-4 sm:py-5 border-b border-gray-200">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-800">
                  {currentSlide.type === 'instruction'
                    ? 'Reading Comprehension'
                    : `Passage ${currentSlide.passageIndex + 1}`}
                </h2>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-slate-600">
                    {answeredCount} / {allQuestionsData.length} answered
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsProgressOpen((current) => !current)}
                    className="inline-flex items-center rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                  >
                    {isProgressOpen ? 'Hide Progress' : 'Show Progress'}
                  </button>
                </div>
              </div>
              {currentSlide.type === 'question' && (
                <div className="mt-3 flex items-center gap-2 lg:hidden">
                  <button
                    type="button"
                    onClick={() => setMobileView('passage')}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold border cursor-pointer ${mobileView === 'passage' ? 'bg-[#08507f] text-white border-[#08507f]' : 'bg-white text-gray-700 border-gray-300'}`}
                  >
                    Passage
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileView('question')}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold border cursor-pointer ${mobileView === 'question' ? 'bg-[#08507f] text-white border-[#08507f]' : 'bg-white text-gray-700 border-gray-300'}`}
                  >
                    Question
                  </button>
                </div>
              )}
            </div>

            <div className="flex-1 min-h-0 px-4 sm:px-8 py-5 sm:py-6">
              {currentSlide.type === 'instruction' && (
                <div className="h-full overflow-y-auto">
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
                </div>
              )}

              {currentSlide.type === 'question' && (
                <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[1.08fr_0.92fr] gap-0">
                  <div className={`${mobileView === 'passage' ? 'block' : 'hidden'} lg:block h-full min-h-0`}>
                    <ReadingPassagePanel
                      title={currentSlide.passage.title}
                      content={currentSlide.passage.content}
                    />
                  </div>

                  <section className={`${mobileView === 'question' ? 'block' : 'hidden'} lg:block h-full min-h-0 overflow-y-auto p-4 sm:p-5 lg:p-5`}>
                    <div className="mb-4 w-full text-[15px] sm:text-base lg:text-lg font-semibold text-gray-900 leading-relaxed">
                      <span className="bg-gray-100 text-gray-700 w-8 h-8 inline-flex items-center justify-center rounded-full text-sm mr-2 font-bold align-middle">
                        {currentQuestionNumber}
                      </span>
                      <span className="align-middle">{currentSlide.question.text}</span>
                    </div>

                    <div className="space-y-2 w-full">
                      {currentSlide.question.options.map((opt: string, optIdx: number) => {
                        const isSelected = answers[currentSlide.question.id] === optIdx
                        return (
                          <label
                            key={optIdx}
                            className={`flex items-start p-2.5 border rounded-lg cursor-pointer transition-colors ${
                              isSelected ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              type="radio"
                              name={`question-${currentSlide.question.id}`}
                              className="mt-1 w-4 h-4 sm:w-5 sm:h-5 text-blue-600 focus:ring-blue-500 border-gray-300 shrink-0"
                              checked={isSelected}
                              onChange={() => handleAnswerSelection(currentSlide.question.id, optIdx)}
                            />
                            <span className="ml-3 text-gray-800 text-[15px] sm:text-base lg:text-[17px] leading-relaxed">{opt}</span>
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
                  className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm font-medium text-gray-700 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                {canMarkCurrentSlide && (
                  <button
                    onClick={toggleFlagForCurrentSlide}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 border rounded-md text-sm font-medium transition cursor-pointer ${
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
                  className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {isProgressOpen && (
            <aside className="hidden xl:block w-full xl:w-[300px] min-h-0 shrink-0 border-t xl:border-t-0 xl:border-l border-gray-200 bg-gray-50/40">
              <div className="p-4 sm:p-5 h-full overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-800 mb-4 uppercase tracking-wider text-center">Question Progress</h3>
                <div className="grid grid-cols-6 gap-2 mb-5">
                  {allQuestionsData.map((q) => {
                    const isAnswered = answers[q.id] !== undefined
                    const isCurrentSlide = currentSlideIndex === q.slideIndex
                    const isFlagged = !!flaggedSlides[q.slideIndex]

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentSlideIndex(q.slideIndex)}
                        className={`h-9 rounded text-sm font-semibold flex items-center justify-center border transition-colors cursor-pointer ${
                          isCurrentSlide ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                        } ${
                          isAnswered
                            ? 'bg-green-500 text-white border-green-600'
                            : isFlagged
                              ? 'bg-amber-50 text-amber-700 border-amber-300'
                              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                        title={`Question ${q.number}${isFlagged ? ' (Marked for review)' : ''}`}
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
          )}
        </div>
      </div>

      {isProgressOpen && (
        <div className="xl:hidden fixed inset-0 z-50 bg-black/40" onClick={() => setIsProgressOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-[84%] max-w-[320px] bg-white border-l border-gray-200 p-4 overflow-y-auto"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Question Progress</h3>
              <button
                type="button"
                onClick={() => setIsProgressOpen(false)}
                className="rounded-md border border-gray-300 px-2 py-1 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-5 gap-2 mb-5">
              {allQuestionsData.map((q) => {
                const isAnswered = answers[q.id] !== undefined
                const isCurrentSlide = currentSlideIndex === q.slideIndex
                const isFlagged = !!flaggedSlides[q.slideIndex]
                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentSlideIndex(q.slideIndex)
                      setIsProgressOpen(false)
                      setMobileView('question')
                    }}
                    className={`h-9 rounded text-sm font-semibold flex items-center justify-center border transition-colors cursor-pointer ${
                      isCurrentSlide ? 'ring-2 ring-blue-500 ring-offset-1' : ''
                    } ${
                      isAnswered
                        ? 'bg-green-500 text-white border-green-600'
                        : isFlagged
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    title={`Question ${q.number}${isFlagged ? ' (Marked for review)' : ''}`}
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
        </div>
      )}
    </div>
  )
}
