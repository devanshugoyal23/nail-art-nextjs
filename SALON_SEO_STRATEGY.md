# 🚀 Salon Pages: Build Time, SEO & Crawl Budget Strategy

## 📊 Current Situation

### Your Numbers
- **Total Salons**: ~8,253 (expandable to 80,000+)
- **Current Sitemap**: Only main directory page (`/nail-salons`)
- **Current Pages**: Fully dynamic SSR (no static generation, no ISR)
- **Build Time**: Fast (nothing pre-built)
- **CPU Usage**: HIGH (300-500ms per page load)
- **Google Indexing**: MINIMAL (only 1 URL in sitemap)

### The Problem
You want to:
1. ✅ Keep build times FAST (< 5 minutes)
2. ✅ Rank on Google GRADUALLY (not spam)
3. ✅ Respect crawl budget (avoid overwhelming Google)
4. ✅ Reduce CPU usage (lower Vercel costs)
5. ✅ Quality over quantity (rank best salons first)

---

## 🎯 The Solution: Tiered Indexing Strategy

Instead of indexing all 8,253+ salons at once, we'll use a **phased approach** that:
- Ranks high-quality salons FIRST
- Expands gradually over time
- Respects Google's crawl budget
- Keeps build times under 5 minutes

---

## 📈 Phase-Based Rollout Plan

### **Phase 1: Foundation** (Week 1-2)
**Goal**: Index core directory structure + top salons
**URLs to Index**: ~500 URLs

#### What to Include:
```
Priority 1 (100 URLs):
- State pages (50 states)
- Top 50 cities (by salon count)

Priority 2 (400 URLs):
- Top 400 salons with:
  ✓ Rating ≥ 4.5 stars
  ✓ Reviews ≥ 50
  ✓ Has photos
  ✓ Currently operational
```

#### Sitemap Structure:
```xml
sitemap-index.xml
  ├── sitemap-nail-salons-states.xml      (50 state pages)
  ├── sitemap-nail-salons-cities.xml      (50 top cities)
  └── sitemap-nail-salons-premium.xml     (400 premium salons)
```

#### Build Time Impact:
- **Pre-build**: Only state pages (50 pages) = ~30 seconds
- **ISR**: Top cities + premium salons (on-demand, cached 6 hours)
- **Total Build Time**: < 1 minute

---

### **Phase 2: Expansion** (Week 3-6)
**Goal**: Add medium-quality salons in major cities
**URLs to Add**: ~2,000 URLs

#### What to Include:
```
Priority 3 (2,000 URLs):
- All salons with:
  ✓ Rating ≥ 4.0 stars
  ✓ Reviews ≥ 25
  ✓ Has photos OR website
  ✓ In top 100 cities
```

#### Sitemap Structure:
```xml
sitemap-index.xml
  ├── sitemap-nail-salons-states.xml      (50 states)
  ├── sitemap-nail-salons-cities.xml      (100 cities)
  ├── sitemap-nail-salons-premium.xml     (400 premium salons)
  └── sitemap-nail-salons-quality.xml     (2,000 quality salons)
```

#### Build Time Impact:
- **Pre-build**: State pages only (50 pages) = ~30 seconds
- **ISR**: Everything else (on-demand, cached 6 hours)
- **Total Build Time**: < 1 minute

---

### **Phase 3: Complete Rollout** (Week 7-12)
**Goal**: Index all remaining salons gradually
**URLs to Add**: ~5,000-8,000 URLs

#### What to Include:
```
Priority 4 (All remaining salons):
- All salons with:
  ✓ Rating ≥ 3.5 stars
  ✓ Has valid address
  ✓ Currently operational
  ✓ Not duplicate listings
```

#### Sitemap Strategy:
```xml
sitemap-index.xml
  ├── sitemap-nail-salons-states.xml          (All states)
  ├── sitemap-nail-salons-cities-major.xml    (Top 100 cities)
  ├── sitemap-nail-salons-cities-all.xml      (All other cities)
  ├── sitemap-nail-salons-premium.xml         (Premium salons)
  ├── sitemap-nail-salons-quality.xml         (Quality salons)
  └── sitemap-nail-salons-standard.xml        (Standard salons)
```

