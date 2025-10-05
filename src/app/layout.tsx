import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: {
    default: "AI Nail Art Studio - Virtual Try-On & Design Generator",
    template: "%s | AI Nail Art Studio"
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
  authors: [{ name: "AI Nail Art Studio" }],
  creator: "AI Nail Art Studio",
  publisher: "AI Nail Art Studio",
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
    siteName: 'AI Nail Art Studio',
    title: 'AI Nail Art Studio - Virtual Try-On & Design Generator',
    description: 'Discover your next manicure with AI-powered virtual nail art try-on. Upload your hand photo to see hundreds of nail designs in real-time.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Nail Art Studio - Virtual Try-On Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Nail Art Studio - Virtual Try-On & Design Generator',
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
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gradient-to-br from-gray-900 to-indigo-900 text-gray-100 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
