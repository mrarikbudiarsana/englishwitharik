import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./wp-blocks.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "English with Arik — Learn English with the Best!",
  description: "Professional English tutoring for IELTS, PTE Academic, TOEFL iBT/ITP, Business English and General English. Based in Bali, Indonesia.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://englishwitharik.com"),
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