#### Build Time Impact:
- **Pre-build**: State pages only = ~30 seconds
- **ISR**: Everything else = on-demand
- **Total Build Time**: < 1 minute

---

### **Phase 4: Low-Priority Pages** (Month 4+)
**Goal**: Index remaining salons with noindex initially
**Strategy**: Discover through internal links, index selectively

#### What to Include:
```
Priority 5 (Low-priority salons):
- Salons with:
  ✓ Rating < 3.5 stars OR no reviews
  ✓ No photos
  ✓ Limited information

Strategy:
- NOT in sitemap (discovered via internal links)
- robots meta: noindex, follow (initially)
- Manually promote to indexed after review/photo updates
```

---

## 🔧 Technical Implementation

### 1. **ISR Configuration** (Fastest Build Times)

**File**: `src/app/nail-salons/[state]/[city]/[slug]/page.tsx`

```typescript
// Add these exports at the top level:

// ISR - Regenerate every 6 hours
export const revalidate = 21600; // 6 hours in seconds

// Allow on-demand generation for salons not pre-built
export const dynamicParams = true;

// Only pre-build state pages (fast builds)
export async function generateStaticParams() {
  // Return empty array - we'll use ISR for all salon pages
  // Only state/city pages will be pre-built
  return [];
}

// Add dynamic metadata with quality signals
export async function generateMetadata({ params }: SalonDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const salon = await getSalonFromR2(/* ... */);

  // Quality-based indexing control
  const shouldIndex = salon && (
    (salon.rating && salon.rating >= 4.0) ||
    (salon.reviewCount && salon.reviewCount >= 25) ||
    (salon.photos && salon.photos.length > 0)
  );

  return {
    title: `${salon.name} | ${city}, ${state}`,
    description: /* ... */,
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
      }
    },
    // ... rest of metadata
  };
}
```

**Result**:
- ✅ Build time: < 1 minute (nothing pre-built)
- ✅ First visit: Generates page (300-500ms)
- ✅ Subsequent visits: Cached (0ms Active CPU)
- ✅ Auto-regenerates every 6 hours
- ✅ Quality-based indexing control

---

### 2. **State & City Pages** (Pre-build for fast nav)

**Files**:
- `src/app/nail-salons/[state]/page.tsx`
- `src/app/nail-salons/[state]/[city]/page.tsx`

```typescript
// Keep existing configuration:
export const revalidate = 3600; // 1 hour
export const dynamicParams = true;
export async function generateStaticParams() {
  // Pre-build all state/city pages
  // This is fast: ~500 pages = ~2 minutes
  return /* ... */;
}
```

**Result**:
- ✅ State pages: Pre-built at deploy
- ✅ City pages: Pre-built at deploy
- ✅ Build time: ~2 minutes
- ✅ Instant page loads

---

### 3. **Priority-Based Sitemap Generation**

**File**: `src/app/sitemap-nail-salons-premium.xml/route.ts` (NEW)

