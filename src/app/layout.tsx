import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
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
  other: {
    'p:domain_verify': 'd35fc9b798405234e7ce574a3418aafb',
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
        {/* Critical CSS for faster initial render - prevents CLS */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html{height:100%}
            body{min-height:100%;background:#0a0a0a;color:#ededed;margin:0}
            img{content-visibility:auto}
            *{box-sizing:border-box}
          `
        }} />
        {/* Preconnect to critical domains for better performance */}
        <link rel="preconnect" href="https://cdn.nailartai.app" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.nailartai.app" />
        {/* Previous R2 domains (for backward compatibility during migration) */}
        <link rel="preconnect" href="https://pub-05b5ee1a83754aa6b4fcd974016ecde8.r2.dev" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pub-f94b6dc4538f33bcd1553dcdda15b36d.r2.dev" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://pub-fc15073de2e24f7bacc00c238f8ada7d.r2.dev" crossOrigin="anonymous" />
        {/* Preconnect to Google Analytics */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        {/* Google Analytics - Lazy loaded to improve LCP */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-F2H0CBYDGF"
          strategy="lazyOnload"
        />
        <Script id="google-analytics" strategy="lazyOnload">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-F2H0CBYDGF');
          `}
        </Script>
        <script dangerouslySetInnerHTML={{
          __html: `
            // Mobile viewport height fix
            (function() {
              if (typeof window === 'undefined') return;
              
              const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
              if (isMobile) {
                const setVH = () => {
                  if (document && document.documentElement) {
                    document.documentElement.style.setProperty('--vh', window.innerHeight * 0.01 + 'px');
                  }
                };
                
                // Set initial value
                setVH();
                
                // Update on resize
                window.addEventListener('resize', setVH);
              }
            })();
            
            // Register service worker for caching - delayed to not block LCP
            if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
              window.addEventListener('load', () => {
                // Wait 2 seconds after load to register SW
                setTimeout(() => {
                  navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                      console.log('Service Worker registered successfully:', registration.scope);
                    })
                    .catch((error) => {
                      console.log('Service Worker registration failed:', error);
                    });
                }, 2000);
              });
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
