import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./wp-blocks.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "English with Arik — Learn English with the Best!",
    template: "%s | English with Arik",
  },
  description: "Professional English tutoring for IELTS, PTE Academic, TOEFL iBT/ITP, Business English and General English. Based in Bali, Indonesia.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL
      ? process.env.NEXT_PUBLIC_SITE_URL.startsWith("http")
        ? process.env.NEXT_PUBLIC_SITE_URL
        : `https://${process.env.NEXT_PUBLIC_SITE_URL}`
      : "https://englishwitharik.com"
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "English with Arik",
    title: "English with Arik — Learn English with the Best!",
    description: "Professional English tutoring for IELTS, PTE Academic, TOEFL iBT/ITP, Business English and General English.",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "English with Arik — Learn English with the Best!",
    description: "Professional English tutoring for IELTS, PTE Academic, TOEFL iBT/ITP, Business English and General English.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-white text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
