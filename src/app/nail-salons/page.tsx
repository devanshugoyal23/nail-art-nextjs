import { Metadata } from 'next';
import Link from 'next/link';
import { getAllStatesWithSalons, generateStateSlug, getCitiesInState } from '@/lib/nailSalonService';
import OptimizedImage from '@/components/OptimizedImage';
import { DirectoryStructuredData } from '@/components/DirectoryStructuredData';

export const metadata: Metadata = {
  title: 'Nail Salons Near You | Find Best Nail Salons by State',
  description: 'Discover the best nail salons, nail spas, and nail art studios in your state. Browse by state to find top-rated nail salons near you with reviews, ratings, and contact information.',
  keywords: [
    'nail salons',
    'nail spas',
    'nail art studios',
    'manicure salons',
    'pedicure salons',
    'nail salon near me',
    'best nail salons',
    'nail salon directory',
  ],
  openGraph: {
    title: 'Nail Salons Near You | Find Best Nail Salons by State',
    description: 'Discover the best nail salons, nail spas, and nail art studios in your state.',
    type: 'website',
    url: 'https://nailartai.app/nail-salons',
    siteName: 'Nail Art AI',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=630&fit=crop&q=80',
        width: 1200,
        height: 630,
        alt: 'Nail Salons Directory - Browse by State'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nail Salons Near You | Find Best Nail Salons by State',
    description: 'Discover the best nail salons in your state',
    images: ['https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&h=630&fit=crop&q=80'],
    creator: '@nailartai'
  },
  alternates: {
    canonical: 'https://nailartai.app/nail-salons'
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

// State-specific information for SEO and visual enhancement
const stateInfo: Record<string, {
  image: string;
  description: string;
  popularCities?: string[];
  highlights?: string[];
}> = {
  'California': {
    image: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop',
    description: 'Home to thousands of top-rated nail salons from Los Angeles to San Francisco. Discover luxury spas and trendy nail art studios.',
    popularCities: ['Los Angeles', 'San Francisco', 'San Diego', 'Sacramento'],
    highlights: ['Luxury spas', 'Trendy nail art', 'Celebrity salons']
  },
  'New York': {
    image: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=400&h=300&fit=crop',
    description: 'Premier nail salons in Manhattan, Brooklyn, and across New York. Find the best manicure and pedicure services in the Big Apple.',
    popularCities: ['New York City', 'Buffalo', 'Rochester', 'Albany'],
    highlights: ['Manhattan luxury', 'Brooklyn trends', 'Fast service']
  },
  'Texas': {
    image: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=300&fit=crop',
    description: 'From Dallas to Houston, find exceptional nail salons across Texas. Experience Southern hospitality with top-notch nail services.',
    popularCities: ['Houston', 'Dallas', 'Austin', 'San Antonio'],
    highlights: ['Southern charm', 'Affordable prices', 'Full service']
  },
  'Florida': {
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    description: 'Beach-ready nails in Miami, Orlando, and Tampa. Find the best nail salons for vacation-perfect manicures and pedicures.',
    popularCities: ['Miami', 'Orlando', 'Tampa', 'Jacksonville'],
    highlights: ['Beach vibes', 'Vacation ready', 'Tropical styles']
  },
  'Illinois': {
    image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=400&h=300&fit=crop',
    description: 'Chicago and beyond - discover top nail salons throughout Illinois. From downtown luxury to suburban convenience.',
    popularCities: ['Chicago', 'Aurora', 'Naperville', 'Rockford'],
    highlights: ['Downtown luxury', 'Suburban convenience', 'Professional service']
  }
};

// Get state image URL (with fallback)
function getStateImage(stateName: string): string {
  const info = stateInfo[stateName];
  if (info?.image) return info.image;
  
  // Fallback to Unsplash with nail salon image
  return `https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=400&h=300&fit=crop&q=80`;
}

// Get state description for SEO
function getStateDescription(stateName: string, cityCount: number): string {
  const info = stateInfo[stateName];
  if (info?.description) {
    return info.description;
  }
  return `Find the best nail salons in ${stateName}. Browse ${cityCount > 0 ? `${cityCount} cities` : 'cities'} with top-rated nail spas, manicure studios, and pedicure services.`;
}

export default async function NailSalonsPage() {
  const states = await getAllStatesWithSalons();
  
  // Get city counts for each state (in parallel, but limit to avoid too many file reads)
  const statesWithInfo = await Promise.all(
    states.slice(0, 50).map(async (state) => {
      try {
        const cities = await getCitiesInState(state.name);
        return {
          ...state,
          cityCount: cities.length,
          popularCities: cities.slice(0, 3).map(c => c.name),
        };
      } catch {
        return {
          ...state,
          cityCount: 0,
          popularCities: [],
        };
      }
    })
  );

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
      {/* Structured Data for SEO */}
      <DirectoryStructuredData 
        type="states" 
        itemCount={states.length}
      />
      
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#ee2b8c]/10 to-[#f8f6f7]">
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-[#1b0d14] mb-6">
              Find Nail Salons Near You
            </h1>
            <p className="text-xl md:text-2xl text-[#1b0d14]/70 max-w-4xl mx-auto mb-8">
              Discover the best nail salons, nail spas, and nail art studios across {states.length} states. 
              Browse by location to find top-rated salons with reviews, ratings, and contact information.
            </p>
          </div>
        </div>
      </div>

      {/* States Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#1b0d14] mb-2">
            Browse Nail Salons by State
          </h2>
          <p className="text-[#1b0d14]/70">
            Select a state to explore nail salons in your area
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {statesWithInfo.map((state) => {
            const stateData = stateInfo[state.name];
            const imageUrl = getStateImage(state.name);
            
            return (
              <Link
                key={state.code}
                href={`/nail-salons/${generateStateSlug(state.name)}`}
                className="group bg-white rounded-xl overflow-hidden ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                {/* State Image */}
                <div className="relative h-40 bg-gradient-to-br from-[#ee2b8c]/20 to-[#f8f6f7] overflow-hidden">
                  <OptimizedImage
                    src={imageUrl}
                    alt={`${state.name} nail salons`}
                    width={400}
                    height={160}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    priority={statesWithInfo.indexOf(state) < 8}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  
                  {/* State Code Badge */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-md">
                    <span className="text-xs font-bold text-[#ee2b8c]">{state.code}</span>
                  </div>
                </div>

                {/* State Info */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors mb-2">
                    {state.name}
                  </h3>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    {state.cityCount > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#ee2b8c]">📍</span>
                        <span className="text-[#1b0d14]/70">{state.cityCount} cities</span>
                      </div>
                    )}
                    {stateData?.highlights && stateData.highlights.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#ee2b8c]">⭐</span>
                        <span className="text-[#1b0d14]/70">{stateData.highlights[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Popular Cities Preview */}
                  {state.popularCities && state.popularCities.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-[#1b0d14]/60 mb-1.5">Popular cities:</p>
                      <div className="flex flex-wrap gap-1.5">
                        {state.popularCities.slice(0, 3).map((city, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-[#ee2b8c]/10 text-[#ee2b8c] text-xs font-medium rounded-full"
                          >
                            {city}
                          </span>
                        ))}
                        {state.cityCount > 3 && (
                          <span className="inline-block px-2 py-0.5 bg-gray-100 text-[#1b0d14]/60 text-xs rounded-full">
                            +{state.cityCount - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  <p className="text-xs text-[#1b0d14]/60 line-clamp-2 leading-relaxed">
                    {getStateDescription(state.name, state.cityCount)}
                  </p>

                  {/* CTA Arrow */}
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
              Find the Perfect Nail Salon in Your State
            </h2>
            <div className="prose prose-lg text-[#1b0d14]/70">
              <p className="mb-4">
                Whether you&apos;re looking for a quick manicure, a luxurious spa experience, or 
                intricate nail art designs, our comprehensive directory helps you find the best 
                nail salons across all {states.length} US states. Browse by state to discover top-rated salons with 
                detailed information including ratings, reviews, contact details, opening hours, and more.
              </p>
              <h3 className="text-xl font-bold text-[#1b0d14] mt-6 mb-3">
                What to Look For in a Nail Salon
              </h3>
              <ul className="list-disc pl-6 space-y-2 mb-6">
                <li>Professional licensing and certification</li>
                <li>High ratings and positive customer reviews</li>
                <li>Clean, sanitized workspace</li>
                <li>Wide range of services (manicure, pedicure, nail art, etc.)</li>
                <li>Convenient location and hours</li>
                <li>Quality products and tools</li>
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
                  <div className="text-3xl font-bold text-[#ee2b8c] mb-1">{states.length}</div>
                  <div className="text-sm text-[#1b0d14]/70">US States</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-[#ee2b8c] mb-1">
                    {statesWithInfo.reduce((sum, s) => sum + s.cityCount, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-[#1b0d14]/70">Cities Listed</div>
                </div>
              </div>
            </div>

            {/* Features Card */}
            <div className="bg-white rounded-2xl p-6 ring-1 ring-[#ee2b8c]/15">
              <h3 className="text-xl font-bold text-[#1b0d14] mb-4">Why Use Our Directory?</h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-[#ee2b8c] text-xl">✓</span>
                  <span className="text-[#1b0d14]/70">Real-time salon information from Google Places</span>
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
                  <span className="text-[#1b0d14]/70">Browse by state, city, or salon name</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-2xl p-8 ring-1 ring-[#ee2b8c]/15 mt-8">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-6">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-[#1b0d14] mb-2">How do I find the best nail salon in my state?</h3>
              <p className="text-[#1b0d14]/70">
                Browse our directory by selecting your state above. Each salon listing includes ratings, reviews, 
                photos, and contact information to help you make an informed decision. Look for salons with high 
                ratings (4.5+ stars) and positive customer reviews.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1b0d14] mb-2">What information is included for each salon?</h3>
              <p className="text-[#1b0d14]/70">
                Each salon listing includes the salon name, address, phone number, website, ratings, customer reviews, 
                opening hours, photos, and current open/closed status. All information is sourced from Google Places API 
                to ensure accuracy.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1b0d14] mb-2">How often is the directory updated?</h3>
              <p className="text-[#1b0d14]/70">
                Our directory pulls real-time information from Google Places API, ensuring that salon details, ratings, 
                and reviews are always up-to-date. Business hours and open/closed status are updated in real-time.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1b0d14] mb-2">Can I book appointments through this directory?</h3>
              <p className="text-[#1b0d14]/70">
                While we don&apos;t offer direct booking, each salon listing includes phone numbers and website links where 
                you can contact the salon directly to book your appointment. Many salons also accept walk-ins.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#1b0d14] mb-2">What services do nail salons typically offer?</h3>
              <p className="text-[#1b0d14]/70">
                Most nail salons offer manicures, pedicures, gel polish, acrylic nails, nail art, nail repairs, 
                and extensions. Many also provide luxury spa treatments, massage services, and special packages for 
                weddings and events. Check individual salon listings for specific services.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

