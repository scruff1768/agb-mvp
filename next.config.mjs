/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/agb',
  async redirects() {
    return [
      { source: '/', destination: '/agb', permanent: true },
    ];
  },
};

export default nextConfig;
