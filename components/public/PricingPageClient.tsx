'use client'

import { useState } from 'react'

/* ─────────────────────────────────────────────
   DATA
───────────────────────────────────────────── */

const WA_LINK = 'https://wa.me/6282144223581'

type SessionType = 'private' | 'semi'

interface HourPackage {
    hours: number
    pricePrivate: string
    priceSemi: string
    popular?: boolean
}

interface PricingSection {
    name: string
    description: string
    packages: HourPackage[]
}

interface Tab {
    id: string
    label: string
    tier: 'premium' | 'standard'
    sections: PricingSection[]
    features: string[]
}

const TABS: Tab[] = [
    {
        id: 'ielts',
        label: 'IELTS',
        tier: 'premium',
        features: [
            'Full preparation materials',
            'Mock tests & band prediction',
            'Personalized study plan',
            'WhatsApp support',
            'Progress tracking',
        ],
        sections: [
            {
                name: 'Full Preparation & Skill-Focused Training',
                description: 'Covers all IELTS skills — Listening, Reading, Writing & Speaking.',
                packages: [
                    { hours: 8, pricePrivate: 'Rp 1,000,000', priceSemi: 'Rp 600,000' },
                    { hours: 16, pricePrivate: 'Rp 2,000,000', priceSemi: 'Rp 1,200,000', popular: true },
                    { hours: 24, pricePrivate: 'Rp 3,000,000', priceSemi: 'Rp 1,800,000' },
                ],
            },
        ],
    },
    {
        id: 'pte',
        label: 'PTE Academic',
        tier: 'premium',
        features: [
            'AI-scored practice tests',
            'PTE-specific strategies',
            'Full skill coverage',
            'WhatsApp support',
            'Progress tracking',
        ],
        sections: [
            {
                name: 'Full Preparation & Skill-Focused Training',
                description: 'Covers all PTE skills with computer-based exam techniques.',
                packages: [
                    { hours: 8, pricePrivate: 'Rp 1,000,000', priceSemi: 'Rp 600,000' },
                    { hours: 16, pricePrivate: 'Rp 2,000,000', priceSemi: 'Rp 1,200,000', popular: true },
                    { hours: 24, pricePrivate: 'Rp 3,000,000', priceSemi: 'Rp 1,800,000' },
                ],
            },
        ],
    },
    {
        id: 'toefl-ibt',
        label: 'TOEFL iBT',
        tier: 'premium',
        features: [
            'Internet-based test strategies',
            'Integrated task practice',
            'Full skill coverage',
            'WhatsApp support',
            'Progress tracking',
        ],
        sections: [
            {
                name: 'Full Preparation & Skill-Focused Training',
                description: 'Covers all TOEFL iBT sections including integrated tasks.',
                packages: [
                    { hours: 8, pricePrivate: 'Rp 1,000,000', priceSemi: 'Rp 600,000' },
                    { hours: 16, pricePrivate: 'Rp 2,000,000', priceSemi: 'Rp 1,200,000', popular: true },
                    { hours: 24, pricePrivate: 'Rp 3,000,000', priceSemi: 'Rp 1,800,000' },
                ],
            },
        ],
    },
    {
        id: 'toefl-itp',
        label: 'TOEFL ITP',
        tier: 'standard',
        features: [
            'Paper-based test strategies',
            'Grammar & structure focus',
            'Full skill coverage',
            'WhatsApp support',
            'Progress tracking',
        ],
        sections: [
            {
                name: 'Full Preparation & Skill-Focused Training',
                description: 'Paper-based test preparation covering Structure, Listening & Reading.',
                packages: [
                    { hours: 8, pricePrivate: 'Rp 800,000', priceSemi: 'Rp 500,000' },
                    { hours: 16, pricePrivate: 'Rp 1,600,000', priceSemi: 'Rp 1,000,000', popular: true },
                    { hours: 24, pricePrivate: 'Rp 2,400,000', priceSemi: 'Rp 1,500,000' },
                ],
            },
        ],
    },
    {
        id: 'general',
        label: 'General English',
        tier: 'standard',
        features: [
            'A1–B2 levels available',
            'Daily communication skills',
            'Vocabulary & grammar',
            'WhatsApp support',
            'Completion certificate (optional)',
        ],
        sections: [
            {
                name: 'A1–A2 (Beginner to Elementary)',
                description: 'Build your English foundation from the ground up.',
                packages: [
                    { hours: 8, pricePrivate: 'Rp 800,000', priceSemi: 'Rp 500,000' },
                    { hours: 16, pricePrivate: 'Rp 1,600,000', priceSemi: 'Rp 1,000,000', popular: true },
                    { hours: 24, pricePrivate: 'Rp 2,400,000', priceSemi: 'Rp 1,500,000' },
                ],
            },
            {
                name: 'B1–B2 (Intermediate to Upper-Intermediate)',
                description: 'Strengthen fluency and accuracy for academic or professional use.',
                packages: [
                    { hours: 8, pricePrivate: 'Rp 800,000', priceSemi: 'Rp 500,000' },
                    { hours: 16, pricePrivate: 'Rp 1,600,000', priceSemi: 'Rp 1,000,000', popular: true },
                    { hours: 24, pricePrivate: 'Rp 2,400,000', priceSemi: 'Rp 1,500,000' },
                ],
            },
        ],
    },
    {
        id: 'business',
        label: 'Business English',
        tier: 'standard',
        features: [
            'Tourism, Business, Job Interview & more',
            'Professional communication skills',
            'Industry-specific vocabulary',
            'WhatsApp support',
            'Completion certificate (optional)',
        ],
        sections: [
            {
                name: 'English for Specific Purposes',
                description: 'Business English, Tourism, Job Interviews, and other professional contexts.',
                packages: [
                    { hours: 8, pricePrivate: 'Rp 800,000', priceSemi: 'Rp 500,000' },
                    { hours: 16, pricePrivate: 'Rp 1,600,000', priceSemi: 'Rp 1,000,000', popular: true },
                    { hours: 24, pricePrivate: 'Rp 2,400,000', priceSemi: 'Rp 1,500,000' },
                ],
            },
        ],
    },
]

