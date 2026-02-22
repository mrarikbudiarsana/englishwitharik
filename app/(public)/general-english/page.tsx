
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { CheckCircle2, BookOpen, Users, Trophy, Target, Clock, ArrowRight, Laptop, Star, MessageCircle, GraduationCap } from 'lucide-react'
import FAQ from '@/components/public/FAQ'
import FeatureCard from '@/components/public/FeatureCard'
import TestimonialsCarousel from '@/components/public/TestimonialsCarousel'
import PostCard from '@/components/public/PostCard'

export const metadata: Metadata = buildPageMetadata({
  title: 'General English',
  description: 'Improve your English for everyday life, study, or work with structured lessons, interactive practice, and real-life communication activities.',
  path: '/general-english',
})

export const revalidate = 3600

export default async function GeneralEnglishPage() {
  const supabase = await createClient()

  // Fetch latest General English blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('status', 'published')
    .ilike('title', '%General English%') // Or just general query if needed
    .order('published_at', { ascending: false })
    .limit(3)

  const features = [
    {
      title: "Experienced Instructor",
      description: "Guided by I Putu Arik Budiarsana, who has taught learners of all levels across Indonesia and abroad.",
      icon: <Trophy className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Communicative Approach",
      description: "Classes are practical and engaging, helping you speak naturally and confidently in real situations.",
      icon: <MessageCircle className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Structured Learning Path",
      description: "Clear progression from Beginner (A1–A2) to Intermediate & Upper Intermediate (B1–B2).",
      icon: <GraduationCap className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Personalised Feedback",
      description: "Receive focused correction and support to help you sound more fluent and accurate.",
      icon: <CheckCircle2 className="w-6 h-6 text-[#08507f]" />
    }
  ]

  const faqItems = [
    {
      question: "Who is this course for?",
      answer: "Anyone who wants to improve general English communication skills for everyday use, study, or work."
    },
    {
      question: "Do I need a certain level to join?",
      answer: "No. You can start from any level — we’ll place you in the right one after a quick assessment."
    },
    {
      question: "What will I learn?",
      answer: "Speaking, Listening, Reading, and Writing — plus Grammar, Vocabulary, and Pronunciation activities in every lesson."
    },
    {
      question: "Do you provide homework or self-study materials?",
      answer: "Yes, you’ll receive extra practice tasks and study resources after each lesson."
    }
  ]

  const testimonials = [
    {
      name: "Ni Kadek Ayu Mirayani",
      role: "Student, Gianyar",
      quote: "During the eight General English sessions with Mr. Arik, my English skills have improved a lot. At first, I felt stuck when speaking English, but now I’ve become much more confident. The lessons were well-structured, easy to understand, and the classes were really enjoyable.",
      program: "General English Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/untitled-design-61.png"
    },
    {
      name: "Kadek Dinda Prasetya Dewi",
      role: "High School Student, Kabupaten Badung",
      quote: "Since I started taking English lessons with Mr. Arik, it’s become much easier for me to understand English. Before that, I used to struggle a lot, but now—after learning so much from him—I’ve really improved compared to my old self! The way he teaches is super fun and easy to understand.",
      program: "General English Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/unnasssssmed-1.png"
    },
    {
      name: "Yudi Rusli",
      role: "Therapist, Turkey",
      quote: "Very good. The material was well-structured and easy to understand. The instructor was very professional. Thank you, Kak Arik.",
      program: "General English Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/unnasssssmed-1.png"
    }
  ]

  const courses = [
    {
      title: "Private Coaching",
      subtitle: "1-on-1 Focus",
      description: "Intensive personal guidance tailored to your specific level and goals. Flexible scheduling.",
      icon: <Users className="w-6 h-6 text-white" />,
      bg: "bg-[#08507f]",
      iconBg: "bg-[#08507f]/20",
      price: "From Rp 800.000 (8 Hours)"
    },
    {
      title: "Semi-Private Class",
      subtitle: "Small Group (2-3)",
      description: "Learn with friends or peers in a small group setting. Interactive and cost-effective.",
      icon: <Users className="w-6 h-6 text-white" />,
      bg: "bg-teal-600",
      iconBg: "bg-teal-700",
      price: "From Rp 480.000 (8 Hours)"
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
                <MessageCircle className="w-4 h-4" />
                Speak with Confidence
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                Ready to improve your English for <span className="text-[#08507f]">everyday life, study, or work</span>?
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                At English with Arik, our General English Program helps you build fluency, confidence, and accuracy across all four skills — Speaking, Writing, Reading, and Listening.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://wa.me/628214422358" target="_blank" rel="noopener noreferrer"
                  className="bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold text-lg py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Free Consultation
                </a>
                <a href="https://tests.englishwitharik.com" target="_blank" rel="noopener noreferrer"
                  className="bg-white border-2 border-gray-100 hover:border-[#08507f]/30 text-gray-700 font-semibold text-lg py-4 px-8 rounded-2xl transition-all hover:bg-gray-50">
                  Take Placement Test
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Live 1-on-1</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> All Levels (A1-B2)</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Personal Feedback</span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-[#08507f]/10 blur-3xl rounded-full transform rotate-12 scale-90"></div>
              <div className="relative bg-white p-2 rounded-3xl shadow-2xl border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_cp4goccp4goccp4g-1.png"
                    alt="General English"
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
      <section className="bg-white py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose English with Arik?</h2>
            <p className="text-lg text-gray-600">Guided by I Putu Arik Budiarsana, helping you achieve your personal and professional goals.</p>
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

      {/* Course Options */}
      <section className="py-20 lg:py-28 bg-[#08507f]/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Plan</h2>
            <p className="text-lg text-gray-600">Flexible options tailored to your needs and budget.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {courses.map((course) => (
              <div key={course.title} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                <div className={`${course.bg} p-6 text-white`}>
                  <div className="flex justify-between items-start mb-4">
                    <div className={`${course.iconBg} p-3 rounded-xl bg-white/20`}>
                      {course.icon}
                    </div>
                    <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                      {course.subtitle}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{course.title}</h3>
                </div>
                <div className="p-8 flex-grow flex flex-col justify-between">
                  <div>
                    <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>
                    <p className="text-[#08507f] font-bold text-lg mb-6">{course.price}</p>
                  </div>
                  <Link href={`https://wa.me/628214422358?text=Hi, I'm interested in ${course.title}`}
                    className="inline-flex items-center justify-center w-full py-3 border border-[#08507f]/20 text-[#08507f] font-semibold rounded-xl hover:bg-[#08507f] hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 lg:py-28 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Our Students Say</h2>
          <TestimonialsCarousel testimonials={testimonials} />
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-28 bg-white max-w-3xl mx-auto px-4 sm:px-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
        <FAQ items={faqItems} />
      </section>

      {/* Bottom CTA */}
      <section className="py-20 bg-[#08507f] text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://englishwitharik.id/wp-content/uploads/2023/08/pattern.png')] opacity-10"></div>
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <h2 className="text-4xl font-bold mb-6">Start Your Journey Today</h2>
          <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
            Join our students who have achieved their dreams. Reliable, Trusted, and Professional English Tutor.
          </p>
          <a href="https://wa.me/628214422358" target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center bg-white text-[#08507f] font-bold text-lg py-4 px-10 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg">
            Book Your Free Trial <ArrowRight className="ml-2 w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Blog Links */}
      {posts && posts.length > 0 && (
        <section className="py-20 bg-gray-50 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-10">
              <h2 className="text-2xl font-bold text-gray-900">Latest Updates</h2>
              <Link href="/blog?category=general-english" className="text-[#08507f] font-medium hover:underline flex items-center">
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
