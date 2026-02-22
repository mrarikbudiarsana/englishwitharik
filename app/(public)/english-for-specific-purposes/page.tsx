
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import { buildPageMetadata } from '@/lib/seo'
import { CheckCircle2, MessageCircle, Users, Trophy, Target, Clock, ArrowRight, Plane, Stethoscope, Briefcase, GraduationCap, Mic2 } from 'lucide-react'
import FeatureCard from '@/components/public/FeatureCard'
import TestimonialsCarousel from '@/components/public/TestimonialsCarousel'
import PostCard from '@/components/public/PostCard'

export const metadata: Metadata = buildPageMetadata({
    title: 'English for Specific Purposes',
    description: 'Master English for tourism, education, healthcare, or any specialised field. Tailored lessons for your profession.',
    path: '/english-for-specific-purposes',
})

export const revalidate = 3600

export default async function ESPPage() {
    const supabase = await createClient()

    // Fetch latest ESP blog posts (broad search for "Specific")
    const { data: posts } = await supabase
        .from('posts')
        .select('*, categories(*)')
        .eq('status', 'published')
        .ilike('title', '%Specific%') // Adjust query if needed
        .order('published_at', { ascending: false })
        .limit(3)

    const features = [
        {
            title: "Experienced Instructor",
            description: "Guided by I Putu Arik Budiarsana, who has trained professionals from education, tourism, healthcare, and corporate sectors.",
            icon: <Trophy className="w-6 h-6 text-[#08507f]" />
        },
        {
            title: "Tailored Curriculum",
            description: "Every lesson is customised for your specific goals, profession, or field of study.",
            icon: <Target className="w-6 h-6 text-[#08507f]" />
        },
        {
            title: "Practical Communication",
            description: "Focus on expressions and language you actually use at work or in your specific environment.",
            icon: <MessageCircle className="w-6 h-6 text-[#08507f]" />
        },
        {
            title: "Personalised Feedback",
            description: "Continuous improvement through real-time correction and support during your practice.",
            icon: <CheckCircle2 className="w-6 h-6 text-[#08507f]" />
        }
    ]

    const testimonials = [
        {
            name: "Ni Komang Ayu Pipit Lestari",
            role: "Waiter, Gianyar",
            quote: "Learning with Mr Arik is really enjoyable. He’s very patient, and his lessons are easy to understand. Thank you, Mr! I’ll send you the result of my interview later — please wait for it, okay?",
            program: "English for J1 Interview Prep",
            image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/untitled-design-66.png"
        },
        {
            name: "Ni Made Payas Pradnya Utami",
            role: "Teacher, Gianyar",
            quote: "Learning English with Kak Arik is really enjoyable. The materials are easy to understand, and his clear and structured explanations make me excited to learn. Thank you, Kak Arik!",
            program: "English for Teaching Maths",
            image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/unnamed-5.png"
        }
    ]

    const courses = [
        {
            title: "English for Tourism",
            description: "Master useful expressions for hotel, restaurant, and hospitality settings. Perfect for handling guests and bookings.",
            icon: <Plane className="w-6 h-6 text-white" />,
            bg: "bg-[#08507f]",
            iconBg: "bg-white/20",
            image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_js0lhqjs0lhqjs0l-1-edited.png",
            price: "From Rp 1.000.000 (8 Hours)"
        },
        {
            title: "Conversation English",
            description: "Develop fluency and confidence in everyday conversations. Learn natural expressions and pronunciation tips.",
            icon: <MessageCircle className="w-6 h-6 text-white" />,
            bg: "bg-[#08507f]",
            iconBg: "bg-white/20",
            image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_b11963b11963b119-edited.png",
            price: "From Rp 1.000.000 (8 Hours)"
        },
        {
            title: "Job Interview Prep",
            description: "Prepare for job or J1 internship interviews. Learn to answer questions about skills and experience professionally.",
            icon: <Briefcase className="w-6 h-6 text-white" />,
            bg: "bg-[#08507f]",
            iconBg: "bg-white/20",
            image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_yjd1gjyjd1gjyjd1.png",
            price: "From Rp 1.000.000 (8 Hours)"
        },
        {
            title: "Specialised Fields",
            description: "Custom courses for Teaching, Healthcare, Academic, or other specific fields. Designed for your exact needs.",
            icon: <Stethoscope className="w-6 h-6 text-white" />,
            bg: "bg-[#08507f]",
            iconBg: "bg-white/20",
            image: "https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_js0lhqjs0lhqjs0l-edited.png",
            price: "From Rp 1.200.000 (8 Hours)"
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
                                <Target className="w-4 h-4" />
                                Specialised Training
                            </span>
                            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-6 leading-tight">
                                Learn English Tailored to Your <span className="text-[#08507f]">Profession and Purpose</span>
                            </h1>
                            <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                                The English for Specific Purposes (ESP) program at English with Arik helps you master English for your exact needs — whether for tourism, education, healthcare, or any specialised field.
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
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Industry Focused</span>
                                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500" /> Real Scenarios</span>
                            </div>
                        </div>

                        <div className="relative hidden lg:block">
                            <div className="absolute inset-0 bg-[#08507f]/10 blur-3xl rounded-full transform rotate-12 scale-90"></div>
                            <div className="relative bg-white p-2 rounded-3xl shadow-2xl border border-gray-100 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                                <div className="aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden relative">
                                    <Image
                                        src="https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_ixu5dbixu5dbixu5.png"
                                        alt="English for Specific Purposes"
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
                        <p className="text-lg text-gray-600">Guided by I Putu Arik Budiarsana, helping you achieve your specific professional goals.</p>
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

            {/* Specialised Courses */}
            <section className="py-20 lg:py-28 bg-[#08507f]/5">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Focus</h2>
                        <p className="text-lg text-gray-600">We offer specialised courses to meet different professional and personal goals.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {courses.map((course) => (
                            <div key={course.title} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group flex flex-col">
                                <div className="aspect-video relative overflow-hidden">
                                    <Image
                                        src={course.image}
                                        alt={course.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                                        <span className="text-white font-bold text-lg">{course.title}</span>
                                    </div>
                                </div>
                                <div className="p-6 flex-grow flex flex-col justify-between">
                                    <div>
                                        <p className="text-gray-600 mb-4 text-sm leading-relaxed line-clamp-3">{course.description}</p>
                                        <p className="text-[#08507f] font-bold mb-4">{course.price}</p>
                                    </div>
                                    <Link href={`https://wa.me/628214422358?text=Hi, I'm interested in ${course.title}`}
                                        className="inline-flex items-center justify-center w-full py-2.5 border border-[#08507f]/20 text-[#08507f] font-semibold rounded-lg hover:bg-[#08507f] hover:text-white transition-colors text-sm">
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

            {/* Bottom CTA */}
            <section className="py-20 bg-[#08507f] text-white text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://englishwitharik.id/wp-content/uploads/2023/08/pattern.png')] opacity-10"></div>
                <div className="max-w-4xl mx-auto px-4 relative z-10">
                    <h2 className="text-4xl font-bold mb-6">Start Your Specialised Training</h2>
                    <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">
                        Join professionals who have advanced their careers with English. Reliable, Trusted, and Customised.
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
