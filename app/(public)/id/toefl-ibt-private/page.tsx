import Link from 'next/link'
import type { Metadata } from 'next'
import { buildFaqJsonLd, buildPageMetadata } from '@/lib/seo'
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  FileText,
  Gift,
  GraduationCap,
  Laptop,
  MessageSquare,
  Monitor,
  Target,
  TrendingUp,
  User,
  Video,
} from 'lucide-react'
import FAQ from '@/components/public/FAQ'

export const metadata: Metadata = buildPageMetadata({
  title: 'TOEFL iBT Private | Kelas 1-on-1 Online Mulai Rp1.000.000',
  description:
    'Persiapan TOEFL iBT private 1-on-1 via Google Meet. Pre-test & post-test full mock test, latihan soal, feedback personal, materi, dan rekaman kelas. Mulai Rp1.000.000 untuk 8 pertemuan. Free trial 30 menit.',
  path: '/id/toefl-ibt-private',
})

export const revalidate = 3600

const PORTAL_SIGNUP = 'https://portal.englishwitharik.com/signup'
const MY_TOEFL_IBT = 'https://toeflibt.englishwitharik.com'
const WA_FREE_TRIAL =
  'https://wa.me/6282144223581?text=Halo%20Arik%2C%20saya%20ingin%20mencoba%20Free%20Trial%2030%20menit%20TOEFL%20iBT%20Private.'

const reasons = [
  {
    icon: User,
    title: 'Private 1-on-1',
    body: [
      'Satu kelas hanya terdiri dari satu peserta dan satu tutor.',
      'Tidak perlu mengikuti kecepatan belajar peserta lain. Waktu pembelajaran dapat lebih difokuskan pada kemampuan dan bagian yang masih perlu kamu tingkatkan.',
      'Kamu juga memiliki lebih banyak kesempatan untuk bertanya, berlatih, dan mendapatkan feedback secara langsung.',
    ],
  },
  {
    icon: Target,
    title: 'Feedback Lebih Banyak & Personal',
    body: [
      'Setiap peserta memiliki kemampuan dan kesulitan yang berbeda.',
      'Karena kelas dilakukan secara 1-on-1, tutor dapat memberikan feedback yang lebih banyak dan spesifik dibandingkan kelas grup.',
      'Kamu dapat mengetahui bagian yang sudah baik, kesalahan yang masih sering dilakukan, serta kemampuan yang perlu menjadi fokus latihan berikutnya.',
    ],
  },
  {
    icon: Laptop,
    title: '100% Online via Google Meet',
    body: [
      'Seluruh kelas dilakukan secara online melalui Google Meet.',
      'Kamu bisa mengikuti kelas dari mana saja tanpa perlu datang ke tempat kursus.',
    ],
  },
]

const tutorPoints = [
  {
    icon: BookOpen,
    title: 'Mengikuti Workshop Pengajaran TOEFL',
    body: 'Tutor telah mengikuti workshop pengajaran TOEFL untuk format sebelumnya maupun format TOEFL terbaru. Dengan demikian, materi dan pembelajaran dapat terus disesuaikan dengan perkembangan TOEFL dan tidak hanya mengandalkan pendekatan dari format tes sebelumnya.',
  },
  {
    icon: GraduationCap,
    title: 'Pengalaman Mengajar TOEFL',
    body: 'Pengalaman mengajar TOEFL membantu tutor dalam mengidentifikasi kesulitan peserta dan menyesuaikan pembelajaran berdasarkan kemampuan masing-masing. Dengan format private, proses pembelajaran dapat dilakukan dengan lebih intensif karena seluruh sesi difokuskan pada satu peserta.',
  },
]

const scoreBreakdown = [
  { label: 'Reading', value: '6' },
  { label: 'Listening', value: '5.5' },
  { label: 'Writing', value: '6' },
  { label: 'Speaking', value: '5' },
]

