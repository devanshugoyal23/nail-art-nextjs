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
  },
  async redirects() {
    return [
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