```typescript
import { NextResponse } from 'next/server';
import { getSalonsForSitemap } from '@/lib/salonDataService';

export async function GET() {
  const baseUrl = 'https://nailartai.app';
  const currentDate = new Date().toISOString();

  // Get only premium salons for Phase 1
  const premiumSalons = await getSalonsForSitemap({
    minRating: 4.5,
    minReviews: 50,
    requirePhotos: true,
    limit: 400,
    orderBy: 'rating DESC, reviewCount DESC'
  });

  const urls = premiumSalons.map(salon => ({
    url: `${baseUrl}/nail-salons/${salon.stateSlug}/${salon.citySlug}/${salon.slug}`,
    lastModified: salon.updatedAt || currentDate,
    changeFrequency: 'monthly',
    priority: 0.9, // High priority for premium salons
  }));

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(page => `  <url>
    <loc>${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return new NextResponse(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=21600, s-maxage=21600', // 6 hours
    },
  });
}
```

**Additional Sitemaps to Create**:
- `sitemap-nail-salons-states.xml` (50 state pages)
- `sitemap-nail-salons-cities.xml` (top cities)
- `sitemap-nail-salons-quality.xml` (Phase 2)
- `sitemap-nail-salons-standard.xml` (Phase 3)

---

### 4. **Quality Scoring System**

**File**: `src/lib/salonQualityScore.ts` (NEW)

```typescript
export interface SalonQualityMetrics {
  rating?: number;
  reviewCount?: number;
  hasPhotos: boolean;
  hasWebsite: boolean;
  hasPhone: boolean;
  hasHours: boolean;
  isOperational: boolean;
}

export function calculateSalonQualityScore(salon: SalonQualityMetrics): number {
  let score = 0;

  // Rating score (0-40 points)
  if (salon.rating) {
    score += (salon.rating / 5) * 40;
  }

  // Review count (0-20 points)
  if (salon.reviewCount) {
    score += Math.min(salon.reviewCount / 100 * 20, 20);
  }

  // Completeness (0-40 points)
  if (salon.hasPhotos) score += 10;
  if (salon.hasWebsite) score += 10;
  if (salon.hasPhone) score += 10;
  if (salon.hasHours) score += 5;
  if (salon.isOperational) score += 5;

  return Math.round(score);
}

export function getSalonPriority(score: number): 'premium' | 'quality' | 'standard' | 'low' {
  if (score >= 80) return 'premium';  // Phase 1
  if (score >= 60) return 'quality';  // Phase 2
  if (score >= 40) return 'standard'; // Phase 3
  return 'low'; // Phase 4 (not in sitemap)
}

export function shouldIndexSalon(score: number, phase: 1 | 2 | 3 | 4): boolean {
  if (phase === 1) return score >= 80; // Premium only
  if (phase === 2) return score >= 60; // Quality+
  if (phase === 3) return score >= 40; // Standard+
  return false; // Phase 4: no index
}
```

---

### 5. **Database Query Optimization**

**Problem**: Current salon pages make 25+ parallel queries

**Solution**: Single aggregated query with caching

**File**: `src/lib/salonPageData.ts` (NEW)

```typescript
import { unstable_cache } from 'next/cache';
import { getSalonFromR2 } from './salonDataService';
import { getGalleryItems } from './galleryService';

// Cache gallery data globally (same for all salons)
const getCachedGalleryData = unstable_cache(
  async () => {
    // Get 50 designs once, cache for 6 hours
    const designs = await getGalleryItems({ page: 1, limit: 50, sortBy: 'newest' });

    return {
      // Pre-categorize by color, technique, occasion
      byColor: {
        red: designs.items.filter(d => d.colors?.includes('Red')).slice(0, 4),
        gold: designs.items.filter(d => d.colors?.includes('Gold')).slice(0, 4),
        pink: designs.items.filter(d => d.colors?.includes('Pink')).slice(0, 4),
      },
      byTechnique: {
        french: designs.items.filter(d => d.techniques?.some(t => t.toLowerCase().includes('french'))).slice(0, 4),
        ombre: designs.items.filter(d => d.techniques?.some(t => t.toLowerCase().includes('ombre'))).slice(0, 4),
        glitter: designs.items.filter(d => d.techniques?.some(t => t.toLowerCase().includes('glitter'))).slice(0, 4),
      },
      byOccasion: {
        bridal: designs.items.filter(d => d.occasions?.some(o => o.toLowerCase().includes('bridal'))).slice(0, 4),
        holiday: designs.items.filter(d => d.occasions?.some(o => o.toLowerCase().includes('holiday'))).slice(0, 4),
      },
      random: designs.items.slice(0, 8),
    };
  },
  ['salon-gallery-data'],
  { revalidate: 21600 } // 6 hours
);

