"use client"

import { useState, useMemo, useRef, useEffect } from 'react'
import { ChevronRight, CheckCircle2, XCircle, Volume2, RotateCcw } from 'lucide-react'
import type { Quiz, QuizQuestion } from '@/lib/quiz/types'

type QuestionResult = {
  selectedIndex: number
  isCorrect: boolean
}

export default function QuizPlayer({ quiz }: { quiz: Quiz }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [checked, setChecked] = useState(false)
  const [results, setResults] = useState<Record<string, QuestionResult>>({})
  const [showResults, setShowResults] = useState(false)

  // Audio state (for listening quizzes)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const questions = quiz.questions
  const currentQuestion: QuizQuestion | undefined = questions[currentIndex]
  const isLastQuestion = currentIndex === questions.length - 1

  // Reading quiz: mobile view toggle
  const [mobileView, setMobileView] = useState<'passage' | 'question'>('question')

  const score = useMemo(() => {
    return Object.values(results).filter(r => r.isCorrect).length
  }, [results])

  const handleSelect = (optionIndex: number) => {
    if (checked) return
    setSelectedOption(optionIndex)
  }

  const handleCheck = () => {
    if (selectedOption === null || !currentQuestion) return
    const isCorrect = selectedOption === currentQuestion.correctAnswerIndex
    setResults(prev => ({
      ...prev,
      [currentQuestion.id]: { selectedIndex: selectedOption, isCorrect }
    }))
    setChecked(true)
  }

  const handleNext = () => {
    if (isLastQuestion) {
      setShowResults(true)
      return
    }
    setCurrentIndex(prev => prev + 1)
    setSelectedOption(null)
    setChecked(false)
  }

  const handleRestart = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setChecked(false)
    setResults({})
    setShowResults(false)
  }

  // Audio controls
  const toggleAudio = async () => {
    if (!audioRef.current) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      try {
        await audioRef.current.play()
        setIsPlaying(true)
      } catch (err) {
        console.error('Audio playback failed:', err)
      }
    }
  }

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }, [currentIndex])

  // Results screen
  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Score header */}
          <div className={`px-8 py-10 text-center ${
            percentage >= 80 ? 'bg-gradient-to-br from-emerald-50 to-green-50' :
            percentage >= 60 ? 'bg-gradient-to-br from-amber-50 to-yellow-50' :
            'bg-gradient-to-br from-red-50 to-rose-50'
          }`}>
            <p className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-3">Your Score</p>
            <p className={`text-6xl font-extrabold ${
              percentage >= 80 ? 'text-emerald-600' :
              percentage >= 60 ? 'text-amber-600' :
              'text-red-600'
            }`}>
              {percentage}%
            </p>
            <p className="mt-2 text-lg text-gray-600">
              {score} out of {questions.length} correct
            </p>
            <p className="mt-4 text-base font-medium text-gray-700">
              {percentage >= 80 ? 'Excellent work! 🎉' :
               percentage >= 60 ? 'Good effort! Keep practicing. 💪' :
               'Keep going! Practice makes perfect. 📚'}
            </p>
          </div>

          {/* Question breakdown */}
          <div className="px-8 py-6 border-t border-gray-100">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-4">Question Breakdown</h3>
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
              {questions.map((q, idx) => {
                const result = results[q.id]
                return (
                  <div
                    key={q.id}
                    className={`h-9 rounded-lg text-sm font-semibold flex items-center justify-center border transition-colors ${
                      result?.isCorrect
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : result
                          ? 'bg-red-500 text-white border-red-600'
                          : 'bg-gray-100 text-gray-500 border-gray-200'
                    }`}
                    title={`Question ${idx + 1}: ${result?.isCorrect ? 'Correct' : result ? 'Incorrect' : 'Skipped'}`}
                  >
                    {idx + 1}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="px-8 py-6 border-t border-gray-100 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={handleRestart}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#08507f] text-white font-semibold rounded-xl hover:bg-[#063a5c] transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <a
              href="/practice"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors"
            >
              More Quizzes
            </a>
          </div>
        </div>
      </div>
    )
  }

  if (!currentQuestion) return null

  // Option styling logic
  const getOptionClass = (optIdx: number) => {
    if (!checked) {
      if (selectedOption === optIdx) {
        return 'border-[#08507f] bg-[#08507f]/5 ring-2 ring-[#08507f]/20'
      }
      return 'border-gray-200 hover:bg-gray-50 cursor-pointer'
    }

    // After checking
    const isCorrectOption = optIdx === currentQuestion.correctAnswerIndex
    const isUserSelection = optIdx === selectedOption

    if (isCorrectOption) {
      return 'border-emerald-500 bg-emerald-50 ring-2 ring-emerald-200'
    }
    if (isUserSelection && !isCorrectOption) {
      return 'border-red-500 bg-red-50 ring-2 ring-red-200'
    }
    return 'border-gray-200 opacity-50'
  }

  // Progress bar
  const progress = ((currentIndex) / questions.length) * 100

  // Question card content
  const questionCard = (
    <div className="flex flex-col gap-5">
      {/* Question text */}
      <div className="text-lg font-medium text-gray-900 leading-relaxed">
        <span className="bg-gray-100 text-gray-700 w-8 h-8 inline-flex items-center justify-center rounded-full text-sm mr-2.5 font-bold align-middle">
          {currentIndex + 1}
        </span>
        <span className="align-middle">{currentQuestion.text}</span>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {currentQuestion.options.map((opt, optIdx) => {
          const isCorrectOption = optIdx === currentQuestion.correctAnswerIndex
          const isUserSelection = optIdx === selectedOption

          return (
            <label
              key={optIdx}
              className={`flex items-start p-3.5 border rounded-xl transition-all duration-200 ${getOptionClass(optIdx)} ${
                checked ? 'cursor-default' : ''
              }`}
              onClick={() => handleSelect(optIdx)}
            >
              <div className="flex items-center gap-3.5 w-full">
                {checked ? (
                  isCorrectOption ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  ) : isUserSelection ? (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 shrink-0 mt-0.5" />
                  )
                ) : (
                  <input
                    type="radio"
                    name={`q-${currentQuestion.id}`}
                    className="w-5 h-5 text-[#08507f] focus:ring-[#08507f] border-gray-300 shrink-0 mt-0.5 cursor-pointer"
                    checked={selectedOption === optIdx}
                    onChange={() => handleSelect(optIdx)}
                    disabled={checked}
                  />
                )}
                <span className="text-gray-800 text-base leading-relaxed">{opt}</span>
              </div>
            </label>
          )
        })}
      </div>

      {/* Explanation */}
      {checked && currentQuestion.explanation && (
        <div className="mt-1 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm font-semibold text-blue-800 mb-1">💡 Explanation</p>
          <p className="text-sm text-blue-700 leading-relaxed">{currentQuestion.explanation}</p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center justify-between pt-2">
        <p className="text-sm text-gray-500">
          Question {currentIndex + 1} of {questions.length}
        </p>
        {!checked ? (
          <button
            onClick={handleCheck}
            disabled={selectedOption === null}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#08507f] text-white text-sm font-semibold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#063a5c] transition-colors"
          >
            Check Answer
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#08507f] text-white text-sm font-semibold rounded-xl hover:bg-[#063a5c] transition-colors"
          >
            {isLastQuestion ? 'See Results' : 'Next Question'}
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{quiz.title}</h2>
          <span className="text-sm font-medium text-gray-500">
            {score} / {Object.keys(results).length} correct
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#08507f] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Progress sidebar (desktop) */}
      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_240px] gap-6">
        <div>
          {/* Audio player for listening quizzes */}
          {quiz.type === 'listening' && quiz.audio_url && (
            <div className="mb-5 bg-gray-50 border border-gray-200 p-4 rounded-xl flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-4">
                <div className="bg-[#08507f]/10 p-3 rounded-full text-[#08507f]">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">Audio</p>
                  <p className="text-xs text-gray-500">Listen and answer the question below</p>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={quiz.audio_url}
                onEnded={() => setIsPlaying(false)}
                className="hidden"
              />

              <button
                onClick={() => void toggleAudio()}
                className={`px-5 py-2 shrink-0 rounded-full font-medium text-sm transition ${
                  isPlaying
                    ? 'bg-[#08507f]/10 text-[#08507f]'
                    : 'bg-[#08507f] text-white hover:bg-[#063a5c]'
                }`}
              >
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>
          )}

          {/* Reading quiz: split layout */}
          {quiz.type === 'reading' && quiz.passage ? (
            <>
              {/* Mobile view toggle */}
              <div className="flex items-center gap-2 mb-4 lg:hidden">
                <button
                  onClick={() => setMobileView('passage')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                    mobileView === 'passage' ? 'bg-[#08507f] text-white border-[#08507f]' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Passage
                </button>
                <button
                  onClick={() => setMobileView('question')}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold border cursor-pointer ${
                    mobileView === 'question' ? 'bg-[#08507f] text-white border-[#08507f]' : 'bg-white text-gray-700 border-gray-300'
                  }`}
                >
                  Question
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* Passage panel */}
                <div className={`${mobileView === 'passage' ? 'block' : 'hidden'} lg:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden`}>
                  <div className="p-5 sm:p-6 max-h-[70vh] overflow-y-auto">
                    <div
                      className="prose prose-sm max-w-none text-gray-800 leading-7"
                      dangerouslySetInnerHTML={{ __html: quiz.passage }}
                    />
                  </div>
                </div>

                {/* Question panel */}
                <div className={`${mobileView === 'question' ? 'block' : 'hidden'} lg:block bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6`}>
                  {questionCard}
                </div>
              </div>
            </>
          ) : (
            /* Grammar / Vocabulary / Listening: single card */
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-7">
              {questionCard}
            </div>
          )}
        </div>

        {/* Progress sidebar */}
        <aside className="hidden xl:block">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sticky top-24">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 text-center">Progress</h3>
            <div className="grid grid-cols-5 gap-2 mb-4">
              {questions.map((q, idx) => {
                const result = results[q.id]
                const isCurrent = idx === currentIndex
                return (
                  <div
                    key={q.id}
                    className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center border transition-colors ${
                      isCurrent ? 'ring-2 ring-[#08507f] ring-offset-1' : ''
                    } ${
                      result?.isCorrect
                        ? 'bg-emerald-500 text-white border-emerald-600'
                        : result
                          ? 'bg-red-500 text-white border-red-600'
                          : 'bg-white text-gray-600 border-gray-200'
                    }`}
                  >
                    {idx + 1}
                  </div>
                )
              })}
            </div>
            <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 font-medium text-center">
              <span className="text-emerald-600 font-bold">{score}</span> correct · <span className="text-red-500 font-bold">{Object.keys(results).length - score}</span> incorrect
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
