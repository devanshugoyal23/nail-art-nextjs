

import Link from "next/link";
import Image from "next/image";
import OptimizedImage from "./OptimizedImage";
import { GalleryItem } from "@/lib/supabase";
import { CategoryWithThumbnail } from "@/lib/categoryService";
import { TagItem } from "@/lib/tagService";
import { generateGalleryItemUrl } from "@/lib/optimizedGalleryService";
import { slugify } from "@/lib/slugify";

interface Props {
  trendingItems: GalleryItem[];
  categories: CategoryWithThumbnail[];
  popularTags: TagItem[];
}

export default function LightHomepage({ trendingItems = [], categories = [] }: Props) {
  const colorHex: Record<string, string> = {
    red: '#ef4444',
    pink: '#ec4899',
    rose: '#f43f5e',
    blue: '#3b82f6',
    sky: '#38bdf8',
    cyan: '#06b6d4',
    teal: '#14b8a6',
    green: '#22c55e',
    emerald: '#10b981',
    lime: '#84cc16',
    yellow: '#eab308',
    amber: '#f59e0b',
    orange: '#f97316',
    purple: '#a855f7',
    violet: '#8b5cf6',
    indigo: '#6366f1',
    black: '#111827',
    white: '#e5e7eb',
    gold: '#fbbf24',
    silver: '#9ca3af',
    brown: '#92400e',
    gray: '#6b7280'
  };
  
  // Emoji fallback when we don't have a good preview image
  const getEmojiFor = (type: 'technique' | 'occasion' | 'season', key: string): string => {
    const k = key.toLowerCase();
    if (type === 'technique') {
      if (k.includes('french')) return '💅';
      if (k.includes('ombre')) return '🌈';
      if (k.includes('marble')) return '🏛️';
      if (k.includes('glitter')) return '✨';
      if (k.includes('chrome')) return '🔮';
      if (k.includes('stamp')) return '🎯';
      return '🎨';
    }
    if (type === 'occasion') {
      if (k.includes('wedding')) return '💍';
      if (k.includes('date')) return '💘';
      if (k.includes('party')) return '🎉';
      if (k.includes('work') || k.includes('office')) return '💼';
      if (k.includes('prom')) return '👗';
      if (k.includes('christmas')) return '🎄';
      if (k.includes('halloween')) return '🎃';
      return '⭐';
    }
    // season
    if (k.includes('spring')) return '🌸';
    if (k.includes('summer')) return '🌞';
    if (k.includes('autumn') || k.includes('fall')) return '🍂';
    if (k.includes('winter')) return '❄️';
    return '🗓️';
  };

  // Distinct pastel tints per tag for visual variety
  const getTintFor = (type: 'technique' | 'occasion' | 'season', key: string): string => {
    const k = key.toLowerCase();
    if (type === 'technique') {
      if (k.includes('french')) return '#fde7f2'; // pink
      if (k.includes('ombre')) return '#e0f2fe'; // sky
      if (k.includes('marble')) return '#f3e8ff'; // purple
      if (k.includes('glitter')) return '#fff7ed'; // amber
      if (k.includes('chrome')) return '#e5e7eb'; // gray
      if (k.includes('stamp')) return '#dcfce7'; // green
      return '#f1f5f9';
    }
    if (type === 'occasion') {
      if (k.includes('wedding')) return '#fdf2f8';
      if (k.includes('date')) return '#ffe4e6';
      if (k.includes('party')) return '#fef9c3';
      if (k.includes('work') || k.includes('office')) return '#e5e7eb';
      if (k.includes('prom')) return '#ede9fe';
      if (k.includes('christmas')) return '#dcfce7';
      if (k.includes('halloween')) return '#fee2e2';
      return '#f1f5f9';
    }
    // season
    if (k.includes('spring')) return '#dcfce7';
    if (k.includes('summer')) return '#fef08a';
    if (k.includes('autumn') || k.includes('fall')) return '#ffedd5';
    if (k.includes('winter')) return '#e0f2fe';
    return '#f1f5f9';
  };
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative h-[60vh] sm:h-[70vh] min-h-[520px] sm:min-h-[560px] md:min-h-[600px] w-full text-white">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDmx-hlwA-qYCuDUGEVuhmIvHl4nX7ZJ5hHiuCV8rcM9QFGx6zPSbvm1ieStVCQY3oPdBBFjjUi_iUNmeA5_8gZ6EATTo-HMGLJ_EM-C5_qw-NrWqcC7LtoTG5fc3SzADvG-w0suw7TKOXz6f-hoVv8_BvpmMfwzm7BERg2P5oLNfsaEF79QaaKXhvcwwTQT8yx4HYTVKF1MjMTjcIhU5qvo0lJX3gu6WLUYWERnocKqYu_B5BlOSbrR7_sFdDTH9ArlPVD9xOI-XE")',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="relative z-10 flex h-full flex-col items-center justify-center text-center">
          <div className="container mx-auto flex flex-col items-center gap-8 px-4">
            <div className="flex flex-col gap-4">
              <h1 className="text-4xl font-black leading-tight tracking-[-0.033em] sm:text-5xl md:text-6xl">
                Find Your Next Manicure
              </h1>
              <p className="mx-auto max-w-2xl text-base font-normal leading-normal text-white/90 md:text-lg">
                Describe your dream nails and let our AI bring them to life. What are you looking for today?
              </p>
            </div>
            <div className="w-full max-w-2xl">
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g., 'chrome french tips with pearls'"
                  className="h-14 w-full rounded-full border-none bg-white/20 pl-6 pr-32 text-white placeholder-white/70 backdrop-blur-sm focus:ring-2 focus:ring-[#ee2b8c]"
                />
                <Link
                  href="/try-on"
                  className="absolute right-2 top-1/2 flex h-10 -translate-y-1/2 items-center justify-center rounded-full bg-[#ee2b8c] px-5 text-sm font-bold text-white"
                >
                  Generate
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/try-on"
                className="flex h-12 min-w-[84px] items-center justify-center rounded-full bg-white px-5 text-base font-bold text-[#ee2b8c]"
              >
                Try On
              </Link>
              <Link
                href="/nail-art-gallery"
                className="flex h-12 min-w-[84px] items-center justify-center rounded-full border-2 border-white bg-transparent px-5 text-base font-bold text-white"
              >
                Explore Gallery
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category (six smart entry cards) */}
      <section className="container mx-auto px-4 pb-8 sm:pb-12 mt-8 sm:mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Nail Shapes', emoji: '💅', desc: 'Discover the perfect nail shape for your style and personality', href: '/categories/nail-shapes' },
            { label: 'Colors', emoji: '🎨', desc: 'Express your mood with the perfect color palette', href: '/categories/colors' },
            { label: 'Techniques', emoji: '✨', desc: 'Master the art of nail design with professional techniques', href: '/categories/techniques' },
            { label: 'Occasions', emoji: '🎉', desc: 'Find the perfect nail art for every special moment', href: '/categories/occasions' },
            { label: 'Seasons', emoji: '🍂', desc: 'Embrace seasonal trends and weather-appropriate styles', href: '/categories/seasons' },
            { label: 'Styles', emoji: '🌟', desc: 'Discover your unique aesthetic and personal style', href: '/categories/styles' },
          ].map((c) => (
            <Link
              key={c.label}
              href={c.href}
              className="flex items-center justify-between rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 hover:shadow-md transition"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fde7f2] text-2xl">
                  <span aria-hidden>{c.emoji}</span>
                </div>
                <div className="text-left">
                  <div className="text-lg font-semibold text-[#1b0d14]">{c.label}</div>
                  <div className="text-sm text-[#1b0d14]/70">{c.desc}</div>
                </div>
              </div>
              <div className="text-[#ee2b8c]">→</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Contextual quick rows removed per request */}

      {/* Trending Now (real data) */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <h2 className="pb-8 text-2xl font-bold leading-tight tracking-[-0.015em] text-[#1b0d14] sm:text-3xl">
          Trending Now
        </h2>
        <div className="w-full">
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {trendingItems.slice(0, 12).map((item) => (
              <Link key={item.id} href={generateGalleryItemUrl(item)} className="snap-start relative w-56 sm:w-60 md:w-64 flex-shrink-0 overflow-hidden rounded-xl border-4 border-white shadow-md hover:shadow-lg transition-shadow">
                <div className="aspect-[3/4] w-full">
                  <OptimizedImage
                    src={item.image_url}
                    alt={item.design_name || 'AI nail art'}
                    width={256}
                    height={342}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                {/* Overlay for polish and readability */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-black/8" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
                </div>
                {/* Bottom label */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold drop-shadow-sm">
                      {(item.design_name || item.category || 'Design').slice(0, 28)}{(item.design_name && item.design_name.length > 28) ? '…' : ''}
                    </span>
                    <span className="text-white/80 text-xs">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Seasonal Spotlight → Top Categories (real, clickable) */}
      <section className="container mx-auto px-4 pb-8 sm:pb-12">
        <h2 className="pb-6 text-2xl font-bold leading-tight tracking-[-0.015em] text-[#1b0d14] sm:text-3xl">
          Seasonal Spotlight
        </h2>
        <div className="w-full">
          <div className="flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory [-ms-scrollbar-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.slice(0, 8).map((cat) => (
              <Link
                key={cat.category}
                href={`/nail-art-gallery/category/${slugify(cat.category)}`}
                className="snap-start relative w-56 sm:w-60 md:w-64 flex-shrink-0 overflow-hidden rounded-xl border-4 border-white shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="aspect-[3/4] w-full">
                  <OptimizedImage
                    src={cat.thumbnail || (trendingItems[0]?.image_url || '')}
                    alt={`${cat.category} nail art`}
                    width={256}
                    height={342}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-[1.03]"
                    loading="lazy"
                  />
                </div>
                {/* Subtle dark overlay for premium look */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 via-black/25 to-transparent" />
                </div>
                {/* Label */}
                <div className="absolute inset-x-0 bottom-0 z-10 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-white text-sm font-semibold drop-shadow-sm">
                      {cat.category}
                    </span>
                    <span className="text-white/80 text-xs">→</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        
      </section>

      {/* Explore by Theme section removed per request */}

      

      {/* Curated quick links: colors, techniques, occasions, seasons */}
      <section className="container mx-auto px-4 pb-8">
        {/* Popular Colors */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#1b0d14] flex items-center gap-2">🌮 Popular Colors</div>
            <Link href="/categories/colors" className="text-[#ee2b8c] text-sm font-semibold hover:underline">View all</Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Red', value: 'red' },
              { label: 'Gold', value: 'gold' },
              { label: 'Glitter', value: 'glitter' },
              { label: 'Black', value: 'black' },
              { label: 'White', value: 'white' },
              { label: 'Orange', value: 'orange' },
            ].map((c) => (
              <Link key={`home-color-${c.value}`} href={`/nail-colors/${c.value}`} className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5 hover:shadow-md transition">
                <span className="h-5 w-5 rounded-full ring-2 ring-white" style={{ backgroundColor: colorHex[c.value] || '#fde7f2' }} />
                <span className="text-[#1b0d14] font-medium">{c.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Techniques */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#1b0d14] flex items-center gap-2">✨ Techniques</div>
            <Link href="/categories/techniques" className="text-[#ee2b8c] text-sm font-semibold hover:underline">View all</Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {['french-manicure','ombre','marble','glitter','chrome','stamping'].map((t) => {
              const label = t.replace(/-/g,' ').replace(/\b\w/g, l => l.toUpperCase());
              const emoji = getEmojiFor('technique', t);
              const tint = getTintFor('technique', t);
              return (
                <Link key={`home-tech-${t}`} href={`/techniques/${t}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5 hover:shadow-md transition">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-[11px] ring-1 ring-black/5" style={{ backgroundColor: tint }}>
                    {emoji}
                  </span>
                  <span className="text-[#1b0d14] font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Occasions */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#1b0d14] flex items-center gap-2">🎉 Occasions</div>
            <Link href="/categories/occasions" className="text-[#ee2b8c] text-sm font-semibold hover:underline">View all</Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {['wedding','date-night','party','work','prom','christmas','halloween'].map((o) => {
              const label = o.replace(/-/g,' ').replace(/\b\w/g, l => l.toUpperCase());
              const emoji = getEmojiFor('occasion', o);
              const tint = getTintFor('occasion', o);
              return (
                <Link key={`home-occ-${o}`} href={`/nail-art/occasion/${o}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5 hover:shadow-md transition">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-[11px] ring-1 ring-black/5" style={{ backgroundColor: tint }}>
                    {emoji}
                  </span>
                  <span className="text-[#1b0d14] font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Seasons */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div className="text-sm font-semibold text-[#1b0d14] flex items-center gap-2">🍂 Seasons</div>
            <Link href="/categories/seasons" className="text-[#ee2b8c] text-sm font-semibold hover:underline">View all</Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {['spring','summer','autumn','winter'].map((s) => {
              const label = s.charAt(0).toUpperCase()+s.slice(1);
              const emoji = getEmojiFor('season', s);
              const tint = getTintFor('season', s);
              return (
                <Link key={`home-sea-${s}`} href={`/nail-art/season/${s}`} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-sm ring-1 ring-black/5 hover:shadow-md transition">
                  <span className="h-5 w-5 rounded-full flex items-center justify-center text-[11px] ring-1 ring-black/5" style={{ backgroundColor: tint }}>
                    {emoji}
                  </span>
                  <span className="text-[#1b0d14] font-medium">{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Try-On CTA */}
      <section className="container mx-auto px-4 py-16 sm:py-24">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#fde1ee] via-[#f9cfe5] to-[#f8e9f3] ring-1 ring-[#ee2b8c]/20 shadow-sm">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-white/40 blur-3xl" />
          <div className="relative grid grid-cols-1 md:grid-cols-2 items-center gap-10 p-8 md:p-12">
            <div className="flex flex-col items-start gap-6">
              <h2 className="text-3xl font-extrabold tracking-[-0.02em] text-[#1b0d14] sm:text-4xl">
                Virtual Try-On Studio
              </h2>
              <p className="text-base leading-relaxed text-[#1b0d14]/80 max-w-xl">
                Use your camera to preview AI‑generated nail designs on your own hands in real‑time.
                Find your perfect match before you head to the salon.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-[#1b0d14] ring-1 ring-black/5">⚡ Instant preview</span>
                <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-[#1b0d14] ring-1 ring-black/5">📱 Mobile friendly</span>
                <span className="rounded-full bg-white/70 px-3 py-1 text-sm font-medium text-[#1b0d14] ring-1 ring-black/5">🔒 No login required</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/try-on" className="inline-flex h-12 items-center rounded-full bg-[#ee2b8c] px-6 text-base font-bold text-white shadow-sm hover:shadow-md transition">
                  Launch Try-On
                </Link>
                <Link href="/nail-art-gallery" className="inline-flex h-12 items-center rounded-full bg-white/80 px-6 text-base font-semibold text-[#1b0d14] ring-1 ring-black/5 hover:bg-white transition">
                  Browse Gallery
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative rounded-2xl border-4 border-white shadow-lg overflow-hidden">
                <Image
                  alt="A smartphone mockup showing a hand with augmented reality nail art."
                  className="max-h-[420px] md:max-h-[460px] object-contain"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDSygmI05_U85yDqLNZpXcLYFVwtsWZX-PVIaipXhIzcC3vS9ff2JGrD72Xf8BEaGkGCl3NlpyjX_icyq6clUcq7yo6bXczuvxvoDYNJdvmJJCPazgGRBqEJ7kwL8GI6uLpV3tFwMpY3_Ha_vk9Hofasbp6AqeITjDd0qDyKqiSL4Hs8qDvLDckHOrrrPs865AjC-mYE7-uUg-F8h0MB96T74HvkxRMkx2u66fgOMlIb3EBDC0pPhiRDqxR2Yru989Y6I37CKpMJIM"
                  width={460}
                  height={460}
                  unoptimized={true}
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      

      {/* Newsletter */}
      <section className="bg-[#fde7f2]">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center gap-4 text-center">
            <h2 className="text-2xl font-bold leading-tight tracking-[-0.015em] text-[#1b0d14] sm:text-3xl">
              Get Inspired Weekly
            </h2>
            <p className="max-w-xl text-base leading-normal text-[#1b0d14]/80">
              Subscribe to our newsletter for the latest trends, tutorials, and exclusive designs delivered to your inbox.
            </p>
            <div className="mt-2 flex w-full max-w-md flex-col gap-2 sm:flex-row">
              <input
                type="email"
                placeholder="Enter your email"
                className="h-12 flex-grow rounded-full border border-[#ee2b8c]/30 bg-white px-4 focus:ring-2 focus:ring-[#ee2b8c]"
              />
              <button className="flex h-12 flex-shrink-0 items-center justify-center rounded-full bg-[#ee2b8c] px-5 text-base font-bold text-white">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


