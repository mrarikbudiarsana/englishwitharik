'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, MapPin } from 'lucide-react'

// Utilities (copied from page to keep this self-contained or importable)
function countryFlag(code: string) {
    return [...code.toUpperCase()]
        .map(c => String.fromCodePoint(0x1f1e6 + c.charCodeAt(0) - 65))
        .join('')
}

function countryName(code: string) {
    try { return new Intl.DisplayNames(['en'], { type: 'region' }).of(code) ?? code }
    catch { return code }
}

interface CityData {
    name: string
    count: number
}

interface CountryData {
    code: string
    count: number
    cities: CityData[]
}

export default function StatsLocations({ data }: { data: CountryData[] }) {
    const [expanded, setExpanded] = useState<Set<string>>(new Set())

    function toggle(code: string) {
        const next = new Set(expanded)
        if (next.has(code)) next.delete(code)
        else next.add(code)
        setExpanded(next)
    }

    if (data.length === 0) {
        return <p className="text-sm text-gray-400">No location data in this period.</p>
    }

    return (
        <div className="divide-y divide-gray-50">
            {data.map(c => {
                const isOpen = expanded.has(c.code)
                const hasCities = c.cities.length > 0

                return (
                    <div key={c.code} className="group">
                        <button
                            onClick={() => hasCities && toggle(c.code)}
                            className={`w-full flex items-center justify-between py-2 text-left transition-colors ${hasCities ? 'hover:bg-gray-50 cursor-pointer' : 'cursor-default'
                                }`}
                        >
                            <div className="flex items-center gap-2.5 flex-1 mr-4">
                                <span className="text-base leading-none">{countryFlag(c.code)}</span>
                                <span className="text-sm text-gray-700 font-medium">{countryName(c.code)}</span>
                                {hasCities && (
                                    <span className="text-gray-400">
                                        {isOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{c.count}</span>
                        </button>

                        {/* City list */}
                        {isOpen && hasCities && (
                            <div className="pl-9 pr-0 pb-2 space-y-1">
                                {c.cities.map(city => (
                                    <div key={city.name} className="flex items-center justify-between text-sm">
                                        <div className="flex items-center gap-2 text-gray-500">
                                            <MapPin size={12} className="opacity-50" />
                                            <span>{city.name === 'null' ? 'Unknown City' : city.name}</span>
                                        </div>
                                        <span className="text-xs text-gray-400 tabular-nums">{city.count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
