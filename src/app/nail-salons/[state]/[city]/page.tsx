import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { generateSlug, getPhotoUrl, generateCitySlug } from '@/lib/nailSalonService';
import { getSalonsForCity } from '@/lib/salonDataService';
import OptimizedImage from '@/components/OptimizedImage';
import { DirectoryStructuredData } from '@/components/DirectoryStructuredData';

interface CityPageProps {
  params: Promise<{
    state: string;
    city: string;
  }>;
}

// Generate static params for cities
export async function generateStaticParams() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const citiesDir = path.join(process.cwd(), 'src', 'data', 'cities');
    
    const files = await fs.readdir(citiesDir);
    const stateFiles = files.filter(file => file.endsWith('.json'));
    
    const params: Array<{ state: string; city: string }> = [];
    
    // Read each state file and extract cities
    for (const stateFile of stateFiles) {
      const stateSlug = stateFile.replace('.json', '');
      const filePath = path.join(citiesDir, stateFile);
      
      try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        if (data.cities && Array.isArray(data.cities)) {
          // Use all cities, but use the slug from JSON if available, otherwise generate it
          const cities = data.cities.map((city: { name: string; slug?: string }) => ({
            state: stateSlug,
            city: city.slug || generateCitySlug(city.name),
          }));
          
          params.push(...cities);
        }
      } catch (error) {
        console.error(`Error reading ${stateFile}:`, error);
      }
    }
    
    return params;
  } catch (error) {
    console.error('Error generating static params for cities:', error);
    // Fallback to common cities
    return [
      { state: 'arizona', city: 'phoenix' },
      { state: 'california', city: 'los-angeles' },
      { state: 'texas', city: 'houston' },
      { state: 'florida', city: 'miami' },
      { state: 'new-york', city: 'new-york' },
    ];
  }
}

// Enable dynamic params for cities not in generateStaticParams
export const dynamicParams = true;

// Enable ISR - revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
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

  // Get city image URL
  const cityImageUrl = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=630&fit=crop&q=80`;

  return {
    title: `Nail Salons in ${formattedCity}, ${formattedState} | Best Nail Salons Near You`,
    description: `Find the best nail salons, nail spas, and nail art studios in ${formattedCity}, ${formattedState}. Browse top-rated salons with reviews, ratings, phone numbers, and addresses.`,
    keywords: [
      `nail salons ${formattedCity} ${formattedState}`,
      `nail spas ${formattedCity}`,
      `nail art studios ${formattedCity}`,
      `best nail salons ${formattedCity}`,
      `manicure ${formattedCity}`,
      `pedicure ${formattedCity}`,
      `nail salon near me ${formattedCity}`,
    ],
    openGraph: {
      title: `Nail Salons in ${formattedCity}, ${formattedState}`,
      description: `Discover top-rated nail salons in ${formattedCity}, ${formattedState}.`,
      type: 'website',
      url: `https://nailartai.app/nail-salons/${stateSlug}/${citySlug}`,
      siteName: 'Nail Art AI',
      images: [
        {
          url: cityImageUrl,
          width: 1200,
          height: 630,
          alt: `Nail salons in ${formattedCity}, ${formattedState}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Nail Salons in ${formattedCity}, ${formattedState}`,
      description: `Discover top-rated nail salons in ${formattedCity}`,
      images: [cityImageUrl],
      creator: '@nailartai'
    },
    alternates: {
      canonical: `https://nailartai.app/nail-salons/${stateSlug}/${citySlug}`
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true
      }
    }
  };
}

