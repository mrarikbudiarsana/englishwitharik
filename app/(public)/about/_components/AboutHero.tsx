'use client'

import { motion } from 'framer-motion'

export default function AboutHero() {
    return (
        <section className="relative overflow-hidden bg-[#08507f] text-white py-24 sm:py-32">
            <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

            <div className="relative max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="w-32 h-32 sm:w-40 sm:h-40 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center border-4 border-white/20 mb-8 mx-auto shadow-2xl">
                        <span className="text-4xl sm:text-5xl font-bold">AB</span>
                    </div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="text-4xl sm:text-6xl font-bold tracking-tight mb-6"
                >
                    Arik Budiarsana
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="text-lg sm:text-xl text-blue-100 max-w-2xl leading-relaxed"
                >
                    Professional English Tutor based in Bali, helping students achieve their global ambitions through language mastery.
                </motion.p>
            </div>
        </section>
    )
}
