
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { CheckCircle2, BookOpen, Users, Trophy, Target, Clock, ArrowRight, Laptop, Star, Briefcase, Presentation, Globe } from 'lucide-react'
import FAQ from '@/components/public/FAQ'
import FeatureCard from '@/components/public/FeatureCard'
import TestimonialsCarousel from '@/components/public/TestimonialsCarousel'
import PostCard from '@/components/public/PostCard'

export const metadata: Metadata = {
  title: 'Business English | English with Arik',
  description: 'Communicate professionally and confidently at work. Improve your English for meetings, presentations, emails, and negotiations.',
}

export const revalidate = 3600

export default async function BusinessEnglishPage() {
  const supabase = await createClient()

  // Fetch latest Business English blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('status', 'published')
    .ilike('title', '%Business%')
    .order('published_at', { ascending: false })
    .limit(3)

  const features = [
    {
      title: "Trainer Experienced in Corporate English",
      description: "Guided by I Putu Arik Budiarsana, who has coached professionals from tourism, education, and business sectors.",
      icon: <Trophy className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Workplace-Focused Lessons",
      description: "Every session uses real examples from emails, meetings, and reports to make learning immediately applicable.",
      icon: <Briefcase className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Customised Curriculum",
      description: "Adjusted to your job, department, and specific communication needs for maximum relevance.",
      icon: <Target className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Interactive Practice",
      description: "Simulations of professional scenarios such as meetings, customer calls, and presentations.",
      icon: <Presentation className="w-6 h-6 text-[#08507f]" />
    }
  ]

  const faqItems = [
    {
      question: "Who is this course for?",
      answer: "Professionals, entrepreneurs, and employees who use English at work — in meetings, emails, or client interactions."
    },
    {
      question: "Do I need to have a high level of English?",
      answer: "Not necessarily. The lessons are tailored to your level, from Elementary (A2) to Advanced (C1)."
    },
    {
      question: "Can I focus on specific skills (like writing or speaking)?",
      answer: "Yes. You can choose full-skill training or focus on one or two key areas that are most critical for your job."
    },
    {
      question: "Will the materials be related to my job?",
      answer: "Absolutely. You’ll learn using examples and vocabulary relevant to your field, industry, or position."
    },
    {
      question: "Do you offer group classes for teams?",
      answer: "Yes, besides private classes, semi-private or small-group options are available for 2–3 learners from the same company or team."
    }
  ]

  const testimonials = [
    {
      name: "Ayu Indrayani",
      role: "Cost Controller, Denpasar",
      quote: "My English skills have improved significantly since learning with Mr. Arik. The fun and structured lessons helped me understand and use English more effectively, especially in the workplace where I need to communicate both verbally and in writing. My confidence has also increased.",
      program: "Business English Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/untitled-design-63.png"
    },
    {
      name: "Muhammad Husamuddin Hariz",
      role: "Junior Tax Consultant, Jakarta",
      quote: "Thank you Mas Arik for all your lessons. I got promoted to permanent employee (kartap) in the middle of last month.",
      program: "Business English Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/unnamed-4.png"
    },
    {
      name: "Daniel Saputra",
      role: "Finance Staff, Denpasar",
      quote: "The lessons were practical and directly applicable to my daily work. I feel more confident leading meetings and communicating with international clients. Thank you, Mr. Arik, for the professional guidance.",
      program: "Business English Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/unnamed-4.png"
    }
  ]
  const courses = [
    {
      title: "Private Coaching",
      subtitle: "1-on-1 Focus",
      description: "Intensive personal guidance tailored to your job and industry. Flexible scheduling.",
      icon: <Users className="w-6 h-6 text-white" />,
      bg: "bg-[#08507f]",
      iconBg: "bg-[#08507f]/20",
      price: "From Rp 1.000.000 (8 Hours)"
    },
    {
      title: "Semi-Private Class",
      subtitle: "Small Group (2-3)",
      description: "Learn with colleagues or peers in a small group. Interactive and cost-effective.",
      icon: <Users className="w-6 h-6 text-white" />,
      bg: "bg-teal-600",
      iconBg: "bg-teal-700",
      price: "From Rp 600.000 (8 Hours)"
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
                <Briefcase className="w-4 h-4" />
                Professional Growth
              </span>
              <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                Communicate <span className="text-[#08507f]">Professionally and Confidently</span> at Work
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                The Business English Program at English with Arik is designed for professionals who want to improve their English for meetings, presentations, emails, negotiations, and daily workplace interactions.
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
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Real-World Tasks</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Tailored Curriculum</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Flexible Schedule</span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-[#08507f]/10 blur-3xl rounded-full transform rotate-12 scale-90"></div>
              <div className="relative bg-white p-2 rounded-3xl shadow-2xl border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_q9aq28q9aq28q9aq-1.png"
                    alt="Business English"
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
            <p className="text-lg text-gray-600">Guided by I Putu Arik Budiarsana, helping you achieve your career goals.</p>
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
              <Link href="/blog?category=business-english" className="text-[#08507f] font-medium hover:underline flex items-center">
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
