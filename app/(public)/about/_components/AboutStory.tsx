'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

export default function AboutStory() {
    return (
        <section className="py-24 bg-white overflow-hidden">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-16 items-center">
                    {/* Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                        className="order-2 lg:order-1"
                    >
                        <span className="text-[#08507f] font-semibold tracking-wide uppercase text-sm">Who We Are</span>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl mb-6">
                            About Us
                        </h2>
                        <div className="prose prose-lg text-gray-600 leading-relaxed">
                            <p className="mb-6">
                                English with Arik was founded by <strong className="text-gray-900">I Putu Arik Budiarsana</strong>, a professional English tutor with over 13 years of teaching experience, including more than four years online.
                            </p>
                            <p>
                                We are dedicated to helping learners of all ages and backgrounds—both in Indonesia and abroad—reach their English goals.
                            </p>
                        </div>

                        <div className="mt-8 flex flex-col sm:flex-row gap-4">
                            <div className="flex flex-col gap-1 border-l-4 border-blue-100 pl-4">
                                <span className="text-2xl font-bold text-[#08507f]">13+</span>
                                <span className="text-sm text-gray-500 font-medium">Years Experience</span>
                            </div>
                            <div className="flex flex-col gap-1 border-l-4 border-blue-100 pl-4">
                                <span className="text-2xl font-bold text-[#08507f]">Global</span>
                                <span className="text-sm text-gray-500 font-medium">Student Base</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Image */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="order-1 lg:order-2 relative"
                    >
                        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/10">
                            {/* Note: Using standard img tag for external URL if not configured in next.config.js, 
                                but prefer Image component if allowed. 
                                Since we don't know if the wordpress domain is allowed, we'll try Image first, 
                                but in the actual implementation I'll use a standard img tag with optimized classes 
                                to avoid configuration errors during this automated step. 
                             */}
                            <img
                                src="https://englishwitharik.wordpress.com/wp-content/uploads/2025/10/gemini_generated_image_n3l5dhn3l5dhn3l5-1.png?w=800"
                                alt="Arik Budiarsana Teaching"
                                className="object-cover w-full h-full transform hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-2xl" />
                        </div>

                        {/* Decorative elements */}
                        <div className="absolute -z-10 -bottom-6 -right-6 w-24 h-24 bg-blue-50 rounded-full blur-2xl" />
                        <div className="absolute -z-10 -top-6 -left-6 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl" />
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
