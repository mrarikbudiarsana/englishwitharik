"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { TOEFLAttempt, TOEFLTestTemplate } from '@/lib/toefl/types'
import ListeningTestInterface from './components/ListeningInterface'
import StructureInterface from './components/StructureInterface'
import ReadingInterface from './components/ReadingInterface'

export default function TestInterface({
  attempt,
  template,
  testSetTitle,
}: {
  attempt: TOEFLAttempt & { toefl_participants: { name: string } }
  template: TOEFLTestTemplate
  testSetTitle: string
}) {
  const router = useRouter()
  // Flatten questions based on section type
  // ... this depends heavily on the specific section template

  const [timeLeft, setTimeLeft] = useState(template.test.durationMinutes * 60)
  const [answers, setAnswers] = useState<Record<string, string | number>>(attempt.answers || {})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [listeningVolume, setListeningVolume] = useState(1)

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  const handleAnswerSelect = (questionId: string, answerIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }))
  }

  const handleFinalSubmit = useCallback(async () => {
    if (isSubmitting) return
    setIsSubmitting(true)

    try {
      const res = await fetch('/api/toefl-itp/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          attemptId: attempt.id,
          answers,
        }),
      })

      if (!res.ok) throw new Error('Submission failed')

      // Refresh page to show results
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to submit test. Please check your connection and try again.")
      setIsSubmitting(false)
    }
  }, [answers, attempt.id, attempt.section, isSubmitting, router])

  // Timer logic
  useEffect(() => {
    if (timeLeft <= 0) {
      handleFinalSubmit() // Auto-submit when time's up
      return
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [handleFinalSubmit, timeLeft])

  // Placeholder for the actual rendering logic since Listening/Structure/Reading all have vastly different logic
  return (
    <div className="flex flex-col h-full w-full bg-gray-50 relative min-h-0">
      {/* Fixed Top Header */}
      <div className="shrink-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-2.5 sm:py-4 shadow-sm">
        <div className="flex flex-col gap-2 sm:gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-bold text-gray-900 text-[15px] sm:text-lg leading-tight">{template.test.title}</h1>
          <p className="text-xs sm:text-sm text-gray-500 truncate">Participant: {attempt.toefl_participants?.name}</p>
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.14em] sm:tracking-[0.18em] text-[#08507f] truncate">{testSetTitle}</p>
        </div>
        <div className="flex items-center justify-between gap-3 sm:gap-6">
          {template.type === 'listening' && (
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <label htmlFor="header-volume" className="text-sm font-semibold text-gray-700">Volume</label>
              <input
                id="header-volume"
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={listeningVolume}
                onChange={(event) => setListeningVolume(Number(event.target.value))}
                className="w-32 xl:w-40 accent-blue-600"
              />
              <span className="text-sm text-gray-500 w-11 text-right">{Math.round(listeningVolume * 100)}%</span>
            </div>
          )}
          <div className={`text-3xl sm:text-2xl font-mono font-bold leading-none ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-3.5 sm:px-6 py-2 rounded-md font-medium text-sm sm:text-base whitespace-nowrap"
          >
            {isSubmitting ? 'Submitting...' : 'Finish Test'}
          </button>
        </div>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden relative">
        {template.type === 'listening' && (
          <div className="absolute inset-0 overflow-hidden">
            <ListeningTestInterface 
              test={template.test} 
              answers={answers} 
              onAnswerSelect={handleAnswerSelect} 
              volume={listeningVolume}
            />
          </div>
        )}
        
        {template.type === 'structure' && (
          <div className="absolute inset-0 overflow-hidden">
            <StructureInterface 
              test={template.test} 
              answers={answers} 
              onAnswerSelect={handleAnswerSelect} 
            />
          </div>
        )}

        {template.type === 'reading' && (
          <div className="absolute inset-0 overflow-hidden">
            <ReadingInterface 
              test={template.test} 
              answers={answers} 
              onAnswerSelect={handleAnswerSelect} 
            />
          </div>
        )}
      </div>
    </div>
  )
}
