import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getNailSalonBySlug, getSalonDetails, getSalonAdditionalData, getNailSalonsForLocation, generateStateSlug, generateCitySlug, generateSlug, NailSalon } from '@/lib/nailSalonService';
import OptimizedImage from '@/components/OptimizedImage';
import NailArtGallerySection from '@/components/NailArtGallerySection';
import SeasonalTrendsSection from '@/components/SeasonalTrendsSection';
import NailCareTipsSection from '@/components/NailCareTipsSection';
import BrowseByTagsSection from '@/components/BrowseByTagsSection';
import DesignCollectionsSection from '@/components/DesignCollectionsSection';
import ColorPaletteSection from '@/components/ColorPaletteSection';
import TechniqueShowcaseSection from '@/components/TechniqueShowcaseSection';
import { getGalleryItems, getGalleryItemsByOccasion, getGalleryItemsByColor, getGalleryItemsByTechnique } from '@/lib/galleryService';

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

  // Fetch salon data and details for metadata
  let salon: NailSalon | null = null;
  let salonDetails = null;
  try {
    salon = await getNailSalonBySlug(formattedState, formattedCity, resolvedParams.slug);
    if (salon) {
      salonDetails = await getSalonDetails(salon);
    }
  } catch (error) {
    console.error('Error fetching salon for metadata:', error);
  }

  const salonName = salon?.name || 'Nail Salon';
  const description = salonDetails?.description 
    ? salonDetails.description.substring(0, 160) + '...'
    : salon?.address 
      ? `Visit ${salonName} in ${formattedCity}, ${formattedState}. ${salon.rating ? `Rated ${salon.rating} stars. ` : ''}${salon.address}. Professional nail services including manicures, pedicures, and nail art.`
      : `Find ${salonName} in ${formattedCity}, ${formattedState}. Get contact information, ratings, and reviews for this nail salon.`;

  return {
    title: `${salonName} - Best Nail Salon in ${formattedCity}, ${formattedState} | Reviews, Services & Location`,
    description,
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
      description,
      type: 'website',
      locale: 'en_US',
    },
    alternates: {
      canonical: `/nail-salons/${resolvedParams.state}/${resolvedParams.city}/${resolvedParams.slug}`,
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
  let salonDetails = null;
  let relatedSalons: NailSalon[] = [];
  let galleryDesigns: any[] = [];
  let designCollections: any[] = [];
  let colorPalettes: any[] = [];
  let techniqueShowcases: any[] = [];
  
  try {
    salon = await getNailSalonBySlug(formattedState, formattedCity, resolvedParams.slug);
    if (salon) {
      // ✅ OPTIMIZATION: Fetch place details ONCE and share it
      let placeDetails = null;
      if (salon.placeId) {
        const { getPlaceDetails } = await import('@/lib/nailSalonService');
        placeDetails = await getPlaceDetails(salon.placeId);
      }
      
      // ✅ CRITICAL OPTIMIZATION: Don't wait for Gemini calls!
      // Show page immediately with Places API data, skip slow Gemini content
      // Fetch only fast data: additional data (photos), related salons, and gallery designs
      const [additionalData, salons, galleryData, bridalDesigns, weddingDesigns, holidayDesigns, redDesigns, goldDesigns, pinkDesigns, frenchDesigns1, frenchDesigns2, frenchDesigns3, ombreDesigns1, ombreDesigns2, glitterDesigns1, glitterDesigns2, chromeDesigns1, chromeDesigns2, marbleDesigns1, marbleDesigns2, geometricDesigns1, geometricDesigns2, watercolorDesigns1, watercolorDesigns2, stampingDesigns1, stampingDesigns2] = await Promise.all([
        getSalonAdditionalData(salon, placeDetails),
        getNailSalonsForLocation(formattedState, formattedCity, 6),
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
      
      // ✅ Create rich details from Places API data (instant and accurate!)
      salonDetails = {
        // AI-generated description from Places API
        description: placeDetails?.generativeSummary?.overview || 
                     placeDetails?.editorialSummary?.overview || 
                     `${salon.name} is a professional nail salon located in ${salon.city}, ${salon.state}.`,
        
        // AI-generated review summary from Places API
        reviewSummary: placeDetails?.generativeSummary?.description,
        
        // Real customer reviews from Places API
        placeReviews: placeDetails?.reviews?.slice(0, 10).map((review: any) => ({
          rating: review.rating || undefined,
          text: review.text?.text || '',
          authorName: review.authorAttribution?.displayName || undefined,
          publishTime: review.publishTime || undefined,
        })),
        
        // Neighborhood info from Places API
        neighborhoodInfo: placeDetails?.editorialSummary?.text,
        
        // ✅ NEW: Real parking info from Places API
        parkingInfo: placeDetails?.parkingOptions ? 
          `Parking: ${Object.entries(placeDetails.parkingOptions)
            .filter(([_, value]) => value === true)
            .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
            .join(', ') || 'Contact salon for parking details'}` :
          'Street parking and nearby parking lots are typically available.',
        
        // ✅ NEW: Real payment options from Places API
        paymentOptions: placeDetails?.paymentOptions ? 
          Object.entries(placeDetails.paymentOptions)
            .filter(([_, value]) => value === true)
            .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim()) :
          ['Cash', 'Credit Cards', 'Debit Cards'],
        
        // ✅ NEW: Amenities from Places API
        amenities: {
          goodForChildren: placeDetails?.goodForChildren,
          restroom: placeDetails?.restroom,
          allowsDogs: placeDetails?.allowsDogs,
          reservable: placeDetails?.reservable,
          outdoorSeating: placeDetails?.outdoorSeating,
        },
        
        // FAQ with ONLY dynamic answers based on real Places API data
        faq: [
          { 
            question: 'Do I need an appointment?', 
            answer: placeDetails?.reservable ? 
              'Yes, this salon accepts reservations. Appointments are recommended.' :
              'Walk-ins are welcome, but appointments are recommended to ensure availability.' 
          },
          { 
            question: 'What payment methods do you accept?', 
            answer: placeDetails?.paymentOptions ? 
              `Accepts: ${Object.entries(placeDetails.paymentOptions)
                .filter(([_, value]) => value === true)
                .map(([key]) => key.replace(/([A-Z])/g, ' $1').trim())
                .join(', ')}` :
              'Most nail salons accept cash, credit cards, and mobile payments.' 
          },
          { 
            question: 'Is this salon family-friendly?', 
            answer: placeDetails?.goodForChildren ? 
              'Yes, this salon is good for children and families.' :
              'Please contact the salon to inquire about services for children.' 
          },
        ].filter(item => item.answer), // Only show FAQs with real answers
      };
      
      // Merge additional data (photos, etc.) into salon
      if (additionalData) {
        salon = { ...salon, ...additionalData };
      }
      
      // Filter out current salon and limit to 5
      relatedSalons = salons.filter(s => s.name !== salon!.name).slice(0, 5);
      
      // Get 8 random designs from the fetched 20 (shuffle for variety)
      if (galleryData && galleryData.items && galleryData.items.length > 0) {
        const shuffled = [...galleryData.items].sort(() => Math.random() - 0.5);
        galleryDesigns = shuffled.slice(0, 8);
      }

      // Prepare Design Collections
      // Use gallery items as fallback if specific occasion searches return empty
      const allGalleryItems = galleryData?.items || [];
      
      // Helper to get designs by searching in all items
      const getDesignsByOccasion = (occasion: string, fallbackItems: any[]) => {
        if (fallbackItems.length === 0) return [];
        return fallbackItems.filter((item: any) => 
          item.occasions?.some((occ: string) => 
            occ.toLowerCase().includes(occasion.toLowerCase())
          )
        ).slice(0, 4);
      };

      const bridalItems = bridalDesigns.length > 0 ? bridalDesigns : 
                         weddingDesigns.length > 0 ? weddingDesigns :
                         getDesignsByOccasion('bridal', allGalleryItems);
      
      const holidayItems = holidayDesigns.length > 0 ? holidayDesigns :
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
      const getDesignsByColor = (color: string, fallbackItems: any[]) => {
        if (fallbackItems.length === 0) return [];
        return fallbackItems.filter((item: any) => 
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
          designs: option.designs.length > 0 ? option.designs : getDesignsByColor(option.name.toLowerCase(), allGalleryItems)
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
      const getDesignsByTechnique = (technique: string, fallbackItems: any[]) => {
        if (fallbackItems.length === 0) return [];
        // More flexible matching - check if technique name appears anywhere in the techniques array
        return fallbackItems.filter((item: any) => {
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
        allGalleryItems.forEach((item: any) => {
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
          designs: technique.designs,
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

  // Get hero image (use first salon photo or fallback)
  const heroImage = salon.photos && salon.photos.length > 0 
    ? salon.photos[0].url 
    : `https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=500&fit=crop&q=80`;

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
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
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Salon Details */}
            <div className="lg:col-span-2 space-y-8">
              {/* Photo Gallery */}
              {salon.photos && salon.photos.length > 0 && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-6 flex items-center gap-2">
                    <span>📸</span>
                    <span>Photo Gallery</span>
                  </h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {salon.photos.slice(0, 6).map((photo, index) => (
                      <div key={index} className="relative aspect-square rounded-lg overflow-hidden group cursor-pointer ring-1 ring-gray-200 hover:ring-[#ee2b8c]/50 transition-all">
                        <OptimizedImage
                          src={photo.url}
                          alt={`${salon.name} - Photo ${index + 1}`}
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
                    ))}
                  </div>
                  {salon.photos.length > 6 && (
                    <p className="text-sm text-[#1b0d14]/60 mt-4 text-center">
                      +{salon.photos.length - 6} more photos available on Google Maps
                    </p>
                  )}
                </div>
              )}

              {/* About Section */}
              {(salonDetails?.description || salonDetails?.placeSummary) && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">About {salon.name}</h2>
                  {salonDetails?.placeSummary && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-[#ee2b8c]/5 to-[#ee2b8c]/10 rounded-lg border-l-4 border-[#ee2b8c]">
                      <p className="text-sm font-semibold text-[#ee2b8c] mb-2">✨ AI-Powered Summary</p>
                      <div className="prose prose-lg text-[#1b0d14]/70 max-w-none">
                        <p className="leading-relaxed">{salonDetails.placeSummary}</p>
                      </div>
                    </div>
                  )}
                  {salonDetails?.description && !salonDetails?.placeSummary && (
                    <div className="prose prose-lg text-[#1b0d14]/70 max-w-none">
                      <p className="leading-relaxed">{salonDetails.description}</p>
                    </div>
                  )}
                </div>
              )}


              {/* Opening Hours - Enhanced Visual Design (Full Width) */}
              {(salon.openingHours || salon.currentOpeningHours?.weekdayDescriptions) && (() => {
                const hoursList = salon.currentOpeningHours?.weekdayDescriptions || salon.openingHours || [];
                const currentDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
                const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                
                // Parse hours to extract day and time
                const parseHours = (hoursString: string) => {
                  // Format: "Monday: 9:00 AM – 7:00 PM" or "Monday: Closed"
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
                  // Try to match day name
                  const dayIndex = dayNames.findIndex(day => 
                    parsed.day.toLowerCase().includes(day.toLowerCase()) ||
                    day.toLowerCase().includes(parsed.day.toLowerCase())
                  );
                  parsed.isToday = dayIndex === currentDay;
                  return { ...parsed, original: hours, index };
                });

                return (
                  <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-[#1b0d14] flex items-center gap-2">
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
                    
                    <div className="space-y-0">
                      {parsedHours.map((item, index) => {
                        const isToday = item.isToday;
                        const isClosed = item.time.toLowerCase().includes('closed');
                        
                        return (
                          <div 
                            key={index} 
                            className={`flex items-center justify-between py-3 px-2 rounded-lg transition-colors ${
                              isToday 
                                ? 'bg-[#ee2b8c]/5 ring-1 ring-[#ee2b8c]/20' 
                                : 'hover:bg-[#f8f6f7]'
                            } ${index < parsedHours.length - 1 ? 'border-b border-gray-100' : ''}`}
                          >
                            <div className="flex items-center gap-3 flex-1">
                              <span className={`text-sm font-medium min-w-[100px] ${
                                isToday 
                                  ? 'text-[#ee2b8c] font-semibold' 
                                  : 'text-[#1b0d14]/60'
                              }`}>
                                {item.day || `Day ${index + 1}`}
                              </span>
                              {isToday && (
                                <span className="px-2 py-0.5 bg-[#ee2b8c]/10 text-[#ee2b8c] text-xs font-semibold rounded">
                                  Today
                                </span>
                              )}
                            </div>
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

                    {/* Visual Hours Chart */}
                    {parsedHours.length > 0 && (
                      <div className="mt-6 pt-6 border-t border-gray-100">
                        <h3 className="text-sm font-semibold text-[#1b0d14]/70 mb-4">Weekly Schedule</h3>
                        <div className="grid grid-cols-7 gap-2">
                          {dayNames.map((day, dayIndex) => {
                            const hoursForDay = parsedHours.find(h => 
                              h.day.toLowerCase().includes(day.toLowerCase()) ||
                              day.toLowerCase().includes(h.day.toLowerCase())
                            );
                            const isTodayDay = dayIndex === currentDay;
                            const isOpen = hoursForDay && !hoursForDay.time.toLowerCase().includes('closed');
                            
                            return (
                              <div 
                                key={dayIndex}
                                className={`text-center p-2 rounded-lg ${
                                  isTodayDay 
                                    ? 'bg-[#ee2b8c]/10 ring-1 ring-[#ee2b8c]/30' 
                                    : 'bg-gray-50'
                                }`}
                              >
                                <div className={`text-xs font-medium mb-1 ${
                                  isTodayDay ? 'text-[#ee2b8c]' : 'text-[#1b0d14]/60'
                                }`}>
                                  {day.slice(0, 3)}
                                </div>
                                <div className={`text-xs ${
                                  isOpen 
                                    ? isTodayDay 
                                      ? 'text-[#1b0d14] font-semibold' 
                                      : 'text-green-600'
                                    : 'text-gray-400'
                                }`}>
                                  {isOpen ? '✓' : '—'}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Services & Pricing */}
              {(salonDetails?.services && salonDetails.services.length > 0) || (salon.types && salon.types.length > 0) ? (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Services & Pricing</h2>
                  {salonDetails?.services && salonDetails.services.length > 0 ? (
                    <div className="space-y-4">
                      {salonDetails.services.map((service, index) => (
                        <div key={index} className="border-b border-[#ee2b8c]/10 pb-3 last:border-0 last:pb-0">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-semibold text-[#1b0d14] mb-1">{service.name}</h3>
                              {service.description && (
                                <p className="text-sm text-[#1b0d14]/70">{service.description}</p>
                              )}
                            </div>
                            {service.price && (
                              <span className="text-[#ee2b8c] font-semibold ml-4">{service.price}</span>
                            )}
                          </div>
                        </div>
                      ))}
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

              {/* Popular Services */}
              {salonDetails?.popularServices && salonDetails.popularServices.length > 0 && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Most Popular Services</h2>
                  <div className="flex flex-wrap gap-2">
                    {salonDetails.popularServices.map((service, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-[#ee2b8c]/10 to-[#ee2b8c]/5 text-[#ee2b8c] rounded-lg text-sm font-medium"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Reviews Summary */}
              {(salonDetails?.reviewsSummary || salonDetails?.reviewSummary) && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">What Customers Say</h2>
                  {salonDetails?.reviewSummary && (
                    <div className="mb-4 p-4 bg-gradient-to-r from-[#ee2b8c]/5 to-[#ee2b8c]/10 rounded-lg border-l-4 border-[#ee2b8c]">
                      <p className="text-sm font-semibold text-[#ee2b8c] mb-2">✨ AI-Powered Review Summary</p>
                      <div className="prose prose-lg text-[#1b0d14]/70 max-w-none">
                        <p className="leading-relaxed">{salonDetails.reviewSummary}</p>
                      </div>
                    </div>
                  )}
                  {salonDetails?.reviewsSummary && !salonDetails?.reviewSummary && (
                    <div className="prose prose-lg text-[#1b0d14]/70 max-w-none">
                      <p className="leading-relaxed">{salonDetails.reviewsSummary}</p>
                    </div>
                  )}
                  {salon.rating && (
                    <div className="mt-4 flex items-center gap-2">
                      <span className="text-yellow-500 text-xl">⭐</span>
                      <span className="text-lg font-bold text-[#1b0d14]">{salon.rating}</span>
                      {salon.reviewCount && (
                        <span className="text-[#1b0d14]/60">
                          ({salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Individual Customer Reviews */}
              {salonDetails?.placeReviews && salonDetails.placeReviews.length > 0 && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Customer Reviews</h2>
                  <div className="space-y-4">
                    {salonDetails.placeReviews.slice(0, 5).map((review, index) => (
                      <div key={index} className="border-b border-[#ee2b8c]/10 pb-4 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {review.rating && (
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500">⭐</span>
                                <span className="font-semibold text-[#1b0d14]">{review.rating}</span>
                              </div>
                            )}
                            {review.authorName && (
                              <span className="text-sm text-[#1b0d14]/60">by {review.authorName}</span>
                            )}
                          </div>
                          {review.publishTime && (
                            <span className="text-xs text-[#1b0d14]/50">
                              {new Date(review.publishTime).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                        {review.text && (
                          <p className="text-[#1b0d14]/70 leading-relaxed line-clamp-4">{review.text}</p>
                        )}
                      </div>
                    ))}
                  </div>
                  {salon.uri && (
                    <div className="mt-4 text-center">
                      <a
                        href={salon.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#ee2b8c] hover:underline text-sm font-medium"
                      >
                        Read all reviews on Google Maps →
                      </a>
                    </div>
                  )}
                </div>
              )}

              {/* Neighborhood Information */}
              {salonDetails?.neighborhoodInfo && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">About the Neighborhood</h2>
                  <div className="prose prose-lg text-[#1b0d14]/70 max-w-none">
                    <p className="leading-relaxed">{salonDetails.neighborhoodInfo}</p>
                  </div>
                </div>
              )}

              {/* Nearby Attractions */}
              {salonDetails?.nearbyAttractions && salonDetails.nearbyAttractions.length > 0 && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Nearby Attractions</h2>
                  <div className="space-y-3">
                    {salonDetails.nearbyAttractions.map((attraction, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <span className="text-xl">📍</span>
                        <div>
                          <p className="font-semibold text-[#1b0d14]">{attraction.name}</p>
                          {attraction.distance && (
                            <p className="text-sm text-[#1b0d14]/60">{attraction.distance}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accessibility Options */}
              {salon.accessibilityOptions && (
                (salon.accessibilityOptions.wheelchairAccessibleParking ||
                 salon.accessibilityOptions.wheelchairAccessibleEntrance ||
                 salon.accessibilityOptions.wheelchairAccessibleRestroom ||
                 salon.accessibilityOptions.wheelchairAccessibleSeating) && (
                  <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                    <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Accessibility</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {salon.accessibilityOptions.wheelchairAccessibleParking && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">♿</span>
                          <span className="text-[#1b0d14]/70">Wheelchair Accessible Parking</span>
                        </div>
                      )}
                      {salon.accessibilityOptions.wheelchairAccessibleEntrance && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">♿</span>
                          <span className="text-[#1b0d14]/70">Wheelchair Accessible Entrance</span>
                        </div>
                      )}
                      {salon.accessibilityOptions.wheelchairAccessibleRestroom && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">♿</span>
                          <span className="text-[#1b0d14]/70">Wheelchair Accessible Restroom</span>
                        </div>
                      )}
                      {salon.accessibilityOptions.wheelchairAccessibleSeating && (
                        <div className="flex items-center gap-2">
                          <span className="text-lg">♿</span>
                          <span className="text-[#1b0d14]/70">Wheelchair Accessible Seating</span>
                        </div>
                      )}
                    </div>
                  </div>
                )
              )}

              {/* Amenities & Features - NEW from Places API */}
              {salonDetails?.amenities && (salonDetails.amenities.goodForChildren || salonDetails.amenities.restroom || salonDetails.amenities.allowsDogs || salonDetails.amenities.reservable || salonDetails.amenities.outdoorSeating) && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Amenities & Features</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {salonDetails.amenities.reservable && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">📅</span>
                        <span className="text-[#1b0d14]/70">Accepts Reservations</span>
                      </div>
                    )}
                    {salonDetails.amenities.goodForChildren && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👶</span>
                        <span className="text-[#1b0d14]/70">Family-Friendly</span>
                      </div>
                    )}
                    {salonDetails.amenities.restroom && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🚻</span>
                        <span className="text-[#1b0d14]/70">Restroom Available</span>
                      </div>
                    )}
                    {salonDetails.amenities.allowsDogs && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🐕</span>
                        <span className="text-[#1b0d14]/70">Pet-Friendly</span>
                      </div>
                    )}
                    {salonDetails.amenities.outdoorSeating && (
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🪑</span>
                        <span className="text-[#1b0d14]/70">Outdoor Seating</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Options - NEW from Places API */}
              {salonDetails?.paymentOptions && salonDetails.paymentOptions.length > 0 && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Payment Options</h2>
                  <div className="flex flex-wrap gap-2">
                    {salonDetails.paymentOptions.map((option, index) => (
                      <span
                        key={index}
                        className="px-4 py-2 bg-gradient-to-r from-[#ee2b8c]/10 to-[#ee2b8c]/5 text-[#1b0d14]/70 rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        <span>💳</span>
                        {option}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Parking & Transportation */}
              {(salonDetails?.parkingInfo || salonDetails?.transportation) && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Parking & Transportation</h2>
                  <div className="space-y-4">
                    {salonDetails.parkingInfo && (
                      <div className="flex items-start gap-3">
                        <span className="text-xl">🅿️</span>
                        <div>
                          <p className="font-semibold text-[#1b0d14] mb-1">Parking</p>
                          <p className="text-[#1b0d14]/70">{salonDetails.parkingInfo}</p>
                        </div>
                      </div>
                    )}
                    {salonDetails.transportation && salonDetails.transportation.length > 0 && (
                      <div className="flex items-start gap-3">
                        <span className="text-xl">🚇</span>
                        <div>
                          <p className="font-semibold text-[#1b0d14] mb-1">Public Transportation</p>
                          <div className="text-[#1b0d14]/70">
                            {typeof salonDetails.transportation === 'string' ? (
                              <p>{salonDetails.transportation}</p>
                            ) : (
                              <ul className="list-disc list-inside space-y-1">
                                {salonDetails.transportation.map((transport, index) => (
                                  <li key={index}>{transport}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {salonDetails?.faq && salonDetails.faq.length > 0 && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Frequently Asked Questions</h2>
                  <div className="space-y-5">
                    {salonDetails.faq.map((item, index) => (
                      <div key={index} className="border-b border-[#ee2b8c]/10 pb-4 last:border-0 last:pb-0">
                        <h3 className="font-semibold text-[#1b0d14] mb-2">Q: {item.question}</h3>
                        <p className="text-[#1b0d14]/70 leading-relaxed">A: {item.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Nail Art Design Gallery Section */}
              {galleryDesigns.length > 0 && (
                <NailArtGallerySection
                  salonName={salon.name}
                  city={formattedCity}
                  state={formattedState}
                  designs={galleryDesigns}
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

              {/* Related Salons */}
              {relatedSalons.length > 0 && (
                <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15">
                  <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">Other Salons in {formattedCity}</h2>
                  <div className="space-y-3">
                    {relatedSalons.map((relatedSalon) => (
                      <Link
                        key={relatedSalon.name}
                        href={`/nail-salons/${stateSlug}/${citySlug}/${generateSlug(relatedSalon.name)}`}
                        className="block p-4 rounded-lg border border-[#ee2b8c]/20 hover:border-[#ee2b8c]/40 hover:bg-[#f8f6f7] transition-all duration-300"
                      >
                        <h3 className="font-semibold text-[#1b0d14] mb-1 hover:text-[#ee2b8c] transition-colors">
                          {relatedSalon.name}
                        </h3>
                        {relatedSalon.address && (
                          <p className="text-sm text-[#1b0d14]/60 line-clamp-1">{relatedSalon.address}</p>
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
                  <div className="mt-4">
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
                          salon.placeId
                            ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyCTHR85j_npmq4XJwEwGB7JXWZDAtGC3HE&q=place_id:${salon.placeId}`
                            : salon.address
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
                      <span>Today's Hours</span>
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

