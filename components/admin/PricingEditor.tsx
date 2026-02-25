'use client'

import { useState } from 'react'
import { Plus, Trash2, GripVertical, Save, Loader2, Info } from 'lucide-react'

// Same structure as the public shape but with internal inputs
interface HourPackage {
    id?: string
    hours: number
    rawPricePrivate: number
    rawPriceSemi: number
    popular: boolean
}

interface PricingSection {
    name: string
    description: string
    packages: HourPackage[]
}

interface TabData {
    id: string
    label: string
    tier: 'premium' | 'standard'
    features: string[]
    sections: PricingSection[]
}

export default function PricingEditor({ initialTabs }: { initialTabs: TabData[] }) {
    const [tabs, setTabs] = useState<TabData[]>(initialTabs)
    const [activeTabIdx, setActiveTabIdx] = useState(0)
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState('')

    const currentTab = tabs[activeTabIdx]

    // Helpers to update state deeply
    const updateCurrentTab = (updates: Partial<TabData>) => {
        setTabs(prev => {
            const next = [...prev]
            next[activeTabIdx] = { ...next[activeTabIdx], ...updates }
            return next
        })
    }

    const updatePackage = (sIdx: number, pIdx: number, updates: Partial<HourPackage>) => {
        const newSections = [...currentTab.sections]
        newSections[sIdx].packages[pIdx] = { ...newSections[sIdx].packages[pIdx], ...updates }
        updateCurrentTab({ sections: newSections })
    }

    const updatePerk = (idx: number, newVal: string) => {
        const newPerks = [...currentTab.features]
        newPerks[idx] = newVal
        updateCurrentTab({ features: newPerks })
    }

    const removePerk = (idx: number) => {
        const newPerks = currentTab.features.filter((_, i) => i !== idx)
        updateCurrentTab({ features: newPerks })
    }

    const addPerk = () => {
        updateCurrentTab({ features: [...currentTab.features, 'New Perk'] })
    }

    const handleSave = async () => {
        setIsSaving(true)
        setMessage('')
        try {
            const res = await fetch('/api/admin/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tabs }),
            })
            if (!res.ok) throw new Error('Failed to save')
            setMessage('✓ Saved successfully')
            setTimeout(() => setMessage(''), 3000)
        } catch (e: any) {
            setMessage('❌ Error saving changes')
        } finally {
            setIsSaving(false)
        }
    }

    if (!currentTab) return <div>No pricing data found. Check your database seeds.</div>

    return (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">

            {/* Tab navigation */}
            <div className="border-b border-gray-200 bg-gray-50/50 p-2 flex gap-1 overflow-x-auto">
                {tabs.map((tab, idx) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTabIdx(idx)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${idx === activeTabIdx
                                ? 'bg-white text-[#08507f] shadow-sm ring-1 ring-gray-200'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            <div className="p-6">

                {/* Sections & Packages */}
                <div className="space-y-8">
                    {currentTab.sections.map((section, sIdx) => (
                        <div key={sIdx} className="border border-gray-100 rounded-xl p-5 bg-gray-50/50">
                            <h3 className="font-semibold text-gray-800 text-lg">{section.name}</h3>
                            <p className="text-sm text-gray-500 mb-5">{section.description}</p>

                            <div className="space-y-4">
                                {section.packages.map((pkg, pIdx) => (
                                    <div key={pIdx} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-lg border border-gray-200 shadow-sm">

                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Hours</label>
                                            <input
                                                type="number"
                                                value={pkg.hours}
                                                onChange={(e) => updatePackage(sIdx, pIdx, { hours: parseInt(e.target.value) || 0 })}
                                                className="w-full text-sm border-gray-200 rounded-md p-2 bg-gray-50 focus:bg-white focus:ring-1 focus:ring-[#08507f] outline-none"
                                            />
                                        </div>

                                        <div className="md:col-span-4">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Private (Rp)</label>
                                            <input
                                                type="number"
                                                value={pkg.rawPricePrivate}
                                                onChange={(e) => updatePackage(sIdx, pIdx, { rawPricePrivate: parseInt(e.target.value) || 0 })}
                                                className="w-full text-sm font-medium border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#08507f] outline-none"
                                            />
                                        </div>

                                        <div className="md:col-span-4">
                                            <label className="block text-xs font-semibold text-gray-500 mb-1">Semi-Private (Rp)</label>
                                            <input
                                                type="number"
                                                value={pkg.rawPriceSemi}
                                                onChange={(e) => updatePackage(sIdx, pIdx, { rawPriceSemi: parseInt(e.target.value) || 0 })}
                                                className="w-full text-sm font-medium border-gray-200 rounded-md p-2 focus:ring-1 focus:ring-[#08507f] outline-none"
                                            />
                                        </div>

                                        <div className="md:col-span-2 flex flex-col justify-start h-full pt-1">
                                            <label className="inline-flex flex-col gap-1 items-start cursor-pointer mt-5 pl-2">
                                                <input
                                                    type="checkbox"
                                                    checked={pkg.popular}
                                                    onChange={(e) => updatePackage(sIdx, pIdx, { popular: e.target.checked })}
                                                    className="w-4 h-4 text-[#F5A623] border-gray-300 rounded focus:ring-[#F5A623]"
                                                />
                                                <span className="text-xs font-semibold text-gray-500 mt-1 whitespace-nowrap">"Most Popular"</span>
                                            </label>
                                        </div>

                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <hr className="my-8 border-gray-100" />

                {/* Features list */}
                <div>
                    <h3 className="font-semibold text-gray-800 text-lg mb-4 flex items-center justify-between">
                        <span>Included Perks</span>
                        <button
                            onClick={addPerk}
                            className="text-xs inline-flex items-center gap-1 bg-[#08507f]/10 text-[#08507f] hover:bg-[#08507f]/20 px-3 py-1.5 rounded-full font-medium transition-colors"
                        >
                            <Plus size={14} /> Add Perk
                        </button>
                    </h3>

                    <div className="space-y-2">
                        {currentTab.features.map((perk, idx) => (
                            <div key={idx} className="flex flex-col sm:flex-row items-start sm:items-center gap-2 group">
                                <div className="text-gray-300 hidden sm:block p-1">
                                    <GripVertical size={16} />
                                </div>
                                <input
                                    value={perk}
                                    onChange={(e) => updatePerk(idx, e.target.value)}
                                    placeholder="E.g. Full preparation materials"
                                    className="flex-1 text-sm border-gray-200 rounded-md p-2 bg-gray-50 group-hover:bg-white focus:bg-white focus:ring-1 focus:ring-[#08507f] outline-none transition-colors"
                                />
                                <button
                                    onClick={() => removePerk(idx)}
                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                                    title="Remove perk"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        {currentTab.features.length === 0 && (
                            <p className="text-sm text-gray-400 italic">No perks configured.</p>
                        )}
                    </div>

                    <div className="mt-4 flex gap-2 items-center p-3 bg-blue-50/50 rounded-lg text-xs text-blue-600 border border-blue-100">
                        <Info size={14} className="flex-shrink-0" />
                        <p>Shared perks (like Flexible Booking) are automatically appended in the public view.</p>
                    </div>
                </div>

            </div>

            {/* Save bar */}
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
                <p className="text-sm font-medium h-5 text-green-600 transition-opacity">
                    {message}
                </p>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 bg-[#08507f] hover:bg-[#063a5c] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-sm shadow-[#08507f]/20"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {isSaving ? 'Saving...' : 'Save All Changes'}
                </button>
            </div>
        </div>
    )
}
