/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'introcar.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'introcar.com',
      },
      {
        protocol: 'https',
        hostname: 'www.introcar.co.uk',
      },
      {
        protocol: 'https',
        hostname: 'www.introcar.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    unoptimized: true,
  },
};

module.exports = nextConfig;
