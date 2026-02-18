'use client'

import { motion } from 'framer-motion'
import { Target, Lightbulb, CheckCircle2 } from 'lucide-react'

const missionItems = [
    "To provide an enjoyable and communicative English learning experience with materials relevant to each learner’s needs.",
    "To offer personalized guidance for specific goals — from General and Business English to international test preparation (IELTS, TOEFL, PTE).",
    "To apply international standards (CEFR, Cambridge, British Council, Pearson, IDP) to ensure high-quality teaching.",
    "To utilize digital technology (Zoom/Google Meet with lifetime class recordings) for flexible learning.",
    "To deliver direct feedback and effective study strategies, helping students progress quickly and confidently.",
    "To continuously enhance teaching quality through international certifications, professional experience, and ongoing training."
]

export default function AboutVision() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                {/* Header / Tagline */}
                <div className="text-center mb-16 max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="text-[#08507f] font-semibold tracking-wide uppercase text-sm">Our Philosophy</span>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            The Gateway to Global Success
                        </h2>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-start">
                    {/* Vision */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 h-full"
                    >
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-[#08507f]">
                            <Lightbulb className="w-6 h-6" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-4">Our Vision</h3>
                        <p className="text-gray-600 leading-relaxed text-lg">
                            To become a gateway to global success through personalized, interactive, and internationally recognized English learning—empowering every student to achieve their academic, professional, and personal goals.
                        </p>
                    </motion.div>

                    {/* Mission */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-[#08507f]">
                                <Target className="w-6 h-6" />
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900">Our Mission</h3>
                        </div>
                        <ul className="space-y-4">
                            {missionItems.map((item, index) => (
                                <li key={index} className="flex gap-3 text-gray-600">
                                    <CheckCircle2 className="w-5 h-5 text-[#08507f] shrink-0 mt-0.5" />
                                    <span className="leading-relaxed">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>
                </div>
            </div>
        </section>
    )
}
