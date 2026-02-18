import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Contact | English with Arik',
  description: 'Get in touch with Arik for IELTS, PTE, TOEFL or English tutoring. Book a free trial session.',
}

export default function ContactPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">Get in Touch</h1>
        <p className="text-gray-500 text-lg">Ready to improve your English? Let&apos;s chat!</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Contact info */}
        <div className="space-y-6">
          <div className="bg-[#08507f]/5 rounded-2xl p-6">
            <h2 className="font-bold text-gray-900 text-lg mb-4">Contact Info</h2>
            <ul className="space-y-4 text-sm text-gray-600">
              <li className="flex items-start gap-3">
                <span className="text-xl">📱</span>
                <div>
                  <p className="font-medium text-gray-800">WhatsApp</p>
                  <a href="https://wa.me/628214422358" target="_blank" rel="noopener noreferrer" className="text-[#08507f] hover:underline">+62 821 4422 3581</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">✉️</span>
                <div>
                  <p className="font-medium text-gray-800">Email</p>
                  <a href="mailto:hello@englishwitharik.com" className="text-[#08507f] hover:underline">hello@englishwitharik.com</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">📍</span>
                <div>
                  <p className="font-medium text-gray-800">Location</p>
                  <p>Bali, Indonesia</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-xl">🕐</span>
                <div>
                  <p className="font-medium text-gray-800">Hours</p>
                  <p>Daily, 07:00 – 23:00 WITA</p>
                </div>
              </li>
            </ul>
          </div>

          <a
            href="https://wa.me/628214422358?text=Hi%20Arik!%20I%27m%20interested%20in%20a%20free%20trial%20lesson."
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-3 w-full bg-[#fd9d19] hover:bg-[#e08810] text-white font-bold py-4 rounded-2xl text-lg transition-colors"
          >
            💬 Book Free Trial on WhatsApp
          </a>
        </div>

        {/* Info card */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <h2 className="font-bold text-gray-900 text-lg mb-4">What to Expect</h2>
          <ul className="space-y-3 text-sm text-gray-600">
            {[
              { emoji: '1️⃣', title: 'Free 30-min trial', desc: 'A no-commitment intro session to discuss your goals' },
              { emoji: '2️⃣', title: 'Personalized plan', desc: 'A study plan tailored to your target exam and timeline' },
              { emoji: '3️⃣', title: 'Regular sessions', desc: 'Flexible scheduling, online or in-person in Bali' },
              { emoji: '4️⃣', title: 'Track your progress', desc: 'Monitor improvement with practice tests and assessments' },
            ].map(item => (
              <li key={item.title} className="flex items-start gap-3">
                <span className="text-2xl">{item.emoji}</span>
                <div>
                  <p className="font-medium text-gray-800">{item.title}</p>
                  <p>{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
