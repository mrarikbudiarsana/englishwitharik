'use client'

import { motion } from 'framer-motion'

export default function AboutHero() {
    return (
        <section className="relative overflow-hidden bg-white pt-24 pb-12 sm:pt-32 sm:pb-16">
            <div className="absolute inset-0 -z-10 h-full w-full bg-white">
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_500px_at_50%_200px,#dbeafe,transparent)] opacity-40"></div>
            </div>

            <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl mb-6">
                        Arik Budiarsana
                    </h1>
                    <p className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
                        Professional English Tutor based in Bali, helping students achieve their global ambitions through language mastery and personalized guidance.
                    </p>
                </motion.div>
            </div>
        </section>
    )
}
