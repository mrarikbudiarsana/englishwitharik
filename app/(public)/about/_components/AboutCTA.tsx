'use client'

import { motion } from 'framer-motion'
import { ArrowRight, MessageCircle } from 'lucide-react'

export default function AboutCTA() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    viewport={{ once: true }}
                    className="bg-[#08507f] rounded-[2.5rem] p-8 sm:p-16 text-center overflow-hidden relative"
                >
                    {/* Decorative background elements */}
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                        <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full blur-3xl" />
                        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-400 rounded-full blur-3xl" />
                    </div>

                    <div className="relative z-10 max-w-2xl mx-auto">
                        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
                            Ready to start your journey?
                        </h2>
                        <p className="text-blue-100 text-lg mb-10">
                            Whether you&apos;re preparing for an exam or looking to improve your general English,
                            I&apos;m here to guide you every step of the way.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <a
                                href="https://wa.me/628214422358"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 bg-white text-[#08507f] font-bold py-4 px-8 rounded-xl hover:bg-blue-50 transition-colors"
                                aria-label="Contact on WhatsApp"
                            >
                                <MessageCircle className="w-5 h-5" />
                                Contact via WhatsApp
                            </a>
                            <a
                                href="/contact"
                                className="inline-flex items-center justify-center gap-2 bg-[#08507f] border border-blue-400/30 text-white font-bold py-4 px-8 rounded-xl hover:bg-[#063a5c] transition-colors"
                            >
                                Book Consultation
                                <ArrowRight className="w-5 h-5" />
                            </a>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    )
}