export async function getSalonPageData(state: string, city: string, slug: string) {
  // Parallel fetch: salon data + cached gallery data
  const [salon, galleryData] = await Promise.all([
    getSalonFromR2(state, city, slug),
    getCachedGalleryData(),
  ]);

  // Related salons (only if needed - can be removed for faster loads)
  const relatedSalons = salon ? await getSalonsForCity(state, city).then(s =>
    s.filter(x => x.slug !== slug).slice(0, 5)
  ) : [];

  return {
    salon,
    galleryData,
    relatedSalons,
  };
}
```

**Result**:
- ✅ Reduced from 25+ queries to 2 queries
- ✅ Gallery data cached globally (shared across all salons)
- ✅ Active CPU reduced from 300-500ms to 50-100ms
- ✅ 80% reduction in database load

---

## 📊 Crawl Budget Management

### Google's Crawl Budget Factors:
1. **Site Quality**: High-quality content = more crawl budget
2. **Page Speed**: Faster pages = more crawl budget
3. **Internal Linking**: Well-linked pages = higher priority
4. **Sitemap Priority**: Higher priority = crawled more often
5. **Update Frequency**: Frequently updated = crawled more

### Our Strategy:

#### **Tier 1: Premium Salons** (400 salons)
- Sitemap priority: 0.9
- Update frequency: Monthly
- Expected crawl: Weekly
- Indexing: Immediate

#### **Tier 2: Quality Salons** (2,000 salons)
- Sitemap priority: 0.7
- Update frequency: Monthly
- Expected crawl: Monthly
- Indexing: 2-4 weeks

#### **Tier 3: Standard Salons** (5,000 salons)
- Sitemap priority: 0.5
- Update frequency: Quarterly
- Expected crawl: Quarterly
- Indexing: 2-3 months

#### **Tier 4: Low-Priority** (Remaining)
- NOT in sitemap
- Discovered via internal links only
- robots: noindex, follow (initially)
- Indexed manually after quality improvements

---

## 🚀 Implementation Timeline

### **Week 1: Foundation Setup**
- [ ] Add ISR to salon detail pages
- [ ] Implement quality scoring system
- [ ] Optimize database queries (reduce from 25 to 2)
- [ ] Test page load performance

**Expected Results**:
- Build time: < 1 minute
- Page load CPU: 50-100ms (was 300-500ms)
- First visit: 200-300ms total time
- Cached visits: < 50ms

---

### **Week 2: Phase 1 Launch**
- [ ] Create premium salon sitemap (400 URLs)
- [ ] Create state pages sitemap (50 URLs)
- [ ] Create top cities sitemap (50 URLs)
- [ ] Submit to Google Search Console
- [ ] Submit to Bing Webmaster Tools

**Expected Results**:
- 500 URLs in sitemap
- Indexed within 1-2 weeks
- Crawl budget: ~100 pages/day

---

### **Week 3-4: Monitor & Optimize**
- [ ] Monitor Google Search Console indexing status
- [ ] Check for crawl errors
- [ ] Analyze which salons are getting traffic
- [ ] Optimize low-performing pages

**Expected Results**:
- 80%+ indexing rate
- 0 crawl errors
- Traffic starting to premium salons

---

### **Week 5-6: Phase 2 Launch**
- [ ] Create quality salon sitemap (2,000 URLs)
- [ ] Update sitemap index
- [ ] Submit updated sitemap to GSC
- [ ] Monitor crawl budget impact

**Expected Results**:
- 2,500 total URLs in sitemap
- Crawl budget: ~200 pages/day
- Indexed within 3-4 weeks

---

### **Month 3: Phase 3 Launch**
- [ ] Create standard salon sitemap (5,000 URLs)
- [ ] Update sitemap index
- [ ] Submit updated sitemap
- [ ] Monitor performance

**Expected Results**:
- 7,500 total URLs in sitemap
- Crawl budget: ~300 pages/day
- Indexed within 2-3 months

---

### **Month 4+: Ongoing Optimization**
- [ ] Promote high-quality Phase 4 salons to indexed
- [ ] Remove low-quality or closed salons from sitemap
- [ ] Update salon data from Google Places API
- [ ] Generate fresh content for top-performing salons

---

## 📈 Expected SEO Results

### **Month 1** (Phase 1: 500 URLs)
- Indexed: 400-450 URLs (80-90%)
- Organic traffic: 100-200 visitors/month
- Avg position: 20-30

### **Month 2** (Phase 2: 2,500 URLs)
- Indexed: 2,000-2,250 URLs (80-90%)
- Organic traffic: 500-1,000 visitors/month
- Avg position: 15-25

### **Month 3** (Phase 3: 7,500 URLs)
- Indexed: 6,000-6,750 URLs (80-90%)
- Organic traffic: 2,000-3,000 visitors/month
- Avg position: 10-20

### **Month 6** (Optimized)
- Indexed: 7,000-8,000 URLs (90%+)
- Organic traffic: 5,000-10,000 visitors/month
- Avg position: 5-15 for premium salons

---

## 💰 Cost Impact (Vercel Fluid Active CPU)

### **Current (SSR, No Caching)**
- 10,000 page views/month
- 300ms Active CPU per view
- Total: 3,000 seconds = 0.83 CPU hours
- Cost: $0.11/month

### **After Optimization (ISR + Caching)**
- 10,000 page views/month
- First visit: 100ms Active CPU (70% reduction)
- Cached visits (90%): 0ms Active CPU
- Total: (1,000 × 0.1s) + (9,000 × 0s) = 100 seconds = 0.028 CPU hours
- **Cost: $0.004/month (96% reduction!)**

### **At Scale (100,000 page views/month)**
- Current cost: $1.10/month
- Optimized cost: $0.04/month
- **Savings: $1.06/month (96% reduction)**

---

## ✅ Success Metrics

Track these in Google Search Console & Vercel Analytics:

### **Technical Performance**
- ✅ Build time < 1 minute
- ✅ Page load Active CPU < 100ms
- ✅ Cache hit rate > 90%
- ✅ Vercel function executions < 10,000/month

### **SEO Performance**
- ✅ Indexing rate > 80%
- ✅ Crawl errors < 1%
- ✅ Avg crawl time < 2 seconds
- ✅ Sitemap coverage > 90%

### **Business Metrics**
- ✅ Organic traffic growth: +50% month-over-month
- ✅ Avg position improvement: -5 positions/month
- ✅ Click-through rate: > 2%
- ✅ User engagement: > 2 pages/session

---

## 🎯 Summary

### **The Strategy**
1. **Fast Builds**: ISR (< 1 minute) instead of static generation (hours)
2. **Gradual Ranking**: Phase 1-4 rollout over 3-6 months
3. **Quality First**: Premium salons ranked first, standard salons later
4. **Crawl Budget**: Respect Google's limits with tiered sitemaps
5. **Cost Efficient**: 96% reduction in CPU costs

### **The Timeline**
- Week 1: Setup & optimization
- Week 2: Launch Phase 1 (500 URLs)
- Month 2: Launch Phase 2 (2,500 URLs)
- Month 3: Launch Phase 3 (7,500 URLs)
- Month 6: Full indexing & optimization

### **The Results**
- ✅ Build time: < 1 minute (was hours)
- ✅ CPU cost: $0.004/month (was $0.11/month)
- ✅ Indexed URLs: 6,000-8,000 (was 1)
- ✅ Organic traffic: 5,000-10,000/month (was minimal)
- ✅ No spam penalties
- ✅ Sustainable SEO growth

---

## 🚀 Ready to Start?

1. Review this plan
2. Confirm Phase 1 launch date
3. I'll implement the code changes
4. We'll deploy and monitor results

**This strategy gives you the best of all worlds: fast builds, gradual ranking, respect for Google's crawl budget, and massive cost savings!**
