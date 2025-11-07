import React from 'react';
import Link from 'next/link';

interface SeasonalTrendsSectionProps {
  salonName: string;
  city: string;
}

// Get current season based on month
function getCurrentSeason(): 'winter' | 'spring' | 'summer' | 'fall' {
  const month = new Date().getMonth(); // 0-11
  if (month >= 2 && month <= 4) return 'spring'; // Mar-May
  if (month >= 5 && month <= 7) return 'summer'; // Jun-Aug
  if (month >= 8 && month <= 10) return 'fall'; // Sep-Nov
  return 'winter'; // Dec-Feb
}

const SEASONAL_TRENDS = {
  winter: {
    emoji: '❄️',
    name: 'Winter',
    color: 'from-blue-500 to-cyan-400',
    trends: [
      { name: 'Holiday Glitter Nails', description: 'Sparkly gold and silver accents perfect for festive celebrations', icon: '✨' },
      { name: 'Snowflake Designs', description: 'Delicate white snowflakes on icy blue or deep navy bases', icon: '❄️' },
      { name: 'Deep Red & Gold', description: 'Rich burgundy and metallic gold for elegant winter looks', icon: '💎' },
      { name: 'Cozy Sweater Patterns', description: 'Knit-inspired textures and cable patterns for warmth', icon: '🧶' },
      { name: 'Frosted Tips', description: 'Icy white or silver tips with a matte finish', icon: '🌨️' },
    ]
  },
  spring: {
    emoji: '🌸',
    name: 'Spring',
    color: 'from-pink-400 to-purple-400',
    trends: [
      { name: 'Pastel Florals', description: 'Soft pink, lavender, and mint with delicate flower accents', icon: '🌷' },
      { name: 'Cherry Blossom Art', description: 'Hand-painted sakura branches on nude or white bases', icon: '🌸' },
      { name: 'Easter Egg Designs', description: 'Playful pastel patterns with dots and stripes', icon: '🥚' },
      { name: 'Fresh Green Accents', description: 'Mint, sage, and lime green with botanical elements', icon: '🌿' },
      { name: 'Butterfly Wings', description: 'Colorful butterfly designs symbolizing renewal', icon: '🦋' },
    ]
  },
  summer: {
    emoji: '☀️',
    name: 'Summer',
    color: 'from-yellow-400 to-orange-500',
    trends: [
      { name: 'Beach Vibes', description: 'Ocean blues, sandy beiges, and seashell accents', icon: '🏖️' },
      { name: 'Tropical Patterns', description: 'Palm leaves, hibiscus flowers, and exotic fruits', icon: '🌺' },
      { name: 'Neon Brights', description: 'Bold electric colors that pop in the sunshine', icon: '🌈' },
      { name: 'Watermelon Designs', description: 'Fresh pink and green with black seed details', icon: '🍉' },
      { name: 'Sunset Ombre', description: 'Gradient from orange to pink to purple', icon: '🌅' },
    ]
  },
  fall: {
    emoji: '🍂',
    name: 'Fall',
    color: 'from-orange-500 to-red-600',
    trends: [
      { name: 'Autumn Leaves', description: 'Warm oranges, reds, and yellows with leaf motifs', icon: '🍁' },
      { name: 'Pumpkin Spice Colors', description: 'Burnt orange, cinnamon brown, and cream tones', icon: '🎃' },
      { name: 'Plaid Patterns', description: 'Cozy flannel-inspired designs in fall colors', icon: '🧡' },
      { name: 'Burgundy & Gold', description: 'Deep wine red with metallic gold accents', icon: '🍷' },
      { name: 'Harvest Moon', description: 'Warm metallic copper and bronze finishes', icon: '🌕' },
    ]
  }
};

export default function SeasonalTrendsSection({ salonName, city: _ }: SeasonalTrendsSectionProps) {
  const season = getCurrentSeason();
  const seasonData = SEASONAL_TRENDS[season];

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{seasonData.emoji}</span>
          <h2 className="text-2xl font-bold text-[#1b0d14]">
            Trending {seasonData.name} Nail Designs
          </h2>
        </div>
        <p className="text-[#1b0d14]/70">
          Discover the hottest nail art trends for {seasonData.name.toLowerCase()} {new Date().getFullYear()}. 
          The talented team at {salonName} stays up-to-date with seasonal styles to keep your nails on-trend.
        </p>
      </div>

      {/* Trends Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {seasonData.trends.map((trend, index) => (
          <div
            key={index}
            className="group p-4 rounded-lg bg-gradient-to-br from-[#ee2b8c]/5 to-transparent hover:from-[#ee2b8c]/10 transition-all duration-300 ring-1 ring-[#ee2b8c]/10 hover:ring-[#ee2b8c]/30"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0">{trend.icon}</span>
              <div>
                <h3 className="font-semibold text-[#1b0d14] mb-1 group-hover:text-[#ee2b8c] transition-colors">
                  {trend.name}
                </h3>
                <p className="text-sm text-[#1b0d14]/70">
                  {trend.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Season-specific CTA */}
      <div className={`p-4 rounded-lg bg-gradient-to-r ${seasonData.color} text-white`}>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-semibold mb-1">Ready for a {seasonData.name} Makeover?</p>
            <p className="text-sm text-white/90">
              Book your appointment and ask about our seasonal specials!
            </p>
          </div>
          <Link
            href={`/nail-art-gallery?search=${seasonData.name.toLowerCase()}`}
            className="flex-shrink-0 bg-white text-[#ee2b8c] px-6 py-2 rounded-lg font-semibold hover:bg-white/90 transition-colors whitespace-nowrap"
          >
            View {seasonData.name} Designs
          </Link>
        </div>
      </div>
    </div>
  );
}

