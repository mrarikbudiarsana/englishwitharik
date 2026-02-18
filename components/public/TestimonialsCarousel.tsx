
'use client'

import React from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { Quote, Star } from 'lucide-react'

type Testimonial = {
    name: string
    role: string
    quote: string
    program: string
}

type Props = {
    testimonials: Testimonial[]
}

const TestimonialsCarousel = ({ testimonials }: Props) => {
    const [emblaRef] = useEmblaCarousel({ loop: true, align: 'start' }, [Autoplay({ delay: 5000 })])

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex touch-pan-y -ml-4">
                {testimonials.map((t, index) => (
                    <div key={`${t.name}-${index}`} className="flex-[0_0_100%] min-w-0 pl-4 md:flex-[0_0_50%] lg:flex-[0_0_33.33%]">
                        <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 relative hover:shadow-lg transition-shadow h-full flex flex-col">
                            <Quote className="absolute top-6 left-6 w-8 h-8 text-[#08507f]/20" />
                            <div className="relative z-10 pt-4 flex-grow">
                                <span className="inline-block bg-blue-100 text-[#08507f] text-xs font-bold px-3 py-1 rounded-full mb-4">
                                    {t.program}
                                </span>
                                <p className="text-gray-700 italic mb-6 text-lg leading-relaxed">{t.quote}</p>
                            </div>
                            <div className="flex items-center gap-4 border-t border-gray-200 pt-6 mt-auto">
                                <div className="w-12 h-12 rounded-full bg-[#08507f] flex items-center justify-center text-white font-bold text-xl shrink-0">
                                    {t.name[0]}
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{t.name}</p>
                                    <p className="text-sm text-gray-500 uppercase tracking-wide text-xs font-semibold">{t.role}</p>
                                </div>
                                <div className="ml-auto flex text-yellow-400 text-sm">
                                    {'★★★★★'.split('').map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TestimonialsCarousel
