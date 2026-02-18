'use client'

import Link from 'next/link'
import { useState, useRef, useEffect } from 'react'
import { Menu, X, ChevronDown } from 'lucide-react'

const programmesLinks = [
  { href: '/ielts-preparation', label: 'IELTS Preparation', accent: false },
  { href: '/pte-academic', label: 'PTE Academic', accent: false },
  { href: '/toefl-ibt', label: 'TOEFL iBT', accent: true },
  { href: '/toefl-itp', label: 'TOEFL ITP', accent: true },
  { href: '/general-english', label: 'General English', accent: false },
  { href: '/business-english', label: 'Business English', accent: false },
  { href: '/english-for-specific-purposes', label: 'English for Specific Purposes', accent: false },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [programmesOpen, setProgrammesOpen] = useState(false)
  const [mobileProgrammesOpen, setMobileProgrammesOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProgrammesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <img
            src="https://scobvornehcncgsqngag.supabase.co/storage/v1/object/public/Public/Logo%20fix.svg"
            alt="English with Arik Logo"
            className="h-10 w-auto"
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-1">
          <Link
            href="/"
            className="px-3 py-2 text-sm text-gray-700 hover:text-[#08507f] rounded-lg hover:bg-[#08507f]/10 transition-colors"
          >
            Home
          </Link>

          {/* Programmes dropdown */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setProgrammesOpen(o => !o)}
              className="flex items-center gap-1 px-3 py-2 text-sm text-gray-700 hover:text-[#08507f] rounded-lg hover:bg-[#08507f]/10 transition-colors"
            >
              Programmes
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${programmesOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {programmesOpen && (
              <div className="absolute left-0 top-full mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                {programmesLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setProgrammesOpen(false)}
                    className={`block px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 ${
                      link.accent
                        ? 'text-[#e07b39] hover:text-[#c4622a]'
                        : 'text-gray-700 hover:text-[#08507f]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/pricing"
            className="px-3 py-2 text-sm text-gray-700 hover:text-[#08507f] rounded-lg hover:bg-[#08507f]/10 transition-colors"
          >
            Pricing
          </Link>

          <Link
            href="/blog"
            className="px-3 py-2 text-sm text-gray-700 hover:text-[#08507f] rounded-lg hover:bg-[#08507f]/10 transition-colors"
          >
            Blog
          </Link>

          <Link
            href="/about"
            className="px-3 py-2 text-sm text-gray-700 hover:text-[#08507f] rounded-lg hover:bg-[#08507f]/10 transition-colors"
          >
            About
          </Link>
        </nav>

        {/* CTA */}
        <div className="hidden lg:flex items-center gap-3">
          <a
            href="https://learnenglishwitharik.online"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#08507f] hover:bg-[#063a5c] text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Login
          </a>
        </div>

        {/* Mobile menu toggle */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1">
          <Link
            href="/"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm text-gray-700 hover:text-[#08507f] hover:bg-[#08507f]/10 rounded-lg"
          >
            Home
          </Link>

          {/* Mobile Programmes accordion */}
          <div>
            <button
              onClick={() => setMobileProgrammesOpen(o => !o)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-sm text-gray-700 hover:text-[#08507f] hover:bg-[#08507f]/10 rounded-lg"
            >
              Programmes
              <ChevronDown
                size={14}
                className={`transition-transform duration-200 ${mobileProgrammesOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {mobileProgrammesOpen && (
              <div className="pl-4 mt-1 space-y-1">
                {programmesLinks.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-3 py-2 text-sm rounded-lg transition-colors hover:bg-gray-50 ${
                      link.accent ? 'text-[#e07b39]' : 'text-gray-700 hover:text-[#08507f]'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/pricing"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm text-gray-700 hover:text-[#08507f] hover:bg-[#08507f]/10 rounded-lg"
          >
            Pricing
          </Link>

          <Link
            href="/blog"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm text-gray-700 hover:text-[#08507f] hover:bg-[#08507f]/10 rounded-lg"
          >
            Blog
          </Link>

          <Link
            href="/about"
            onClick={() => setMobileOpen(false)}
            className="block px-3 py-2.5 text-sm text-gray-700 hover:text-[#08507f] hover:bg-[#08507f]/10 rounded-lg"
          >
            About
          </Link>

          <a
            href="https://learnenglishwitharik.online"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[#08507f] text-white text-sm font-medium py-2.5 px-3 rounded-lg text-center mt-2"
          >
            Login
          </a>
        </div>
      )}
    </header>
  )
}