const facilities = [
  {
    icon: ClipboardList,
    title: 'Pre-Test — Full Mock Test',
    body: 'Sebelum memulai pembelajaran, kamu akan mengikuti pre-test berupa full mock test TOEFL iBT. Pre-test membantu memberikan gambaran mengenai kemampuan awal sebelum mengikuti program.',
  },
  {
    icon: TrendingUp,
    title: 'Post-Test — Full Mock Test',
    body: 'Setelah menyelesaikan program, kamu akan kembali mengikuti full mock test sebagai post-test. Hasil pre-test dan post-test dapat digunakan untuk melihat perkembangan kemampuan selama mengikuti program.',
  },
  {
    icon: BookOpen,
    title: 'Banyak Latihan Soal TOEFL iBT',
    body: 'Selain full mock test, tersedia juga berbagai latihan soal TOEFL iBT yang dapat digunakan untuk belajar secara mandiri di luar jam kelas, terutama untuk Reading dan Listening.',
  },
  {
    icon: MessageSquare,
    title: 'Personal Feedback',
    body: 'Karena kelas dilakukan secara private, kamu mendapatkan kesempatan lebih besar untuk menerima feedback secara langsung dan personal dari tutor.',
  },
  {
    icon: Video,
    title: 'Rekaman Kelas',
    body: 'Kelas akan direkam sehingga kamu dapat menonton kembali penjelasan tutor setelah sesi selesai. Gunakan rekaman untuk mengulang materi atau mempelajari kembali bagian yang masih belum dipahami.',
  },
  {
    icon: FileText,
    title: 'Materi Pembelajaran',
    body: 'Materi yang digunakan selama program juga tersedia untuk mendukung pembelajaran dan latihan mandiri.',
  },
]

const steps = [
  {
    title: 'Buat Akun & Daftar',
    body: 'Buka portal.englishwitharik.com/signup, buat akun, dan lakukan pendaftaran TOEFL iBT Private melalui Portal English with Arik.',
  },
  {
    title: 'Terima Invoice',
    body: 'Setelah melakukan pendaftaran, kamu akan menerima invoice sesuai dengan paket yang dipilih.',
  },
  {
    title: 'Lakukan Pembayaran',
    body: 'Lakukan pelunasan invoice sesuai dengan informasi pembayaran yang diberikan.',
  },
  {
    title: 'Buat Akun My TOEFL iBT',
    body: 'Buat juga akun di toeflibt.englishwitharik.com. Akun ini akan digunakan untuk mengakses mock test dan latihan soal selama proses persiapan.',
  },
  {
    title: 'Kerjakan Pre-Test',
    body: 'Sebelum pembelajaran dimulai, kerjakan full mock test sebagai pre-test untuk mendapatkan gambaran kemampuan awalmu.',
  },
  {
    title: 'Tentukan Jadwal',
    body: 'Pilih sistem Regular Schedule atau Flexible Schedule. Jika memilih Flexible Schedule, kamu dapat booking sendiri kelas berdasarkan slot yang tersedia melalui platform.',
  },
  {
    title: 'Mulai Kelas Private',
    body: 'Ikuti kelas 1-on-1 bersama tutor melalui Google Meet. Setiap sesi berlangsung selama 60 menit.',
  },
  {
    title: 'Latihan & Dapatkan Feedback',
    body: 'Gunakan latihan soal yang tersedia untuk belajar secara mandiri dan dapatkan feedback personal selama sesi bersama tutor.',
  },
  {
    title: 'Kerjakan Post-Test',
    body: 'Setelah menyelesaikan program, kerjakan full mock test kembali sebagai post-test untuk melihat perkembangan kemampuanmu.',
  },
]

const packageBenefits = (sessions: number) => [
  `${sessions}× kelas private 1-on-1`,
  'Pre-test full mock test',
  'Post-test full mock test',
  'Latihan soal TOEFL iBT',
  'Personal feedback',
  'Materi pembelajaran',
  'Rekaman kelas',
  'Flexible / regular schedule',
]

