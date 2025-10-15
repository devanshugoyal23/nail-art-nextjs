import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Virtual Nail Art Try-On | Nail Art AI",
  description: "Try on nail art designs virtually with AI. Upload your hand photo or use your camera to see how different nail designs look on you in real-time.",
  keywords: [
    "virtual nail art try-on",
    "AI nail art try-on",
    "virtual manicure",
    "nail art virtual try-on",
    "AI manicure try-on",
    "virtual nail design",
    "nail art camera",
    "nail art app"
  ],
  openGraph: {
    title: "Virtual Nail Art Try-On | Nail Art AI",
    description: "Try on nail art designs virtually with AI. Upload your hand photo or use your camera to see how different nail designs look on you in real-time.",
    images: [
      {
        url: '/og-try-on.jpg',
        width: 1200,
        height: 630,
        alt: 'Virtual Nail Art Try-On Experience',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Virtual Nail Art Try-On | Nail Art AI',
    description: 'Try on nail art designs virtually with AI. Upload your hand photo or use your camera to see how different nail designs look on you in real-time.',
    images: ['/twitter-try-on.jpg'],
  },
  alternates: {
    canonical: 'https://nailartai.app/try-on',
  },
};

export default function TryOnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
