import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ccrarmffjbvkggrtktyy.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Add other common image domains if needed
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      // Add picsum.photos for placeholder images
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    // Mobile-optimized image settings
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache for CDN
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable aggressive caching for CDN
    unoptimized: false,
    // Mobile performance optimizations
    loader: 'default',
  },
  async redirects() {
    return [
      // Redirect old gallery to new nail-art-gallery
      {
        source: "/gallery",
        destination: "/nail-art-gallery",
        permanent: true,
      },
      // Redirect old gallery detail URLs to root detail URLs
      {
        source: "/gallery/:category/:slug",
        destination: "/:category/:slug",
        permanent: true,
      },
      // Redirect old design fallback URLs
      {
        source: "/gallery/design/:slug",
        destination: "/design/:slug",
        permanent: true,
      },
      // Redirect legacy ID detail route
      {
        source: "/gallery/:id",
        destination: "/design/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
