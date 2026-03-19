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
}: {
  attempt: TOEFLAttempt & { toefl_participants: { name: string } }
  template: TOEFLTestTemplate
}) {
  const router = useRouter()
  // Flatten questions based on section type
  // ... this depends heavily on the specific section template

  const [timeLeft, setTimeLeft] = useState(template.test.durationMinutes * 60)
  const [answers, setAnswers] = useState<Record<string, string | number>>(attempt.answers || {})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
          section: attempt.section
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
      <div className="shrink-0 z-40 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-bold text-gray-900 text-base sm:text-lg">{template.test.title}</h1>
          <p className="text-sm text-gray-500">Participant: {attempt.toefl_participants?.name}</p>
        </div>
        <div className="flex items-center justify-between gap-4 sm:gap-6">
          <div className={`text-xl sm:text-2xl font-mono font-bold ${timeLeft < 300 ? 'text-red-600 animate-pulse' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </div>
          <button
            onClick={handleFinalSubmit}
            disabled={isSubmitting}
            className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-md font-medium text-sm sm:text-base"
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
