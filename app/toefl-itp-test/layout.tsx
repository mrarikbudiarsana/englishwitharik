export default function TOEFLITPLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-[100dvh] w-full flex-col overflow-hidden bg-gray-50 font-sans">
      <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
    </div>
  )
}
