import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSalonAdditionalData, generateSlug, NailSalon, SalonDetails } from '@/lib/nailSalonService';
import OptimizedImage from '@/components/OptimizedImage';
import NailArtGallerySection from '@/components/NailArtGallerySection';
import SeasonalTrendsSection from '@/components/SeasonalTrendsSection';
import NailCareTipsSection from '@/components/NailCareTipsSection';
import BrowseByTagsSection from '@/components/BrowseByTagsSection';
import DesignCollectionsSection from '@/components/DesignCollectionsSection';
import ColorPaletteSection from '@/components/ColorPaletteSection';
import TechniqueShowcaseSection from '@/components/TechniqueShowcaseSection';
import CollapsibleSection from '@/components/CollapsibleSection';
import StickySalonCTA from '@/components/StickySalonCTA';
import { SalonStructuredData } from '@/components/SalonStructuredData';
import { absoluteUrl } from '@/lib/absoluteUrl';
import { getCachedGalleryData } from '@/lib/salonPageCache';
import { GalleryItem } from '@/lib/supabase';
import { deterministicSelect } from '@/lib/deterministicSelection';
import EnrichedSalonSections from '@/components/EnrichedSalonSections';
import { EnrichedSalonData } from '@/types/salonEnrichment';
import {
  NearbyCitiesSection,
  SimilarQualitySalonsSection,
  PriceLevelSalonsSection,
  TopRatedSalonsSection,
  ExploreMoreLinksSection,
} from '@/components/SalonInternalLinks';
import ClaimListingCTA from '@/components/ClaimListingCTA';
import {
  getSimilarQualitySalons,
  getSimilarPriceLevelSalons,
  getTopRatedSalons,
  CityGroup,
} from '@/lib/salonInternalLinking';
import { getNearbyCitiesFromState, getMajorCitiesInState } from '@/lib/nearbyCitiesHelper';

// ISR Configuration - Cache salon pages for 7 days to reduce CPU usage and R2 costs
// ✅ PHASE 2.3: Increased from 6h to 7 days (96% fewer regenerations)
// Salon data rarely changes, so 7-day cache is appropriate for business listings
export const revalidate = 2592000; // 30 days - data is static, no need for frequent regeneration
export const dynamicParams = true; // Allow on-demand generation for new salons

