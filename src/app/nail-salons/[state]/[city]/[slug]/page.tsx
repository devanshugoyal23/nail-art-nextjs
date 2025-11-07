import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getSalonAdditionalData, generateSlug, NailSalon } from '@/lib/nailSalonService';
import { getSalonsForCity } from '@/lib/salonDataService';
import OptimizedImage from '@/components/OptimizedImage';
import NailArtGallerySection from '@/components/NailArtGallerySection';
import SeasonalTrendsSection from '@/components/SeasonalTrendsSection';
import NailCareTipsSection from '@/components/NailCareTipsSection';
import BrowseByTagsSection from '@/components/BrowseByTagsSection';
import DesignCollectionsSection from '@/components/DesignCollectionsSection';
import ColorPaletteSection from '@/components/ColorPaletteSection';
import TechniqueShowcaseSection from '@/components/TechniqueShowcaseSection';
import CollapsibleSection from '@/components/CollapsibleSection';
import { SalonStructuredData } from '@/components/SalonStructuredData';
import { absoluteUrl } from '@/lib/absoluteUrl';
import { getGalleryItems, getGalleryItemsByOccasion, getGalleryItemsByColor, getGalleryItemsByTechnique } from '@/lib/galleryService';
import { GalleryItem } from '@/lib/supabase';

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

  // Fetch salon data for metadata from R2
  let salon: NailSalon | null = null;
  try {
    const { getSalonFromR2 } = await import('@/lib/salonDataService');
    salon = await getSalonFromR2(formattedState, formattedCity, resolvedParams.slug);
  } catch (error) {
    console.error('Error fetching salon for metadata:', error);
  }

  const salonName = salon?.name || 'Nail Salon';
  
  // Enhanced description with rating, services, and CTA (no dependency on salonDetails)
  const enhancedDescription = salon?.address 
    ? `${salonName} in ${formattedCity}, ${formattedState}. ${salon?.rating ? `Rated ${salon.rating}/5 stars` : ''}${salon?.reviewCount ? ` with ${salon.reviewCount} reviews.` : '.'} ${salon.address}. Professional nail services including manicures, pedicures, and nail art. Book your appointment today!`
    : `Find ${salonName} in ${formattedCity}, ${formattedState}. ${salon?.rating ? `Rated ${salon.rating}/5 stars` : ''}${salon?.reviewCount ? ` with ${salon.reviewCount} reviews.` : ''} Get contact information, ratings, and reviews for this nail salon.`;

  // Optimized title (55-60 chars)
  const optimizedTitle = `${salonName} | ${formattedCity}, ${formattedState} Nail Salon`;
  
  // Get image URL (use Google Maps API image) - only if URL is valid
  const validPhotos = salon?.photos?.filter(photo => photo.url && photo.url.trim() !== '') || [];
  const imageUrl = validPhotos.length > 0 ? validPhotos[0].url : undefined;
  
  // Build canonical URL (absolute)
  const canonicalUrl = absoluteUrl(`/nail-salons/${resolvedParams.state}/${resolvedParams.city}/${resolvedParams.slug}`);

  return {
    title: optimizedTitle,
    description: enhancedDescription.substring(0, 160),
    keywords: [
      salonName,
      `nail salon ${formattedCity}`,
      `nail salon ${formattedState}`,
      `best nail salon ${formattedCity}`,
      'manicure',
      'pedicure',
      'nail art',
      'nail spa',
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
  let salonDetails: { description?: string; faq?: Array<{ question: string; answer: string }>; parkingInfo?: string; paymentOptions?: string[]; services?: Array<{ name: string; description?: string; price?: string }> } | null = null;
  let relatedSalons: NailSalon[] = [];
  let galleryDesigns: Array<{ id: string; imageUrl: string; title?: string; description?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }> = [];
  let rawGalleryItems: GalleryItem[] = [];
  let designCollections: Array<{ title: string; description: string; icon: string; designs: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>; href: string }> = [];
  let colorPalettes: Array<{ color: string; designs: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>; emoji: string }> = [];
  let techniqueShowcases: Array<{ name: string; designs: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>; description: string; icon: string; difficulty: string }> = [];
  
  try {
    // ✅ Fetch from R2 only (no API dependency)
    const { getSalonFromR2 } = await import('@/lib/salonDataService');
    salon = await getSalonFromR2(formattedState, formattedCity, resolvedParams.slug);
    
    if (!salon) {
      // No R2 data available - show 404 instead of falling back to API
      console.log(`⚠️ Salon not found in R2 for ${resolvedParams.slug}`);
      notFound();
    } else {
      console.log(`✅ Using R2 data for salon ${resolvedParams.slug}`);
    }
    if (salon) {
      // ✅ OPTIMIZATION: Fetch related salons from R2 and gallery designs
      // Note: Removed getPlaceDetails() call to reduce Google Maps API dependency
      // Photos should already be available from R2 data
      const [additionalData, citySalons, galleryData, bridalDesigns, weddingDesigns, holidayDesigns, redDesigns, goldDesigns, pinkDesigns, frenchDesigns1, frenchDesigns2, frenchDesigns3, ombreDesigns1, ombreDesigns2, glitterDesigns1, glitterDesigns2, chromeDesigns1, chromeDesigns2, marbleDesigns1, marbleDesigns2, geometricDesigns1, geometricDesigns2, watercolorDesigns1, watercolorDesigns2, stampingDesigns1, stampingDesigns2] = await Promise.all([
        getSalonAdditionalData(salon, undefined).catch(() => ({})),
        getSalonsForCity(formattedState, formattedCity).catch(() => []),
        // Fetch 20 designs and shuffle for variety (for variety on each page load)
        getGalleryItems({ page: 1, limit: 20, sortBy: 'newest' }).catch(() => ({ items: [], total: 0 })),
        // Design Collections
        getGalleryItemsByOccasion('Bridal', 4).catch(() => []),
        getGalleryItemsByOccasion('Wedding', 4).catch(() => []),
        getGalleryItemsByOccasion('Holiday', 4).catch(() => []),
        // Color Palettes
        getGalleryItemsByColor('Red', 4).catch(() => []),
        getGalleryItemsByColor('Gold', 4).catch(() => []),
        getGalleryItemsByColor('Pink', 4).catch(() => []),
        // Techniques - try multiple variations to ensure we get matches
        getGalleryItemsByTechnique('French', 4).catch(() => []),
        getGalleryItemsByTechnique('French Manicure', 4).catch(() => []),
        getGalleryItemsByTechnique('french-manicure', 4).catch(() => []),
        getGalleryItemsByTechnique('Ombre', 4).catch(() => []),
        getGalleryItemsByTechnique('ombre', 4).catch(() => []),
        getGalleryItemsByTechnique('Glitter', 4).catch(() => []),
        getGalleryItemsByTechnique('glitter', 4).catch(() => []),
        getGalleryItemsByTechnique('Chrome', 4).catch(() => []),
        getGalleryItemsByTechnique('chrome', 4).catch(() => []),
        getGalleryItemsByTechnique('Marble', 4).catch(() => []),
        getGalleryItemsByTechnique('marble', 4).catch(() => []),
        getGalleryItemsByTechnique('Geometric', 4).catch(() => []),
        getGalleryItemsByTechnique('geometric', 4).catch(() => []),
        getGalleryItemsByTechnique('Watercolor', 4).catch(() => []),
        getGalleryItemsByTechnique('watercolor', 4).catch(() => []),
        getGalleryItemsByTechnique('Stamping', 4).catch(() => []),
        getGalleryItemsByTechnique('stamping', 4).catch(() => [])
      ]);
      
      // Transform GalleryItems to expected format
      const transformGalleryItems = (items: Array<{ id: string; image_url: string; design_name?: string; prompt: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>) => items.map(item => ({
        id: item.id,
        imageUrl: item.image_url,
        title: item.design_name || item.prompt,
        description: item.prompt,
        colors: item.colors,
        techniques: item.techniques,
        occasions: item.occasions
      }));
      
      // ✅ Create salon details with fallback data (no Google Places API dependency)
      salonDetails = {
        // Simple fallback description
        description: `${salon.name} is a professional nail salon located in ${salon.city}, ${salon.state}.`,
        
        // Default parking info
        parkingInfo: 'Street parking and nearby parking lots are typically available.',
        
        // Default payment options
        paymentOptions: ['Cash', 'Credit Cards', 'Debit Cards'],
        
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
      
      // Merge additional data (photos, etc.) into salon
      if (additionalData) {
        salon = { ...salon, ...additionalData };
      }
      
      // Filter out current salon and limit to 5 (get related salons from R2 city data)
      relatedSalons = citySalons.filter(s => generateSlug(s.name) !== resolvedParams.slug).slice(0, 5);
      
      // Get 8 random designs from the fetched 20 (shuffle for variety)
      if (galleryData && galleryData.items && galleryData.items.length > 0) {
        const shuffled = [...galleryData.items].sort(() => Math.random() - 0.5);
        rawGalleryItems = shuffled.slice(0, 8);
        galleryDesigns = rawGalleryItems.map(item => ({
          id: item.id,
          imageUrl: item.image_url,
          title: item.design_name || item.prompt,
          description: item.prompt,
          colors: item.colors,
          techniques: item.techniques,
          occasions: item.occasions
        }));
      }

      // Prepare Design Collections
      // Use gallery items as fallback if specific occasion searches return empty
      const allGalleryItems = (galleryData?.items || []).map(item => ({
        id: item.id,
        imageUrl: item.image_url,
        title: item.design_name || item.prompt,
        description: item.prompt,
        colors: item.colors,
        techniques: item.techniques,
        occasions: item.occasions
      }));
      
      // Helper to get designs by searching in all items
      const getDesignsByOccasion = (occasion: string, fallbackItems: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>) => {
        if (fallbackItems.length === 0) return [];
        return fallbackItems.filter(item => 
          item.occasions?.some((occ: string) => 
            occ.toLowerCase().includes(occasion.toLowerCase())
          )
        ).slice(0, 4);
      };

      const bridalItems = bridalDesigns.length > 0 ? transformGalleryItems(bridalDesigns) : 
                         weddingDesigns.length > 0 ? transformGalleryItems(weddingDesigns) :
                         getDesignsByOccasion('bridal', allGalleryItems);
      
      const holidayItems = holidayDesigns.length > 0 ? transformGalleryItems(holidayDesigns) :
                          getDesignsByOccasion('holiday', allGalleryItems);

      designCollections = [
        ...(bridalItems.length > 0 ? [{
          title: 'Bridal Collection',
          description: 'Elegant designs perfect for your special day',
          icon: '👰',
          designs: bridalItems,
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

      // Prepare Color Palettes
      const colorEmojis: { [key: string]: string } = {
        'Red': '❤️',
        'Gold': '✨',
        'Pink': '💗',
        'Blue': '💙',
        'Purple': '💜',
        'Black': '🖤',
        'White': '🤍',
        'Green': '💚'
      };

      // Prepare Color Palettes with fallback - Ensure exactly 3 colors
      const getDesignsByColor = (color: string, fallbackItems: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>) => {
        if (fallbackItems.length === 0) return [];
        return fallbackItems.filter(item => 
          item.colors?.some((c: string) => 
            c.toLowerCase().includes(color.toLowerCase())
          )
        ).slice(0, 4);
      };

      // Try multiple colors to ensure we get 3
      const colorOptions = [
        { name: 'Red', designs: redDesigns },
        { name: 'Gold', designs: goldDesigns },
        { name: 'Pink', designs: pinkDesigns },
        { name: 'Blue', designs: getDesignsByColor('blue', allGalleryItems) },
        { name: 'Purple', designs: getDesignsByColor('purple', allGalleryItems) },
        { name: 'Black', designs: getDesignsByColor('black', allGalleryItems) }
      ];

      // Get first 3 colors that have designs
      colorPalettes = colorOptions
        .map(option => ({
          color: option.name,
          designs: option.designs.length > 0 ? 
            ('image_url' in option.designs[0] ? transformGalleryItems(option.designs as GalleryItem[]) : option.designs as { id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[]; }[]) : 
            getDesignsByColor(option.name.toLowerCase(), allGalleryItems)
        }))
        .filter(palette => palette.designs && palette.designs.length > 0)
        .slice(0, 3) // Ensure exactly 3
        .map(palette => ({
          ...palette,
          emoji: colorEmojis[palette.color] || '🎨'
        }));

      // Prepare Technique Showcases
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
        }
      };

      // Prepare Technique Showcases with fallback - Ensure exactly 3 techniques
      const getDesignsByTechnique = (technique: string, fallbackItems: Array<{ id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[] }>) => {
        if (fallbackItems.length === 0) return [];
        // More flexible matching - check if technique name appears anywhere in the techniques array
        return fallbackItems.filter(item => {
          if (!item.techniques || !Array.isArray(item.techniques)) return false;
          return item.techniques.some((t: string) => {
            const techLower = t.toLowerCase();
            const searchLower = technique.toLowerCase();
            return techLower.includes(searchLower) || searchLower.includes(techLower);
          });
        }).slice(0, 4);
      };

      // Combine all technique variations and deduplicate
      const frenchAll = [...frenchDesigns1, ...frenchDesigns2, ...frenchDesigns3].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      const ombreAll = [...ombreDesigns1, ...ombreDesigns2].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      const glitterAll = [...glitterDesigns1, ...glitterDesigns2].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      const chromeAll = [...chromeDesigns1, ...chromeDesigns2].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      const marbleAll = [...marbleDesigns1, ...marbleDesigns2].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      const geometricAll = [...geometricDesigns1, ...geometricDesigns2].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      const watercolorAll = [...watercolorDesigns1, ...watercolorDesigns2].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );
      const stampingAll = [...stampingDesigns1, ...stampingDesigns2].filter((item, index, self) => 
        index === self.findIndex(t => t.id === item.id)
      );

      // Try multiple techniques to ensure we get 3 - check all gallery items for each
      const allTechniques = [
        { name: 'French', designs: frenchAll.length > 0 ? frenchAll : getDesignsByTechnique('french', allGalleryItems) },
        { name: 'Ombre', designs: ombreAll.length > 0 ? ombreAll : getDesignsByTechnique('ombre', allGalleryItems) },
        { name: 'Glitter', designs: glitterAll.length > 0 ? glitterAll : getDesignsByTechnique('glitter', allGalleryItems) },
        { name: 'Chrome', designs: chromeAll.length > 0 ? chromeAll : getDesignsByTechnique('chrome', allGalleryItems) },
        { name: 'Marble', designs: marbleAll.length > 0 ? marbleAll : getDesignsByTechnique('marble', allGalleryItems) },
        { name: 'Geometric', designs: geometricAll.length > 0 ? geometricAll : getDesignsByTechnique('geometric', allGalleryItems) },
        { name: 'Watercolor', designs: watercolorAll.length > 0 ? watercolorAll : getDesignsByTechnique('watercolor', allGalleryItems) },
        { name: 'Stamping', designs: stampingAll.length > 0 ? stampingAll : getDesignsByTechnique('stamping', allGalleryItems) }
      ];

      // Get first 3 techniques that have designs, prioritizing API results
      const techniquesWithDesigns = allTechniques.filter(tech => tech.designs && tech.designs.length > 0);
      
      // If we have less than 3, try to get more from general gallery
      if (techniquesWithDesigns.length < 3 && allGalleryItems.length > 0) {
        // Get all unique techniques from gallery items
        const allAvailableTechniques = new Set<string>();
        allGalleryItems.forEach(item => {
          if (item.techniques && Array.isArray(item.techniques)) {
            item.techniques.forEach((t: string) => allAvailableTechniques.add(t));
          }
        });

        // Try to find techniques we haven't tried yet
        const triedNames = new Set(techniquesWithDesigns.map(t => t.name.toLowerCase()));
        for (const tech of Array.from(allAvailableTechniques)) {
          if (techniquesWithDesigns.length >= 3) break;
          const techLower = tech.toLowerCase();
          if (!triedNames.has(techLower)) {
            const designs = getDesignsByTechnique(tech, allGalleryItems);
            if (designs.length > 0) {
              techniquesWithDesigns.push({
                name: tech.charAt(0).toUpperCase() + tech.slice(1).toLowerCase(),
                designs
              });
              triedNames.add(techLower);
            }
          }
        }
      }

      // Take exactly 3
      techniqueShowcases = techniquesWithDesigns
        .slice(0, 3)
        .map(technique => ({
          name: technique.name,
          designs: 'image_url' in technique.designs[0] ? transformGalleryItems(technique.designs as GalleryItem[]) : technique.designs as { id: string; imageUrl: string; title?: string; colors?: string[]; techniques?: string[]; occasions?: string[]; }[],
          ...(techniqueInfo[technique.name] || {
            description: `Professional ${technique.name.toLowerCase()} nail art technique`,
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

  // Get hero image (use first salon photo or fallback) - only if URL is valid
  const validPhotosForHero = salon.photos?.filter(photo => photo.url && photo.url.trim() !== '') || [];
  const heroImage = validPhotosForHero.length > 0 
    ? validPhotosForHero[0].url 
    : `https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=500&fit=crop&q=80`;

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
        {/* Structured Data for SEO */}
        {salon && salonDetails && (
          <SalonStructuredData
            salon={salon}
            salonDetails={salonDetails}
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
              alt={salon.name}
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
                  <div className={`px-4 py-2 rounded-full text-sm font-semibold backdrop-blur-sm ${
                    salon.currentOpeningHours.openNow 
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
              <p className="text-xl text-white/90 drop-shadow-md">
                {formattedCity}, {formattedState}
              </p>
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
              {/* Photo Gallery - HIGH PRIORITY: Visual content */}
              {(() => {
                // Filter out photos with empty or invalid URLs
                const validPhotos = salon.photos?.filter(photo => photo.url && photo.url.trim() !== '') || [];
                
                // Only show photo gallery if there are valid photos with URLs
                if (validPhotos.length === 0) {
                  return null;
                }
                
                return (
                  <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                    <h2 className="text-2xl font-bold text-[#1b0d14] mb-6 flex items-center gap-2">
                      <span>📸</span>
                      <span>Photo Gallery</span>
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {validPhotos.slice(0, 6).map((photo, index) => {
                        // Enhanced alt text based on photo position
                        const photoTypes = ['exterior', 'interior', 'service area', 'nail art station', 'waiting area', 'treatment room'];
                        const photoType = photoTypes[index] || 'interior';
                        const enhancedAlt = `${salon.name} nail salon ${photoType} in ${formattedCity}, ${formattedState}`;
                        
                        return (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer ring-1 ring-gray-200 hover:ring-[#ee2b8c]/50 transition-all">
                            <OptimizedImage
                              src={photo.url}
                              alt={enhancedAlt}
                              width={400}
                              height={400}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                            />
                          {photo.authorAttributions && photo.authorAttributions[0] && (
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              {photo.authorAttributions[0].displayName && (
                                <p>Photo by {photo.authorAttributions[0].displayName}</p>
                              )}
                            </div>
                          )}
                          </div>
                        );
                      })}
                    </div>
                    {salon.photos && salon.photos.length > 6 && (
                      <p className="text-sm text-[#1b0d14]/60 mt-4 text-center">
                        +{salon.photos!.length - 6} more photos available on Google Maps
                      </p>
                    )}
                  </div>
                );
              })()}

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
                        <span className={`px-3 py-1.5 rounded-md text-sm font-semibold ${
                          salon.currentOpeningHours.openNow 
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
                              className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                                isToday 
                                  ? 'bg-[#ee2b8c]/5 ring-1 ring-[#ee2b8c]/20' 
                                  : 'hover:bg-[#f8f6f7]'
                              }`}
                            >
                              <span className={`text-sm font-medium ${
                                isToday 
                                  ? 'text-[#ee2b8c] font-semibold' 
                                  : 'text-[#1b0d14]/70'
                              }`}>
                                {item.day || `Day ${index + 1}`}
                              </span>
                              <span className={`text-sm ${
                                isClosed 
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
              {((salon.accessibilityOptions && (salon.accessibilityOptions.wheelchairAccessibleParking || salon.accessibilityOptions.wheelchairAccessibleEntrance || salon.accessibilityOptions.wheelchairAccessibleRestroom || salon.accessibilityOptions.wheelchairAccessibleSeating)) ||
                (salonDetails?.paymentOptions && salonDetails.paymentOptions.length > 0)) && (
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
                    {salonDetails?.paymentOptions && salonDetails.paymentOptions.length > 0 && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-lg">💳</span>
                        <span className="text-[#1b0d14]/70">
                          {salonDetails.paymentOptions.slice(0, 2).join(', ')}
                          {salonDetails.paymentOptions.length > 2 && ` +${salonDetails.paymentOptions.length - 2} more`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Parking & Transportation - Compact */}
              {(salonDetails?.parkingInfo || (salonDetails as { transportation?: string | string[] })?.transportation) && (
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
                          {typeof (salonDetails as { transportation: string | string[] }).transportation === 'string' ? (
                            <p>{(salonDetails as { transportation: string }).transportation}</p>
                          ) : (
                            <ul className="list-disc list-inside space-y-1">
                              {((salonDetails as { transportation: string[] }).transportation).map((transport: string, index: number) => (
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

              {/* FAQ Section - Compact */}
              {salonDetails?.faq && salonDetails.faq.length > 0 && (
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
                      <p className={`text-xs mt-2 ${
                        salon.currentOpeningHours.openNow ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {salon.currentOpeningHours.openNow ? '✓ Currently Open' : '✗ Currently Closed'}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
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
      </div>
  );
}

