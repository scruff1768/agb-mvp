/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  basePath: "/agb", // everything runs under /agb
  async redirects() {
    return [
      {
        source: "/",          // root of the domain
        destination: "/agb",  // send users into the app
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
