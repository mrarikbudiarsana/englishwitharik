import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.englishwitharik.com',
          },
        ],
        destination: 'https://englishwitharik.com/:path*',
        permanent: true,
      },
    ]
  },
};

export default nextConfig;
