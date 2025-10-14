import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Core Web Vitals optimizations
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Core Web Vitals optimizations
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  images: {
            remotePatterns: [
              // New Cloudflare R2 domain (public access)
              {
                protocol: 'https',
                hostname: 'pub-05b5ee1a83754aa6b4fcd974016ecde8.r2.dev',
                port: '',
                pathname: '/**',
              },
              // Previous R2 domains (for backward compatibility)
              {
                protocol: 'https',
                hostname: 'pub-f94b6dc4538f33bcd1553dcdda15b36d.r2.dev',
                port: '',
                pathname: '/**',
              },
              {
                protocol: 'https',
                hostname: 'pub-fc15073de2e24f7bacc00c238f8ada7d.r2.dev',
                port: '',
                pathname: '/**',
              },
              // Add picsum.photos for placeholder images
              {
                protocol: 'https',
                hostname: 'picsum.photos',
                port: '',
                pathname: '/**',
              },
            ],
            // Core Web Vitals optimized image settings
            formats: ['image/avif', 'image/webp'], // AVIF first for better compression
            deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
            imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
            minimumCacheTTL: 60 * 60 * 24 * 365, // 1 year cache for CDN
            dangerouslyAllowSVG: true,
            contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
            // Enable aggressive caching for CDN
            unoptimized: false,
            // Mobile performance optimizations
            loader: 'default',
            // Fix quality warnings by explicitly configuring qualities
            qualities: [25, 50, 65, 70, 75, 85, 90, 95, 100],
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
