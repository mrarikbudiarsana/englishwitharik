
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { CheckCircle2, BookOpen, Users, Trophy, Target, ArrowRight, Laptop, GraduationCap } from 'lucide-react'
import FAQ from '@/components/public/FAQ'
import FeatureCard from '@/components/public/FeatureCard'
import TestimonialsCarousel from '@/components/public/TestimonialsCarousel'
import PostCard from '@/components/public/PostCard'

export const metadata: Metadata = buildPageMetadata({
  title: 'Test Preparation',
  description: 'Expert preparation for IELTS, PTE Academic, and TOEFL. Achieve your target score with our proven strategies and personalized coaching.',
  path: '/test-preparation',
})

export const revalidate = 3600

export default async function TestPrepPage() {
  const supabase = await createClient()
  const nowIso = new Date().toISOString()

  // Fetch latest blog posts related to test prep
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('status', 'published')
    .lte('published_at', nowIso)
    .ilike('title', '%preparation%') // or generic 'test'
    .order('published_at', { ascending: false })
    .limit(3)

  const features = [
    {
      title: "Certified Tutors",
      description: "Learn from experts who have achieved top scores and are certified professionals in language teaching.",
      icon: <Trophy className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Proven Strategies",
      description: "Master the exam formats with our step-by-step techniques that have helped hundreds of students reach their goals.",
      icon: <Target className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Flexible Learning",
      description: "Choose between private 1-on-1 coaching or small group classes. Online sessions to fit your busy schedule.",
      icon: <Laptop className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Guaranteed Results",
      description: "We track your progress with regular mock tests and feedback to ensure you are ready for test day.",
      icon: <CheckCircle2 className="w-6 h-6 text-[#08507f]" />
    }
  ]

  const programs = [
    {
      name: 'IELTS Academic & General',
      href: '/ielts-preparation',
      desc: 'The world’s most popular English test for migration and higher education.',
      features: ['Band 5–9 Targets', 'Writing & Speaking focus', 'Official materials'],
      icon: <GraduationCap className="w-6 h-6 text-white" />,
      bg: "bg-[#08507f]",
      iconBg: "bg-[#08507f]/20"
    },
    {
      name: 'PTE Academic',
      href: '/pte-academic',
      desc: 'Fast, computer-based English test accepted for visas and study worldwide.',
      features: ['AI Scoring insights', 'Templates & Tricks', 'Fast results'],
      icon: <Laptop className="w-6 h-6 text-white" />,
      bg: "bg-teal-600",
      iconBg: "bg-teal-700"
    },
    {
      name: 'TOEFL iBT',
      href: '/toefl-ibt',
      desc: 'Premier test for university admission, especially in the USA and Canada.',
      features: ['Score 0–120', 'Academic focus', 'Integrated skills'],
      icon: <BookOpen className="w-6 h-6 text-white" />,
      bg: "bg-indigo-600",
      iconBg: "bg-indigo-700"
    },
    {
      name: 'TOEFL ITP',
      href: '/toefl-itp',
      desc: 'Paper-based assessment widely used for scholarships and placement in Indonesia.',
      features: ['Grammar mastery', 'Listening section', 'Institutional use'],
      icon: <Users className="w-6 h-6 text-white" />,
      bg: "bg-orange-600",
      iconBg: "bg-orange-700"
    },
  ]

  const testimonials = [
    {
      name: "Bagas Falah Muhammad",
      role: "Civil Engineer",
      quote: "I joined a private IELTS class with Mr. Arik for 24 hours of learning. Before that, my writing and speaking skills were below Band 6, but after taking this class, I gained a lot of insights. I've achieved the IELTS band score required by my university in Australia.",
      program: "IELTS Private",
    },
    {
      name: "Nadia Ramadhani",
      role: "Student, Surabaya",
      quote: "I took private PTE Academic lessons with Mr Arik for a month before my test. His step-by-step guidance on speaking and writing templates helped me improve my confidence a lot. I achieved my target score for migration.",
      program: "PTE Private",
    },
    {
      name: "Zati Adila Nurifa",
      role: "Data Specialist",
      quote: "Five star obviously for Mas Arik. He teaches with patience, ensuring that I fully understand the material. I have a much better grasp on IELTS and its strategies.",
      program: "IELTS Private",
    }
  ]

  const faqItems = [
    {
      question: "Which test should I take?",
      answer: "It depends on your goal. IELTS is widely accepted for migration and study in UK/Australia/Canada. TOEFL iBT is preferred by US universities. PTE is consistent and fast, great for Australian visas. TOEFL ITP is mainly for local institutions."
    },
    {
      question: "Do you offer online classes?",
      answer: "Yes, all our classes are conducted online via Zoom or Google Meet, allowing you to learn from anywhere with flexible scheduling."
    },
    {
      question: "How do I know my current level?",
      answer: "We offer a free placement test or consultation to assess your current English proficiency and recommend the best program for you."
    },
    {
      question: "Can I take a free trial?",
      answer: "Absolutely! You can book a free 30-minute consultation/trial session to meet your tutor and discuss your study plan."
    },
    {
      question: "Are study materials included?",
      answer: "Yes, all students receive comprehensive digital study materials, practice tests, and recordings of their lessons."
    }
  ]

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#08507f]/5 to-white pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-2 bg-[#08507f]/10 text-[#08507f] text-sm font-bold px-4 py-1.5 rounded-full mb-6">
                <Trophy className="w-4 h-4" />
                Your Success Starts Here
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                Master Your <span className="text-[#08507f]">English Proficiency Test</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Whether it&apos;s IELTS, PTE, or TOEFL, we provide expert coaching to help you achieve the score you need for your global ambitions.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://wa.me/628214422358" target="_blank" rel="noopener noreferrer"
                  className="bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold text-lg py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Book Free Consultation
                </a>
                <a href="https://tests.englishwitharik.com" target="_blank" rel="noopener noreferrer"
                  className="bg-white border-2 border-gray-100 hover:border-[#08507f]/30 text-gray-700 font-semibold text-lg py-4 px-8 rounded-2xl transition-all hover:bg-gray-50">
                  Take Free Test
                </a>
              </div>
              <div className="mt-8 flex items-center gap-6 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Expert Tutors</span>
                <span className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-green-500" /> Proven Methods</span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-[#08507f]/10 blur-3xl rounded-full transform rotate-12 scale-90"></div>
              <div className="relative bg-white p-2 rounded-3xl shadow-2xl border border-gray-100 transform -rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_cnrjcacnrjcacnrj.png"
                    alt="English Test Preparation"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <p className="text-lg text-gray-600">We don&apos;t just teach English; we teach you how to succeed in the test.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={i * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Programs Section */}
      <section className="py-20 bg-[#08507f]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Select Your Exam</h2>
            <p className="text-lg text-gray-600">Comprehensive preparation courses for all major international English tests.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {programs.map((program) => (
              <Link href={program.href} key={program.name} className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full hover:-translate-y-1">
                <div className={`${program.bg} p-6 text-white`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${program.iconBg} p-3 rounded-xl bg-white/20`}>
                      {program.icon}
                    </div>
                    <ArrowRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">{program.name}</h3>
                  <p className="text-white/90 text-sm leading-relaxed">{program.desc}</p>
                </div>
                <div className="p-6 flex-grow">
                  <ul className="space-y-3">
                    {program.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center text-gray-600 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-[#08507f] mr-2 flex-shrink-0" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Success Stories</h2>
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-10 text-center">Frequently Asked Questions</h2>
          <FAQ items={faqItems} />
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-[#08507f] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://englishwitharik.id/wp-content/uploads/2023/08/pattern.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-6">Ready to Ace Your Test?</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Don&apos;t let the exam stand in your way. Get the expert help you need today.
          </p>
          <a href="https://wa.me/628214422358" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center bg-white text-[#08507f] font-bold text-lg py-4 px-10 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg">
            Book Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Blog Links */}
      {posts && posts.length > 0 && (
        <section className="py-20 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Latest Tips & Strategies</h2>
              <Link href="/blog" className="text-[#08507f] font-medium hover:underline flex items-center">
                View all <ArrowRight className="ml-1 w-4 h-4" />
              </Link>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {posts.map(post => (
                <PostCard key={post.id} post={post} />
              ))}
            </div>
          </div>
        </section>
      )}

    </div>
  )
}
