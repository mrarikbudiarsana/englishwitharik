import Link from 'next/link'
import type { Metadata } from 'next'
import { buildFaqJsonLd, buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kursus PTE Academic Indonesia | Program Persiapan Online',
  description: 'Kursus PTE Academic online untuk peserta di Indonesia. Latihan intensif, strategi praktis, dan evaluasi detail untuk capai skor target.',
  path: '/id/kursus-pte-academic-indonesia',
})

const faqs = [
  {
    question: 'Apakah program ini cocok untuk pemula PTE?',
    answer: 'Ya. Program disesuaikan dengan level awal dan target skor peserta.',
  },
  {
    question: 'Apakah ada simulasi dan latihan rutin?',
    answer: 'Ada. Kamu akan mendapat latihan terstruktur sesuai format soal PTE Academic.',
  },
  {
    question: 'Apakah saya bisa ikut dari luar kota?',
    answer: 'Bisa. Program dirancang online untuk peserta dari seluruh Indonesia.',
  },
]

const faqJsonLd = buildFaqJsonLd(faqs)

export default function KursusPTEAcademicIndonesiaPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="rounded-2xl border border-[#08507f]/20 bg-gradient-to-br from-[#08507f]/10 to-white p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Kursus PTE Academic Indonesia dengan Pendekatan Praktis
        </h1>
        <p className="mt-4 text-gray-600 text-lg leading-relaxed">
          Program PTE Academic untuk peserta Indonesia yang butuh hasil cepat dan terukur. Fokus ke strategi menjawab,
          efisiensi waktu, dan latihan terstruktur.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/6282144223581?text=Halo%20Arik,%20saya%20ingin%20kursus%20PTE%20Academic."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#063a5c]"
          >
            Konsultasi PTE Gratis
          </a>
          <Link
            href="/pte-academic"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Lihat Program PTE
          </Link>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Keunggulan Program</h2>
        <ul className="space-y-2 text-gray-600">
          <li>Strategi section-by-section sesuai format PTE terbaru.</li>
          <li>Teknik menjawab cepat tanpa mengorbankan akurasi.</li>
          <li>Latihan intensif dengan evaluasi berkala.</li>
          <li>Pendampingan personal hingga mendekati jadwal tes.</li>
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
