import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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


