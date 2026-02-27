import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // Force a single canonical host to reduce duplicate discovery in GSC.
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.englishwitharik.com" }],
        destination: "https://englishwitharik.com/:path*",
        permanent: true,
      },
      // Clean up legacy WordPress trash slug.
      {
        source: "/blog/__trashed",
        destination: "/blog",
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '*.wp.com' },
      { protocol: 'https', hostname: 'i0.wp.com' },
      { protocol: 'https', hostname: 'i1.wp.com' },
      { protocol: 'https', hostname: 'i2.wp.com' },
      { protocol: 'https', hostname: 'englishwitharik.wordpress.com' },
      { protocol: 'https', hostname: 'englishwitharik.com' },
    ],
  },
};

export default nextConfig;
