/** @type {import('next').NextConfig} */
const nextConfig = {
  // All app routes live under /agb (we've already been building like this)
  basePath: '/agb',

  async redirects() {
    return [
      // Domain root → /agb (landing)
      { source: '/', destination: '/agb', permanent: false },
    ];
  },
};

export default nextConfig;
