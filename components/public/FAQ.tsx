'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/components/ui/cn'

interface FAQItem {
    question: string
    answer: string
}

interface FAQProps {
    items: FAQItem[]
    className?: string
}

export default function FAQ({ items, className }: FAQProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null)

    return (
        <div className={cn("space-y-4", className)}>
            {items.map((item, index) => (
                <div
                    key={index}
                    className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:border-[#08507f]/30 transition-colors"
                >
                    <button
                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                        className="w-full flex items-center justify-between p-4 text-left font-medium text-gray-900"
                    >
                        <span>{item.question}</span>
                        <ChevronDown
                            className={cn(
                                "w-5 h-5 text-gray-500 transition-transform duration-200",
                                openIndex === index && "transform rotate-180 text-[#08507f]"
                            )}
                        />
                    </button>

                    <AnimatePresence>
                        {openIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <div className="px-4 pb-4 text-gray-600 border-t border-gray-100 pt-3">
                                    {item.answer}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    )
}