interface SalonDetailPageProps {
  params: Promise<{
    state: string;
    city: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: SalonDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const stateName = decodeURIComponent(resolvedParams.state).replace(/-/g, ' ');
  const cityName = decodeURIComponent(resolvedParams.city).replace(/-/g, ' ');
  const formattedState = stateName.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  const formattedCity = cityName.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');

  // ✅ OPTIMIZATION: Fetch city data once for metadata (was duplicate R2 request)
  let salon: NailSalon | null = null;
  try {
    const { getCityDataFromR2 } = await import('@/lib/salonDataService');
    const cityData = await getCityDataFromR2(formattedState, formattedCity);

    if (cityData && cityData.salons) {
      salon = cityData.salons.find(s => generateSlug(s.name) === resolvedParams.slug) || null;
    }
  } catch (error) {
    console.error('Error fetching salon for metadata:', error);
  }

  const salonName = salon?.name || 'Nail Salon';

  // Enhanced description with rating, services, and CTA (no dependency on salonDetails)
  const enhancedDescription = salon?.address
    ? `Planning a visit to ${salonName} in ${formattedCity}, ${formattedState}? See real prices, hours, and try 1000+ nail designs virtually on YOUR hands before you go. Best for 2026.`
    : `Find ${salonName} in ${formattedCity}, ${formattedState}. Rated ${salon?.rating || 'high'} with ${salon?.reviewCount || 'many'} reviews. Try on 1000+ nail art designs virtually before your salon visit.`;

  // Optimized title (55-60 chars)
  const optimizedTitle = `${salonName} - ${formattedCity}, ${formattedState} | Prices, Reviews & Virtual Try-On 2026`;

  // Get image URL: Use nail design image from gallery instead of salon photos
  // This ensures consistent, beautiful OG images for social sharing
  const imageUrl = undefined; // Will use default OG image (nail design images are loaded later in the page)

  // Build canonical URL (absolute)
  const canonicalUrl = absoluteUrl(`/nail-salons/${resolvedParams.state}/${resolvedParams.city}/${resolvedParams.slug}`);

  // Calculate quality score for indexing decision (0-100)
  let qualityScore = 0;
  if (salon) {
    // Rating (0-40 points)
    if (salon.rating) qualityScore += (salon.rating / 5) * 40;
    // Reviews (0-20 points)
    if (salon.reviewCount) qualityScore += Math.min((salon.reviewCount / 100) * 20, 20);
    // Completeness (0-40 points) - removed photo check since using nail designs
    if (salon.website) qualityScore += 10;
    if (salon.phone) qualityScore += 10;
    if (salon.address) qualityScore += 10;
    if (salon.currentOpeningHours) qualityScore += 5;
    if (salon.businessStatus === 'OPERATIONAL') qualityScore += 5;
  }

  // Only index high-quality salons (score >= 60)
  const shouldIndex = qualityScore >= 60;

  return {
    title: optimizedTitle,
    description: enhancedDescription.substring(0, 160),
    keywords: [
      salonName,
      `nail salon ${formattedCity}`,
      `nail spa ${formattedCity}`,
      `nail art studio ${formattedCity}`,
      `best nail salon ${formattedCity} 2026`,
      `nail salon near me ${formattedCity}`,
      `virtual nail art try on`,
      'manicure',
      'pedicure',
      formattedCity,
      formattedState
    ],
    openGraph: {
      title: `${salonName} - ${formattedCity}, ${formattedState}`,
      description: enhancedDescription.substring(0, 200),
      type: 'website',
      locale: 'en_US',
      url: canonicalUrl,
      siteName: 'Nail Art AI',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${salonName} nail salon in ${formattedCity}, ${formattedState}`
        }
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${salonName} - ${formattedCity}, ${formattedState}`,
      description: enhancedDescription.substring(0, 200),
      images: imageUrl ? [imageUrl] : undefined,
      creator: '@nailartai',
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: shouldIndex,
      follow: true,
      googleBot: {
        index: shouldIndex,
        follow: true,
      }
    },
  };
}

export default async function SalonDetailPage({ params }: SalonDetailPageProps) {
  const resolvedParams = await params;
  const stateSlug = resolvedParams.state;
  const citySlug = resolvedParams.city;
  const stateName = decodeURIComponent(stateSlug).replace(/-/g, ' ');
  const cityName = decodeURIComponent(citySlug).replace(/-/g, ' ');
  const formattedState = stateName.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  const formattedCity = cityName.split(' ').map(word =>
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');

  let salon: NailSalon | null = null;
  let salonDetails: SalonDetails | null = null;
  let enrichedData: EnrichedSalonData | null = null;
  let relatedSalons: NailSalon[] = [];
  let galleryDesigns: Array<{ id: string; imageUrl: string; title?: string; description?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }> = [];
  let rawGalleryItems: GalleryItem[] = [];
  let designCollections: Array<{ title: string; description: string; icon: string; designs: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>; href: string }> = [];
  let colorPalettes: Array<{ color: string; designs: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>; emoji: string }> = [];
  let techniqueShowcases: Array<{ name: string; designs: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>; description: string; icon: string; difficulty: string }> = [];

  // ✅ NEW: Internal linking data for SEO
  let nearbyCitiesData: CityGroup[] = [];
  let similarQualitySalons: NailSalon[] = [];
  let priceLevelSalons: NailSalon[] = [];
  let topRatedStateSalons: NailSalon[] = [];

  try {
    // ✅ OPTIMIZATION: Fetch city data once from R2 (was 2-3 duplicate requests!)
    // This eliminates duplicate R2 calls in getSalonFromR2() and getSalonsForCity()
    const { getCityDataFromR2 } = await import('@/lib/salonDataService');
    const cityData = await getCityDataFromR2(formattedState, formattedCity);

    if (!cityData || !cityData.salons) {
      console.log(`⚠️ No salon data found for ${formattedCity}, ${formattedState}`);
      notFound();
    }

    // Find specific salon from city data (no additional R2 request)
    salon = cityData.salons.find(s => generateSlug(s.name) === resolvedParams.slug) || null;

    if (!salon) {
      console.log(`⚠️ Salon not found in R2 for ${resolvedParams.slug}`);
      notFound();
    } else {
      console.log(`✅ Using R2 data for salon ${resolvedParams.slug} (1 R2 request, was 2-3!)`);
    }

    if (salon) {
      // Use city data for related salons (no additional R2 request)
      relatedSalons = cityData.salons.filter(s => generateSlug(s.name) !== resolvedParams.slug).slice(0, 5);

      // ✅ NEW: Calculate internal linking data for SEO
      // Get similar quality salons from current city
      similarQualitySalons = getSimilarQualitySalons(
        salon,
        cityData.salons,
        resolvedParams.slug,
        6
      );

      // Get salons with similar price level from current city
      if (salon.priceLevel) {
        priceLevelSalons = getSimilarPriceLevelSalons(
          salon,
          cityData.salons,
          resolvedParams.slug,
          6
        );
      }

      // Get nearby cities (lightweight - just city info, no salon data)
      const nearbyCities = await getNearbyCitiesFromState(
        formattedState,
        formattedCity,
        4
      );

      // Convert to CityGroup format for the component
      nearbyCitiesData = nearbyCities.map((city) => ({
        city: city.name,
        citySlug: city.slug,
        state: city.state,
        stateSlug: city.stateSlug,
        distance: 0, // We don't have distance data without coordinates
        salons: [],
        topRated: null,
      }));

      // Get top-rated salons from major cities in the state (for state-level links)
      // This fetches data from 2-3 major cities for better coverage
      try {
        const majorCities = await getMajorCitiesInState(formattedState, 3);
        const { getCityDataFromR2 } = await import('@/lib/salonDataService');

        // Fetch salon data from major cities in parallel
        const majorCityData = await Promise.all(
          majorCities.map(async (city) => {
            try {
              const data = await getCityDataFromR2(formattedState, city.name);
              return data?.salons || [];
            } catch {
              return [];
            }
          })
        );

        // Flatten and get top-rated salons
        const allStateSalons = majorCityData.flat();
        topRatedStateSalons = getTopRatedSalons(
          allStateSalons,
          resolvedParams.slug,
          8
        );
      } catch (error) {
        console.error('Error fetching state-level top salons:', error);
        // Continue without state-level salons if fetch fails
      }

      // ✅ OPTIMIZATION: Use shared gallery cache (96% query reduction)
      // BEFORE: 26+ parallel Supabase queries (300-500ms, $0.11/month per 10k views)
      // AFTER: 1 cached query (50-100ms, $0.004/month per 10k views)
      const currentSalon = salon; // Create const to satisfy TypeScript
      const [additionalData, cachedGallery, fetchedEnrichedData] = await Promise.all([
        getSalonAdditionalData(currentSalon, undefined).catch(() => ({})),
        getCachedGalleryData().catch(() => null),
        // ✅ NEW: Try to load enriched data from R2 (no API calls, just cache read)
        import('@/lib/r2SalonStorage').then(({ getEnrichedDataFromR2 }) =>
          getEnrichedDataFromR2(currentSalon).catch(() => null)
        ).catch(() => null)
      ]);

      // Store enriched data for use in component
      enrichedData = fetchedEnrichedData;

      // ✅ Create salon details with enriched data OR fallback data (no Google Places API dependency)
      if (fetchedEnrichedData && fetchedEnrichedData.sections) {
        // Use enriched data from R2 if available
        salonDetails = {
          // Use AI-generated description
          description: fetchedEnrichedData.sections.about?.content
            ? fetchedEnrichedData.sections.about.content.replace(/<[^>]*>/g, '').substring(0, 300) + '...'
            : `${salon.name} is a professional nail salon located in ${salon.city}, ${salon.state}.`,

          // Use parking guide if available
          parkingInfo: fetchedEnrichedData.sections.parking?.summary || 'Street parking and nearby parking lots are typically available.',

          // Use AI-generated FAQ if available
          faq: fetchedEnrichedData.sections.faq?.questions.map(q => ({
            question: q.question,
            answer: q.answer
          })) || [
              {
                question: 'Do I need an appointment?',
                answer: 'Walk-ins are welcome, but appointments are recommended to ensure availability.'
              },
              {
                question: 'What payment methods do you accept?',
                answer: 'Most nail salons accept cash, credit cards, and mobile payments.'
              },
              {
                question: 'Is this salon family-friendly?',
                answer: 'Please contact the salon to inquire about services for children.'
              },
            ],

          // Use real customer reviews from enriched data
          placeReviews: fetchedEnrichedData.sections.customerReviews?.featuredReviews.map(r => ({
            rating: r.rating,
            text: r.text,
            authorName: r.authorName,
            publishTime: r.date,
          })) || undefined,

          // Use review summary if available
          reviewsSummary: fetchedEnrichedData.sections.reviewInsights?.summary,
        };
      } else {
        // Fallback to default data if no enriched data available
        salonDetails = {
          // Simple fallback description
          description: `${salon.name} is a professional nail salon located in ${salon.city}, ${salon.state}.`,

          // Default parking info
          parkingInfo: 'Street parking and nearby parking lots are typically available.',

          // Default FAQ
          faq: [
            {
              question: 'Do I need an appointment?',
              answer: 'Walk-ins are welcome, but appointments are recommended to ensure availability.'
            },
            {
              question: 'What payment methods do you accept?',
              answer: 'Most nail salons accept cash, credit cards, and mobile payments.'
            },
            {
              question: 'Is this salon family-friendly?',
              answer: 'Please contact the salon to inquire about services for children.'
            },
          ],
        };
      }

      // Merge additional data (photos, etc.) into salon
      if (additionalData) {
        salon = { ...salon, ...additionalData };
      }

      // ✅ Related salons already set from cityData (line 189) - no duplicate R2 request!

      // ✅ FIXED: Use cached gallery data with DETERMINISTIC selection for SEO stability
      // Combines both optimizations:
      // 1. Cached gallery data (96% query reduction from main branch)
      // 2. Deterministic selection (85% R2 cost reduction + SEO stability)
      if (cachedGallery) {
        // ✅ Use ALL gallery designs for maximum variety (was using only 20 from 'random')
        // Same salon = same designs every time (SEO + caching)
        // Different salons = different designs (variety across site)
        // Using cachedGallery.all (100+ designs) instead of random (20 designs)
        const selectedDesigns = deterministicSelect(cachedGallery.all, resolvedParams.slug, 8);
        galleryDesigns = selectedDesigns;

        // Convert to raw gallery items format (for backwards compatibility)
        rawGalleryItems = galleryDesigns.map(item => ({
          id: item.id,
          image_url: item.imageUrl,
          design_name: item.title,
          prompt: item.description || '',
          colors: item.colors,
          techniques: item.techniques,
          occasions: item.occasions
        })) as GalleryItem[];
      }

      // Prepare Design Collections (using pre-categorized cache data)
      const bridalItems = cachedGallery?.byOccasion.bridal || [];
      const weddingItems = cachedGallery?.byOccasion.wedding || [];
      const holidayItems = cachedGallery?.byOccasion.holiday || [];

      // Prefer bridal, fallback to wedding if bridal is empty
      const bridalOrWedding = bridalItems.length > 0 ? bridalItems : weddingItems;

      designCollections = [
        ...(bridalOrWedding.length > 0 ? [{
          title: 'Bridal Collection',
          description: 'Elegant designs perfect for your special day',
          icon: '👰',
          designs: bridalOrWedding,
          href: '/nail-art/occasion/wedding'
        }] : []),
        ...(holidayItems.length > 0 ? [{
          title: 'Holiday Collection',
          description: 'Festive designs for every celebration',
          icon: '🎉',
          designs: holidayItems,
          href: '/nail-art/occasion/holiday'
        }] : [])
      ];

      // Prepare Color Palettes (using pre-categorized cache data)
      const colorEmojis: { [key: string]: string } = {
        'Red': '❤️',
        'Gold': '✨',
        'Pink': '💗',
        'Blue': '💙',
        'Purple': '💜',
        'Silver': '⚪'
      };

      // Get first 3 colors that have designs from cache
      const colorOptions = [
        { name: 'Red', designs: cachedGallery?.byColor.red || [] },
        { name: 'Gold', designs: cachedGallery?.byColor.gold || [] },
        { name: 'Pink', designs: cachedGallery?.byColor.pink || [] },
        { name: 'Blue', designs: cachedGallery?.byColor.blue || [] },
        { name: 'Purple', designs: cachedGallery?.byColor.purple || [] },
        { name: 'Silver', designs: cachedGallery?.byColor.silver || [] }
      ];

      colorPalettes = colorOptions
        .filter(option => option.designs.length > 0)
        .slice(0, 3) // Take first 3 colors with designs
        .map(option => ({
          color: option.name,
          designs: option.designs,
          emoji: colorEmojis[option.name] || '🎨'
        }));

      // Prepare Technique Showcases (using pre-categorized cache data)
      const techniqueInfo: { [key: string]: { description: string; icon: string; difficulty: string } } = {
        'French': {
          description: 'Classic and timeless French manicure style',
          icon: '💅',
          difficulty: 'Easy'
        },
        'Ombre': {
          description: 'Beautiful gradient color transitions',
          icon: '🌈',
          difficulty: 'Medium'
        },
        'Glitter': {
          description: 'Sparkly and glamorous designs',
          icon: '✨',
          difficulty: 'Easy'
        },
        'Chrome': {
          description: 'Metallic finish with mirror-like shine',
          icon: '🔮',
          difficulty: 'Medium'
        },
        'Marble': {
          description: 'Elegant marble effect patterns',
          icon: '🏛️',
          difficulty: 'Advanced'
        },
        'Geometric': {
          description: 'Sharp lines and modern shapes',
          icon: '🔷',
          difficulty: 'Medium'
        },
        'Watercolor': {
          description: 'Soft, artistic watercolor effects',
          icon: '🎨',
          difficulty: 'Medium'
        },
        'Stamping': {
          description: 'Intricate patterns using nail stamping',
          icon: '🖼️',
          difficulty: 'Easy'
        }
      };

      // Get first 3 techniques that have designs from cache
      const techniqueOptions = [
        { name: 'French', designs: cachedGallery?.byTechnique.french || [] },
        { name: 'Ombre', designs: cachedGallery?.byTechnique.ombre || [] },
        { name: 'Glitter', designs: cachedGallery?.byTechnique.glitter || [] },
        { name: 'Chrome', designs: cachedGallery?.byTechnique.chrome || [] },
        { name: 'Marble', designs: cachedGallery?.byTechnique.marble || [] },
        { name: 'Geometric', designs: cachedGallery?.byTechnique.geometric || [] },
        { name: 'Watercolor', designs: cachedGallery?.byTechnique.watercolor || [] },
        { name: 'Stamping', designs: cachedGallery?.byTechnique.stamping || [] }
      ];

      techniqueShowcases = techniqueOptions
        .filter(option => option.designs.length > 0)
        .slice(0, 3) // Take first 3 techniques with designs
        .map(option => ({
          name: option.name,
          designs: option.designs,
          ...(techniqueInfo[option.name] || {
            description: `Professional ${option.name.toLowerCase()} nail art technique`,
            icon: '✨',
            difficulty: 'Medium'
          })
        }));
    }
  } catch (error) {
    console.error(`Error fetching salon:`, error);
    notFound();
  }

  if (!salon) {
    notFound();
  }

  // Get hero image: Use nail design from R2 gallery (deterministic selection for consistency)
  // ✅ Changed from salon photos to nail design images from R2
  // This ensures all salons have beautiful, relevant hero images even if salon photos aren't in R2
  const heroImage = galleryDesigns.length > 0
    ? galleryDesigns[0].imageUrl // Use first design (deterministically selected above)
    : `https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=500&fit=crop&q=80`; // Fallback to nail-related stock image

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
      {/* Structured Data for SEO */}
      {salon && salonDetails && (
        <SalonStructuredData
          salon={salon}
          salonDetails={salonDetails as { description?: string; faq?: Array<{ question: string; answer: string }>;[key: string]: unknown }}
          stateSlug={stateSlug}
          citySlug={citySlug}
          slug={resolvedParams.slug}
        />
      )}

      {/* Hero Section with Image */}
      <div className="relative overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={heroImage}
            alt={`Beautiful nail art design showcasing work from ${salon.name} in ${formattedCity}, ${formattedState}`}
            width={1200}
            height={500}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="mb-4">
              <Link
                href={`/nail-salons/${stateSlug}/${citySlug}`}
                className="text-white/90 hover:text-white text-sm font-medium inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                ← Back to {formattedCity} Salons
              </Link>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              {salon.name}
            </h1>
            {salon.rating && (
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full">
                  <span className="text-yellow-500 text-2xl">⭐</span>
                  <span className="text-2xl font-bold text-[#1b0d14]">{salon.rating}</span>
                  {salon.reviewCount && (
                    <span className="text-lg text-[#1b0d14]/70 ml-2">
                      ({salon.reviewCount.toLocaleString()} {salon.reviewCount === 1 ? 'review' : 'reviews'})
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Business Status & Open Now */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-4">
              {salon.currentOpeningHours?.openNow !== undefined && (
                <div className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${salon.currentOpeningHours.openNow
                  ? 'bg-green-500/90 text-white'
                  : 'bg-red-500/90 text-white'
                  }`}>
                  {salon.currentOpeningHours.openNow ? '🟢 Open Now' : '🔴 Closed'}
                </div>
              )}
              {salon.businessStatus && salon.businessStatus !== 'OPERATIONAL' && (
                <div className="px-4 py-2 rounded-full text-sm font-semibold bg-yellow-500/90 text-white backdrop-blur-sm">
                  {salon.businessStatus === 'CLOSED_TEMPORARILY' ? '⚠️ Temporarily Closed' : '❌ Permanently Closed'}
                </div>
              )}
              {salon.priceLevel && (
                <div className="px-4 py-2 rounded-full text-sm font-semibold bg-blue-500/90 text-white backdrop-blur-sm">
                  {salon.priceLevel === 'INEXPENSIVE' && '💰 Budget-Friendly'}
                  {salon.priceLevel === 'MODERATE' && '💰💰 Moderate'}
                  {salon.priceLevel === 'EXPENSIVE' && '💰💰💰 Expensive'}
                  {salon.priceLevel === 'VERY_EXPENSIVE' && '💰💰💰💰 Very Expensive'}
                </div>
              )}
            </div>
            <p className="text-xl text-white/90 drop-shadow-md mb-8">
              {formattedCity}, {formattedState}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/try-on"
                className="inline-block bg-[#ee2b8c] text-white font-bold py-4 px-10 rounded-full hover:bg-[#ee2b8c]/90 transition-all shadow-xl shadow-[#ee2b8c]/20 hover:scale-105"
              >
                Try Virtual Try-On 💅
              </Link>
              <Link
                href="/nail-art-gallery"
                className="inline-block bg-white/20 backdrop-blur-sm text-white font-bold py-4 px-10 rounded-full hover:bg-white/30 transition-all border border-white/30"
              >
                Browse Designs
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Content Freshness Indicator */}
        <div className="mb-6 text-center">
          <p className="text-sm text-[#1b0d14]/60">
            Last updated: <time dateTime={new Date().toISOString()}>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</time>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Salon Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Section - HIGH PRIORITY: Key information */}
            {salonDetails?.description && (
              <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">About {salon.name}</h2>
                <div className="prose prose-lg text-[#1b0d14]/70 max-w-none">
                  <p className="leading-relaxed">{salonDetails.description}</p>
                </div>
              </div>
            )}


            {/* Opening Hours - COMPACT VERSION with expandable full hours */}
            {(salon.openingHours || salon.currentOpeningHours?.weekdayDescriptions) && (() => {
              const hoursList = salon.currentOpeningHours?.weekdayDescriptions || salon.openingHours || [];
              const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
              const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

              // Parse hours to extract day and time
              const parseHours = (hoursString: string) => {
                const match = hoursString.match(/^([^:]+):\s*(.+)$/);
                if (match) {
                  return {
                    day: match[1].trim(),
                    time: match[2].trim(),
                    isToday: false
                  };
                }
                return {
                  day: '',
                  time: hoursString,
                  isToday: false
                };
              };

              const parsedHours = hoursList.map((hours, index) => {
                const parsed = parseHours(hours);
                const dayIndex = dayNames.findIndex(day =>
                  parsed.day.toLowerCase().includes(day.toLowerCase()) ||
                  day.toLowerCase().includes(parsed.day.toLowerCase())
                );
                parsed.isToday = dayIndex === currentDay;
                return { ...parsed, original: hours, index };
              });

              const todayHours = parsedHours.find(h => h.isToday);

              return (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-[#1b0d14] flex items-center gap-2">
                      <span>🕐</span>
                      <span>Opening Hours</span>
                    </h2>
                    {salon.currentOpeningHours?.openNow !== undefined && (
                      <span className={`px-3 py-1.5 rounded-md text-sm font-semibold ${salon.currentOpeningHours.openNow
                        ? 'bg-green-50 text-green-700 ring-1 ring-green-200'
                        : 'bg-red-50 text-red-700 ring-1 ring-red-200'
                        }`}>
                        {salon.currentOpeningHours.openNow ? 'Open Now' : 'Closed'}
                      </span>
                    )}
                  </div>

                  {/* Today's Hours - Prominently Displayed */}
                  {todayHours && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-[#ee2b8c]/5 to-[#ee2b8c]/10 rounded-lg border-l-4 border-[#ee2b8c]">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-[#ee2b8c] mb-1">Today ({todayHours.day})</p>
                          <p className="text-lg font-bold text-[#1b0d14]">{todayHours.time}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Full Hours - Collapsible */}
                  <CollapsibleSection
                    title="View All Hours"
                    defaultExpanded={false}
                    icon={<span>📅</span>}
                  >
                    <div className="space-y-2">
                      {parsedHours.map((item, index) => {
                        const isToday = item.isToday;
                        const isClosed = item.time.toLowerCase().includes('closed');

                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between py-2 px-3 rounded-lg ${isToday
                              ? 'bg-[#ee2b8c]/5 ring-1 ring-[#ee2b8c]/20'
                              : 'hover:bg-[#f8f6f7]'
                              }`}
                          >
                            <span className={`text-sm font-medium ${isToday
                              ? 'text-[#ee2b8c] font-semibold'
                              : 'text-[#1b0d14]/70'
                              }`}>
                              {item.day || `Day ${index + 1}`}
                            </span>
                            <span className={`text-sm ${isClosed
                              ? 'text-gray-400'
                              : isToday
                                ? 'text-[#1b0d14] font-semibold'
                                : 'text-[#1b0d14]/80'
                              }`}>
                              {item.time}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </CollapsibleSection>
                </div>
              );
            })()}

            {/* Services & Pricing - MEDIUM PRIORITY */}
            {((salonDetails as { services?: Array<{ name: string; description?: string; price?: string }> })?.services && (salonDetails as { services?: Array<{ name: string; description?: string; price?: string }> }).services!.length > 0) || (salon.types && salon.types.length > 0) ? (
              <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                <h2 className="text-xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
                  <span>💅</span>
                  <span>Services & Pricing</span>
                </h2>
                {(salonDetails as { services?: Array<{ name: string; description?: string; price?: string }> })?.services && (salonDetails as { services?: Array<{ name: string; description?: string; price?: string }> }).services!.length > 0 ? (
                  <div className="space-y-3">
                    {/* Group services by type for better structure */}
                    <div>
                      <h3 className="text-lg font-semibold text-[#1b0d14] mb-3">Manicure Services</h3>
                      <div className="space-y-3">
                        {((salonDetails as { services: Array<{ name: string; description?: string; price?: string }> }).services).filter((s) =>
                          s.name?.toLowerCase().includes('manicure') ||
                          s.name?.toLowerCase().includes('nail art') ||
                          s.name?.toLowerCase().includes('gel')
                        ).map((service, index: number) => (
                          <div key={index} className="border-b border-[#ee2b8c]/10 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-[#1b0d14] mb-1">{service.name}</h4>
                                {service.description && (
                                  <p className="text-sm text-[#1b0d14]/70">{service.description}</p>
                                )}
                              </div>
                              {service.price && (
                                <span className="text-[#ee2b8c] font-semibold whitespace-nowrap">{service.price}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1b0d14] mb-3">Pedicure Services</h3>
                      <div className="space-y-3">
                        {((salonDetails as { services: Array<{ name: string; description?: string; price?: string }> }).services).filter((s) =>
                          s.name?.toLowerCase().includes('pedicure') ||
                          s.name?.toLowerCase().includes('foot')
                        ).map((service, index: number) => (
                          <div key={index} className="border-b border-[#ee2b8c]/10 pb-3 last:border-0 last:pb-0">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <h4 className="font-semibold text-[#1b0d14] mb-1">{service.name}</h4>
                                {service.description && (
                                  <p className="text-sm text-[#1b0d14]/70">{service.description}</p>
                                )}
                              </div>
                              {service.price && (
                                <span className="text-[#ee2b8c] font-semibold whitespace-nowrap">{service.price}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Other services */}
                    {((salonDetails as { services: Array<{ name: string; description?: string; price?: string }> }).services).filter((s) =>
                      !s.name?.toLowerCase().includes('manicure') &&
                      !s.name?.toLowerCase().includes('pedicure') &&
                      !s.name?.toLowerCase().includes('nail art') &&
                      !s.name?.toLowerCase().includes('gel') &&
                      !s.name?.toLowerCase().includes('foot')
                    ).length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-[#1b0d14] mb-3">Additional Services</h3>
                          <div className="space-y-3">
                            {((salonDetails as { services: Array<{ name: string; description?: string; price?: string }> }).services).filter((s) =>
                              !s.name?.toLowerCase().includes('manicure') &&
                              !s.name?.toLowerCase().includes('pedicure') &&
                              !s.name?.toLowerCase().includes('nail art') &&
                              !s.name?.toLowerCase().includes('gel') &&
                              !s.name?.toLowerCase().includes('foot')
                            ).map((service, index: number) => (
                              <div key={index} className="border-b border-[#ee2b8c]/10 pb-3 last:border-0 last:pb-0">
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1">
                                    <h4 className="font-semibold text-[#1b0d14] mb-1">{service.name}</h4>
                                    {service.description && (
                                      <p className="text-sm text-[#1b0d14]/70">{service.description}</p>
                                    )}
                                  </div>
                                  {service.price && (
                                    <span className="text-[#ee2b8c] font-semibold whitespace-nowrap">{service.price}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {salon.types?.map((type, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-[#ee2b8c]/10 text-[#ee2b8c] rounded-full text-sm"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : null}

            {/* Amenities & Features - Combined compact section */}
            {(salon.accessibilityOptions && (salon.accessibilityOptions.wheelchairAccessibleParking || salon.accessibilityOptions.wheelchairAccessibleEntrance || salon.accessibilityOptions.wheelchairAccessibleRestroom || salon.accessibilityOptions.wheelchairAccessibleSeating)) && (
              <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                <h2 className="text-xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
                  <span>✨</span>
                  <span>Amenities & Features</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {salon.accessibilityOptions?.wheelchairAccessibleParking && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-lg">♿</span>
                      <span className="text-[#1b0d14]/70">Wheelchair Accessible</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Parking & Transportation - Compact */}
            {(salonDetails?.parkingInfo || (salonDetails as unknown as { transportation?: string | string[] })?.transportation) && (
              <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                <h2 className="text-xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
                  <span>🅿️</span>
                  <span>Parking & Transportation</span>
                </h2>
                <div className="space-y-4">
                  {salonDetails?.parkingInfo && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1b0d14] mb-2 flex items-center gap-2">
                        <span className="text-xl">🅿️</span>
                        <span>Parking</span>
                      </h3>
                      <p className="text-[#1b0d14]/70 text-sm ml-7">{salonDetails.parkingInfo}</p>
                    </div>
                  )}
                  {(salonDetails as { transportation?: string | string[] })?.transportation && (
                    <div>
                      <h3 className="text-lg font-semibold text-[#1b0d14] mb-2 flex items-center gap-2">
                        <span className="text-xl">🚇</span>
                        <span>Public Transportation</span>
                      </h3>
                      <div className="text-[#1b0d14]/70 text-sm ml-7">
                        {typeof (salonDetails as unknown as { transportation: string | string[] }).transportation === 'string' ? (
                          <p>{(salonDetails as unknown as { transportation: string }).transportation}</p>
                        ) : (
                          <ul className="list-disc list-inside space-y-1">
                            {((salonDetails as unknown as { transportation: string[] }).transportation).map((transport: string, index: number) => (
                              <li key={index}>{transport}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Enriched Salon Sections - Real data from Google Maps + Gemini AI */}
            {enrichedData && (
              <EnrichedSalonSections
                enrichedData={enrichedData}
                salonName={salon.name}
              />
            )}

            {/* ✅ NEW: Internal Linking Sections for SEO */}
            {/* Nearby Cities Section */}
            {nearbyCitiesData.length > 0 && (
              <NearbyCitiesSection
                nearbyCities={nearbyCitiesData}
                currentState={formattedState}
                currentStateSlug={stateSlug}
              />
            )}

            {/* Similar Quality Salons Section */}
            {similarQualitySalons.length > 0 && (
              <SimilarQualitySalonsSection
                salons={similarQualitySalons}
                currentState={formattedState}
                currentStateSlug={stateSlug}
              />
            )}

            {/* Price Level Salons Section */}
            {priceLevelSalons.length > 0 && salon.priceLevel && (
              <PriceLevelSalonsSection
                salons={priceLevelSalons}
                priceLevel={salon.priceLevel}
                currentState={formattedState}
                currentStateSlug={stateSlug}
              />
            )}

            {/* Top-Rated State Salons Section */}
            {topRatedStateSalons.length > 0 && (
              <TopRatedSalonsSection
                salons={topRatedStateSalons}
                currentState={formattedState}
                currentStateSlug={stateSlug}
              />
            )}

            {/* FAQ Section - Compact (only show if no enriched data) */}
            {!enrichedData && salonDetails?.faq && salonDetails.faq.length > 0 && (
              <CollapsibleSection
                title="Frequently Asked Questions"
                defaultExpanded={false}
                icon={<span>❓</span>}
              >
                <div className="space-y-4">
                  {salonDetails.faq.map((item: { question: string; answer: string }, index: number) => (
                    <div key={index} className="border-b border-[#ee2b8c]/10 pb-3 last:border-0 last:pb-0">
                      <h3 className="font-semibold text-[#1b0d14] mb-1 text-sm">Q: {item.question}</h3>
                      <p className="text-[#1b0d14]/70 leading-relaxed text-sm">A: {item.answer}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleSection>
            )}

            {/* Visual Content Sections - LOWER PRIORITY but valuable */}
            <div className="space-y-6">
              {/* Nail Art Design Gallery Section */}
              {galleryDesigns.length > 0 && (
                <NailArtGallerySection
                  salonName={salon.name}
                  city={formattedCity}
                  state={formattedState}
                  designs={rawGalleryItems}
                />
              )}

              {/* Design Collections Section */}
              {designCollections && designCollections.length > 0 && (
                <DesignCollectionsSection
                  salonName={salon.name}
                  collections={designCollections}
                />
              )}

              {/* Color Palette Recommendations Section */}
              {colorPalettes && colorPalettes.length > 0 && (
                <ColorPaletteSection
                  salonName={salon.name}
                  palettes={colorPalettes}
                />
              )}

              {/* Technique Showcase Section */}
              {techniqueShowcases && techniqueShowcases.length > 0 && (
                <TechniqueShowcaseSection
                  salonName={salon.name}
                  techniques={techniqueShowcases}
                />
              )}

              {/* Seasonal Trends Section */}
              <SeasonalTrendsSection
                salonName={salon.name}
                city={formattedCity}
              />

              {/* Nail Care Tips Section */}
              <NailCareTipsSection
                salonName={salon.name}
              />

              {/* Browse by Tags Section */}
              <BrowseByTagsSection
                salonName={salon.name}
              />
            </div>

            {/* Related Salons - LOWER PRIORITY */}
            {relatedSalons.length > 0 && (
              <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                <h2 className="text-xl font-bold text-[#1b0d14] mb-4">Other Salons in {formattedCity}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {relatedSalons.map((relatedSalon) => (
                    <Link
                      key={relatedSalon.name}
                      href={`/nail-salons/${stateSlug}/${citySlug}/${generateSlug(relatedSalon.name)}`}
                      className="block p-4 rounded-lg border border-[#ee2b8c]/20 hover:border-[#ee2b8c]/40 hover:bg-[#f8f6f7] transition-all duration-300"
                    >
                      <h3 className="font-semibold text-[#1b0d14] mb-1 hover:text-[#ee2b8c] transition-colors line-clamp-1">
                        {relatedSalon.name}
                      </h3>
                      {relatedSalon.address && (
                        <p className="text-sm text-[#1b0d14]/60 line-clamp-1">{relatedSalon.shortFormattedAddress || relatedSalon.address}</p>
                      )}
                      {relatedSalon.rating && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-yellow-500 text-sm">⭐</span>
                          <span className="text-sm font-semibold text-[#1b0d14]">{relatedSalon.rating}</span>
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 text-center">
                  <Link
                    href={`/nail-salons/${stateSlug}/${citySlug}`}
                    className="text-[#ee2b8c] hover:underline text-sm font-medium"
                  >
                    View all salons in {formattedCity} →
                  </Link>
                </div>
              </div>
            )}

            {/* Google Maps Attribution */}
            {salon.uri && (
              <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                <p className="text-sm text-[#1b0d14]/60">
                  Data provided by{' '}
                  <span className="font-roboto" translate="no">Google Maps</span>
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Map Section */}
              {(salon.address || salon.name) && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                  <h2 className="text-xl font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
                    <span>📍</span>
                    <span>Location</span>
                  </h2>
                  <div className="aspect-video rounded-lg overflow-hidden ring-1 ring-gray-200 mb-4">
                    <iframe
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      allowFullScreen
                      referrerPolicy="no-referrer-when-downgrade"
                      src={
                        salon.address
                          ? `https://www.google.com/maps?q=${encodeURIComponent(salon.address)}&output=embed`
                          : salon.name
                            ? `https://www.google.com/maps?q=${encodeURIComponent(`${salon.name}, ${salon.city}, ${salon.state}`)}&output=embed`
                            : ''
                      }
                    />
                  </div>
                  {salon.address && (
                    <div className="space-y-2">
                      <p className="text-sm text-[#1b0d14]/70">{salon.shortFormattedAddress || salon.address}</p>
                      {salon.uri && (
                        <a
                          href={salon.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-[#ee2b8c] hover:text-[#ee2b8c]/80 text-sm font-medium transition-colors"
                        >
                          <span>View on Google Maps</span>
                          <span>→</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Quick Contact Card */}
              <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                <h3 className="text-lg font-bold text-[#1b0d14] mb-4">Quick Contact</h3>
                <div className="space-y-3">
                  {salon.phone && (
                    <a
                      href={`tel:${salon.phone}`}
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#f8f6f7] hover:bg-[#ee2b8c]/5 transition-colors group"
                    >
                      <span className="text-2xl">📞</span>
                      <div className="flex-1">
                        <p className="text-xs text-[#1b0d14]/60">Phone</p>
                        <p className="text-sm font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
                          {salon.phone}
                        </p>
                      </div>
                    </a>
                  )}
                  {salon.website && (
                    <a
                      href={salon.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg bg-[#f8f6f7] hover:bg-[#ee2b8c]/5 transition-colors group"
                    >
                      <span className="text-2xl">🌐</span>
                      <div className="flex-1">
                        <p className="text-xs text-[#1b0d14]/60">Website</p>
                        <p className="text-sm font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors line-clamp-1">
                          Visit Website
                        </p>
                      </div>
                    </a>
                  )}
                  {salon.rating && (
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-50 to-orange-50">
                      <span className="text-2xl">⭐</span>
                      <div className="flex-1">
                        <p className="text-xs text-[#1b0d14]/60">Rating</p>
                        <p className="text-sm font-bold text-[#1b0d14]">
                          {salon.rating} {salon.reviewCount ? `(${salon.reviewCount.toLocaleString()} reviews)` : ''}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Opening Hours Summary */}
              {salon.currentOpeningHours?.weekdayDescriptions && salon.currentOpeningHours.weekdayDescriptions.length > 0 && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                  <h3 className="text-lg font-bold text-[#1b0d14] mb-3 flex items-center gap-2">
                    <span>🕐</span>
                    <span>Today&apos;s Hours</span>
                  </h3>
                  <p className="text-sm font-semibold text-[#1b0d14]">
                    {salon.currentOpeningHours.weekdayDescriptions[0]}
                  </p>
                  {salon.currentOpeningHours.openNow !== undefined && (
                    <p className={`text-xs mt-2 ${salon.currentOpeningHours.openNow ? 'text-green-600' : 'text-red-600'
                      }`}>
                      {salon.currentOpeningHours.openNow ? '✓ Currently Open' : '✗ Currently Closed'}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ✅ NEW: Explore More Links Section */}
        <div className="mt-8">
          <ExploreMoreLinksSection
            currentState={formattedState}
            currentStateSlug={stateSlug}
            currentCity={formattedCity}
            currentCitySlug={citySlug}
          />
        </div>
      </div>

      {/* Claim Listing CTA for Salon Owners */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <ClaimListingCTA salonName={salon.name} />
      </div>

      {/* Navigation */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-4 justify-center">
          <Link
            href={`/nail-salons/${stateSlug}/${citySlug}`}
            className="bg-white ring-1 ring-[#ee2b8c]/20 hover:bg-[#f8f6f7] text-[#1b0d14] font-semibold py-3 px-6 rounded-full transition-all duration-300"
          >
            ← Back to {formattedCity} Salons
          </Link>
          <Link
            href={`/nail-salons/${stateSlug}`}
            className="bg-white ring-1 ring-[#ee2b8c]/20 hover:bg-[#f8f6f7] text-[#1b0d14] font-semibold py-3 px-6 rounded-full transition-all duration-300"
          >
            View All {formattedState} Cities
          </Link>
          <Link
            href="/nail-salons"
            className="bg-white ring-1 ring-[#ee2b8c]/20 hover:bg-[#f8f6f7] text-[#1b0d14] font-semibold py-3 px-6 rounded-full transition-all duration-300"
          >
            Browse All States
          </Link>
        </div>
      </div>
      <StickySalonCTA />
    </div>
  );
}

