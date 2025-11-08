import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCitiesInState, generateCitySlug } from '@/lib/nailSalonService';
import OptimizedImage from '@/components/OptimizedImage';
import { DirectoryStructuredData } from '@/components/DirectoryStructuredData';
import { FAQStructuredData } from '@/components/FAQStructuredData';

interface StatePageProps {
  params: Promise<{
    state: string;
  }>;
}

// Generate static params for all states
export async function generateStaticParams() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const citiesDir = path.join(process.cwd(), 'src', 'data', 'cities');
    
    const files = await fs.readdir(citiesDir);
    const stateFiles = files.filter(file => file.endsWith('.json'));
    
    return stateFiles.map(file => ({
      state: file.replace('.json', ''),
    }));
  } catch (error) {
    console.error('Error generating static params for states:', error);
    // Fallback to common states
    return [
      { state: 'california' },
      { state: 'texas' },
      { state: 'florida' },
      { state: 'new-york' },
      { state: 'arizona' },
    ];
  }
}

// Enable dynamic params for states not in generateStaticParams
export const dynamicParams = true;

// Enable ISR - revalidate every hour
export const revalidate = 3600;

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const stateSlug = resolvedParams.state;
  const stateName = decodeURIComponent(stateSlug).replace(/-/g, ' ');
  const formattedState = stateName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');

  // Get state image URL
  const stateImageUrl = `https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=630&fit=crop&q=80`;

  return {
    title: `Nail Salons in ${formattedState} | Find Best Nail Salons by City`,
    description: `Discover the best nail salons, nail spas, and nail art studios in ${formattedState}. Browse by city to find top-rated nail salons with reviews, ratings, and contact information.`,
    keywords: [
      `nail salons ${formattedState}`,
      `nail spas ${formattedState}`,
      `nail art studios ${formattedState}`,
      `best nail salons ${formattedState}`,
      `manicure ${formattedState}`,
      `pedicure ${formattedState}`,
      `nail salon near me ${formattedState}`,
    ],
    openGraph: {
      title: `Nail Salons in ${formattedState}`,
      description: `Find the best nail salons in ${formattedState}. Browse by city to discover top-rated salons.`,
      type: 'website',
      url: `https://nailartai.app/nail-salons/${stateSlug}`,
      siteName: 'Nail Art AI',
      images: [
        {
          url: stateImageUrl,
          width: 1200,
          height: 630,
          alt: `Nail salons in ${formattedState}`
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `Nail Salons in ${formattedState}`,
      description: `Find the best nail salons in ${formattedState}`,
      images: [stateImageUrl],
      creator: '@nailartai'
    },
    alternates: {
      canonical: `https://nailartai.app/nail-salons/${stateSlug}`
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

export default async function StatePage({ params }: StatePageProps) {
  const resolvedParams = await params;
  const stateSlug = resolvedParams.state;
  const stateName = decodeURIComponent(stateSlug).replace(/-/g, ' ');
  const formattedState = stateName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');

  let cities;
  try {
    cities = await getCitiesInState(formattedState);
  } catch (error) {
    console.error(`Error fetching cities for ${formattedState}:`, error);
    notFound();
  }

  if (cities.length === 0) {
    notFound();
  }

  // Calculate statistics
  const totalSalons = cities.reduce((sum, city) => sum + (city.salonCount || 0), 0);
  const topCities = [...cities]
    .sort((a, b) => (b.salonCount || 0) - (a.salonCount || 0))
    .slice(0, 5);

  // Get state image (using Unsplash with state name)
  const stateImageUrl = `https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&h=400&fit=crop&q=80`;

  // FAQ data for schema
  const faqs = [
    {
      question: `How do I choose a nail salon in ${formattedState}?`,
      answer: `Look for salons with high ratings (4.5+ stars), read customer reviews, check their photos, and verify they offer the services you need. Our directory provides all this information to help you decide.`
    },
    {
      question: `What are typical nail salon prices in ${formattedState}?`,
      answer: `Prices vary by location and service. Basic manicures typically range from $20-$40, pedicures from $30-$60, and specialty services like gel nails or nail art can range from $40-$100+. Check individual salon listings for pricing.`
    },
    {
      question: "Do I need an appointment?",
      answer: `While many salons accept walk-ins, appointments are recommended, especially during peak times (weekends and evenings). Call ahead using the phone numbers provided in our listings.`
    },
    {
      question: `What services do nail salons in ${formattedState} offer?`,
      answer: `Most salons offer manicures, pedicures, gel polish, acrylic nails, nail art, nail repairs, extensions, and spa treatments. Some also offer waxing, massage, and special event packages.`
    }
  ];

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
      {/* Structured Data for SEO */}
      <DirectoryStructuredData
        type="state"
        stateName={formattedState}
        stateSlug={stateSlug}
        itemCount={cities.length}
      />
      <FAQStructuredData faqs={faqs} />
      
      {/* Hero Section with State Image */}
      <div className="relative overflow-hidden">
        {/* State Background Image */}
        <div className="absolute inset-0">
          <OptimizedImage
            src={stateImageUrl}
            alt={`${formattedState} nail salons`}
            width={1200}
            height={400}
            className="w-full h-full object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-20">
          <div className="text-center">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center justify-center space-x-2 text-sm mb-6" aria-label="Breadcrumb">
              <Link href="/" className="text-white/80 hover:text-white transition-colors">
                Home
              </Link>
              <span className="text-white/50">/</span>
              <Link href="/nail-salons" className="text-white/80 hover:text-white transition-colors">
                Salons
              </Link>
              <span className="text-white/50">/</span>
              <span className="text-white font-medium">{formattedState}</span>
            </nav>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              Nail Salons in {formattedState}
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-4xl mx-auto mb-8 drop-shadow-md">
              Find the best nail salons, nail spas, and nail art studios in {formattedState}. 
              Browse by city to discover top-rated salons near you.
            </p>
            
            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
                <div className="text-2xl font-bold text-[#ee2b8c]">{cities.length}</div>
                <div className="text-xs text-[#1b0d14]/70">Cities</div>
              </div>
              {totalSalons > 0 && (
                <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
                  <div className="text-2xl font-bold text-[#ee2b8c]">{totalSalons.toLocaleString()}</div>
                  <div className="text-xs text-[#1b0d14]/70">Total Salons</div>
                </div>
              )}
              <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full">
                <div className="text-2xl font-bold text-[#ee2b8c]">{topCities.length}</div>
                <div className="text-xs text-[#1b0d14]/70">Top Cities</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cities Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#1b0d14] mb-2">
            Select a City
          </h2>
          <p className="text-[#1b0d14]/70">
            {cities.length} {cities.length === 1 ? 'city' : 'cities'} with nail salons in {formattedState}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {cities.map((city, index) => {
            // Get city image (using Unsplash with city and state name)
            const cityImageUrl = `https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop&q=80`;
            const isTopCity = topCities.some(tc => tc.name === city.name);
            
            return (
              <Link
                key={city.name}
                href={`/nail-salons/${stateSlug}/${generateCitySlug(city.name)}`}
                className="group bg-white rounded-xl overflow-hidden ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* City Image */}
                <div className="relative h-40 bg-gradient-to-br from-[#ee2b8c]/20 to-[#f8f6f7] overflow-hidden">
                  <OptimizedImage
                    src={cityImageUrl}
                    alt={`${city.name}, ${formattedState} nail salons`}
                    width={400}
                    height={160}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={index < 8}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  
                  {/* Top City Badge */}
                  {isTopCity && (
                    <div className="absolute top-3 right-3 bg-[#ee2b8c]/90 backdrop-blur-sm px-2.5 py-1 rounded-md">
                      <span className="text-xs font-bold text-white">⭐ Top</span>
                    </div>
                  )}
                  
                  {/* Salon Count Badge */}
                  {city.salonCount > 0 && (
                    <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md">
                      <span className="font-bold text-[#1b0d14] text-sm">{city.salonCount}</span>
                      <span className="text-xs text-[#1b0d14]/70 ml-1">salons</span>
                    </div>
                  )}
                </div>

                {/* City Info */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors mb-2">
                    {city.name}
                  </h3>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-3 mb-3 text-sm">
                    {city.salonCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#ee2b8c]">💅</span>
                        <span className="text-[#1b0d14]/70">{city.salonCount} salons</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <span className="text-[#ee2b8c]">📍</span>
                      <span className="text-[#1b0d14]/70">{formattedState}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-[#1b0d14]/60 line-clamp-2 leading-relaxed mb-3">
                    Find top-rated nail salons in {city.name}, {formattedState}. Browse {city.salonCount > 0 ? `${city.salonCount} salons` : 'salons'} with reviews, ratings, and contact information.
                  </p>

                  {/* CTA */}
                  <div className="mt-4 flex items-center gap-2 text-[#ee2b8c] text-sm font-semibold group-hover:gap-3 transition-all">
                    <span>Explore salons</span>
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
              Best Nail Salons in {formattedState}
            </h2>
            <div className="prose prose-lg text-[#1b0d14]/70">
              <p className="mb-4">
                Explore our comprehensive directory of top-rated nail salons across {cities.length} cities in {formattedState}.
                Whether you&apos;re looking for a quick{' '}
                <Link href="/techniques/french-manicure" className="text-[#ee2b8c] hover:underline font-medium">
                  French manicure
                </Link>, a luxurious spa experience, or{' '}
                <Link href="/nail-art-gallery" className="text-[#ee2b8c] hover:underline font-medium">
                  intricate nail art designs
                </Link>,
                you&apos;ll find the perfect salon in your city. Each listing includes detailed information
                about ratings, reviews, services, opening hours, and contact details.
              </p>
              <h3 className="text-xl font-bold text-[#1b0d14] mt-6 mb-3">
                Popular Services in {formattedState}
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>
                  Professional manicures and{' '}
                  <Link href="/nail-art-gallery/category/pedicure" className="text-[#ee2b8c] hover:underline">
                    pedicures
                  </Link>
                </li>
                <li>
                  <Link href="/nail-art-gallery" className="text-[#ee2b8c] hover:underline">
                    Nail art and design services
                  </Link> - bring inspiration from our gallery
                </li>
                <li>
                  <Link href="/techniques/gel" className="text-[#ee2b8c] hover:underline">
                    Gel polish
                  </Link> and{' '}
                  <Link href="/techniques/acrylic" className="text-[#ee2b8c] hover:underline">
                    acrylic nails
                  </Link>
                </li>
                <li>Nail repairs and extensions</li>
                <li>
                  Luxury spa treatments and{' '}
                  <Link href="/categories/techniques" className="text-[#ee2b8c] hover:underline">
                    specialized techniques
                  </Link>
                </li>
                <li>
                  <Link href="/nail-art/occasion/wedding" className="text-[#ee2b8c] hover:underline">
                    Wedding and special occasion packages
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Stats & Features */}
          <div className="space-y-6">
            {/* Stats Card */}
            <div className="bg-gradient-to-br from-[#ee2b8c]/10 to-[#f8f6f7] rounded-2xl p-6 ring-1 ring-[#ee2b8c]/15">
              <h3 className="text-xl font-bold text-[#1b0d14] mb-4">Directory Statistics</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ee2b8c] mb-1">{cities.length}</div>
                  <div className="text-sm text-[#1b0d14]/70">Cities</div>
                </div>
                {totalSalons > 0 && (
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#ee2b8c] mb-1">{totalSalons.toLocaleString()}</div>
                    <div className="text-sm text-[#1b0d14]/70">Total Salons</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ee2b8c] mb-1">{topCities.length}</div>
                  <div className="text-sm text-[#1b0d14]/70">Top Cities</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ee2b8c] mb-1">{formattedState}</div>
                  <div className="text-sm text-[#1b0d14]/70">State</div>
                </div>
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
                  <span className="text-[#1b0d14]/70">Browse by city for easy navigation</span>
                </li>
              </ul>
            </div>

            {/* Top Cities */}
            {topCities.length > 0 && (
              <div className="bg-white rounded-2xl p-6 ring-1 ring-[#ee2b8c]/15">
                <h3 className="text-xl font-bold text-[#1b0d14] mb-4">⭐ Top Cities</h3>
                <div className="space-y-2">
                  {topCities.map((city) => (
                    <Link
                      key={city.name}
                      href={`/nail-salons/${stateSlug}/${generateCitySlug(city.name)}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-[#f8f6f7] transition-colors"
                    >
                      <span className="text-sm font-medium text-[#1b0d14]">{city.name}</span>
                      {city.salonCount > 0 && (
                        <span className="text-sm font-bold text-[#ee2b8c]">{city.salonCount} salons</span>
                      )}
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
                  <h4 className="text-base font-semibold text-[#1b0d14] mb-1">How do I choose a nail salon in {formattedState}?</h4>
                  <p className="text-sm text-[#1b0d14]/70">
                    Look for salons with high ratings (4.5+ stars), read customer reviews, check their photos, 
                    and verify they offer the services you need. Our directory provides all this information to help you decide.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#1b0d14] mb-1">What are typical nail salon prices in {formattedState}?</h4>
                  <p className="text-sm text-[#1b0d14]/70">
                    Prices vary by location and service. Basic manicures typically range from $20-$40, pedicures from $30-$60, 
                    and specialty services like gel nails or nail art can range from $40-$100+. Check individual salon listings for pricing.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#1b0d14] mb-1">Do I need an appointment?</h4>
                  <p className="text-sm text-[#1b0d14]/70">
                    While many salons accept walk-ins, appointments are recommended, especially during peak times (weekends and evenings). 
                    Call ahead using the phone numbers provided in our listings.
                  </p>
                </div>
                <div>
                  <h4 className="text-base font-semibold text-[#1b0d14] mb-1">What services do nail salons in {formattedState} offer?</h4>
                  <p className="text-sm text-[#1b0d14]/70">
                    Most salons offer manicures, pedicures, gel polish, acrylic nails, nail art, nail repairs, extensions, 
                    and spa treatments. Some also offer waxing, massage, and special event packages.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Nail Art Inspiration Section */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-gradient-to-br from-[#ee2b8c]/5 to-[#f8f6f7] rounded-2xl p-8 ring-1 ring-[#ee2b8c]/15">
            <h2 className="text-2xl md:text-3xl font-bold text-[#1b0d14] mb-4">
              💅 Nail Art Inspiration for Your {formattedState} Salon Visit
            </h2>
            <p className="text-[#1b0d14]/70 mb-6 leading-relaxed">
              Browse our AI-generated nail art gallery and save designs to show your technician at your next {formattedState} salon appointment!
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/nail-art-gallery"
                className="group bg-white p-4 rounded-xl ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/40 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-2">🎨</div>
                <h3 className="font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
                  Browse All Designs
                </h3>
                <p className="text-xs text-[#1b0d14]/60 mt-1">1000+ nail art ideas</p>
              </Link>

              <Link
                href="/categories/seasons"
                className="group bg-white p-4 rounded-xl ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/40 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-2">🌸</div>
                <h3 className="font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
                  Seasonal Designs
                </h3>
                <p className="text-xs text-[#1b0d14]/60 mt-1">Spring, summer & more</p>
              </Link>

              <Link
                href="/categories/techniques"
                className="group bg-white p-4 rounded-xl ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/40 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-2">✨</div>
                <h3 className="font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
                  Popular Techniques
                </h3>
                <p className="text-xs text-[#1b0d14]/60 mt-1">French, gel, chrome & more</p>
              </Link>

              <Link
                href="/try-on"
                className="group bg-white p-4 rounded-xl ring-1 ring-[#ee2b8c]/20 hover:ring-[#ee2b8c]/40 hover:shadow-lg transition-all"
              >
                <div className="text-3xl mb-2">📸</div>
                <h3 className="font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
                  Virtual Try-On
                </h3>
                <p className="text-xs text-[#1b0d14]/60 mt-1">See designs on your hands</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

