import Link from 'next/link'
import type { Metadata } from 'next'
import { buildFaqJsonLd, buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kursus Business English Indonesia | English untuk Karier',
  description: 'Kursus Business English online untuk profesional di Indonesia. Fokus pada email, meeting, presentasi, dan komunikasi kerja internasional.',
  path: '/id/kursus-business-english-indonesia',
})

const faqs = [
  {
    question: 'Apa materi utama Business English?',
    answer: 'Materi utama meliputi email profesional, meeting, presentasi, negosiasi, dan komunikasi lintas tim.',
  },
  {
    question: 'Apakah cocok untuk karyawan dengan jadwal padat?',
    answer: 'Ya. Jadwal kelas fleksibel dan dapat disesuaikan dengan jam kerja.',
  },
  {
    question: 'Apakah ada latihan praktik real case?',
    answer: 'Ada. Sesi dirancang dengan contoh situasi kerja agar langsung bisa diterapkan.',
  },
]

const faqJsonLd = buildFaqJsonLd(faqs)

export default function KursusBusinessEnglishIndonesiaPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="rounded-2xl border border-[#08507f]/20 bg-gradient-to-br from-[#08507f]/10 to-white p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Kursus Business English Indonesia untuk Profesional
        </h1>
        <p className="mt-4 text-gray-600 text-lg leading-relaxed">
          Tingkatkan komunikasi kerja dalam bahasa Inggris secara praktis. Program online untuk profesional di seluruh
          Indonesia dengan fokus pada kebutuhan kerja nyata.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/6282144223581?text=Halo%20Arik,%20saya%20ingin%20kelas%20Business%20English."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#063a5c]"
          >
            Konsultasi Business English
          </a>
          <Link
            href="/business-english"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Lihat Program Business English
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Fokus Pembelajaran</h2>
        <ul className="space-y-2 text-gray-600">
          <li>Menulis email profesional yang jelas dan efektif.</li>
          <li>Berbicara percaya diri saat meeting dan diskusi.</li>
          <li>Presentasi kerja yang terstruktur dan meyakinkan.</li>
          <li>Komunikasi lintas budaya untuk tim global.</li>
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
