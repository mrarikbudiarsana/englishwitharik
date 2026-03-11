export default function TOEFLITPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="h-[100dvh] w-full overflow-hidden bg-gray-50 flex flex-col font-sans">
      {/* Promotional Banner */}
      <div className="w-full shrink-0 bg-blue-600 text-white text-center py-2 text-sm font-medium z-50">
        Improve your TOEFL score with English with Arik! <a href="/pricing" className="underline font-bold">Book a Class Today &rarr;</a>
      </div>
      
      {/* 
        This layout intentionally omits the main website Navbar and Footer
        to provide a distraction-free, full-screen test experience.
      */}
      <main className="flex-1 flex flex-col w-full min-h-0 relative">
        {children}
      </main>
    </div>
  )
}
