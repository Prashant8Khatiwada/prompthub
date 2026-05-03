import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  output: 'standalone',
  // Suggestion: Enable Turbopack by running 'next dev --turbo' for faster development builds.
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'www.instagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: 'scontent.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '*.fbcdn.net',
      },
    ],
  },
  async headers() {
    return [
      {
        // Apply to all public creator/prompt pages
        source: '/:subdomain/:slug*',
        headers: [
          {
            key: 'Cache-Control',
            // Publicly cacheable, 1 hour fresh, 24 hour stale-while-revalidate
            // This tells TikTok/WhatsApp/etc. the page is safe to open in-app
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Also cover subdomain-only profile pages
        source: '/:subdomain',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        ],
      },
    ]
  },
}

export default nextConfig

