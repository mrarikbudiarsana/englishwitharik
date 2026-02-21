import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | English with Arik',
}

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Privacy Policy</h1>
      <div className="prose prose-gray max-w-none text-sm">
        <p className="text-gray-500">Last updated: February 2026</p>
        <p>English with Arik (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) respects your privacy. This policy explains how we collect and use information when you visit englishwitharik.com.</p>
        <h2>Information We Collect</h2>
        <p>We may collect your name, email address, and contact details when you register for classes or contact us. We use this solely to provide our tutoring services.</p>
        <h2>Cookies</h2>
        <p>We use minimal cookies for site functionality (e.g., authentication). We do not use tracking cookies for advertising.</p>
        <h2>Contact</h2>
        <p>For privacy concerns, contact us at <a href="mailto:info@englishwitharik.com">info@englishwitharik.com</a>.</p>
      </div>
    </div>
  )
}
