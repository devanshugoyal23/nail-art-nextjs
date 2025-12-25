import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from '@vercel/analytics/react';
import ViewportHeightFix from "@/components/ViewportHeightFix";
import ServiceWorkerRegistration from "@/components/ServiceWorkerRegistration";

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
        <meta name="theme-color" content="#ee2b8c" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Nail Art AI" />
        <meta name="google-adsense-account" content="ca-pub-4529100459751500" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Critical CSS for faster initial render - enhanced for mobile performance */}
        <style dangerouslySetInnerHTML={{
          __html: `
            html{height:100%;font-size:16px}
            body{min-height:100%;background:#f8f6f7;color:#1b0d14;margin:0;font-family:system-ui,-apple-system,sans-serif}
            img{content-visibility:auto;max-width:100%;height:auto}
            *{box-sizing:border-box}
            .pinterest-masonry{column-count:2;column-gap:0.5rem;height:100vh;contain:layout style paint;content-visibility:auto}
            .pinterest-item{break-inside:avoid;margin-bottom:0.75rem;display:inline-block;width:100%;position:relative;contain:layout style paint;content-visibility:auto}
            @media(min-width:640px){.pinterest-masonry{column-count:4;column-gap:0.75rem}}
            @media(min-width:1024px){.pinterest-masonry{column-count:6;column-gap:1rem}}
            @media(min-width:1280px){.pinterest-masonry{column-count:8;column-gap:0.75rem}}
          `
        }} />
        {/* Preconnect to critical domains for better performance - Enhanced for mobile */}
        <link rel="preconnect" href="https://cdn.nailartai.app" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.nailartai.app" />
        {/* Preconnect to Google Analytics - delayed for LCP optimization */}
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
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4529100459751500"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
        {/* Mediavine Grow */}
        <Script id="grow-me-initializer" strategy="afterInteractive" data-grow-initializer="">
          {`!(function(){window.growMe||((window.growMe=function(e){window.growMe._.push(e);}),(window.growMe._=[]));var e=document.createElement("script");(e.type="text/javascript"),(e.src="https://faves.grow.me/main.js"),(e.defer=!0),e.setAttribute("data-grow-faves-site-id","U2l0ZTo5ODJhNTYwNC0wNTk4LTQ5NzctYTFiZi0yMDBiYmRhNDljOGY=");var t=document.getElementsByTagName("script")[0];t.parentNode.insertBefore(e,t);})();`}
        </Script>
      </head>
      <body className="min-h-screen bg-[#f8f6f7] text-[#1b0d14] flex flex-col">
        <ViewportHeightFix />
        <ServiceWorkerRegistration />
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
