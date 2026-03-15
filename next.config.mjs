/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dev-abinandan.pantheonsite.io',
        pathname: '/sites/default/files/**',
      },
    ],
  },
};

export default nextConfig;
