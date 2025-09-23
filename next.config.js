/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.dog.ceo' },
      { protocol: 'https', hostname: 'cdn.thedogapi.com' },
      { protocol: 'https', hostname: 'cdn.thecatapi.com' },
      { protocol: 'https', hostname: 'cdn2.thecatapi.com' },
      // Fallback common CDNs occasionally used by these APIs
      { protocol: 'https', hostname: 'media.thedogapi.com' },
      { protocol: 'https', hostname: 'media.thecatapi.com' },
    ],
  },
}

module.exports = nextConfig