// Features shared across every programme and package tier
const SHARED_FEATURES = [
    'Student portal access (portal.englishwitharik.com)',
    'Quizzes & games',
    'Flexible booking',
]

/* ─────────────────────────────────────────────
   ICONS
───────────────────────────────────────────── */

function CheckIcon({ className }: { className?: string }) {
    return (
        <svg
            className={className}
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="8" cy="8" r="8" fill="currentColor" fillOpacity="0.12" />
            <path
                d="M4.5 8.2L6.8 10.5L11.5 5.5"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

function StarIcon() {
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 1L7.545 4.09L11 4.635L8.5 7.07L9.09 10.5L6 8.875L2.91 10.5L3.5 7.07L1 4.635L4.455 4.09L6 1Z" />
        </svg>
    )
}

function UserIcon() {
    return (
        <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="7.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M2 13c0-3.038 2.462-5.5 5.5-5.5S13 9.962 13 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
    )
}

function UsersIcon() {
    return (
        <svg width="17" height="15" viewBox="0 0 17 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6.5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M1 13c0-3.038 2.462-5.5 5.5-5.5S12 9.962 12 13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            <circle cx="12" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3" />
            <path d="M15 12.5c0-2.209-1.343-4-3-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
    )
}

function GiftIcon() {
    return (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="5" width="12" height="2" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <rect x="2" y="7" width="10" height="6" rx="1" stroke="currentColor" strokeWidth="1.3" />
            <path d="M7 5V13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
            <path d="M7 5C7 5 5 4 5 2.5C5 1.672 5.672 1 6.5 1C7.328 1 7.5 2 7 5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
            <path d="M7 5C7 5 9 4 9 2.5C9 1.672 8.328 1 7.5 1C6.672 1 6.5 2 7 5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
    )
}

/* ─────────────────────────────────────────────
   PRICE CARD
───────────────────────────────────────────── */

function PriceCard({
    pkg,
    sessionType,
}: {
    pkg: HourPackage
    sessionType: SessionType
}) {
    const price = sessionType === 'private' ? pkg.pricePrivate : pkg.priceSemi
    const perHour =
        sessionType === 'private'
            ? Math.round(parseInt(pkg.pricePrivate.replace(/\D/g, '')) / pkg.hours).toLocaleString('id-ID')
            : Math.round(parseInt(pkg.priceSemi.replace(/\D/g, '')) / pkg.hours).toLocaleString('id-ID')

    return (
        <div
            className={`relative rounded-2xl border p-6 flex flex-col transition-shadow hover:shadow-lg ${pkg.popular
                ? 'border-[#08507f] bg-gradient-to-br from-[#08507f]/5 to-[#0a6aaa]/5 shadow-md'
                : 'border-gray-200 bg-white'
                }`}
        >
            {pkg.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-[#F5A623] text-white text-xs font-bold px-3 py-1 rounded-full shadow whitespace-nowrap">
                        <StarIcon />
                        Most Popular
                    </span>
                </div>
            )}

            <div className="text-center mb-5 pt-2">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                    {pkg.hours} Hours
                </p>
                <p className="text-4xl font-extrabold text-gray-900 mb-1">{price}</p>
                <p className="text-xs text-gray-400">Rp {perHour} / hour</p>
            </div>

            <a
                href={`${WA_LINK}?text=Hi%2C+I%27m+interested+in+the+${pkg.hours}-hour+package`}
                target="_blank"
                rel="noopener noreferrer"
                className={`mt-auto block text-center py-2.5 rounded-xl font-semibold text-sm transition-all cursor-pointer ${pkg.popular
                    ? 'bg-[#08507f] hover:bg-[#063a5c] text-white shadow-sm hover:shadow'
                    : 'border border-[#08507f] text-[#08507f] hover:bg-[#08507f] hover:text-white'
                    }`}
            >
                Book via WhatsApp
            </a>
        </div>
    )
}

/* ─────────────────────────────────────────────
   INCLUDED FEATURES SECTION
───────────────────────────────────────────── */

function IncludedFeatures({ features }: { features: string[] }) {
    return (
        <div className="mt-10 rounded-2xl border border-gray-100 bg-white overflow-hidden">
            {/* Header bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 bg-gray-50">
                <div className="w-1.5 h-1.5 rounded-full bg-[#08507f]" />
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Every package includes
                </p>
            </div>
            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5 px-5 py-5">
                {features.map((f) => (
                    <span
                        key={f}
                        className="inline-flex items-center gap-2 bg-[#08507f]/6 text-[#08507f] text-sm font-medium px-3.5 py-1.5 rounded-full border border-[#08507f]/12"
                    >
                        <CheckIcon className="w-3.5 h-3.5 text-[#08507f] shrink-0" />
                        {f}
                    </span>
                ))}
            </div>
        </div>
    )
}

/* ─────────────────────────────────────────────
   MAIN EXPORT
───────────────────────────────────────────── */

export default function PricingPageClient() {
    const [activeTab, setActiveTab] = useState<string>('ielts')
    const [sessionType, setSessionType] = useState<SessionType>('private')

    const tab = TABS.find((t) => t.id === activeTab)!

    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">

            {/* ── Hero ── */}
            <div className="text-center mb-12">
                <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-3 tracking-tight">
                    Transparent Pricing
                </h1>
                <p className="text-gray-500 text-lg max-w-xl mx-auto">
                    Flexible packages for every learning goal. No hidden fees — just great English coaching.
                </p>
                {/* Free trial nudge */}
                <div className="inline-flex items-center gap-2 mt-5 bg-green-50 text-green-700 border border-green-200 rounded-full px-5 py-2 text-sm font-medium">
                    <GiftIcon />
                    First trial class is <strong className="ml-0.5">FREE</strong> (15–30 min)
                    <a
                        href={WA_LINK}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-semibold hover:text-green-800 cursor-pointer"
                    >
                        Claim now
                    </a>
                </div>
            </div>

            {/* ── Programme Tabs ── */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                {TABS.map((t) => (
                    <button
                        key={t.id}
                        onClick={() => setActiveTab(t.id)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer border ${activeTab === t.id
                            ? 'bg-[#08507f] text-white border-[#08507f] shadow'
                            : 'bg-white text-gray-600 border-gray-200 hover:border-[#08507f]/50 hover:text-[#08507f]'
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* ── Private / Semi-Private Toggle ── */}
            <div className="flex justify-center mb-10">
                <div className="inline-flex bg-gray-100 rounded-xl p-1 gap-1">
                    <button
                        onClick={() => setSessionType('private')}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${sessionType === 'private'
                            ? 'bg-white text-[#08507f] shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <UserIcon />
                        Private (1-on-1)
                    </button>
                    <button
                        onClick={() => setSessionType('semi')}
                        className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${sessionType === 'semi'
                            ? 'bg-white text-[#08507f] shadow-sm border border-gray-200'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <UsersIcon />
                        Semi-Private (2–3 students)
                    </button>
                </div>
            </div>

            {/* ── Pricing Sections ── */}
            <div className="space-y-12">
                {tab.sections.map((section) => (
                    <div key={section.name}>
                        <div className={`mb-6 ${tab.sections.length === 1 ? 'text-center' : ''}`}>
                            <h2 className="text-xl font-bold text-gray-800 mb-1">{section.name}</h2>
                            <p className="text-gray-500 text-sm">{section.description}</p>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                            {section.packages.map((pkg) => (
                                <PriceCard key={pkg.hours} pkg={pkg} sessionType={sessionType} />
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* ── What's Included ── */}
            <IncludedFeatures features={[...tab.features, ...SHARED_FEATURES]} />


            {/* ── Single Session ── */}
            <div className="mt-8 rounded-2xl bg-gradient-to-r from-[#08507f] to-[#0a6aaa] p-6 text-white text-center">
                <p className="text-lg font-bold mb-1">Not ready to commit to a package?</p>
                <p className="text-sm text-white/80 mb-4">
                    Book a single casual session for Rp 150,000 (1 hour) — no package required.
                </p>
                <a
                    href={`${WA_LINK}?text=Hi%2C+I'd+like+to+book+a+single+casual+session`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-[#F5A623] hover:bg-[#d48f1e] text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors cursor-pointer shadow"
                >
                    Book a Single Session
                </a>
            </div>

            {/* ── Footer note ── */}
            <p className="text-center text-gray-400 text-xs mt-10">
                All prices are in Indonesian Rupiah (IDR). Prices last updated July 2025. For group enquiries or custom packages,{' '}
                <a
                    href={WA_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#08507f] underline cursor-pointer"
                >
                    contact us on WhatsApp
                </a>
                .
            </p>
        </div>
    )
}
