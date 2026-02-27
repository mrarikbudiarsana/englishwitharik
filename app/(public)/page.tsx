import { createClient } from '@/lib/supabase/server'
import PostCard from '@/components/public/PostCard'
import TestimonialsCarousel from '@/components/public/TestimonialsCarousel'
import StudentLocationsMap from '@/components/public/StudentLocationsMap'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import {
  BookOpen, Briefcase, Target, Building2,
  GraduationCap, Library, Video, Calendar, DollarSign,
  MapPin, Phone, Clock, MessageCircle, Star, Quote,
  ChevronRight, ArrowRight, CheckCircle2,
  FileText, BarChart3, Globe, Trophy
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'English with Arik — Your Gateway to Global Success',
  description: 'Learn English in an effective and fun way! Professional tutoring for IELTS, TOEFL, PTE, Business English & General English with I Putu Arik Budiarsana based in Bali, Indonesia.',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'English with Arik — Your Gateway to Global Success',
    description: 'Learn English in an effective and fun way! Professional tutoring for IELTS, TOEFL, PTE, Business English & General English.',
    url: '/',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'English with Arik — Your Gateway to Global Success',
    description: 'Learn English in an effective and fun way! Professional tutoring for IELTS, TOEFL, PTE, Business English & General English.',
  },
}

export const revalidate = 60

const HERO_IMAGE_URL = 'https://res.cloudinary.com/english-tests-platform/image/upload/f_auto,q_auto,dpr_auto,w_1080/v1771332153/untitled-design-47_zrmjxa.webp'
const HERO_POSTER_URL = 'https://res.cloudinary.com/english-tests-platform/image/upload/f_auto,q_auto,dpr_auto,w_900/v1771332153/untitled-design-47_zrmjxa.webp'

const courses = [
  {
    title: 'General English',
    href: '/general-english',
    icon: <BookOpen className="w-8 h-8 text-[#08507f]" />,
    desc: 'Build a strong foundation in English for all proficiency levels. Perfect for everyday communication.',
  },
  {
    title: 'Business English',
    href: '/business-english',
    icon: <Briefcase className="w-8 h-8 text-[#08507f]" />,
    desc: 'Master professional communication skills for the workplace, meetings, and presentations.',
  },
  {
    title: 'Test Preparation',
    href: '/test-preparation',
    icon: <Target className="w-8 h-8 text-[#08507f]" />,
    desc: 'Comprehensive preparation for IELTS, TOEFL iBT/ITP, PTE Academic, TOEIC, CELPIP, and CAEL.',
  },
  {
    title: 'English for Specific Purposes',
    href: '/contact',
    icon: <Building2 className="w-8 h-8 text-[#08507f]" />,
    desc: 'Industry-tailored instruction for tourism, hospitality, healthcare, and other specialized fields.',
  },
]

const whyChooseUs = [
  {
    icon: <GraduationCap className="w-6 h-6 text-[#08507f]" />,
    title: 'Experienced & Qualified Teacher',
    desc: 'Learn from I Putu Arik Budiarsana with expertise in multiple English specializations.',
  },
  {
    icon: <Library className="w-6 h-6 text-[#08507f]" />,
    title: 'High-Quality Learning Materials',
    desc: 'Access comprehensive PDF materials delivered via Google Classroom.',
  },
  {
    icon: <Video className="w-6 h-6 text-[#08507f]" />,
    title: 'Class Recordings Available',
    desc: 'Review your lessons anytime with recorded sessions for better retention.',
  },
  {
    icon: <Calendar className="w-6 h-6 text-[#08507f]" />,
    title: 'Flexible Scheduling Options',
    desc: 'Book sessions 7 days a week, 7:00 AM – 11:00 PM (GMT+8). Rescheduling available with 30 min notice.',
  },
  {
    icon: <DollarSign className="w-6 h-6 text-[#08507f]" />,
    title: 'Affordable & Transparent Pricing',
    desc: 'Quality education at competitive rates with no hidden fees.',
  },
]

const testimonials = [
  {
    name: 'Bagas Falah Muhammad',
    role: 'Civil Engineer, Padang',
    quote: 'I achieved my required IELTS band score for Australian university admission after completing the private 24-hour program. The focus on writing and speaking really helped me improve quickly.',
  },
  {
    name: 'Zati Adila Nurifa',
    role: 'Data Specialist, Madura',
    quote: "The instructor's patient approach and emphasis on students' understanding made all the difference. My IELTS strategies improved significantly through consistent practice exercises.",
  },
]

export default async function HomePage() {
  const supabase = await createClient()
  const nowIso = new Date().toISOString()
  const { data: rawPosts } = await supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image_url, published_at, created_at,
      post_categories(category_id, categories(id, name, slug))
    `)
    .eq('status', 'published')
    .lte('published_at', nowIso)
    .order('published_at', { ascending: false })
    .limit(6)

  const posts = (rawPosts ?? []).map(post => ({
    ...post,
    categories: (post.post_categories ?? []).flatMap((pc: { categories: unknown }) =>
      Array.isArray(pc.categories) ? pc.categories : [pc.categories]
    ).filter(Boolean),
  }))

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'English with Arik',
    url: 'https://englishwitharik.com',
    email: 'info@englishwitharik.com',
    areaServed: 'Worldwide',
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* ===== HERO ===== */}
      <section
        className="relative min-h-[calc(100vh-64px)] flex items-end justify-center pb-12 md:pb-24 px-4 overflow-hidden"
      >
        <Image
          src={HERO_IMAGE_URL}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Content Card */}
        <div className="relative z-10 w-full max-w-4xl rounded-[28px] border border-white/30 bg-white/70 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.18)] px-6 py-10 md:px-14 md:py-12 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Your Gateway to{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#08507f] to-blue-600">
              Global Success
            </span>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4"></div>
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="https://wa.me/6282144223581"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-[#08507f] hover:bg-[#063a5c] text-white font-bold py-3.5 px-8 rounded-full transition-all shadow-lg hover:shadow-[#08507f]/30 hover:-translate-y-1 uppercase tracking-wide text-sm"
            >
              Free Consultation
            </a>
            <Link
              href="/pricing"
              className="w-full sm:w-auto bg-transparent border-2 border-[#08507f] text-[#08507f] hover:bg-[#08507f]/5 font-bold py-3 px-8 rounded-full transition-all uppercase tracking-wide text-sm"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section className="py-24 px-4 bg-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-[#08507f]/5 skew-x-12 translate-x-1/2" />
        <div className="max-w-7xl mx-auto relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text */}
            <div>
              <span className="inline-block bg-[#08507f]/10 text-[#08507f] text-sm font-bold px-4 py-1.5 rounded-full mb-6 tracking-wide">
                ABOUT ENGLISH WITH ARIK
              </span>
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                Learn English in an <span className="text-[#08507f]">Effective</span> and <span className="text-[#fd9d19]">Fun</span> Way!
              </h2>
              <div className="prose prose-lg text-gray-600 mb-8">
                <p>
                  Founded by <strong>I Putu Arik Budiarsana</strong>, English with Arik is your premier online platform for mastering English.
                  Whether you&apos;re aiming for global opportunities, academic success, or professional growth, we provide a personalized learning experience that sticks.
                </p>
                <p>
                  With extensive expertise in <strong>IELTS, TOEFL, PTE, General English, English for Tourism, Business English, and English for Other Purposes</strong>, Arik brings a communicative approach
                  to every lesson, ensuring you not only learn the rules but gaining the confidence to use them.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">
                {[
                  { title: "Expert Instruction", desc: "Learn directly from a qualified specialist.", icon: <GraduationCap className="w-8 h-8 text-[#08507f]" /> },
                  { title: "Premium Materials", desc: "Access high-quality PDFs & resources.", icon: <Library className="w-8 h-8 text-[#08507f]" /> },
                  { title: "Flexible Learning", desc: "Study online, anytime, anywhere.", icon: <Globe className="w-8 h-8 text-[#08507f]" /> },
                  { title: "Proven Results", desc: "Join successful students worldwide.", icon: <Trophy className="w-8 h-8 text-[#08507f]" /> },
                ].map((feature, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="bg-[#08507f]/10 p-3 rounded-xl">{feature.icon}</div>
                    <div>
                      <h4 className="font-bold text-gray-900">{feature.title}</h4>
                      <p className="text-sm text-gray-500 leading-snug">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link
                  href="/about"
                  className="inline-flex items-center text-[#08507f] font-bold hover:text-[#063a5c] transition-colors group"
                >
                  Learn more about Arik
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Right: Video/Media */}
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-tr from-[#08507f] to-[#2b7bb3] rounded-2xl opacity-20 blur-xl"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl max-w-sm mx-auto bg-gray-900 ring-1 ring-gray-900/5">
                <video
                  className="w-full h-auto object-cover"
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  poster={HERO_POSTER_URL}
                >
                  <source src="https://res.cloudinary.com/english-tests-platform/video/upload/v1771332452/video-web_optae0.mp4" type="video/mp4" />
                </video>
                <div className="absolute left-4 bottom-4 z-20 bg-white/95 p-4 rounded-xl shadow-xl border border-gray-100 hidden md:block">
                  <div className="flex items-center gap-3">
                    <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                      <Star className="w-5 h-5 fill-current" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">5-Star Rated</p>
                      <p className="text-xs text-gray-500">by Students</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== COURSES ===== */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#08507f] font-bold tracking-wider text-sm uppercase mb-2 block">Our Programs</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Tailored English Courses for Your Goals</h2>
            <p className="text-gray-600 text-lg">
              Unlock your potential with our comprehensive curriculum designed for tangible results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.map((course, idx) => (
              <Link
                key={course.href}
                href={course.href}
                className="group bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#08507f] to-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="mb-6 inline-block bg-blue-50 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  {course.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#08507f] transition-colors">
                  {course.title}
                </h3>
                <p className="text-gray-500 leading-relaxed mb-6">
                  {course.desc}
                </p>
                <div className="flex items-center text-[#08507f] font-semibold text-sm mt-auto">
                  Learn more <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FREE PRACTICE TESTS ===== */}
      <section className="py-24 px-4 bg-gradient-to-br from-indigo-900 via-blue-900 to-indigo-900 text-white relative overflow-hidden">
        {/* Abstract Shapes */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-400 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-[#fd9d19] blur-3xl"></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold px-3 py-1 rounded-full mb-6 inline-block">
                FREE RESOURCES
              </span>
              <h2 className="text-3xl md:text-5xl font-bold mb-6">Test Your English <br /><span className="text-blue-300">Before You Start</span></h2>
              <p className="text-blue-100 text-lg mb-8 leading-relaxed">
                Take our high-quality practice mock tests for IELTS, TOEFL, and PTE Academic.
                Get instant AI-driven scores and insights to understand your current level.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                {['IELTS Academic', 'TOEFL iBT', 'TOEFL ITP', 'PTE Academic'].map(exam => (
                  <span key={exam} className="bg-white/10 hover:bg-white/20 transition-colors border border-white/10 px-4 py-2 rounded-lg text-sm font-medium backdrop-blur-sm">
                    {exam}
                  </span>
                ))}
              </div>

              <a
                href="https://tests.englishwitharik.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-white text-indigo-900 font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors shadow-lg shadow-blue-900/20"
              >
                Start Free Test Now
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </a>
            </div>

            <div className="hidden lg:block relative">
              {/* Mockup or Illustration Placeholder */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-md">
                <div className="space-y-4">
                  <div className="h-4 bg-white/10 rounded w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded w-1/2"></div>
                  <div className="h-32 bg-white/5 rounded-xl border border-white/5 flex items-center justify-center">
                    <BarChart3 className="w-10 h-10 text-white/50" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="h-20 bg-[#08507f]/20 rounded-lg border border-[#08507f]/30 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-blue-300">7.5</span>
                      <span className="text-xs text-blue-100">IELTS</span>
                    </div>
                    <div className="h-20 bg-blue-500/20 rounded-lg border border-blue-500/30 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-blue-300">92</span>
                      <span className="text-xs text-blue-100">TOEFL</span>
                    </div>
                    <div className="h-20 bg-purple-500/20 rounded-lg border border-purple-500/30 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-purple-300">65</span>
                      <span className="text-xs text-purple-100">PTE</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Success Stories</h2>
            <p className="text-gray-500">Hear from our students who have achieved their dreams.</p>
          </div>

          <TestimonialsCarousel
            testimonials={[
              {
                name: 'Vincent Farrel Wilia',
                role: 'Entrepreneur, Jakarta',
                program: 'PTE Academic',
                quote: 'Highly recommended for PTE preparation! ka Arik is very patient, supportive, and really knows the exam strategies for all sections (Speaking, Writing, Reading, Listening). thankss a lot ka Arikk for the guidance, it really boosted my confidence for the PTE test',
              },
              {
                name: 'Puput',
                role: 'Marketer, Yogyakarta',
                program: 'IELTS Academic',
                quote: 'Waaaaa thank you Misterrr. You helped me reach my dream score with my limited time and busy work schedule. Even though the lessons were short, the knowledge was very effective and useful. Thank youuuu',
              },
              {
                name: 'Andri Wijaya',
                role: 'Student, Alice Springs',
                program: 'PTE Academic',
                quote: 'Great experience learning here. The strategies are practical and easy to apply during the test. Really helped me improve my score without overcomplicating things. Recommended.',
              },
              {
                name: 'Ketut Agus Seputra',
                role: 'Lecturer, Singaraja',
                program: 'TOEFL iBT',
                quote: 'I was new to TOEFL iBT and my first attempt was quite successful, especially in the speaking section. Thank you for your help in making me familiar with the test format and the strategies that helped me answer the questions.',
              },
              {
                name: 'Pipit',
                role: 'Waitress, Gianyar',
                program: 'J1 Interview Preparation',
                quote: 'Learning with Mr. Arik is very fun. He is very patient, his teaching is easy to understand, thank you Mr. Thank you also that I could pass and do J1 Training in the USA.',
              },
              {
                name: 'Chris',
                role: 'Student, Semarang',
                program: 'IELTS Academic',
                quote: 'Mr Arik is always excited to teach, and is extremely helpful in finding my weak points, not missing a single detail. His explanation is detailed and comprehensive, and he gives many tips and tricks to excel in IELTS.',
              },
              {
                name: 'Bagas Falah Muhammad',
                role: 'Civil Engineer, Padang',
                program: 'IELTS Academic',
                quote: 'I achieved my required IELTS band score for Australian university admission after completing the private 24-hour program. The focus on writing and speaking really helped me improve quickly.',
              },
              {
                name: 'Zati Adila Nurifa',
                role: 'Data Specialist, Madura',
                program: 'IELTS Academic',
                quote: "The instructor's patient approach and emphasis on students' understanding made all the differences. My IELTS strategies improved significantly through consistent practice exercises.",
              },
            ]}
          />
        </div>
      </section>

      {/* ===== STUDENT LOCATIONS MAP ===== */}
      <StudentLocationsMap />

      {/* ===== FAQ SECTION ===== */}
      <section className="py-24 px-4 bg-[#fd9d19]/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#fd9d19] font-bold tracking-wider text-sm uppercase mb-2 block">Common Questions</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {[
              { q: "How do I join?", a: "It's easy! Just click the 'Free Consultation' or WhatsApp button to contact us directly. We'll guide you through the process." },
              { q: "Can I get a free trial?", a: "Yes! Every new student is eligible for a 30-minute free trial class to experience our teaching style and discuss your goals." },
              { q: "What courses do you offer?", a: "We offer General English, Business English, English for Tourism, and Test Preparation (IELTS, TOEFL iBT/ITP, PTE Academic, and more)." },
              { q: "Where are the classes held?", a: "All classes are held online via Google Meet. Lessons are interactive and recorded for your review." },
              { q: "Do you provide learning materials?", a: "Absolutely! You'll receive high-quality PDF materials, slides, and exercises via Google Classroom." },
              { q: "Can I reschedule a class?", a: "Yes, you can reschedule up to 30 minutes before the lesson starts without any penalty." },
              { q: "Do I get a certificate?", a: "Yes, students who complete a full course receive an e-certificate of completion from English with Arik." },
            ].map((faq, i) => (
              <details key={i} className="group bg-white rounded-xl shadow-sm border border-[#fd9d19]/20 overflow-hidden">
                <summary className="flex items-center justify-between p-6 cursor-pointer list-none font-bold text-gray-900 hover:bg-[#fd9d19]/10 transition-colors">
                  <span>{faq.q}</span>
                  <span className="transition-transform group-open:rotate-180">
                    <ChevronRight className="w-5 h-5 text-[#fd9d19]" />
                  </span>
                </summary>
                <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed border-t border-transparent group-open:border-gray-100 group-open:pt-4 transition-all">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ===== RECENT POSTS ===== */}
      {posts.length > 0 && (
        <section className="py-24 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Latest from the Blog</h2>
                <p className="text-gray-500">Tips, strategies, and updates to help you learn.</p>
              </div>
              <Link href="/blog" className="text-[#08507f] hover:text-[#063a5c] font-bold flex items-center group">
                View all articles
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map(post => (
                <PostCard key={post.id} post={post as unknown as Parameters<typeof PostCard>[0]['post']} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ===== CONTACT & CTA ===== */}
      <section className="py-24 px-4 bg-[#08507f] relative overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="max-w-5xl mx-auto relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Ready to Start Your Journey?</h2>
          <p className="text-slate-300 text-xl mb-12 max-w-2xl mx-auto">
            Join students from Indonesia and around the world who have achieved their English goals with Arik.
          </p>

          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 md:p-12 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="bg-white/10 p-3 rounded-full text-white mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Location</h4>
                <p className="text-slate-400">Desa Sangsit, Buleleng, Bali<br />Indonesia 81171</p>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="bg-white/10 p-3 rounded-full text-white mb-4">
                  <Phone className="w-6 h-6" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Contact</h4>
                <p className="text-slate-400">082-144-223-581<br />info@englishwitharik.com</p>
              </div>
              <div className="flex flex-col items-center md:items-start text-center md:text-left">
                <div className="bg-white/10 p-3 rounded-full text-white mb-4">
                  <Clock className="w-6 h-6" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">Hours (GMT+8)</h4>
                <p className="text-slate-400">Mon – Sun<br />7:00 AM – 11:00 PM</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/6282144223581"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-4 px-10 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/30 hover:-translate-y-1"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                <span>Chat on WhatsApp</span>
              </div>
            </a>
            <Link
              href="/pricing"
              className="bg-transparent hover:bg-white/10 text-white font-bold py-4 px-10 rounded-xl transition-all border border-white/30"
            >
              View Pricing Options
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