const packages = [
  {
    sessions: 8,
    name: '8 Pertemuan',
    price: 'Rp1.000.000',
    meta: '8 sesi • Total 8 jam',
    perSession: 'Rp125.000 / pertemuan',
    validity: '3 bulan',
    cta: 'Daftar 8 Pertemuan',
  },
  {
    sessions: 16,
    name: '16 Pertemuan',
    price: 'Rp2.000.000',
    meta: '16 sesi • Total 16 jam',
    perSession: 'Rp125.000 / pertemuan',
    validity: '6 bulan',
    cta: 'Daftar 16 Pertemuan',
  },
  {
    sessions: 24,
    name: '24 Pertemuan',
    price: 'Rp3.000.000',
    meta: '24 sesi • Total 24 jam',
    perSession: 'Rp125.000 / pertemuan',
    validity: '9 bulan',
    cta: 'Daftar 24 Pertemuan',
  },
]

const trialBenefits = [
  'Bertemu langsung dengan tutor',
  'Mencoba pembelajaran private 1-on-1',
  'Mengenal metode pembelajaran',
  'Berdiskusi mengenai persiapan TOEFL iBT',
  'Bertanya mengenai program',
  'Menentukan apakah kelas ini cocok untukmu',
]

const faqs = [
  {
    question: 'Apakah kelasnya benar-benar private?',
    answer: 'Ya. Kelas menggunakan sistem 1-on-1, yaitu satu peserta belajar bersama satu tutor.',
  },
  {
    question: 'Berapa lama satu pertemuan?',
    answer: 'Setiap pertemuan berlangsung selama 60 menit. Untuk free trial, durasi kelas adalah 30 menit.',
  },
  {
    question: 'Apakah kelas dilakukan secara online?',
    answer: 'Ya. Seluruh kelas dilakukan secara online melalui Google Meet.',
  },
  {
    question: 'Apakah jadwal harus selalu sama setiap minggu?',
    answer:
      'Tidak. Kamu dapat memilih Regular Schedule atau Flexible Schedule. Dengan Flexible Schedule, kamu dapat booking sendiri kelas berdasarkan slot tutor yang tersedia.',
  },
  {
    question: 'Kapan paling lambat saya bisa booking kelas?',
    answer: 'Untuk Flexible Schedule, booking dapat dilakukan maksimal H-12 jam sebelum kelas.',
  },
  {
    question: 'Apakah jadwal bisa di-reschedule?',
    answer: 'Ya. Tersedia opsi reschedule sesuai dengan ketentuan program.',
  },
  {
    question: 'Berapa lama masa berlaku paket?',
    answer:
      'Masa berlaku disesuaikan dengan paket yang dipilih: 8 pertemuan — 3 bulan, 16 pertemuan — 6 bulan, 24 pertemuan — 9 bulan. Seluruh sesi perlu digunakan selama masa berlaku paket.',
  },
  {
    question: 'Apakah ada pre-test dan post-test?',
    answer:
      'Ya. Kamu akan mendapatkan pre-test dan post-test berupa full mock test TOEFL iBT melalui platform My TOEFL iBT.',
  },
  {
    question: 'Seperti apa mock test-nya?',
    answer:
      'Mock test tersedia melalui My TOEFL iBT dan dirancang untuk memberikan pengalaman pengerjaan yang mendekati pengalaman tes TOEFL iBT sebenarnya.',
  },
  {
    question: 'Apakah ada latihan di luar jam kelas?',
    answer:
      'Ya. Tersedia berbagai latihan soal melalui platform My TOEFL iBT, terutama untuk Reading dan Listening, yang dapat digunakan untuk latihan mandiri.',
  },
  {
    question: 'Apa perbedaan Portal dan My TOEFL iBT?',
    answer:
      'Portal English with Arik digunakan untuk pendaftaran dan pengelolaan kelas, termasuk booking untuk Flexible Schedule. My TOEFL iBT digunakan untuk pre-test, post-test, full mock test, dan latihan soal TOEFL iBT.',
  },
  {
    question: 'Bagaimana proses pembayarannya?',
    answer:
      'Setelah melakukan pendaftaran melalui Portal English with Arik, kamu akan menerima invoice untuk dilunasi.',
  },
  {
    question: 'Apakah saya mendapatkan rekaman kelas?',
    answer:
      'Ya. Kamu akan mendapatkan rekaman kelas sehingga dapat mempelajari kembali penjelasan dan materi setelah sesi selesai.',
  },
  {
    question: 'Saya belum pernah belajar TOEFL. Apakah bisa ikut?',
    answer:
      'Bisa. Program ini terbuka untuk peserta TOEFL iBT dengan berbagai tingkat kemampuan. Pre-test dapat digunakan untuk mendapatkan gambaran kemampuan awal sebelum mengikuti pembelajaran.',
  },
  {
    question: 'Apakah saya bisa fokus pada skill tertentu?',
    answer:
      'Bisa. Karena pembelajaran dilakukan secara 1-on-1, kelas dapat lebih disesuaikan dengan kebutuhan dan kemampuan peserta.',
  },
  {
    question: 'Apakah harus langsung membeli paket?',
    answer:
      'Tidak. Kamu bisa mencoba Free Trial selama 30 menit secara GRATIS terlebih dahulu sebelum memutuskan untuk mengambil paket.',
  },
]

