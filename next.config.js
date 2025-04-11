/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'devobjects.blob.core.windows.net',
      // add other domains if needed
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'devobjects.blob.core.windows.net',
        port: '',
        pathname: '/devobjects/profile-picture/**',
      },
    ],
  },
};

module.exports = nextConfig;