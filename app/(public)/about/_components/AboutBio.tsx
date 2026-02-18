'use client'

import { motion } from 'framer-motion'
import { MapPin, Clock } from 'lucide-react'

interface AboutBioProps {
    content?: string | null
}

export default function AboutBio({ content }: AboutBioProps) {
    return (
        <section className="py-16 sm:py-24 bg-white">
            <div className="max-w-4xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                >
                    {content ? (
                        <div
                            className="prose prose-lg prose-blue max-w-none prose-headings:font-bold prose-headings:text-[#08507f] prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600"
                            dangerouslySetInnerHTML={{ __html: content }}
                        />
                    ) : (
                        <div className="space-y-8">
                            <div className="prose prose-lg prose-blue max-w-none">
                                <p className="text-xl text-gray-600 leading-relaxed mb-8">
                                    Hi! I&apos;m <strong className="text-[#08507f]">Arik Budiarsana</strong>, a dedicated English tutor with a passion for helping students unlock their potential. Based in the beautiful island of Bali, I specialize in preparing students for major proficiency exams and improving their professional communication skills.
                                </p>
                                <div className="grid sm:grid-cols-2 gap-8 mb-12">
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg">My Mission</h3>
                                        <p className="text-gray-600">
                                            To provide personalized, high-quality English education that empowers individuals to pursue their dreams of studying abroad, immigrating, or advancing their careers globally.
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                        <h3 className="font-bold text-gray-900 mb-3 text-lg">My Approach</h3>
                                        <p className="text-gray-600">
                                            I believe in a practical, results-oriented teaching method. By focusing on both exam strategies and fundamental language skills, I help students build genuine confidence.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid sm:grid-cols-2 gap-6">
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100/50">
                                    <MapPin className="w-6 h-6 text-[#08507f] shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Located in Bali</h4>
                                        <p className="text-gray-600 text-sm">Banjar Dinas Sema, Sangsit Village, Sawan District, Buleleng</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 p-4 rounded-xl bg-blue-50 border border-blue-100/50">
                                    <Clock className="w-6 h-6 text-[#08507f] shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 mb-1">Teaching Hours</h4>
                                        <p className="text-gray-600 text-sm">Daily 07:00 – 23:00 WITA (GMT+8)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </motion.div>
            </div>
        </section>
    )
}
