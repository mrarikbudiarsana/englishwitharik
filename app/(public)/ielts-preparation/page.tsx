import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { CheckCircle2, BookOpen, Users, Trophy, Target, Clock, ArrowRight, Laptop, Star } from 'lucide-react'
import FAQ from '@/components/public/FAQ'
import FeatureCard from '@/components/public/FeatureCard'
import TestimonialsCarousel from '@/components/public/TestimonialsCarousel'
import PostCard from '@/components/public/PostCard'

export const metadata: Metadata = {
  title: 'IELTS Preparation | English with Arik',
  description: 'Join our IELTS Full Preparation or Skill-Focused Training. Achieve your target band with personalized coaching and our premium Student Portal.',
}
export const revalidate = 3600

export default async function IELTSPage() {
  const supabase = await createClient()

  // Fetch latest blog posts for the bottom section
  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('status', 'published')
    .ilike('title', '%IELTS%')
    .order('published_at', { ascending: false })
    .limit(3)

  const features = [
    {
      title: "Tailored for You",
      description: "Each program is adapted to your level and test goals, ensuring you focus on what matters most for your score.",
      icon: <Target className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "All-in-One Learning",
      description: "Get access to live classes, recordings, and self-study materials all in one place via our Student Portal.",
      icon: <Laptop className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Personalised Feedback",
      description: "Receive detailed corrections on your Writing and Speaking tasks with score estimates and improvement strategies.",
      icon: <CheckCircle2 className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Full Support",
      description: "Enjoy WhatsApp mentoring between sessions, vocabulary lists, and comprehensive error analysis.",
      icon: <Users className="w-6 h-6 text-[#08507f]" />
    }
  ]

  const faqItems = [
    {
      question: "What is included in each IELTS program?",
      answer: "Each program includes full class materials, recordings, personalised feedback, vocabulary lists, and optional test simulations. You'll also receive continuous support via WhatsApp throughout your course."
    },
    {
      question: "Who is the Full Preparation course for?",
      answer: "The Full Preparation course covers all four IELTS skills — Listening, Reading, Writing, and Speaking — and is ideal for students targeting Band 6–7+."
    },
    {
      question: "What if I only want to focus on one skill?",
      answer: "The Skill-Focused program concentrates on one or two areas (for example, Writing & Speaking) with intensive practice and strategy lessons."
    },
    {
      question: "Is the Foundation Course right for me?",
      answer: "Yes, if you are new to IELTS or need to build a solid base in grammar, vocabulary, and basic test strategies before progressing to full preparation."
    },
    {
      question: "How do I know which level I am?",
      answer: "You can book a free 30-minute trial. During this session, we'll discuss your goals, assess your English level, and help you choose the most suitable program."
    },
    {
      question: "What English level do I need to start?",
      answer: "We recommend at least a B1 (Intermediate) level for the best results, though our Foundation Course is perfect if you're slightly below that."
    },
    {
      question: "How are the lessons conducted?",
      answer: "All lessons are online, either privately or in small semi-private groups (2–3 students). Each session lasts 60 minutes, and all are interactive, practical, and fully guided by your instructor."
    },
    {
      question: "Will I get feedback on my writing and speaking?",
      answer: "Yes. Every writing and speaking task is reviewed personally with detailed notes, score estimates, and improvement strategies based on official band descriptors."
    }
  ]

  const testimonials = [
    {
      name: "Bagas Falah Muhammad",
      role: "Civil Engineer",
      quote: "I joined a private IELTS class with Mr. Arik for 24 hours of learning. Before that, my writing and speaking skills were below Band 6, but after taking this class, I gained a lot of insights. I've achieved the IELTS band score required by my university in Australia.",
      program: "IELTS Private",
    },
    {
      name: "Zati Adila Nurifa",
      role: "Data Specialist",
      quote: "Five star obviously for Mas Arik. He teaches with patience, ensuring that I fully understand the material. I have a much better grasp on IELTS and its strategies, as he frequently provides practice exercises and reviews them with me.",
      program: "IELTS Private",
    },
    {
      name: "Budi Setiawan",
      role: "Heavy Equipment Operator",
      quote: "I took the IELTS General course with Mr. Arik and achieved a band score of 6.5. The course was very helpful and I would recommend it to anyone who wants to improve their English skills. ",
      program: "IELTS General",
    }
  ]

  const courses = [
    {
      title: "IELTS Full Preparation",
      subtitle: "All Skills",
      description: "Complete package for Listening, Reading, Writing, and Speaking. Perfect for students targeting Band 6–7+ who want structured training.",
      icon: <BookOpen className="w-6 h-6 text-white" />,
      bg: "bg-[#08507f]",
      iconBg: "bg-[#08507f]/20"
    },
    {
      title: "Skill-Focused Training",
      subtitle: "Specific Modules",
      description: "Choose to focus on one or two skills — e.g. Writing & Speaking — with intensive drills and smart strategies to improve faster.",
      icon: <Target className="w-6 h-6 text-white" />,
      bg: "bg-teal-600",
      iconBg: "bg-teal-700"
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
                Guaranteed Progress
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                Ready to reach your target <span className="text-[#08507f]">IELTS band</span> and study or work abroad?
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                At English with Arik, our IELTS Preparation Program is designed to match your level, goal, and schedule, with personal coaching, full materials, and guaranteed progress.
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
              <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Live 1-on1</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Personal Feedback</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Mock Tests</span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-[#08507f]/10 blur-3xl rounded-full transform rotate-12 scale-90"></div>
              {/* Illustration / Image Placeholder */}
              <div className="relative bg-white p-2 rounded-3xl shadow-2xl border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://res.cloudinary.com/english-tests-platform/image/upload/v1771371510/englishwitharik/blog/uiarjwoeckp576hip2xa.jpg"
                    alt="IELTS Preparation with Arik"
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
            <p className="text-lg text-gray-600">Guided by I Putu Arik Budiarsana, with proven IELTS success stories across Indonesia and abroad.</p>
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
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Pick the Class That Matches Your Needs</h2>
            <p className="text-lg text-gray-600">From full preparation to specific skill assessments, we have you covered.</p>
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
                  <p className="text-gray-600 mb-6 leading-relaxed">{course.description}</p>
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
            Join our students who have achieved their dreams. Reliable, Trusted, and Professional English Tutor in Indonesia.
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
              <h2 className="text-2xl font-bold text-gray-900">Latest IELTS Insights</h2>
              <Link href="/blog?category=ielts" className="text-[#08507f] font-medium hover:underline flex items-center">
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
