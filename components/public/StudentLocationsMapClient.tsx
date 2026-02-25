'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Indonesian city locations with lat/lng coordinates
const indonesianLocations = [
  // Sumatra
  { city: 'Pekanbaru', lat: 0.5071, lng: 101.4478 },
  { city: 'Padang', lat: -0.9471, lng: 100.4172 },
  { city: 'Bengkulu', lat: -3.7928, lng: 102.2608 },
  { city: 'Lampung', lat: -5.4500, lng: 105.2667 },
  // Java
  { city: 'Jakarta', lat: -6.2088, lng: 106.8456 },
  { city: 'Bekasi', lat: -6.2349, lng: 106.9896 },
  { city: 'Depok', lat: -6.4025, lng: 106.7942 },
  { city: 'Bandung', lat: -6.9175, lng: 107.6191 },
  { city: 'Tasikmalaya', lat: -7.3274, lng: 108.2207 },
  { city: 'Semarang', lat: -6.9666, lng: 110.4196 },
  { city: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
  { city: 'Surabaya', lat: -7.2575, lng: 112.7521 },
  { city: 'Sidoarjo', lat: -7.4478, lng: 112.7183 },
  // Madura
  { city: 'Madura', lat: -7.0456, lng: 113.4843 },
  // Bali
  { city: 'Bali', lat: -8.4095, lng: 115.1889, highlight: true },
  // Kalimantan
  { city: 'Samarinda', lat: -0.4948, lng: 117.1436 },
  // Nusa Tenggara
  { city: 'Kupang', lat: -10.1787, lng: 123.6070 },
]

// International locations
const internationalLocations = [
  // Australia
  { city: 'Melbourne', country: 'Australia', flag: '🇦🇺', lat: -37.8136, lng: 144.9631 },
  { city: 'Adelaide', country: 'Australia', flag: '🇦🇺', lat: -34.9285, lng: 138.6007 },
  { city: 'Alice Springs', country: 'Australia', flag: '🇦🇺', lat: -23.6980, lng: 133.8807 },
  { city: 'Katherine', country: 'Australia', flag: '🇦🇺', lat: -14.4520, lng: 132.2711 },
  { city: 'Millmerran', country: 'Australia', flag: '🇦🇺', lat: -27.8697, lng: 151.2732 },
  { city: 'Perth', country: 'Australia', flag: '🇦🇺', lat: -31.9505, lng: 115.8605 },
  // Turkey
  { city: 'Istanbul', country: 'Turkey', flag: '🇹🇷', lat: 41.0082, lng: 28.9784 },
  // USA
  { city: 'Arkansas', country: 'USA', flag: '🇺🇸', lat: 34.7465, lng: -92.2896 },
]

const baliAreas = [
  'Denpasar', 'Badung', 'Jembrana', 'Karangasem',
  'Singaraja', 'Tabanan', 'Gianyar', 'Bangli'
]

// Custom marker icons
const createCustomIcon = (color: string, size: number = 24) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="${color}" stroke="white" stroke-width="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3" fill="white"/>
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  })
}

const defaultIcon = createCustomIcon('#be185d', 28)
const highlightIcon = createCustomIcon('#08507f', 32)
const internationalIcon = createCustomIcon('#f97316', 28) // Orange for international

// Center to show global reach (shifted to show Indonesia + Australia + Turkey + USA)
const center: [number, number] = [10, 80]

export default function StudentLocationsMapClient() {
  return (
    <div className="w-full h-[400px] md:h-[500px] overflow-hidden">
      <MapContainer
        center={center}
        zoom={2}
        scrollWheelZoom={false}
        className="w-full h-full z-0"
        style={{ background: '#c9e7f5' }}
        minZoom={2}
        maxZoom={10}
      >
        {/* OpenStreetMap Tiles - Clean style */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Indonesian City Markers */}
        {indonesianLocations.map((loc) => (
          <Marker
            key={loc.city}
            position={[loc.lat, loc.lng]}
            icon={loc.highlight ? highlightIcon : defaultIcon}
          >
            <Popup>
              <div className="text-center">
                <h4 className="font-bold text-gray-900 text-sm">{loc.city}</h4>
                {loc.city === 'Bali' && (
                  <p className="text-xs text-gray-600 mt-1">
                    {baliAreas.join(', ')}
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* International Markers */}
        {internationalLocations.map((loc) => (
          <Marker
            key={`${loc.city}-${loc.country}`}
            position={[loc.lat, loc.lng]}
            icon={internationalIcon}
          >
            <Popup>
              <div className="text-center">
                <span className="text-lg">{loc.flag}</span>
                <h4 className="font-bold text-gray-900 text-sm">{loc.city}</h4>
                <p className="text-xs text-gray-500">{loc.country}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
