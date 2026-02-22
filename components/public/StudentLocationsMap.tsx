'use client'

import dynamic from 'next/dynamic'
import { MapPin } from 'lucide-react'

// Dynamically import the map to avoid SSR issues with Leaflet
const MapComponent = dynamic(() => import('./StudentLocationsMapClient'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] md:h-[500px] bg-slate-100 animate-pulse flex items-center justify-center">
      <span className="text-gray-400">Loading map...</span>
    </div>
  ),
})

const baliAreas = [
  'Denpasar', 'Badung', 'Jembrana', 'Karangasem',
  'Singaraja', 'Tabanan', 'Gianyar', 'Bangli'
]

export default function StudentLocationsMap() {
  return (
    <section className="py-24 px-4 bg-slate-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#08507f] font-bold tracking-wider text-sm uppercase mb-2 block">
            Global Reach
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Our Students Come From
          </h2>
          <p className="text-gray-600 text-lg">
            Join learners from across Indonesia and around the world.
          </p>
        </div>

        {/* Map Container */}
        <div className="relative overflow-hidden">
          <MapComponent />

          {/* Legend */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#be185d] fill-[#be185d]" />
              <span className="text-gray-600">Indonesia</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#08507f] fill-[#08507f]" />
              <span className="text-gray-600">Bali ({baliAreas.join(', ')})</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#f97316] fill-[#f97316]" />
              <span className="text-gray-600">International</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
