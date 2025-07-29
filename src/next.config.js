/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ibb.co',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
    // The `domains` property is still useful for local development and self-hosting.
    // An empty string for the hostname allows images from the same origin.
    domains: [''],
  },
};

module.exports = nextConfig;
