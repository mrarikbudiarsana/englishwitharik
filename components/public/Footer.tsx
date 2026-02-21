import Link from 'next/link'
import { getSettings, formatWhatsAppLink, formatWhatsAppDisplay } from '@/lib/settings'

export default async function Footer() {
  const year = new Date().getFullYear()
  const settings = await getSettings()

  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-[#08507f] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-white font-bold text-sm">English with Arik</span>
            </div>
            <p className="text-sm leading-relaxed">
              Professional English tutoring for IELTS, PTE, TOEFL, Business English & more.
            </p>
            <p className="text-sm mt-3">{settings.location_address}</p>
            <p className="text-sm">{settings.business_hours}</p>
          </div>

          {/* Courses */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Courses</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/ielts-preparation" className="hover:text-[#08507f]">IELTS Preparation</Link></li>
              <li><Link href="/pte-academic" className="hover:text-[#08507f]">PTE Academic</Link></li>
              <li><Link href="/toefl-ibt" className="hover:text-[#08507f]">TOEFL iBT</Link></li>
              <li><Link href="/toefl-itp" className="hover:text-[#08507f]">TOEFL ITP</Link></li>
              <li><Link href="/business-english" className="hover:text-[#08507f]">Business English</Link></li>
              <li><Link href="/general-english" className="hover:text-[#08507f]">General English</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-[#08507f]">Blog &amp; Articles</Link></li>
              <li><Link href="/test-preparation" className="hover:text-[#08507f]">Free Practice Tests</Link></li>
              <li><Link href="/pricing" className="hover:text-[#08507f]">Pricing</Link></li>
              <li><Link href="/about" className="hover:text-[#08507f]">About Arik</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-3">Contact</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href={`mailto:${settings.email}`} className="hover:text-[#08507f]">
                  {settings.email}
                </a>
              </li>
              <li>
                <a href={formatWhatsAppLink(settings.whatsapp)} target="_blank" rel="noopener noreferrer" className="hover:text-[#08507f]">
                  WhatsApp: {formatWhatsAppDisplay(settings.whatsapp)}
                </a>
              </li>
            </ul>
            <div className="flex items-center gap-5 mt-6">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#08507f] transition-colors" aria-label="Instagram">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.975.975 1.247 2.242 1.308 3.608.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.975.975-2.242 1.247-3.608 1.308-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.975-.975-1.247-2.242-1.308-3.608-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.975-.975 2.242-1.247 3.608-1.308 1.266-.058 1.646-.07 4.85-.07zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948s.014 3.667.072 4.947c.2 4.337 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072s3.667-.014 4.947-.072c4.358-.2 6.78-2.618 6.98-6.98.058-1.28.072-1.689.072-4.948s-.014-3.667-.072-4.947c-.2-4.337-2.618-6.78-6.98-6.98-1.28-.058-1.689-.072-4.947-.072zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
              )}
              {settings.youtube && (
                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#08507f] transition-colors" aria-label="YouTube">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z" />
                  </svg>
                </a>
              )}
              {settings.tiktok && (
                <a href={settings.tiktok} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#08507f] transition-colors" aria-label="TikTok">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.01.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.92-.23-2.74.29-.62.38-1.09.98-1.24 1.7-.15.48-.15.98-.02 1.47.11.45.34.87.66 1.2.62.65 1.5 1 2.39 1.05.77.06 1.34-.14 1.83-.55.6-.48.91-1.19.95-1.96.04-1.41.02-2.82.02-4.23.01-4.5.01-9 0-13.5z" />
                  </svg>
                </a>
              )}
              {settings.threads && (
                <a href={settings.threads} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#08507f] transition-colors" aria-label="Threads">
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.59 12c.025 3.086.718 5.496 2.057 7.164 1.432 1.781 3.632 2.698 6.542 2.717 2.227-.025 4.073-.645 5.487-1.844.982-.826 1.726-1.89 2.21-3.166l1.987.668c-.581 1.559-1.503 2.876-2.74 3.916-1.73 1.465-3.968 2.258-6.65 2.358-.114.003-.229.003-.343.004Zm4.683-7.793c-.729 3.073-2.972 4.64-6.683 4.64-.396 0-.807-.02-1.23-.064-2.37-.242-4.109-1.186-5.17-2.81-.949-1.447-1.456-3.39-1.506-5.778v-.202c.05-2.387.557-4.33 1.506-5.777 1.06-1.624 2.8-2.568 5.17-2.81.424-.044.835-.064 1.23-.064 3.71 0 5.954 1.566 6.683 4.64.324 1.376.436 2.905.438 4.613l-.003.619c-.002 1.713-.114 3.238-.435 4.593Zm-1.916-8.407c-.477-2.03-1.954-3.068-4.384-3.068-.29 0-.591.015-.901.044-1.667.168-2.888.735-3.63 1.686-.691.889-1.07 2.158-1.118 3.784l-.003.189v.166c.003.034.003.069.003.103v.098l.003.194c.048 1.626.427 2.895 1.118 3.783.742.951 1.963 1.518 3.63 1.686.31.029.611.044.9.044 2.43 0 3.908-1.038 4.385-3.068.27-1.157.358-2.412.363-3.82v-.01c-.005-1.408-.094-2.664-.366-3.821Z" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>&copy; {year} English with Arik. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-[#08507f]">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
