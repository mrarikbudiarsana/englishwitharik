"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TOEFLITPLandingPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [section, setSection] = useState<'listening' | 'structure' | 'reading'>('listening')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleStartTest = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 1. Register or find student and start attempt in the database
      const res = await fetch('/api/toefl-itp/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, section }),
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => null)
        throw new Error(errData ? JSON.stringify(errData, null, 2) : 'Failed to start test')
      }
      
      const { attemptId } = await res.json()
      
      // 2. Redirect to the test page with the attempt ID
      router.push(`/toefl-itp-test/${attemptId}`)
    } catch (error: any) {
      console.error(error)
      alert(`Error starting test:\n${error.message}`)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            TOEFL ITP Training
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your details to begin the practice test.
          </p>
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
              <label htmlFor="section" className="block text-sm font-medium text-gray-700 mb-1">Select Test Section</label>
              <select
                id="section"
                name="section"
                required
                value={section}
                onChange={(e) => setSection(e.target.value as any)}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="listening">Day 1: Listening Comprehension (35 mins)</option>
                <option value="structure">Day 2: Structure & Written Expression (25 mins)</option>
                <option value="reading">Day 3: Reading Comprehension (55 mins)</option>
              </select>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Starting...' : 'Start Test'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