export default async function CityPage({ params }: CityPageProps) {
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

  let salons;
  try {
    // Use R2 data instead of Google Maps API
    salons = await getSalonsForCity(formattedState, formattedCity);
  } catch (error) {
    console.error(`Error fetching salons for ${formattedCity}, ${formattedState}:`, error);
    notFound();
  }

  if (salons.length === 0) {
    notFound();
  }

  // Calculate statistics
  const avgRating = salons.filter(s => s.rating).length > 0
    ? (salons.reduce((sum, s) => sum + (s.rating || 0), 0) / salons.filter(s => s.rating).length).toFixed(1)
    : null;
  const totalReviews = salons.reduce((sum, s) => sum + (s.reviewCount || 0), 0);
  const salonsWithPhotos = salons.filter(s => s.photos && s.photos.length > 0).length;
  
  // Get city image (using Unsplash with city name)
  const cityImageUrl = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1200&h=400&fit=crop&q=80`;

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
      {/* Structured Data for SEO */}
      <DirectoryStructuredData 
        type="city" 
        stateName={formattedState}
        cityName={formattedCity}
        stateSlug={stateSlug}
        citySlug={citySlug}
        itemCount={salons.length}
      />
      
      {/* Hero Section with City Image */}
      <div className="relative overflow-hidden">
        {/* City Background Image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={cityImageUrl}
            alt={`${formattedCity}, ${formattedState}`}
            width={1200}
            height={400}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            <div className="mb-4">
              <Link
                href={`/nail-salons/${stateSlug}`}
                className="text-white/90 hover:text-white text-sm font-medium inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                ← Back to {formattedState}
              </Link>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Nail Salons in {formattedCity}, {formattedState}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8 drop-shadow-md">
              Discover {salons.length} top-rated nail salons, nail spas, and nail art studios in {formattedCity}
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {avgRating && (
                <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
                  <div className="text-2xl font-bold text-[#ee2b8c]">{avgRating}</div>
                  <div className="text-xs text-[#1b0d14]/70">Avg Rating</div>
                </div>
              )}
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
                <div className="text-2xl font-bold text-[#ee2b8c]">{salons.length}</div>
                <div className="text-xs text-[#1b0d14]/70">Salons</div>
              </div>
              {totalReviews > 0 && (
                <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
                  <div className="text-2xl font-bold text-[#ee2b8c]">{totalReviews.toLocaleString()}</div>
                  <div className="text-xs text-[#1b0d14]/70">Reviews</div>
                </div>
              )}
              {salonsWithPhotos > 0 && (
                <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
                  <div className="text-2xl font-bold text-[#ee2b8c]">{salonsWithPhotos}</div>
                  <div className="text-xs text-[#1b0d14]/70">With Photos</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Salons List */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#1b0d14] mb-2">
            Top Nail Salons
          </h2>
          <p className="text-[#1b0d14]/70">
            {salons.length} {salons.length === 1 ? 'salon' : 'salons'} found in {formattedCity}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salons.map((salon, index) => {
            // Get photo URL - check if it's valid (not empty)
            const salonImageUrl = salon.photos && salon.photos.length > 0 
              ? (salon.photos[0].url || getPhotoUrl(salon.photos[0].name, 400))
              : null;
            // Only use image if URL is valid (not empty string)
            const salonImage = salonImageUrl && salonImageUrl.trim() !== '' ? salonImageUrl : null;
            const isOpen = salon.currentOpeningHours?.openNow;
            
            return (
              <Link
                key={salon.placeId ? salon.placeId : `${generateSlug(salon.name)}-${index}`}
                href={`/nail-salons/${stateSlug}/${citySlug}/${generateSlug(salon.name)}`}
                className="group bg-white rounded-xl overflow-hidden ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* Salon Image */}
                {salonImage ? (
                  <div className="relative h-48 bg-gradient-to-br from-[#ee2b8c]/20 to-[#f8f6f7] overflow-hidden">
                    <OptimizedImage
                      src={salonImage}
                      alt={salon.name}
                      width={400}
                      height={192}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      priority={index < 6}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    
                    {/* Status Badge */}
                    {isOpen !== undefined && (
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm ${
                          isOpen 
                            ? 'bg-green-500/90 text-white' 
                            : 'bg-red-500/90 text-white'
                        }`}>
                          {isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </div>
                    )}
                    
                    {/* Rating Badge */}
                    {salon.rating && (
                      <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md flex items-center gap-1.5">
                        <span className="text-yellow-500 text-sm">⭐</span>
                        <span className="font-bold text-[#1b0d14] text-sm">{salon.rating}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative h-48 bg-gradient-to-br from-[#ee2b8c]/20 to-[#f8f6f7] flex items-center justify-center">
                    <div className="text-6xl opacity-30">💅</div>
                    {isOpen !== undefined && (
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isOpen 
                            ? 'bg-green-500 text-white' 
                            : 'bg-red-500 text-white'
                        }`}>
                          {isOpen ? 'Open Now' : 'Closed'}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Salon Info */}
                <div className="p-5">
                  <h3 className="text-xl font-bold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors mb-3 line-clamp-2">
                    {salon.name}
                  </h3>

                  {/* Rating & Reviews */}
                  {salon.rating && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-500">⭐</span>
                        <span className="font-semibold text-[#1b0d14]">{salon.rating}</span>
                      </div>
                      {salon.reviewCount && (
                        <span className="text-sm text-[#1b0d14]/60">
                          ({salon.reviewCount.toLocaleString()} {salon.reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                      {salon.priceLevel && (
                        <span className="ml-auto text-sm text-[#1b0d14]/60">
                          {salon.priceLevel === 'INEXPENSIVE' && '💰'}
                          {salon.priceLevel === 'MODERATE' && '💰💰'}
                          {salon.priceLevel === 'EXPENSIVE' && '💰💰💰'}
                          {salon.priceLevel === 'VERY_EXPENSIVE' && '💰💰💰💰'}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Address */}
                  {salon.address && (
                    <p className="text-[#1b0d14]/70 text-sm mb-3 flex items-start gap-2 line-clamp-2">
                      <span className="text-[#ee2b8c] flex-shrink-0 mt-0.5">📍</span>
                      <span>{salon.shortFormattedAddress || salon.address}</span>
                    </p>
                  )}

                  {/* Phone */}
                  {salon.phone && (
                    <p className="text-[#1b0d14]/70 text-sm mb-3 flex items-center gap-2">
                      <span className="text-[#ee2b8c]">📞</span>
                      <span className="hover:text-[#ee2b8c] transition-colors">{salon.phone}</span>
                    </p>
                  )}

                  {/* Opening Hours Preview */}
                  {salon.currentOpeningHours?.weekdayDescriptions && salon.currentOpeningHours.weekdayDescriptions.length > 0 && (
                    <div className="mb-3 pb-3 border-b border-[#ee2b8c]/10">
                      <p className="text-xs text-[#1b0d14]/60 mb-1">Today:</p>
                      <p className="text-sm text-[#1b0d14]/80 font-medium">
                        {salon.currentOpeningHours.weekdayDescriptions[0]}
                      </p>
                    </div>
                  )}

                  {/* CTA */}
                  <div className="mt-4 flex items-center gap-2 text-[#ee2b8c] text-sm font-semibold group-hover:gap-3 transition-all">
                    <span>View Details</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* SEO Content - Enhanced */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Main SEO Content */}
          <div className="bg-white rounded-2xl p-8 ring-1 ring-[#ee2b8c]/15">
            <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
              Best Nail Salons in {formattedCity}, {formattedState}
            </h2>
            <div className="prose prose-lg text-[#1b0d14]/70">
              <p className="mb-4">
                Find the perfect nail salon in {formattedCity}, {formattedState}. Our comprehensive directory 
                features {salons.length} top-rated salons offering a wide range of services including manicures, 
                pedicures, nail art, gel polish, acrylic nails, and more. Each salon listing includes detailed 
                information including ratings, reviews, contact details, opening hours, and photos to help you make the best choice.
              </p>
              <h3 className="text-xl font-bold text-[#1b0d14] mt-6 mb-3">
                Services Available in {formattedCity}
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Professional manicures and pedicures</li>
                <li>Nail art and design services</li>
                <li>Gel polish and acrylic nails</li>
                <li>Nail repairs and extensions</li>
                <li>Luxury spa treatments</li>
                <li>Wedding and special occasion packages</li>
              </ul>
            </div>
          </div>

          {/* Stats & Features */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-[#ee2b8c]/10 to-[#f8f6f7] rounded-2xl p-6 ring-1 ring-[#ee2b8c]/15">
              <h3 className="text-xl font-bold text-[#1b0d14] mb-4">Salon Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ee2b8c] mb-1">{salons.length}</div>
                  <div className="text-sm text-[#1b0d14]/70">Total Salons</div>
                </div>
                {avgRating && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#ee2b8c] mb-1">{avgRating}</div>
                    <div className="text-sm text-[#1b0d14]/70">Avg Rating</div>
                  </div>
                )}
                {totalReviews > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#ee2b8c] mb-1">{totalReviews.toLocaleString()}</div>
                    <div className="text-sm text-[#1b0d14]/70">Total Reviews</div>
                  </div>
                )}
                {salonsWithPhotos > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#ee2b8c] mb-1">{salonsWithPhotos}</div>
                    <div className="text-sm text-[#1b0d14]/70">With Photos</div>
                  </div>
                )}
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl p-6 ring-1 ring-[#ee2b8c]/15">
              <h3 className="text-xl font-bold text-[#1b0d14] mb-4">Why Choose Our Directory?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-[#ee2b8c] text-xl">✓</span>
                  <span className="text-[#1b0d14]/70">Real-time information from Google Places API</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ee2b8c] text-xl">✓</span>
                  <span className="text-[#1b0d14]/70">Verified ratings and customer reviews</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ee2b8c] text-xl">✓</span>
                  <span className="text-[#1b0d14]/70">Complete contact information and hours</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ee2b8c] text-xl">✓</span>
                  <span className="text-[#1b0d14]/70">High-quality salon photos</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-[#ee2b8c] text-xl">✓</span>
                  <span className="text-[#1b0d14]/70">Current opening status (Open/Closed)</span>
                </li>
              </ul>
            </div>

            {/* Top Rated Salons */}
            {salons.filter(s => s.rating && s.rating >= 4.5).length > 0 && (
              <div className="bg-white rounded-2xl p-6 ring-1 ring-[#ee2b8c]/15">
                <h3 className="text-xl font-bold text-[#1b0d14] mb-4">⭐ Top Rated Salons</h3>
                <div className="space-y-2">
                  {salons
                    .filter(s => s.rating && s.rating >= 4.5)
                    .slice(0, 3)
                    .map((salon, idx) => (
                      <Link
                        key={salon.placeId || idx}
                        href={`/nail-salons/${stateSlug}/${citySlug}/${generateSlug(salon.name)}`}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f6f7] transition-colors"
                      >
                        <span className="text-sm font-medium text-[#1b0d14]">{salon.name}</span>
                        <span className="text-sm font-bold text-[#ee2b8c]">{salon.rating}⭐</span>
                      </Link>
                    ))}
                </div>
              </div>
            )}

            {/* FAQ Section */}
            <div className="bg-white rounded-2xl p-6 ring-1 ring-[#ee2b8c]/15 mt-6">
              <h3 className="text-xl font-bold text-[#1b0d14] mb-4">Frequently Asked Questions</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-[#1b0d14] mb-1">What are the best nail salons in {formattedCity}?</h4>
                  <p className="text-sm text-[#1b0d14]/70">
                    The best nail salons in {formattedCity} are those with ratings of 4.5+ stars and positive customer reviews. 
                    Check our &quot;Top Rated Salons&quot; section above to see the highest-rated options in your area.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#1b0d14] mb-1">How much does a manicure cost in {formattedCity}?</h4>
                  <p className="text-sm text-[#1b0d14]/70">
                    Manicure prices in {formattedCity} typically range from $20-$40 for basic services, $40-$60 for gel manicures, 
                    and $50-$100+ for specialty nail art. Check the price level indicators (💰) on each salon card for guidance.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#1b0d14] mb-1">Are walk-ins accepted at nail salons in {formattedCity}?</h4>
                  <p className="text-sm text-[#1b0d14]/70">
                    Many salons in {formattedCity} accept walk-ins, but appointments are recommended during busy times. 
                    Call ahead using the phone numbers in our listings to check availability and book your appointment.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#1b0d14] mb-1">What nail services are available in {formattedCity}?</h4>
                  <p className="text-sm text-[#1b0d14]/70">
                    Salons in {formattedCity} offer a wide range of services including manicures, pedicures, gel polish, 
                    acrylic nails, dip powder, nail art, nail repairs, extensions, and spa treatments. Some also offer 
                    waxing, massage, and special packages for weddings and events.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#1b0d14] mb-1">How can I find nail salons open now in {formattedCity}?</h4>
                  <p className="text-sm text-[#1b0d14]/70">
                    Look for the &quot;Open Now&quot; badge (green) on salon cards above. Our directory shows real-time open/closed 
                    status for all salons. You can also check the &quot;Today&apos;s hours&quot; preview on each card to see when they close.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

