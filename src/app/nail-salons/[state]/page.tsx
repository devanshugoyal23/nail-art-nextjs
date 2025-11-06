import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCitiesInState, generateStateSlug, generateCitySlug } from '@/lib/nailSalonService';
import OptimizedImage from '@/components/OptimizedImage';

interface StatePageProps {
  params: Promise<{
    state: string;
  }>;
}

export async function generateMetadata({ params }: StatePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const stateName = decodeURIComponent(resolvedParams.state).replace(/-/g, ' ');
  const formattedState = stateName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');

  return {
    title: `Nail Salons in ${formattedState} | Find Best Nail Salons by City`,
    description: `Discover the best nail salons, nail spas, and nail art studios in ${formattedState}. Browse by city to find top-rated nail salons with reviews, ratings, and contact information.`,
    openGraph: {
      title: `Nail Salons in ${formattedState}`,
      description: `Find the best nail salons in ${formattedState}. Browse by city to discover top-rated salons.`,
    },
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

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
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
            <div className="mb-4">
              <Link
                href="/nail-salons"
                className="text-white/90 hover:text-white text-sm font-medium inline-flex items-center gap-2 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                ← Back to All States
              </Link>
            </div>
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
                Whether you're looking for a quick manicure, a luxurious spa experience, or intricate nail art, 
                you'll find the perfect salon in your city. Each listing includes detailed information 
                about ratings, reviews, services, opening hours, and contact details.
              </p>
              <h3 className="text-xl font-bold text-[#1b0d14] mt-6 mb-3">
                Services Available in {formattedState}
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
                  {topCities.map((city, idx) => (
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
          </div>
        </div>
      </div>
    </div>
  );
}

