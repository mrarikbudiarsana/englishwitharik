'use client'

export interface AudioConfig {
  src: string
  title?: string
  transcript?: string
}

interface AudioBlockProps {
  config: AudioConfig
}

export default function AudioBlock({ config }: AudioBlockProps) {
  return (
    <section className="not-prose my-8 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6">
      {config.title && <h3 className="text-lg font-semibold text-slate-900">{config.title}</h3>}
      <audio className="mt-3 w-full" controls preload="metadata" src={config.src}>
        Your browser does not support the audio element.
      </audio>
      {config.transcript && (
        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
          <summary className="cursor-pointer text-sm font-medium text-slate-700">Show transcript</summary>
          <p className="mt-2 whitespace-pre-line text-sm text-slate-600">{config.transcript}</p>
        </details>
      )}
    </section>
  )
}