const faqJsonLd = buildFaqJsonLd(faqs)

const summaryHighlights = [
  { icon: User, label: 'Private 1-on-1' },
  { icon: Calendar, label: 'Flexible / Regular Schedule' },
  { icon: ClipboardList, label: 'Pre-Test & Post-Test Full Mock Test' },
  { icon: Monitor, label: 'Platform Latihan TOEFL iBT' },
  { icon: BookOpen, label: 'Banyak Latihan Reading & Listening' },
  { icon: MessageSquare, label: 'Personal Feedback' },
  { icon: Video, label: 'Rekaman Kelas' },
  { icon: FileText, label: 'Materi Pembelajaran' },
  { icon: Award, label: 'Mulai dari Rp1.000.000' },
]

export default function TOEFLIBTPrivatePage() {
  return (
    <div className="bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#08507f]/5 to-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12 items-center">
            <div className="lg:col-span-3">
              <span className="inline-flex items-center gap-2 bg-[#08507f]/10 text-[#08507f] text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                <User className="w-4 h-4" />
                TOEFL iBT Private
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                Persiapan TOEFL iBT <span className="text-[#08507f]">1-on-1</span> yang Lebih Personal &amp; Fleksibel
              </h1>
              <div className="space-y-4 text-lg text-gray-600 leading-relaxed mb-8">
                <p>
                  Persiapkan TOEFL iBT melalui kelas{' '}
                  <strong className="font-semibold text-gray-900">private 1-on-1 bersama tutor melalui Google Meet</strong>.
                </p>
                <p>
                  Pembelajaran dapat lebih difokuskan pada kebutuhan dan kemampuanmu. Kamu juga mendapatkan{' '}
                  <strong className="font-semibold text-gray-900">
                    pre-test &amp; post-test berupa full mock test, latihan soal TOEFL iBT, feedback personal, materi, serta
                    rekaman kelas
                  </strong>
                  .
                </p>
                <p>
                  Punya jadwal kuliah atau pekerjaan yang padat? Kamu bisa memilih{' '}
                  <strong className="font-semibold text-gray-900">Flexible Schedule</strong> atau{' '}
                  <strong className="font-semibold text-gray-900">Regular Schedule</strong> sesuai kebutuhan.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <a
                  href={WA_FREE_TRIAL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold text-lg py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Coba Free Trial 30 Menit
                </a>
                <a
                  href={PORTAL_SIGNUP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border-2 border-gray-100 hover:border-[#08507f]/30 text-gray-700 font-semibold text-lg py-4 px-8 rounded-2xl transition-all hover:bg-gray-50"
                >
                  Daftar TOEFL iBT Private
                </a>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
                <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">Mulai dari</p>
                <p className="mt-2 text-4xl font-bold text-[#08507f]">Rp1.000.000</p>
                <p className="mt-1 text-gray-600">untuk 8 pertemuan</p>

                <div className="mt-6 space-y-3">
                  {[
                    'Kelas private 1-on-1 via Google Meet',
                    'Setiap sesi 60 menit',
                    'Pre-test & post-test full mock test',
                    'Flexible atau regular schedule',
                  ].map(item => (
                    <div key={item} className="flex items-start gap-3 text-gray-700">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-[#08507f]/5 border border-[#08507f]/15 p-4">
                  <p className="flex items-start gap-2 text-sm text-gray-700">
                    <Gift className="w-5 h-5 text-[#e07b39] shrink-0" />
                    <span>
                      Belum yakin? Coba{' '}
                      <strong className="font-semibold text-gray-900">Free Trial 30 Menit — GRATIS</strong>.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kenapa Pilih */}
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Kenapa Pilih TOEFL iBT Private?</h2>
            <p className="text-lg text-gray-600">
              Pembelajaran yang difokuskan sepenuhnya pada satu peserta, dengan jadwal yang bisa kamu sesuaikan.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reasons.map(reason => (
              <div
                key={reason.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#08507f]/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#08507f]/5 rounded-xl flex items-center justify-center mb-4">
                  <reason.icon className="w-6 h-6 text-[#08507f]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{reason.title}</h3>
                <div className="space-y-3 text-gray-600 leading-relaxed">
                  {reason.body.map(paragraph => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Jadwal */}
          <div className="mt-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="bg-[#08507f] text-white p-6 sm:p-8">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6" />
                <h3 className="text-2xl font-bold">Jadwal Flexible atau Regular</h3>
              </div>
              <p className="mt-2 text-blue-100">Pilih sistem belajar yang paling sesuai dengan aktivitasmu.</p>
            </div>
            <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100 bg-white">
              <div className="p-6 sm:p-8">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Flexible Schedule</h4>
                <div className="space-y-3 text-gray-600 leading-relaxed">
                  <p>Booking sendiri jadwal kelas melalui platform berdasarkan slot tutor yang tersedia.</p>
                  <p>
                    Booking dapat dilakukan maksimal{' '}
                    <strong className="font-semibold text-gray-900">H-12 jam sebelum kelas</strong>.
                  </p>
                  <p>
                    Ada perubahan rencana? Tersedia juga opsi{' '}
                    <strong className="font-semibold text-gray-900">reschedule sesuai ketentuan program</strong>.
                  </p>
                </div>
              </div>
              <div className="p-6 sm:p-8">
                <h4 className="text-lg font-bold text-gray-900 mb-3">Regular Schedule</h4>
                <div className="space-y-3 text-gray-600 leading-relaxed">
                  <p>Lebih nyaman dengan jadwal yang konsisten?</p>
                  <p>
                    Kamu dapat memilih <strong className="font-semibold text-gray-900">Regular Schedule</strong> sehingga
                    kelas berlangsung secara rutin pada hari dan jam yang sudah ditentukan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tutor */}
      <section className="py-20 lg:py-28 bg-[#08507f]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Belajar Bersama Tutor yang Berpengalaman Mengajar TOEFL
            </h2>
            <p className="text-lg text-gray-600">
              Program TOEFL iBT Private dibimbing oleh tutor yang memiliki pengalaman mengajar TOEFL serta terus mengikuti
              perkembangan format tes dan pengajarannya.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
              <div className="w-12 h-12 bg-[#08507f]/5 rounded-xl flex items-center justify-center mb-4">
                <Target className="w-6 h-6 text-[#08507f]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">TOEFL Score 5.5</h3>
              <p className="mt-2 text-sm text-gray-500">Dengan pencapaian:</p>
              <dl className="mt-4 grid grid-cols-2 gap-3">
                {scoreBreakdown.map(item => (
                  <div key={item.label} className="rounded-xl bg-[#08507f]/5 px-4 py-3">
                    <dt className="text-xs font-medium uppercase tracking-wide text-gray-500">{item.label}</dt>
                    <dd className="mt-1 text-2xl font-bold text-[#08507f]">{item.value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-5 text-gray-600 leading-relaxed">
                Pengalaman mengikuti tes secara langsung membantu tutor memahami proses persiapan serta berbagai tantangan
                yang dapat dihadapi peserta saat menghadapi tes.
              </p>
            </div>

            {tutorPoints.map(point => (
              <div key={point.title} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <div className="w-12 h-12 bg-[#08507f]/5 rounded-xl flex items-center justify-center mb-4">
                  <point.icon className="w-6 h-6 text-[#08507f]" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{point.title}</h3>
                <p className="text-gray-600 leading-relaxed">{point.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fasilitas */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Fasilitas yang Kamu Dapatkan</h2>
            <p className="text-lg text-gray-600">
              Semua paket TOEFL iBT Private sudah dilengkapi dengan fasilitas untuk mendukung proses persiapanmu.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {facilities.map(item => (
              <div
                key={item.title}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#08507f]/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-[#08507f]/5 rounded-xl flex items-center justify-center mb-4">
                  <item.icon className="w-6 h-6 text-[#08507f]" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>

          {/* Simulasi via platform */}
          <div className="mt-8 rounded-3xl border border-[#08507f]/15 bg-[#08507f]/5 p-6 sm:p-10">
            <div className="grid lg:grid-cols-3 gap-8 items-center">
              <div className="lg:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <Monitor className="w-6 h-6 text-[#08507f]" />
                  <h3 className="text-2xl font-bold text-gray-900">Simulasi TOEFL iBT melalui Platform</h3>
                </div>
                <p className="text-gray-600 leading-relaxed">
                  Pre-test dan post-test dilakukan melalui platform{' '}
                  <strong className="font-semibold text-[#08507f] break-words">toeflibt.englishwitharik.com</strong>. Platform My TOEFL
                  iBT dirancang untuk memberikan pengalaman mengerjakan mock test yang mendekati pengalaman tes TOEFL iBT
                  sebenarnya.
                </p>
                <p className="mt-3 text-gray-600 leading-relaxed">
                  Dengan demikian, kamu tidak hanya berlatih mengerjakan soal, tetapi juga dapat membiasakan diri dengan
                  pengalaman mengerjakan tes melalui komputer.
                </p>
              </div>
              <div className="lg:justify-self-end">
                <a
                  href={MY_TOEFL_IBT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-full lg:w-auto bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold py-4 px-8 rounded-2xl transition-colors shadow-lg"
                >
                  Buat Akun My TOEFL iBT <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dua Platform */}
      <section className="py-20 lg:py-28 bg-gray-50 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Dua Platform untuk Mendukung Persiapanmu</h2>
            <p className="text-lg text-gray-600">
              Selama mengikuti TOEFL iBT Private, kamu akan menggunakan dua platform dengan fungsi yang berbeda.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
              <div className="w-12 h-12 bg-[#08507f]/5 rounded-xl flex items-center justify-center mb-4">
                <CalendarClock className="w-6 h-6 text-[#08507f]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">Portal English with Arik</h3>
              <p className="mt-1 font-semibold text-[#08507f] break-words">portal.englishwitharik.com</p>
              <div className="mt-4 space-y-3 text-gray-600 leading-relaxed flex-grow">
                <p>
                  Portal digunakan untuk{' '}
                  <strong className="font-semibold text-gray-900">pendaftaran dan pengelolaan kelas</strong>.
                </p>
                <p>
                  Untuk membuat akun dan mendaftar:{' '}
                  <strong className="font-semibold text-gray-900 break-words">portal.englishwitharik.com/signup</strong>
                </p>
                <p>
                  Melalui sistem Flexible Schedule, kamu juga dapat memilih dan booking sendiri jadwal berdasarkan slot yang
                  tersedia.
                </p>
              </div>
              <a
                href={PORTAL_SIGNUP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center w-full py-3 bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold rounded-xl transition-colors"
              >
                Buat Akun &amp; Daftar
              </a>
            </div>

            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
              <div className="w-12 h-12 bg-[#08507f]/5 rounded-xl flex items-center justify-center mb-4">
                <ClipboardList className="w-6 h-6 text-[#08507f]" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">My TOEFL iBT</h3>
              <p className="mt-1 font-semibold text-[#08507f] break-words">toeflibt.englishwitharik.com</p>
              <div className="mt-4 flex-grow">
                <p className="text-gray-600">Platform ini digunakan untuk:</p>
                <ul className="mt-3 space-y-2">
                  {[
                    'Pre-test',
                    'Post-test',
                    'Full mock test',
                    'Latihan Reading',
                    'Latihan Listening',
                    'Latihan soal TOEFL iBT lainnya',
                  ].map(item => (
                    <li key={item} className="flex items-start gap-2 text-gray-600">
                      <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-gray-600 leading-relaxed">
                  Buat akun di platform ini agar kamu dapat mengakses fasilitas latihan dan simulasi TOEFL iBT.
                </p>
              </div>
              <a
                href={MY_TOEFL_IBT}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center w-full py-3 border border-[#08507f]/20 text-[#08507f] font-semibold rounded-xl hover:bg-[#08507f] hover:text-white transition-colors"
              >
                Buat Akun My TOEFL iBT
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Cara Memulai */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Bagaimana Cara Memulainya?</h2>
            <p className="text-lg text-gray-600">Sembilan langkah dari pendaftaran sampai post-test.</p>
          </div>

          <ol className="space-y-6">
            {steps.map((step, index) => (
              <li key={step.title} className="flex gap-5">
                <div className="shrink-0 w-11 h-11 rounded-full bg-[#08507f] text-white font-bold flex items-center justify-center">
                  {index + 1}
                </div>
                <div className="pt-1.5">
                  <h3 className="text-lg font-bold text-gray-900">{step.title}</h3>
                  <p className="mt-1 text-gray-600 leading-relaxed break-words">{step.body}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-12 text-center">
            <a
              href={PORTAL_SIGNUP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold text-lg py-4 px-10 rounded-2xl transition-colors shadow-lg"
            >
              Daftar Sekarang <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Paket */}
      <section className="py-20 lg:py-28 bg-[#08507f]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pilih Paket TOEFL iBT Private</h2>
            <p className="text-lg text-gray-600">
              Semua sesi berlangsung selama 60 menit dan dilakukan secara private 1-on-1 melalui Google Meet.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {packages.map(pkg => (
              <div
                key={pkg.name}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col"
              >
                <div className="bg-[#08507f] p-6 text-white">
                  <h3 className="text-xl font-bold">{pkg.name}</h3>
                  <p className="mt-3 text-3xl font-bold">{pkg.price}</p>
                  <p className="mt-2 text-sm text-blue-100">{pkg.meta}</p>
                  <p className="text-sm text-blue-100">{pkg.perSession}</p>
                </div>
                <div className="p-8 flex-grow flex flex-col">
                  <p className="text-sm font-semibold text-gray-900 mb-5">Masa berlaku: {pkg.validity}</p>
                  <ul className="space-y-2.5 flex-grow">
                    {packageBenefits(pkg.sessions).map(benefit => (
                      <li key={benefit} className="flex items-start gap-2 text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{benefit}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href={PORTAL_SIGNUP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-8 inline-flex items-center justify-center w-full py-3 border border-[#08507f]/20 text-[#08507f] font-semibold rounded-xl hover:bg-[#08507f] hover:text-white transition-colors"
                  >
                    {pkg.cta}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Free Trial */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-gray-100 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-br from-[#08507f] to-[#063a5c] text-white p-8 sm:p-12 text-center">
              <span className="inline-flex items-center gap-2 bg-white/15 text-white text-sm font-bold px-4 py-1.5 rounded-full mb-5">
                <Gift className="w-4 h-4" />
                Belum Yakin? Coba Dulu Gratis
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold">Free Trial TOEFL iBT Private — 30 Menit</h2>
              <p className="mt-4 text-lg text-blue-100 max-w-2xl mx-auto">
                Kamu tidak perlu langsung mengambil paket. Coba terlebih dahulu kelas TOEFL iBT Private selama 30 menit
                secara GRATIS untuk mengetahui apakah metode pembelajarannya sesuai dengan kebutuhanmu.
              </p>
            </div>

            <div className="p-8 sm:p-12 bg-white">
              <p className="font-semibold text-gray-900 mb-5">Free trial dapat digunakan untuk:</p>
              <ul className="grid sm:grid-cols-2 gap-3">
                {trialBenefits.map(benefit => (
                  <li key={benefit} className="flex items-start gap-2 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-col sm:flex-row flex-wrap sm:items-center sm:justify-between gap-5 rounded-2xl bg-[#08507f]/5 border border-[#08507f]/15 p-6">
                <p className="text-lg font-bold text-gray-900">30 Menit • Private 1-on-1 • GRATIS</p>
                <a
                  href={WA_FREE_TRIAL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold py-3.5 px-8 rounded-2xl transition-colors shadow-lg shrink-0"
                >
                  Coba Free Trial <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-gray-50 border-y border-gray-100">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <FAQ items={faqs} />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">Siap Memulai Persiapan TOEFL iBT?</h2>
            <p className="text-lg text-gray-600">
              Persiapkan TOEFL iBT dengan pembelajaran yang lebih personal dan fleksibel.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-14">
            {summaryHighlights.map(item => (
              <div
                key={item.label}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white shadow-sm px-4 py-3.5"
              >
                <item.icon className="w-5 h-5 text-[#08507f] shrink-0" />
                <span className="text-gray-700 font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-3xl border border-gray-100 shadow-sm p-8 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900">Mau coba dulu?</h3>
              <p className="mt-1 text-lg font-semibold text-[#08507f]">Free Trial 30 Menit — GRATIS</p>
              <p className="mt-3 text-gray-600 leading-relaxed flex-grow">
                Coba kelasnya terlebih dahulu sebelum menentukan paket yang paling sesuai untukmu.
              </p>
              <a
                href={WA_FREE_TRIAL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center w-full py-3.5 border border-[#08507f]/20 text-[#08507f] font-semibold rounded-2xl hover:bg-[#08507f] hover:text-white transition-colors"
              >
                Coba Free Trial
              </a>
            </div>

            <div className="rounded-3xl bg-[#08507f] text-white shadow-lg p-8 flex flex-col">
              <h3 className="text-xl font-bold">Sudah Siap Mulai?</h3>
              <p className="mt-3 text-blue-100 leading-relaxed flex-grow">
                Buat akun dan lakukan pendaftaran melalui Portal English with Arik. Setelah pendaftaran dilakukan, invoice
                akan dikirimkan untuk dilunasi.
              </p>
              <a
                href={PORTAL_SIGNUP}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex items-center justify-center w-full py-3.5 bg-white text-[#08507f] font-bold rounded-2xl hover:bg-gray-100 transition-colors"
              >
                Daftar TOEFL iBT Private
              </a>
            </div>
          </div>

          <div className="mt-6 rounded-2xl bg-gray-50 border border-gray-100 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <p className="text-gray-600">
              Setelah mendaftar, jangan lupa membuat akun{' '}
              <strong className="font-semibold text-gray-900">My TOEFL iBT</strong> untuk mengakses pre-test, post-test, dan
              latihan soal.
            </p>
            <a
              href={MY_TOEFL_IBT}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center shrink-0 py-3 px-6 border border-[#08507f]/20 text-[#08507f] font-semibold rounded-xl hover:bg-[#08507f] hover:text-white transition-colors"
            >
              Buat Akun My TOEFL iBT
            </a>
          </div>

          <p className="mt-10 text-center text-sm text-gray-500">
            Ingin melihat seluruh program TOEFL iBT?{' '}
            <Link href="/toefl-ibt" className="text-[#08507f] font-medium hover:underline">
              Lihat halaman TOEFL iBT
            </Link>
          </p>
        </div>
      </section>
    </div>
  )
}
