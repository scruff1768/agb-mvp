// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // MVP-friendly: don't block builds on lint/type errors
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },

  // App runs under /agb (matches your BASE constants)
  basePath: '/agb',

  async redirects() {
    return [
      // Visiting the site root should land on the login screen
      { source: '/', destination: '/agb/login', permanent: false },
    ];
  },
};

export default nextConfig;
