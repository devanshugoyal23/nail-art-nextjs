import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AI Nail Art Studio - Virtual Try-On & Design Generator",
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
  openGraph: {
    title: "AI Nail Art Studio - Virtual Try-On & Design Generator",
    description: "Discover your next manicure with AI-powered virtual nail art try-on. Upload your hand photo to see hundreds of nail designs in real-time.",
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
  },
  alternates: {
    canonical: 'https://nailartai.app',
  },
};

export default function Home() {
  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "AI Nail Art Studio",
            "url": "https://nailartai.app",
            "description": "AI-powered virtual nail art try-on experience with instant results",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://nailartai.app/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "publisher": {
              "@type": "Organization",
              "name": "AI Nail Art Studio",
              "url": "https://nailartai.app",
              "logo": {
                "@type": "ImageObject",
                "url": "https://nailartai.app/logo.png"
              }
            }
          })
        }}
      />
      
      <div className="text-center flex flex-col items-center justify-center min-h-[70vh]">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-6xl font-extrabold text-white leading-tight mb-4 animate-fade-in-down">
            Welcome to the <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">AI Nail Art Studio</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto animate-fade-in-up">
            Discover your next manicure without the commitment. Use our cutting-edge AI to virtually try on hundreds of nail designs on your own hands.
          </p>
          <div className="flex justify-center space-x-4 animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
            <Link
              href="/try-on"
              className="bg-indigo-600 text-white font-bold py-3 px-8 rounded-full hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-indigo-500/50"
            >
              Start Virtual Try-On
            </Link>
            <Link
              href="/nail-art-gallery"
              className="bg-purple-600 text-white font-bold py-3 px-8 rounded-full hover:bg-purple-700 transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-purple-500/50"
            >
              Browse Gallery
            </Link>
          </div>
        </div>
        
        {/* SEO Content Section */}
        <div className="mt-16 max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-3">🎨 AI-Powered Design</h2>
              <p className="text-gray-300 text-sm">
                Our advanced AI generates unique nail art designs tailored to your preferences, 
                from classic French manicures to bold artistic creations.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-3">📱 Virtual Try-On</h2>
              <p className="text-gray-300 text-sm">
                Upload your hand photo and see how different nail designs look on you in real-time. 
                No commitment, just pure creativity.
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-bold text-white mb-3">✨ Instant Results</h2>
              <p className="text-gray-300 text-sm">
                Get instant AI-generated nail art designs with detailed instructions, 
                supply lists, and step-by-step tutorials.
              </p>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-white mb-8 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">How does the AI nail art generator work?</h3>
                <p className="text-gray-300 text-sm">
                  Our AI analyzes your preferences and generates unique nail art designs using advanced machine learning. 
                  Simply describe what you want or browse our gallery for inspiration.
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Can I try designs on my own hands?</h3>
                <p className="text-gray-300 text-sm">
                  Yes! Upload a photo of your hand and our virtual try-on feature will show you exactly 
                  how different nail designs will look on your actual hands.
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">Are the designs free to use?</h3>
                <p className="text-gray-300 text-sm">
                  Absolutely! All AI-generated nail art designs are free to use. Download high-resolution 
                  images and get detailed instructions for recreating the designs.
                </p>
              </div>
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">What nail shapes and styles are supported?</h3>
                <p className="text-gray-300 text-sm">
                  We support all nail shapes including almond, square, coffin, oval, and stiletto. 
                  Our AI can create designs for any occasion, season, or style preference.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}