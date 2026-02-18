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
  title: 'PTE Academic | English with Arik',
  description: 'Join our PTE Academic Preparation Program. Expert coaching, AI-powered mock tests, and personalised feedback to help you achieve your target score.',
}

export const revalidate = 3600

export default async function PTEPage() {
  const supabase = await createClient()

  // Fetch latest PTE blog posts
  const { data: posts } = await supabase
    .from('posts')
    .select('*, categories(*)')
    .eq('status', 'published')
    .ilike('title', '%PTE%')
    .order('published_at', { ascending: false })
    .limit(3)

  const features = [
    {
      title: "Certified Trainer",
      description: "Officially recognised by Pearson English Language Learning (Level 2 Professional), ensuring you get expert guidance.",
      icon: <Trophy className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "All-in-One Learning",
      description: "Live interactive classes, full recordings, and structured self-study modules available on Google Classroom.",
      icon: <Laptop className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Personalised Feedback",
      description: "Detailed corrections and strategies for Writing, Speaking, and integrated-skill tasks to boost your performance.",
      icon: <CheckCircle2 className="w-6 h-6 text-[#08507f]" />
    },
    {
      title: "Full Support",
      description: "WhatsApp mentoring, vocabulary guidance, and error analysis throughout your journey to success.",
      icon: <Users className="w-6 h-6 text-[#08507f]" />
    }
  ]

  const faqItems = [
    {
      question: "What makes the PTE Academic course different?",
      answer: "Our PTE lessons combine expert human coaching and AI-powered mock tests. You’ll learn how to maximise scores in each task with feedback based on the real Pearson scoring system."
    },
    {
      question: "Who is this course for?",
      answer: "It’s designed for anyone preparing for study, work, or migration to English-speaking countries such as Australia, New Zealand, or Canada. Both first-time test takers and repeat candidates are welcome."
    },
    {
      question: "Do I need to know my English level before joining?",
      answer: "Not necessarily. You can take a quick free placement test or a PTE diagnostic test with us to determine your current score range and the right study plan."
    },
    {
      question: "How long does it take to reach my target score?",
      answer: "It depends on your starting level and goal. On average, students aiming for PTE 65+ (equivalent to IELTS 7.0) need at least 24 hours of structured lessons plus home practice."
    },
    {
      question: "What’s included in the course package?",
      answer: "Live 1-on-1 coaching, full digital study materials & recordings, AI mock tests (paid option), pronunciation drills, and personalised WhatsApp support."
    }
  ]

  const testimonials = [
    {
      name: "Nadia Ramadhani",
      role: "Student, Surabaya",
      quote: "I took private PTE Academic lessons with Mr Arik for a month before my test. His step-by-step guidance on speaking and writing templates helped me improve my confidence a lot. I especially liked the personalised feedback and mock test reviews. I achieved my target score for migration.",
      program: "PTE Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/untitled-design-58.png"
    },
    {
      name: "Andreas Saputra",
      role: "Software Engineer, Jakarta",
      quote: "Mr Arik is an amazing trainer! Before joining his class, I struggled with the Reading and Listening parts. His detailed explanations and practice techniques made everything so much clearer. I love how he always encourages me and checks my progress through WhatsApp.",
      program: "PTE Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/untitled-design-59.png"
    },
    {
      name: "Andri Wijaya",
      role: "Student, Alice Springs",
      quote: "Great experience learning here. The strategies are practical and easy to apply during the test. Really helped me improve my score without overcomplicating things. Recommended.",
      program: "PTE Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/untitled-design-59.png"
    },
    {
      name: "Vincent Farrel Wilia",
      role: "Enterpreneur, Jakarta",
      quote: "Highly recommended for PTE preparation! ka Arik is very patient, supportive, and really knows the exam strategies for all sections (Speaking, Writing, Reading, Listening). thankss a lot ka Arikk for the guidance, it really boosted my confidence for the PTE test",
      program: "PTE Private",
      image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/untitled-design-59.png"
    }
  ]

  const courses = [
    {
      title: "Private Coaching",
      subtitle: "1-on-1 Focus",
      description: "Intensive personal guidance tailored to your specific weaknesses. Flexible scheduling and maximum interaction.",
      icon: <Users className="w-6 h-6 text-white" />,
      bg: "bg-[#08507f]",
      iconBg: "bg-[#08507f]/20",
      price: "From Rp 1.200.000 (8 Hours)"
    },
    {
      title: "Semi-Private Class",
      subtitle: "Small Group (2-3)",
      description: "Learn with friends or peers in a small group setting. Interactive and cost-effective while maintaining high quality.",
      icon: <Users className="w-6 h-6 text-white" />,
      bg: "bg-teal-600",
      iconBg: "bg-teal-700",
      price: "From Rp 720.000 (8 Hours)"
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
                Ready to reach your target <span className="text-[#08507f]">PTE score</span>?
              </h1>
              <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                Unlock opportunities for study, work, or migration abroad. Our PTE Academic Program offers proven strategies, mock tests, and personalised feedback for real weekly progress.
              </p>
              <div className="flex flex-wrap gap-4">
                <a href="https://wa.me/628214422358" target="_blank" rel="noopener noreferrer"
                  className="bg-[#08507f] hover:bg-[#063a5c] text-white font-semibold text-lg py-4 px-8 rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1">
                  Free Consultation
                </a>
                <a href="https://tests.englishwitharik.com" target="_blank" rel="noopener noreferrer"
                  className="bg-white border-2 border-gray-100 hover:border-[#08507f]/30 text-gray-700 font-semibold text-lg py-4 px-8 rounded-2xl transition-all hover:bg-gray-50">
                  Take Free Test
                </a>
              </div>
              <div className="mt-8 flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Live 1-on-1</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> AI Mock Tests</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Personal Feedback</span>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-[#08507f]/10 blur-3xl rounded-full transform rotate-12 scale-90"></div>
              <div className="relative bg-white p-2 rounded-3xl shadow-2xl border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                  <Image
                    src="https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_cnrjcacnrjcacnrj.png"
                    alt="PTE Preparation"
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
            <p className="text-lg text-gray-600">Guided by I Putu Arik Budiarsana, helping you achieve your migration and study goals.</p>
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
              <h2 className="text-2xl font-bold text-gray-900">Latest PTE Insights</h2>
              <Link href="/blog?category=pte" className="text-[#08507f] font-medium hover:underline flex items-center">
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
