"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { TOEFL_SECTION_LABELS } from '@/lib/toefl/catalog'
import type { TOEFLTestSection } from '@/lib/toefl/types'

interface StartTestFormProps {
  testSetSlug: string
  section: TOEFLTestSection
  title: string
  description?: string
}

export default function StartTestForm({
  testSetSlug,
  section,
  title,
  description,
}: StartTestFormProps) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [userId, setUserId] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleStartTest(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/toefl-itp/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, userId, section, testSetSlug }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData ? JSON.stringify(errData, null, 2) : 'Failed to start test')
      }

      const { attemptId } = await res.json()
      router.push(`/toefl-itp-test/${attemptId}`)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error(error)
      alert(`Error starting test:\n${message}`)
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
      <div>
        <h2 className="text-center text-3xl font-bold text-gray-900">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-center text-sm text-gray-600">
            {description}
          </p>
        ) : null}
      </div>

      <form className="mt-8 space-y-6" onSubmit={handleStartTest}>
        <div className="rounded-md shadow-sm space-y-4">
          <div>
            <label htmlFor="name" className="sr-only">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="userId" className="sr-only">UserID</label>
            <input
              id="userId"
              name="userId"
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="UserID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Starting...' : `Start ${TOEFL_SECTION_LABELS[section]}`}
          </button>
        </div>
      </form>
    </div>
  )
}
