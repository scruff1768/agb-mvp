/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/agb',
  // No manual redirect needed – basePath already handles it
  reactStrictMode: true,
  swcMinify: true
};

export default nextConfig;
