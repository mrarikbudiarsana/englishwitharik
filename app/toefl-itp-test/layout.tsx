export default function TOEFLITPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-gray-50 flex flex-col font-sans">
      {/* Promotional Banner */}
      <div className="w-full shrink-0 bg-blue-600 text-white text-center py-2 text-sm font-medium z-50">
        Kelas TOEFL ITP cuma Rp299k/bulan. Mulai 20 April 2026.{" "}
        <a
          href="https://wa.me/6282144223581?text=Halo%2C%20saya%20tertarik%20ikut%20kelas%20TOEFL%20ITP%20yang%20mulai%2020%20April%202026.%20Boleh%20minta%20info%20lengkapnya%3F"
          target="_blank"
          rel="noopener noreferrer"
          className="underline font-bold"
        >
          Daftar sekarang →
        </a>
      </div>
      {/* 
        This layout intentionally omits the main website Navbar and Footer
        to provide a distraction-free, full-screen test experience.
      */}
      <main className="flex-1 flex flex-col w-full min-h-0 relative">
        {children}
      </main>
    </div >
  )
}
