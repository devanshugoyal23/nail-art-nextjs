import React from 'react';
import Link from 'next/link';
import { deterministicSubset } from '@/lib/deterministicSelection';

interface NailCareTipsSectionProps {
  salonName: string;
}

interface TipGuide {
  title: string;
  icon: string;
  tips: (salonName: string) => string[];
  proTip?: (salonName: string) => string;
}

const NAIL_CARE_GUIDES: TipGuide[] = [
  {
    title: 'Make Your Manicure Last Longer',
    icon: '⏰',
    tips: (salonName: string) => [
      'Apply a fresh top coat every 2-3 days to seal and protect your polish',
      'Wear rubber gloves when doing dishes, cleaning, or using harsh chemicals',
      'Keep your nails and cuticles moisturized with cuticle oil daily',
      `Ask the professionals at ${salonName} about their recommended aftercare products`,
      'File nails in one direction only to prevent splitting and peeling'
    ],
    proTip: (salonName: string) => `The nail technicians at ${salonName} can show you proper aftercare techniques to make your manicure last 2-3 weeks!`
  },
  {
    title: 'Nail Health 101',
    icon: '💪',
    tips: (salonName: string) => [
      'Take biotin supplements to strengthen nails and promote growth',
      'Keep nails trimmed and filed to prevent breakage and snagging',
      'Moisturize cuticles daily with vitamin E or cuticle oil',
      `Schedule regular appointments at ${salonName} to maintain healthy nail growth`,
      'Stay hydrated and eat a balanced diet rich in protein and vitamins'
    ],
    proTip: (salonName: string) => `The experts at ${salonName} can assess your nail health and recommend personalized strengthening treatments!`
  },
  {
    title: 'Prevent Nail Damage',
    icon: '🛡️',
    tips: (salonName: string) => [
      'Always use a base coat before applying colored polish',
      `Visit ${salonName} for professional gel or acrylic removal - never peel them off yourself`,
      'Avoid using your nails as tools to open cans or scrape things',
      'Don\'t cut cuticles - gently push them back instead',
      'Use acetone-free nail polish remover to prevent drying'
    ],
    proTip: (salonName: string) => `The team at ${salonName} uses gentle removal techniques to prevent damage - damaged nails can take 3-6 months to recover!`
  },
  {
    title: 'At-Home Nail Care Routine',
    icon: '🏠',
    tips: (salonName: string) => [
      'Soak nails in warm water with a few drops of olive oil for 10 minutes weekly',
      'Gently buff nail surface to smooth ridges and improve polish adhesion',
      'Apply cuticle oil before bed and massage into nails and skin',
      `Ask ${salonName} to recommend the best nail strengthener for your nail type`,
      'Keep a nail file handy to smooth any snags immediately'
    ],
    proTip: (salonName: string) => `Maintain your professional results from ${salonName} with a weekly at-home spa treatment between salon visits!`
  },
  {
    title: 'Choosing the Right Nail Shape',
    icon: '💅',
    tips: (salonName: string) => [
      'Square nails are strong and perfect for those who type frequently',
      'Oval and almond shapes elongate fingers and are universally flattering',
      'Stiletto and coffin shapes make a bold statement but require more maintenance',
      'Round nails are low-maintenance and great for natural nail growth',
      `The nail artists at ${salonName} can help you choose the perfect shape for your lifestyle`
    ],
    proTip: (salonName: string) => `Book a consultation at ${salonName} to discover which nail shape best suits your nail bed and daily activities!`
  },
  {
    title: 'Gel vs. Regular Polish',
    icon: '✨',
    tips: (salonName: string) => [
      'Gel polish lasts 2-3 weeks without chipping, perfect for busy lifestyles',
      'Regular polish is easier to remove and change frequently for variety',
      'Gel requires UV/LED curing but dries instantly with no smudging',
      `Ask the team at ${salonName} which polish type works best for your nail health`,
      'Both can be beautiful - choose based on your schedule and preferences'
    ],
    proTip: (salonName: string) => `The professionals at ${salonName} can help you alternate between gel and regular polish for optimal nail health!`
  },
  {
    title: 'Fixing Common Nail Problems',
    icon: '🔧',
    tips: (salonName: string) => [
      'For yellow nails: Use a whitening toothpaste or lemon juice soak',
      'For brittle nails: Increase biotin intake and use a nail hardener',
      'For peeling nails: Keep them moisturized and avoid harsh chemicals',
      `For persistent issues: Visit ${salonName} for professional nail treatments and advice`,
      'For hangnails: Don\'t pull them - clip carefully and moisturize'
    ],
    proTip: (salonName: string) => `The experienced technicians at ${salonName} can identify nail problems and recommend effective treatments!`
  },
  {
    title: 'Nail Art Aftercare',
    icon: '🎨',
    tips: (salonName: string) => [
      'Avoid picking at nail art decorations - they\'ll last longer if left alone',
      'Apply extra top coat over 3D embellishments to secure them',
      'Be gentle with intricate designs - they may be more delicate',
      `Return to ${salonName} for touch-ups to keep your nail art looking fresh`,
      'Protect detailed nail art with gloves during household chores'
    ],
    proTip: (salonName: string) => `The talented nail artists at ${salonName} create durable designs that can last 2-3 weeks with proper care!`
  }
];

// ✅ FIXED: Use deterministic tip selection for SEO stability
// Same salon always shows same tips - improves SEO and caching
// Different salons get different tips for variety across the site
function getDeterministicTips(salonName: string, count: number = 1): TipGuide[] {
  return deterministicSubset(NAIL_CARE_GUIDES, salonName, count);
}

export default function NailCareTipsSection({ salonName }: NailCareTipsSectionProps) {
  // Get 1 deterministic tip guide based on salon name
  const selectedTips = getDeterministicTips(salonName, 1);
  const guide = selectedTips[0];

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">{guide.icon}</span>
          <h2 className="text-2xl font-bold text-[#1b0d14]">
            {guide.title}
          </h2>
        </div>
        <p className="text-[#1b0d14]/70 text-sm">
          Expert advice from the professionals at {salonName}
        </p>
      </div>

      {/* Compact Tips List */}
      <ul className="space-y-2.5 mb-4">
        {guide.tips(salonName).map((tip, tipIndex) => (
          <li key={tipIndex} className="flex items-start gap-2.5">
            <span className="text-[#ee2b8c] flex-shrink-0 mt-0.5 text-sm">✓</span>
            <span className="text-[#1b0d14]/80 text-sm leading-relaxed">
              {tip}
            </span>
          </li>
        ))}
      </ul>

      {/* Pro Tip */}
      {guide.proTip && (
        <div className="p-3 bg-[#ee2b8c]/10 rounded-lg border-l-4 border-[#ee2b8c]">
          <p className="text-sm">
            <span className="font-semibold text-[#ee2b8c]">💎 Pro Tip: </span>
            <span className="text-[#1b0d14]/80">{guide.proTip(salonName)}</span>
          </p>
        </div>
      )}

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-[#ee2b8c]/10 text-center">
        <Link
          href="/nail-care-tips"
          className="inline-flex items-center gap-2 text-[#ee2b8c] text-sm font-semibold hover:text-[#ee2b8c]/80 transition-colors"
        >
          More Nail Care Tips →
        </Link>
      </div>
    </div>
  );
}

