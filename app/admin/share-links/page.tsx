import Link from 'next/link'

const baseUrl = 'https://englishwitharik.com'
const businessEnglishPath = '/id/kursus-business-english-indonesia'

function buildUtmLink(source: string, medium: string, campaign: string) {
  return `${baseUrl}${businessEnglishPath}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`
}

export default function AdminShareLinksPage() {
  const now = new Date()
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const templates = [
    {
      channel: 'Instagram Story',
      source: 'instagram',
      medium: 'social',
      campaign: `${monthKey}-business-english-story`,
    },
    {
      channel: 'Instagram Reel',
      source: 'instagram',
      medium: 'social',
      campaign: `${monthKey}-business-english-reel`,
    },
    {
      channel: 'WhatsApp Broadcast',
      source: 'whatsapp',
      medium: 'referral',
      campaign: `${monthKey}-business-english-wa`,
    },
    {
      channel: 'YouTube Description',
      source: 'youtube',
      medium: 'video',
      campaign: `${monthKey}-business-english-video`,
    },
    {
      channel: 'Email Newsletter',
      source: 'email',
      medium: 'email',
      campaign: `${monthKey}-business-english-newsletter`,
    },
  ]

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Share Links</h1>
        <p className="text-sm text-gray-500 mt-1">
          Use these links when sharing so Campaign Attribution can show what worked.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-base font-semibold text-gray-900 mb-3">How To Use</h2>
        <ol className="list-decimal pl-5 text-sm text-gray-600 space-y-1">
          <li>Pick a channel row below.</li>
          <li>Copy the full link.</li>
          <li>Share that link on the matching platform.</li>
          <li>Check results in <Link href="/admin/stats" className="text-[#08507f] hover:underline">Stats</Link> under Campaign Attribution.</li>
        </ol>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">Ready-To-Share Links</h2>
          <p className="text-xs text-gray-500 mt-1">Target page: {businessEnglishPath}</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Channel</th>
                <th className="px-6 py-3 text-left font-medium">Source</th>
                <th className="px-6 py-3 text-left font-medium">Medium</th>
                <th className="px-6 py-3 text-left font-medium">Campaign</th>
                <th className="px-6 py-3 text-left font-medium">Share Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {templates.map(t => {
                const link = buildUtmLink(t.source, t.medium, t.campaign)
                return (
                  <tr key={t.channel} className="align-top">
                    <td className="px-6 py-3 font-medium text-gray-800 whitespace-nowrap">{t.channel}</td>
                    <td className="px-6 py-3 text-gray-600">{t.source}</td>
                    <td className="px-6 py-3 text-gray-600">{t.medium}</td>
                    <td className="px-6 py-3 text-gray-600 whitespace-nowrap">{t.campaign}</td>
                    <td className="px-6 py-3">
                      <code className="text-xs text-gray-700 break-all">{link}</code>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
