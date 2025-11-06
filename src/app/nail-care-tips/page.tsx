import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Expert Nail Care Tips & Advice | Keep Your Manicure Looking Fresh',
  description: 'Professional nail care tips from experts. Learn how to make your manicure last longer, maintain healthy nails, prevent damage, and choose the right nail shape. Complete guide to nail health and aftercare.',
  keywords: [
    'nail care tips',
    'manicure care',
    'nail health',
    'how to make manicure last longer',
    'nail care routine',
    'prevent nail damage',
    'healthy nails',
    'nail aftercare',
    'gel nail care',
    'acrylic nail care'
  ],
  openGraph: {
    title: 'Expert Nail Care Tips & Advice',
    description: 'Professional nail care tips to keep your manicure looking fresh and your nails healthy. Expert advice from nail technicians.',
    type: 'website',
  },
  alternates: {
    canonical: '/nail-care-tips',
  },
};

interface TipGuide {
  title: string;
  icon: string;
  tips: string[];
  proTip: string;
}

const NAIL_CARE_GUIDES: TipGuide[] = [
  {
    title: 'Make Your Manicure Last Longer',
    icon: '⏰',
    tips: [
      'Apply a fresh top coat every 2-3 days to seal and protect your polish',
      'Wear rubber gloves when doing dishes, cleaning, or using harsh chemicals',
      'Keep your nails and cuticles moisturized with cuticle oil daily',
      'Ask your nail technician about their recommended aftercare products',
      'File nails in one direction only to prevent splitting and peeling'
    ],
    proTip: 'Professional gel manicures can last 2-3 weeks with proper care and maintenance!'
  },
  {
    title: 'Nail Health 101',
    icon: '💪',
    tips: [
      'Take biotin supplements to strengthen nails and promote growth',
      'Keep nails trimmed and filed to prevent breakage and snagging',
      'Moisturize cuticles daily with vitamin E or cuticle oil',
      'Schedule regular salon appointments to maintain healthy nail growth',
      'Stay hydrated and eat a balanced diet rich in protein and vitamins'
    ],
    proTip: 'Healthy nails grow about 3mm per month. Professional nail technicians can assess your nail health and recommend personalized treatments!'
  },
  {
    title: 'Prevent Nail Damage',
    icon: '🛡️',
    tips: [
      'Always use a base coat before applying colored polish',
      'Visit a professional salon for gel or acrylic removal - never peel them off yourself',
      'Avoid using your nails as tools to open cans or scrape things',
      'Don\'t cut cuticles - gently push them back instead',
      'Use acetone-free nail polish remover to prevent drying'
    ],
    proTip: 'Professional salons use gentle removal techniques to prevent damage. Damaged nails can take 3-6 months to fully recover, so prevention is key!'
  },
  {
    title: 'At-Home Nail Care Routine',
    icon: '🏠',
    tips: [
      'Soak nails in warm water with a few drops of olive oil for 10 minutes weekly',
      'Gently buff nail surface to smooth ridges and improve polish adhesion',
      'Apply cuticle oil before bed and massage into nails and skin',
      'Ask your nail technician to recommend the best nail strengthener for your nail type',
      'Keep a nail file handy to smooth any snags immediately'
    ],
    proTip: 'A weekly at-home spa treatment keeps nails healthy between professional salon visits!'
  },
  {
    title: 'Choosing the Right Nail Shape',
    icon: '💅',
    tips: [
      'Square nails are strong and perfect for those who type frequently',
      'Oval and almond shapes elongate fingers and are universally flattering',
      'Stiletto and coffin shapes make a bold statement but require more maintenance',
      'Round nails are low-maintenance and great for natural nail growth',
      'Professional nail artists can help you choose the perfect shape for your lifestyle'
    ],
    proTip: 'Book a consultation at your local nail salon to discover which nail shape best suits your nail bed and daily activities!'
  },
  {
    title: 'Gel vs. Regular Polish',
    icon: '✨',
    tips: [
      'Gel polish lasts 2-3 weeks without chipping, perfect for busy lifestyles',
      'Regular polish is easier to remove and change frequently for variety',
      'Gel requires UV/LED curing but dries instantly with no smudging',
      'Ask your nail technician which polish type works best for your nail health',
      'Both can be beautiful - choose based on your schedule and preferences'
    ],
    proTip: 'Professional nail technicians can help you alternate between gel and regular polish for optimal nail health!'
  },
  {
    title: 'Fixing Common Nail Problems',
    icon: '🔧',
    tips: [
      'For yellow nails: Use a whitening toothpaste or lemon juice soak',
      'For brittle nails: Increase biotin intake and use a nail hardener',
      'For peeling nails: Keep them moisturized and avoid harsh chemicals',
      'For persistent issues: Visit a professional salon for treatments and advice',
      'For hangnails: Don\'t pull them - clip carefully and moisturize'
    ],
    proTip: 'Experienced nail technicians can identify nail problems and recommend effective professional treatments!'
  },
  {
    title: 'Nail Art Aftercare',
    icon: '🎨',
    tips: [
      'Avoid picking at nail art decorations - they\'ll last longer if left alone',
      'Apply extra top coat over 3D embellishments to secure them',
      'Be gentle with intricate designs - they may be more delicate',
      'Return to your salon for touch-ups to keep your nail art looking fresh',
      'Protect detailed nail art with gloves during household chores'
    ],
    proTip: 'Talented nail artists create durable designs that can last 2-3 weeks with proper care and maintenance!'
  }
];

