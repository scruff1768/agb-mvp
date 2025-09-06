// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ✅ Ignore linting and type errors during build (MVP-friendly)
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  async redirects() {
    return [
      // send any /agb/... request to the same path at site root
      { source: '/agb', destination: '/play', permanent: false },
      { source: '/agb/:path*', destination: '/:path*', permanent: false },
    ];
  },
};

export default nextConfig;
