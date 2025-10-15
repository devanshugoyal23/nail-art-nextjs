import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { initializeMobileOptimizations } from "@/lib/mobileOptimization";
import { Analytics } from '@vercel/analytics/react';

export const metadata: Metadata = {
  title: {
    default: "Nail Art AI - Virtual Try-On & Design Generator",
    template: "%s | Nail Art AI"
  },
  description: "Discover your next manicure with AI-powered virtual nail art try-on. Upload your hand photo to see hundreds of nail designs in real-time. Free AI nail art generator with instant results.",
  keywords: [
    "nail art",
    "AI nail art",
    "virtual nail art",
    "nail art generator",
    "virtual try-on",
    "manicure",
    "nail design",
    "nail art ideas",
    "nail art designs",
    "AI manicure",
    "virtual manicure",
    "nail art app"
  ],
  authors: [{ name: "Nail Art AI" }],
  creator: "Nail Art AI",
  publisher: "Nail Art AI",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nailartai.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nailartai.app',
    siteName: 'Nail Art AI',
    title: 'Nail Art AI - Virtual Try-On & Design Generator',
    description: 'Discover your next manicure with AI-powered virtual nail art try-on. Upload your hand photo to see hundreds of nail designs in real-time.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Nail Art AI - Virtual Try-On Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nail Art AI - Virtual Try-On & Design Generator',
    description: 'Discover your next manicure with AI-powered virtual nail art try-on. Upload your hand photo to see hundreds of nail designs in real-time.',
    images: ['/twitter-image.jpg'],
    creator: '@nailartai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // Verification handled via DNS records
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
        <meta name="theme-color" content="#7c3aed" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nail Art AI" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Preload critical resources for better performance */}
        <link rel="preload" href="/sw.js" as="script" />
        <link rel="preload" href="/globals.css" as="style" />
        <link rel="preconnect" href="https://pub-05b5ee1a83754aa6b4fcd974016ecde8.r2.dev" />
        <link rel="preconnect" href="https://pub-f94b6dc4538f33bcd1553dcdda15b36d.r2.dev" />
        <link rel="preconnect" href="https://pub-fc15073de2e24f7bacc00c238f8ada7d.r2.dev" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if (typeof window !== 'undefined') {
              (${initializeMobileOptimizations.toString()})();

              // Register service worker for caching
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('Service Worker registered successfully:', registration.scope);
                    })
                    .catch((error) => {
                      console.log('Service Worker registration failed:', error);
                    });
                });
              }
            }
          `
        }} />
      </head>
      <body className="min-h-screen bg-black text-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
