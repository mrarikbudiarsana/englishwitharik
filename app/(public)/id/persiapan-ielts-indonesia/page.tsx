import Link from 'next/link'
import type { Metadata } from 'next'
import { buildFaqJsonLd, buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Persiapan IELTS di Indonesia | Kelas Online dan Privat',
  description: 'Program persiapan IELTS untuk seluruh Indonesia. Fokus ke Listening, Reading, Writing, dan Speaking dengan strategi band score dan feedback personal.',
  path: '/id/persiapan-ielts-indonesia',
})

const faqs = [
  {
    question: 'Apakah program ini cocok untuk pemula IELTS?',
    answer: 'Ya. Program dimulai dari evaluasi level agar materi dan strategi sesuai kemampuan awal kamu.',
  },
  {
    question: 'Apakah ada latihan Writing dan Speaking dengan feedback?',
    answer: 'Ada. Kamu akan mendapat feedback detail untuk memperbaiki struktur jawaban, grammar, dan coherence.',
  },
  {
    question: 'Berapa lama persiapan IELTS yang ideal?',
    answer: 'Tergantung level awal dan target band score. Rata-rata 1 sampai 3 bulan untuk progres yang stabil.',
  },
]

const faqJsonLd = buildFaqJsonLd(faqs)

export default function PersiapanIELTSIndonesiaPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="rounded-2xl border border-[#08507f]/20 bg-gradient-to-br from-[#08507f]/10 to-white p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Persiapan IELTS di Indonesia dengan Program Terstruktur
        </h1>
        <p className="mt-4 text-gray-600 text-lg leading-relaxed">
          Program IELTS online untuk siswa dan profesional di seluruh Indonesia. Fokus pada strategi tiap section,
          latihan terarah, dan evaluasi berkala untuk capai target band score.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/6282144223581?text=Halo%20Arik,%20saya%20ingin%20program%20persiapan%20IELTS."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#063a5c]"
          >
            Konsultasi IELTS Gratis
          </a>
          <Link
            href="/ielts-preparation"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Lihat Halaman IELTS
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Yang Kamu Dapatkan</h2>
        <ul className="space-y-2 text-gray-600">
          <li>Strategi Listening, Reading, Writing, dan Speaking.</li>
          <li>Evaluasi Writing Task 1 dan Task 2 dengan feedback detail.</li>
          <li>Latihan speaking simulation dengan koreksi langsung.</li>
          <li>Rencana belajar mingguan sesuai deadline tes.</li>
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