export default function NailCareTipsPage() {
  return (
    <div className="min-h-screen bg-[#f8f6f7]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#ee2b8c]/10 to-[#f8f6f7]">
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-[#1b0d14] mb-6">
              💡 Expert Nail Care Tips
            </h1>
            <p className="text-xl text-[#1b0d14]/70 max-w-3xl mx-auto mb-8">
              Professional advice from nail care experts to keep your manicure looking fresh and your nails healthy. 
              Learn the secrets to beautiful, strong nails from experienced nail technicians.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link
                href="/nail-salons"
                className="bg-[#ee2b8c] text-white px-8 py-4 rounded-full font-semibold hover:bg-[#ee2b8c]/90 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Find a Nail Salon Near You
              </Link>
              <Link
                href="/nail-art-gallery"
                className="bg-white text-[#ee2b8c] px-8 py-4 rounded-full font-semibold ring-1 ring-[#ee2b8c]/30 hover:ring-[#ee2b8c]/50 hover:bg-[#ee2b8c]/5 transition-all duration-300"
              >
                Browse Nail Art Designs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Quick Tips Summary */}
        <div className="mb-12 p-6 bg-white rounded-xl ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
            <span>⚡</span>
            <span>Quick Daily Nail Care Checklist</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#ee2b8c]/5">
              <span className="text-[#ee2b8c] text-xl">✓</span>
              <span className="text-[#1b0d14]/80 font-medium">Apply cuticle oil daily</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#ee2b8c]/5">
              <span className="text-[#ee2b8c] text-xl">✓</span>
              <span className="text-[#1b0d14]/80 font-medium">Moisturize hands regularly</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#ee2b8c]/5">
              <span className="text-[#ee2b8c] text-xl">✓</span>
              <span className="text-[#1b0d14]/80 font-medium">Wear gloves for chores</span>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-[#ee2b8c]/5">
              <span className="text-[#ee2b8c] text-xl">✓</span>
              <span className="text-[#1b0d14]/80 font-medium">File snags immediately</span>
            </div>
          </div>
        </div>

        {/* All Tip Guides */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {NAIL_CARE_GUIDES.map((guide, index) => (
            <div
              key={index}
              className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 transition-all duration-300"
            >
              {/* Guide Header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-4xl">{guide.icon}</span>
                <h3 className="text-xl font-bold text-[#1b0d14]">
                  {guide.title}
                </h3>
              </div>

              {/* Tips List */}
              <ul className="space-y-3 mb-4">
                {guide.tips.map((tip, tipIndex) => (
                  <li key={tipIndex} className="flex items-start gap-3">
                    <span className="text-[#ee2b8c] flex-shrink-0 mt-1">✓</span>
                    <span className="text-[#1b0d14]/80 leading-relaxed">
                      {tip}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Pro Tip */}
              <div className="p-4 bg-[#ee2b8c]/10 rounded-lg border-l-4 border-[#ee2b8c]">
                <p className="text-sm">
                  <span className="font-semibold text-[#ee2b8c]">💎 Pro Tip: </span>
                  <span className="text-[#1b0d14]/80">{guide.proTip}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 p-8 bg-gradient-to-r from-[#ee2b8c] to-[#ee2b8c]/80 rounded-xl text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Ready for a Professional Manicure?</h2>
          <p className="text-lg mb-6 text-white/90">
            Find the best nail salons near you and book your appointment today!
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/nail-salons"
              className="bg-white text-[#ee2b8c] px-8 py-4 rounded-full font-semibold hover:bg-white/90 transition-all duration-300 shadow-lg"
            >
              Find Nail Salons
            </Link>
            <Link
              href="/faq"
              className="bg-white/20 text-white px-8 py-4 rounded-full font-semibold hover:bg-white/30 transition-all duration-300"
            >
              Read FAQs
            </Link>
          </div>
        </div>

        {/* SEO Content */}
        <div className="mt-12 prose prose-lg max-w-none">
          <div className="bg-white rounded-xl p-8 ring-1 ring-[#ee2b8c]/15">
            <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Complete Guide to Nail Care</h2>
            <div className="text-[#1b0d14]/80 space-y-4">
              <p>
                <strong>Proper nail care</strong> is essential for maintaining healthy, beautiful nails and extending the life of your manicure. 
                Whether you prefer gel polish, acrylics, dip powder, or natural nails, following expert tips ensures the best results.
              </p>
              <p>
                Professional nail technicians recommend a combination of <strong>at-home maintenance</strong> and <strong>regular salon visits</strong> 
                for optimal nail health. Daily care routines like applying cuticle oil, moisturizing hands, and protecting nails during household 
                chores can significantly extend the life of your manicure.
              </p>
              <p>
                <strong>Preventing nail damage</strong> is easier than repairing it. Always use a base coat before applying polish, never peel off 
                gel or acrylic nails, and avoid using your nails as tools. Professional removal at a nail salon prevents damage that can take 
                3-6 months to fully recover.
              </p>
              <p>
                <strong>Choosing the right nail shape</strong> depends on your lifestyle, finger shape, and personal preferences. Square nails are 
                strong and practical, oval and almond shapes are universally flattering, while stiletto and coffin shapes make bold statements. 
                Consult with your nail technician to find the perfect shape for you.
              </p>
              <p>
                <strong>Nail health</strong> starts from within. A balanced diet rich in protein, biotin, and vitamins supports strong nail growth. 
                Stay hydrated, take supplements if needed, and give your nails occasional breaks from polish to breathe. Professional nail salons 
                can assess your nail health and recommend personalized treatments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

