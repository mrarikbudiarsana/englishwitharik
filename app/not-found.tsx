import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Minimal header */}
      <header className="border-b border-gray-100 px-6 h-16 flex items-center">
        <Link href="/">
          <img
            src="https://scobvornehcncgsqngag.supabase.co/storage/v1/object/public/Public/Logo%20fix.svg"
            alt="English with Arik"
            className="h-10 w-auto"
          />
        </Link>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <p className="text-8xl font-bold text-[#08507f] mb-4">404</p>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
          <p className="text-gray-500 mb-8">
            Sorry, we couldn&apos;t find the page you&apos;re looking for. It may have been moved or doesn&apos;t exist.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="bg-[#08507f] hover:bg-[#063a5c] text-white font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Go to Homepage
            </Link>
            <Link
              href="/blog"
              className="border border-gray-300 hover:border-gray-400 text-gray-700 font-medium px-6 py-2.5 rounded-lg text-sm transition-colors"
            >
              Browse Blog
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
