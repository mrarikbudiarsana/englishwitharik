import Navbar from '@/components/public/Navbar'
import Footer from '@/components/public/Footer'
import PageViewTracker from '@/components/public/PageViewTracker'

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PageViewTracker />
      <Navbar />
      <main>{children}</main>
      <Footer />
    </>
  )
}
