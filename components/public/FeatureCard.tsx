'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import { cn } from '@/components/ui/cn'

interface FeatureCardProps {
    title: string
    description: string
    icon: React.ReactNode
    className?: string
    delay?: number
}

export default function FeatureCard({ title, description, icon, className, delay = 0 }: FeatureCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay }}
            viewport={{ once: true }}
            className={cn(
                "bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#08507f]/20 transition-all duration-300",
                className
            )}
        >
            <div className="w-12 h-12 bg-[#08507f]/5 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#08507f]/10 transition-colors">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </motion.div>
    )
}
