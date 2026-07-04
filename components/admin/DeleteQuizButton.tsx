'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteQuizButtonProps {
  quizId: string
  quizTitle: string
  className?: string
}

export default function DeleteQuizButton({
  quizId,
  quizTitle,
  className = '',
}: DeleteQuizButtonProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete the quiz "${quizTitle}"? This action cannot be undone.`)) {
      return
    }

    setIsDeleting(true)

    try {
      const res = await fetch(`/api/admin/quizzes/${quizId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Failed to delete quiz')
      }

      router.refresh()
    } catch (error) {
      console.error(error)
      alert(error instanceof Error ? error.message : 'An error occurred while deleting the quiz.')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isDeleting}
      className={`inline-flex items-center rounded-md bg-red-50 border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 ${className}`}
    >
      {isDeleting ? (
        <>
          <svg className="animate-spin -ml-1 mr-1.5 h-3.5 w-3.5 text-red-700" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          Deleting...
        </>
      ) : (
        'Delete'
      )}
    </button>
  )
}
