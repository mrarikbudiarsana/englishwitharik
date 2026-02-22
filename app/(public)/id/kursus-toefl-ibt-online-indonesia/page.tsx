import Link from 'next/link'
import type { Metadata } from 'next'
import { buildFaqJsonLd, buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kursus TOEFL iBT Online Indonesia | Capai Skor Target',
  description: 'Kursus TOEFL iBT online untuk peserta di Indonesia. Materi terstruktur, strategi per section, dan latihan intensif untuk capai skor target.',
  path: '/id/kursus-toefl-ibt-online-indonesia',
})

const faqs = [
  {
    question: 'Apakah kelas TOEFL iBT ini full online?',
    answer: 'Ya. Semua sesi berjalan online dan bisa diikuti dari seluruh Indonesia.',
  },
  {
    question: 'Apakah ada fokus per section TOEFL iBT?',
    answer: 'Ada. Program membahas Reading, Listening, Speaking, dan Writing dengan strategi terpisah.',
  },
  {
    question: 'Apakah saya akan dapat latihan dan evaluasi rutin?',
    answer: 'Ya. Tersedia latihan terstruktur dan evaluasi berkala agar progres terukur.',
  },
]

const faqJsonLd = buildFaqJsonLd(faqs)

export default function KursusTOEFLIBTOnlineIndonesiaPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="rounded-2xl border border-[#08507f]/20 bg-gradient-to-br from-[#08507f]/10 to-white p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Kursus TOEFL iBT Online Indonesia untuk Skor Target
        </h1>
        <p className="mt-4 text-gray-600 text-lg leading-relaxed">
          Program persiapan TOEFL iBT dengan pendekatan praktis. Kelas online fleksibel untuk peserta di seluruh
          Indonesia dengan target skor yang jelas.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/6282144223581?text=Halo%20Arik,%20saya%20ingin%20kursus%20TOEFL%20iBT%20online."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#063a5c]"
          >
            Mulai Konsultasi TOEFL iBT
          </a>
          <Link
            href="/toefl-ibt"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Lihat Program TOEFL iBT
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fokus Program</h2>
        <ul className="space-y-2 text-gray-600">
          <li>Strategi Reading dan manajemen waktu.</li>
          <li>Latihan Listening dengan pola soal TOEFL iBT.</li>
          <li>Template Speaking dan Writing untuk jawaban lebih terstruktur.</li>
          <li>Evaluasi progres berdasarkan target skor.</li>
        </ul>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">FAQ</h2>
        <div className="space-y-3">
          {faqs.map(item => (
            <details key={item.question} className="rounded-lg border border-gray-100 p-4">
              <summary className="cursor-pointer font-semibold text-gray-800">{item.question}</summary>
              <p className="mt-2 text-gray-600">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>
    </main>
  )
}
