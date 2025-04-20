import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  serverExternalPackages: ['papaparse'],
  assetPrefix: process.env.NODE_ENV === 'production' ? '/' : undefined
}


export default nextConfig