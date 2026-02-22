import Link from 'next/link'
import type { Metadata } from 'next'
import { buildPageMetadata, buildFaqJsonLd } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Kursus Bahasa Inggris di Indonesia | IELTS, TOEFL, PTE, Business English',
  description: 'Kursus bahasa Inggris online untuk seluruh Indonesia. Program IELTS, TOEFL iBT/ITP, PTE Academic, Business English, dan General English dengan jadwal fleksibel.',
  path: '/id/kursus-bahasa-inggris-indonesia',
})

const faqs = [
  {
    question: 'Apakah kelas bisa diikuti dari seluruh Indonesia?',
    answer: 'Ya. Kelas dilakukan secara online dan bisa diikuti dari kota mana pun di Indonesia.',
  },
  {
    question: 'Apakah ada program khusus IELTS, TOEFL, dan PTE?',
    answer: 'Ada. Kamu bisa pilih program sesuai target tes dan deadline kamu.',
  },
  {
    question: 'Kalau jadwal saya sibuk, apakah tetap bisa ikut?',
    answer: 'Bisa. Jadwal kelas fleksibel dan bisa disesuaikan.',
  },
  {
    question: 'Apakah ada trial class?',
    answer: 'Ada konsultasi awal untuk memetakan level dan target belajar kamu.',
  },
  {
    question: 'Berapa lama sampai terlihat progres?',
    answer: 'Rata-rata progres sudah terasa dalam beberapa minggu jika belajar konsisten.',
  },
]

const faqJsonLd = buildFaqJsonLd(faqs)

export default function KursusBahasaInggrisIndonesiaPage() {
  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      <section className="rounded-2xl border border-[#08507f]/20 bg-gradient-to-br from-[#08507f]/10 to-white p-6 sm:p-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
          Kursus Bahasa Inggris di Indonesia untuk Target Akademik dan Karier
        </h1>
        <p className="mt-4 text-gray-600 text-lg leading-relaxed">
          Belajar English lebih terarah dengan program online untuk siswa, mahasiswa, dan profesional di seluruh
          Indonesia. Fokus pada hasil: skor tes meningkat, komunikasi lebih percaya diri, dan progres yang terukur.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <a
            href="https://wa.me/6282144223581?text=Halo%20Arik,%20saya%20ingin%20konsultasi%20gratis%20kursus%20bahasa%20Inggris."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-xl bg-[#08507f] px-5 py-3 text-sm font-semibold text-white hover:bg-[#063a5c]"
          >
            Konsultasi Gratis via WhatsApp
          </a>
          <Link
            href="/test-preparation"
            className="inline-flex items-center justify-center rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Lihat Program Kelas
          </Link>
        </div>
      </section>

      <section className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Kenapa Pilih English with Arik</h2>
          <ul className="space-y-2 text-gray-600">
            <li>Program terstruktur dan personal sesuai level dan target.</li>
            <li>Tutor berpengalaman dengan pendekatan praktis.</li>
            <li>Kelas online fleksibel untuk seluruh Indonesia.</li>
            <li>Progress tracking dan evaluasi berkala.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Program yang Tersedia</h2>
          <ul className="space-y-2 text-gray-600">
            <li>IELTS Preparation</li>
            <li>TOEFL iBT dan TOEFL ITP</li>
            <li>PTE Academic</li>
            <li>Business English</li>
            <li>General English</li>
          </ul>
        </div>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Siapa yang Cocok Join</h2>
        <ul className="space-y-2 text-gray-600">
          <li>Siswa SMA/mahasiswa yang mau persiapan tes English.</li>
          <li>Fresh graduate yang butuh skor English untuk beasiswa atau kerja.</li>
          <li>Profesional yang ingin komunikasi kerja lebih lancar.</li>
          <li>Siapa pun yang ingin belajar English secara konsisten dengan mentor.</li>
        </ul>
      </section>

      <section className="mt-10 rounded-xl border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Cara Belajar</h2>
        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
          <li>Konsultasi awal gratis untuk cek level dan target.</li>
          <li>Rencana belajar personal berdasarkan kebutuhan.</li>
          <li>Kelas rutin dan tugas praktik.</li>
          <li>Evaluasi berkala untuk update strategi.</li>
        </ol>
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

      <section className="mt-10 rounded-2xl bg-[#08507f] p-6 sm:p-8 text-white">
        <h2 className="text-2xl font-bold">Siap Naik Level Bahasa Inggris?</h2>
        <p className="mt-2 text-blue-100">
          Mulai dari konsultasi gratis dulu. Kita susun strategi yang realistis sesuai target kamu.
        </p>
        <a
          href="https://wa.me/6282144223581?text=Halo%20Arik,%20saya%20siap%20mulai%20kelas%20bahasa%20Inggris."
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center justify-center rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#08507f] hover:bg-blue-50"
        >
          Mulai Konsultasi Gratis
        </a>
      </section>
    </main>
  )
}
