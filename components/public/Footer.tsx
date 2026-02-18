import Link from 'next/link'

export default function Footer() {
  const year = new Date().getFullYear()

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
            <p className="text-sm mt-3">📍 Bali, Indonesia</p>
            <p className="text-sm">🕐 Daily 07:00 – 23:00 WITA</p>
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
                <a href="mailto:hello@englishwitharik.id" className="hover:text-[#08507f]">
                  hello@englishwitharik.id
                </a>
              </li>
              <li>
                <a href="https://wa.me/628214422358" target="_blank" rel="noopener noreferrer" className="hover:text-[#08507f]">
                  WhatsApp: +62 821 4422 3581
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© {year} English with Arik. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="hover:text-[#08507f]">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
