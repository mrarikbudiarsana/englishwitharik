'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

type InternationalLocation = {
  city: string
  country: string
  countryCode: string
  lat: number
  lng: number
}

// Indonesian city locations with lat/lng coordinates
const indonesianLocations = [
  // Sumatra
  { city: 'Pekanbaru', lat: 0.5071, lng: 101.4478 },
  { city: 'Padang', lat: -0.9471, lng: 100.4172 },
  { city: 'Bengkulu', lat: -3.7928, lng: 102.2608 },
  { city: 'Lampung', lat: -5.45, lng: 105.2667 },
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
  { city: 'Kupang', lat: -10.1787, lng: 123.607 },
]

// International locations where Indonesian students are based
const internationalLocations: InternationalLocation[] = [
  // Australia
  { city: 'Sydney', country: 'Australia', countryCode: 'AU', lat: -33.8688, lng: 151.2093 },
  { city: 'Melbourne', country: 'Australia', countryCode: 'AU', lat: -37.8136, lng: 144.9631 },
  { city: 'Adelaide', country: 'Australia', countryCode: 'AU', lat: -34.9285, lng: 138.6007 },
  { city: 'Alice Springs', country: 'Australia', countryCode: 'AU', lat: -23.698, lng: 133.8807 },
  { city: 'Katherine', country: 'Australia', countryCode: 'AU', lat: -14.452, lng: 132.2711 },
  { city: 'Millmerran', country: 'Australia', countryCode: 'AU', lat: -27.8697, lng: 151.2732 },
  { city: 'Perth', country: 'Australia', countryCode: 'AU', lat: -31.9505, lng: 115.8605 },
  // UAE
  { city: 'Abu Dhabi', country: 'UAE', countryCode: 'AE', lat: 24.4539, lng: 54.3773 },
  // Turkey
  { city: 'Istanbul', country: 'Turkey', countryCode: 'TR', lat: 41.0082, lng: 28.9784 },
  // USA
  { city: 'Arkansas', country: 'USA', countryCode: 'US', lat: 34.7465, lng: -92.2896 },
]

const baliAreas = [
  'Denpasar', 'Badung', 'Jembrana', 'Karangasem',
  'Singaraja', 'Tabanan', 'Gianyar', 'Bangli',
]

// Convert ISO country code to emoji flag for fallback.
const countryCodeToFlagEmoji = (countryCode: string): string => {
  const base = 127397
  return countryCode
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 2)
    .split('')
    .map((char) => String.fromCodePoint(char.charCodeAt(0) + base))
    .join('')
}

const countryCodeToFlagIconUrl = (countryCode: string): string => {
  const normalized = countryCode.toLowerCase().replace(/[^a-z]/g, '').slice(0, 2)
  return `https://flagcdn.com/w40/${normalized}.png`
}

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

// Center to show global reach (shifted to show Indonesia + Australia + UAE + Turkey + USA)
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

        {/* International markers for Indonesian students abroad */}
        {internationalLocations.map((loc) => (
          <Marker
            key={`${loc.city}-${loc.country}`}
            position={[loc.lat, loc.lng]}
            icon={internationalIcon}
          >
            <Popup>
              <div className="text-center">
                <img
                  src={countryCodeToFlagIconUrl(loc.countryCode)}
                  alt={`${loc.country} flag`}
                  className="mx-auto mb-1 h-4 w-6 rounded-sm object-cover"
                  loading="lazy"
                />
                <span className="sr-only">{countryCodeToFlagEmoji(loc.countryCode)}</span>
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
