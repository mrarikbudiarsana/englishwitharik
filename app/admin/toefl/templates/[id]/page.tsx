'use client'

import { useState, useEffect, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useParams } from 'next/navigation'
import Link from 'next/link'

export default function TemplateEditorPage() {
  const { id } = useParams()
  const supabase = useMemo(() => createClient(), [])
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [jsonData, setJsonData] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const validateTemplateShape = (templateId: string | string[] | undefined, value: unknown) => {
    if (!value || typeof value !== 'object') {
      throw new Error('Template JSON must be an object.')
    }

    const data = value as Record<string, unknown>

    if ('type' in data && 'test' in data) {
      throw new Error('Save only the inner test object. Remove the outer "type" and "test" wrapper before saving.')
    }

    if (typeof data.title !== 'string' || typeof data.durationMinutes !== 'number') {
      throw new Error('Template must include "title" and numeric "durationMinutes".')
    }

    if (templateId === 'listening') {
      const parts = data.parts as Record<string, unknown> | undefined
      if (!parts?.A || !parts?.B || !parts?.C) {
        throw new Error('Listening template must include parts A, B, and C.')
      }
    }

    if (templateId === 'structure') {
      const parts = data.parts as Record<string, unknown> | undefined
      if (!parts?.A || !parts?.B) {
        throw new Error('Structure template must include parts A and B.')
      }
    }

    if (templateId === 'reading') {
      if (!Array.isArray(data.passages)) {
        throw new Error('Reading template must include a passages array.')
      }
    }
  }

  useEffect(() => {
    async function fetchTemplate() {
      const { data, error } = await supabase
        .from('toefl_templates')
        .select('test_data')
        .eq('id', id)
        .single()

      if (error) {
        setError('Failed to load template')
      } else if (data) {
        setJsonData(JSON.stringify(data.test_data, null, 2))
      }
      setLoading(false)
    }

    fetchTemplate()
  }, [id, supabase])

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const parsedData = JSON.parse(jsonData)
      validateTemplateShape(id, parsedData)
      
      const { error: updateError } = await supabase
        .from('toefl_templates')
        .update({ 
          test_data: parsedData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)

      if (updateError) throw updateError
      
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid JSON format or database error'
      setError(message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto pb-32">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Link 
          href="/admin/toefl"
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold capitalize">Edit {id} Template</h1>
          <p className="text-gray-500 text-sm">Modify the questions and structure for this section.</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded-lg text-sm flex items-start gap-2">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-600 p-3 rounded-lg text-sm flex items-center gap-2">
            <svg className="w-5 h-5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            Template updated successfully!
          </div>
        )}

        {/* Editor Box */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[700px]">
          <div className="p-4 border-b bg-gray-50 flex justify-between items-center">
            <div className="text-xs font-mono text-gray-500 capitalize">JSON Content: {id}</div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-orange-700 transition disabled:opacity-50 flex items-center gap-2"
            >
              {saving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>

          <textarea
            value={jsonData}
            onChange={(e) => setJsonData(e.target.value)}
            spellCheck={false}
            className="flex-1 p-6 font-mono text-sm focus:outline-none resize-none bg-white text-slate-900 leading-relaxed min-h-[600px]"
            placeholder="{ ... }"
          />
        </div>
      </div>

      {/* Help Instructions */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700 flex items-start gap-3">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
        <div>
          <p className="font-semibold mb-1">Editing Tips:</p>
          <ul className="list-disc ml-4 space-y-1 opacity-80">
            <li>Ensure you add/edit questions in the correct array format.</li>
            <li>Double-check `audioUrl` links for Listening sections.</li>
            <li>The `correctAnswerIndex` is 0-based (0=A, 1=B, 2=C, 3=D).</li>
            <li>Passage content in Reading supports HTML like `&lt;p&gt;` and `&lt;strong&gt;`.</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
