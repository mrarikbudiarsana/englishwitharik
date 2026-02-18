'use client'

import { motion } from 'framer-motion'
import { Users, GraduationCap, Globe, BookOpen } from 'lucide-react'

const stats = [
    { label: 'Years Experience', value: '10+', icon: Users },
    { label: 'Students Helped', value: '1,000+', icon: GraduationCap },
    { label: 'Tests Taught', value: '5+', icon: BookOpen },
    { label: 'Countries Reach', value: 'Global', icon: Globe },
]

export default function AboutStats() {
    return (
        <section className="py-12 -mt-16 relative z-10 px-4 sm:px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
                    {stats.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="bg-white rounded-2xl p-6 shadow-xl shadow-blue-900/5 text-center border border-blue-50 hover:border-blue-100 transition-colors"
                        >
                            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 text-[#08507f]">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-gray-500 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    )
}
