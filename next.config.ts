import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Enable SWC minification for better performance
  swcMinify: true,

  images: {
    // Modern image formats for better compression
    formats: ['image/avif', 'image/webp'],

    // Optimized device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Long cache TTL for images (1 year)
    minimumCacheTTL: 31536000,

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.nailartai.app',
      },
      {
        protocol: 'https',
        hostname: 'f94b6dc4538f33bcd1553dcdda15b36d.r2.cloudflarestorage.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'maps.googleapis.com',
      },
      {
        protocol: 'https',
        hostname: 'places.googleapis.com',
      }
    ],
  },
  async redirects() {
    return [
      // Legacy gallery path -> new gallery path
      {
        source: '/gallery/:slug*',
        destination: '/nail-art-gallery/:slug*',
        permanent: true,
      },
      // Category alias
      {
        source: '/category/:slug*',
        destination: '/categories/:slug*',
        permanent: true,
      },
      // Shapes and legacy categories under /nail-art/:shape -> gallery category
      {
        source: '/nail-art/:shape',
        destination: '/nail-art-gallery/category/:shape',
        permanent: true,
      },
      // Legacy style taxonomy -> canonical category page
      {
        source: '/nail-art/style/:style',
        destination: '/nail-art-gallery/category/:style',
        permanent: true,
      },
      // Fix mislink to category index
      {
        source: '/nail-art-gallery/category/all',
        destination: '/categories/all',
        permanent: true,
      },
      // Redirect /categories/:slug to gallery category, excluding reserved section pages
      {
        source: '/categories/:slug((?!all|colors|techniques|occasions|seasons|styles|nail-shapes).*)',
        destination: '/nail-art-gallery/category/:slug',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;


