export default function TOEFLITPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-50 font-sans">
      <div className="z-50 w-full shrink-0 bg-blue-600 px-4 py-2 text-center text-xs font-medium text-white sm:text-sm">
        Kelas TOEFL ITP cuma Rp299k/bulan. Mulai 20 April 2026.{` `}
        <a
          href="https://wa.me/6282144223581?text=Halo%2C%20saya%20tertarik%20ikut%20kelas%20TOEFL%20ITP%20yang%20mulai%2020%20April%202026.%20Boleh%20minta%20info%20lengkapnya%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold underline"
        >
          Daftar sekarang &rarr;
        </a>
      </div>
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
