'use client'

import { motion } from 'framer-motion'
import { Award, BookOpen, Clock, MessageCircle, UserCheck, Globe2 } from 'lucide-react'

const features = [
    {
        icon: Award,
        title: "Internationally Certified",
        description: "Certified tutor (TESOL/TEFL, TEOL, IELTS Speaking & Writing by IDP, PTE by Pearson) and Ministry of Education certified educator."
    },
    {
        icon: Clock, // Represents flexibility
        title: "Flexible Programs",
        description: "Tailored programs including General English (CEFR A1–C2), Business English, ESP, and IELTS/TOEFL/PTE preparation."
    },
    {
        icon: BookOpen,
        title: "Premium Materials",
        description: "Trusted, high-quality learning resources from industry leaders like Cambridge, British Council, Pearson, Collins, and IDP."
    },
    {
        icon: MessageCircle,
        title: "Communicative Approach",
        description: "Interactive teaching method focused on real-world usage, with lifetime access to class recordings for your review."
    },
    {
        icon: UserCheck,
        title: "Personalized Feedback",
        description: "Receive detailed, constructive feedback (real-time and delayed) along with test simulations for optimal preparation."
    },
    {
        icon: Globe2,
        title: "Trusted Globally",
        description: "A trusted choice for local students in Indonesia and the Indonesian diaspora community worldwide."
    }
]

export default function AboutWhyChooseUs() {
    return (
        <section className="py-24 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        <span className="text-[#08507f] font-semibold tracking-wide uppercase text-sm">Why Us?</span>
                        <h2 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Why Choose English with Arik?
                        </h2>
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={feature.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-6 text-[#08507f]">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">
                                {feature.title}
                            </h3>
                            <p className="text-gray-600 leading-relaxed text-sm">
                                {feature.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
