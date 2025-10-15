import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: "Frequently Asked Questions | Nail Art AI",
  description: "Find answers to common questions about AI nail art, virtual try-on, nail art techniques, and more. Get help with your nail art journey.",
  keywords: [
    "nail art FAQ",
    "nail art questions",
    "AI nail art help",
    "virtual nail art FAQ",
    "nail art troubleshooting",
    "nail art tips",
    "manicure questions"
  ],
  openGraph: {
    title: "Frequently Asked Questions | Nail Art AI",
    description: "Find answers to common questions about AI nail art, virtual try-on, nail art techniques, and more.",
    images: [
      {
        url: '/og-faq.jpg',
        width: 1200,
        height: 630,
        alt: 'Nail Art FAQ - Common Questions',
      },
    ],
  },
  alternates: {
    canonical: 'https://nailartai.app/faq',
  },
};

const faqCategories = [
  {
    title: "General Questions",
    href: "/faq/general",
    description: "Basic questions about our AI nail art platform",
    icon: "❓"
  },
  {
    title: "Techniques",
    href: "/faq/techniques", 
    description: "Questions about nail art techniques and methods",
    icon: "🎨"
  },
  {
    title: "Troubleshooting",
    href: "/faq/troubleshooting",
    description: "Common issues and how to solve them",
    icon: "🔧"
  }
];

const generalFAQs = [
  {
    question: "How does the AI nail art generator work?",
    answer: "Our AI analyzes your preferences and generates unique nail art designs using advanced machine learning. Simply describe what you want or browse our gallery for inspiration. The AI creates completely original designs tailored to your style preferences."
  },
  {
    question: "Can I try designs on my own hands?",
    answer: "Yes! Upload a photo of your hand and our virtual try-on feature will show you exactly how different nail designs will look on your actual hands. No commitment, just pure creativity and experimentation."
  },
  {
    question: "Are the designs free to use?",
    answer: "Absolutely! All AI-generated nail art designs are free to use. Download high-resolution images and get detailed instructions for recreating the designs at home or at a salon."
  },
  {
    question: "What nail shapes and styles are supported?",
    answer: "We support all nail shapes including almond, square, coffin, oval, and stiletto. Our AI can create designs for any occasion, season, or style preference - from classic French manicures to bold artistic creations."
  },
  {
    question: "How accurate is the virtual try-on?",
    answer: "Our virtual try-on uses advanced AI to realistically apply nail art designs to your hand photos. While results may vary based on photo quality and lighting, it provides an excellent preview of how designs will look."
  },
  {
    question: "Can I save my favorite designs?",
    answer: "Yes! You can save designs to your personal gallery, download them, and even share them on social media. Your saved designs are stored securely and can be accessed anytime."
  }
];

const techniqueFAQs = [
  {
    question: "What's the best way to apply nail art at home?",
    answer: "Start with clean, dry nails and apply a base coat. Use thin layers of polish and allow each layer to dry completely. For detailed designs, use a fine brush or dotting tool. Finish with a top coat to seal and protect your design."
  },
  {
    question: "How long do nail art designs typically last?",
    answer: "With proper application and care, nail art can last 1-2 weeks. Use a quality top coat, avoid prolonged water exposure, and apply cuticle oil daily to maintain your design's longevity."
  },
  {
    question: "What tools do I need for nail art?",
    answer: "Essential tools include base coat, top coat, nail polish in various colors, a fine detail brush, dotting tools, and nail art striping tape. For advanced techniques, consider stamping plates, gel polish, and UV lamp."
  },
  {
    question: "How do I remove nail art safely?",
    answer: "Use acetone-based nail polish remover and cotton pads. Soak the cotton in remover, place on your nail, wrap with foil, and wait 10-15 minutes. Gently push off the softened polish with an orange stick."
  }
];

const troubleshootingFAQs = [
  {
    question: "Why isn't my virtual try-on working?",
    answer: "Ensure your photo has good lighting and your hand is clearly visible. Try taking a new photo with your hand flat and fingers spread. Make sure you're using a supported image format (JPG, PNG)."
  },
  {
    question: "The AI-generated design doesn't match my request. What should I do?",
    answer: "Try being more specific in your description. Include details about colors, patterns, and style preferences. You can also browse our gallery for similar designs and use those as inspiration for your custom request."
  },
  {
    question: "How can I improve the quality of my hand photos?",
    answer: "Use natural lighting when possible, keep your hand steady, and ensure all fingers are visible. Avoid shadows and blurry images. A clean background helps the AI better identify your hand shape."
  },
  {
    question: "Can I use the designs for commercial purposes?",
    answer: "Yes, our AI-generated designs are free for personal and commercial use. However, we recommend crediting Nail Art AI when sharing or using designs publicly."
  }
];

export default function FAQPage() {
  return (
    <>
      {/* Structured Data for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
              ...generalFAQs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              })),
              ...techniqueFAQs.map(faq => ({
                "@type": "Question", 
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              })),
              ...troubleshootingFAQs.map(faq => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            ]
          })
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-purple-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto">
              Find answers to common questions about AI nail art, virtual try-on, 
              nail art techniques, and more. Get help with your nail art journey.
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {faqCategories.map((category, index) => (
              <Link
                key={index}
                href={category.href}
                className="group bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:border-purple-500/50 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{category.icon}</div>
                  <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-purple-400 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {category.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* General FAQs */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">General Questions</h2>
            <div className="space-y-6">
              {generalFAQs.map((faq, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Technique FAQs */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">Nail Art Techniques</h2>
            <div className="space-y-6">
              {techniqueFAQs.map((faq, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Troubleshooting FAQs */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-8">Troubleshooting</h2>
            <div className="space-y-6">
              {troubleshootingFAQs.map((faq, index) => (
                <div key={index} className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                  <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                  <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="bg-purple-900/30 rounded-xl p-8 border border-purple-700 text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Still Have Questions?</h2>
            <p className="text-gray-300 mb-6">
              Can&apos;t find what you&apos;re looking for? We&apos;re here to help!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Contact Us
              </Link>
              <Link
                href="/try-on"
                className="bg-gray-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Try Virtual Try-On
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
