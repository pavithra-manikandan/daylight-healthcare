import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'standalone', // Required for Cloudflare
  experimental: {
    serverComponentsExternalPackages: ['papaparse'] // For CSV parsing
  },
  // Cloudflare-specific optimizations:
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : undefined
}

export default nextConfig