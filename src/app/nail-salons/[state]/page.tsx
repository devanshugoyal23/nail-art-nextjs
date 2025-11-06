import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getCitiesInState, generateStateSlug, generateCitySlug } from '@/lib/nailSalonService';

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

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#ee2b8c]/10 to-[#f8f6f7]">
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <div className="mb-4">
              <Link
                href="/nail-salons"
                className="text-[#ee2b8c] hover:text-[#ee2b8c]/80 text-sm font-medium inline-flex items-center gap-2"
              >
                ← Back to All States
              </Link>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-[#1b0d14] mb-6">
              Nail Salons in {formattedState}
            </h1>
            <p className="text-xl md:text-2xl text-[#1b0d14]/70 max-w-4xl mx-auto mb-8">
              Find the best nail salons, nail spas, and nail art studios in {formattedState}. 
              Browse by city to discover top-rated salons near you.
            </p>
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {cities.map((city) => (
            <Link
              key={city.name}
              href={`/nail-salons/${stateSlug}/${generateCitySlug(city.name)}`}
              className="group bg-white rounded-xl p-6 text-center ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-2">🏙️</div>
              <h3 className="font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors mb-1">
                {city.name}
              </h3>
              {city.salonCount > 0 && (
                <p className="text-xs text-[#ee2b8c] mt-2">
                  {city.salonCount} salons
                </p>
              )}
            </Link>
          ))}
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
            Best Nail Salons in {formattedState}
          </h2>
          <div className="prose prose-lg text-[#1b0d14]/70">
            <p>
              Explore our directory of top-rated nail salons in {formattedState}. Whether you're 
              looking for a quick manicure, a luxurious spa experience, or intricate nail art, 
              you'll find the perfect salon in your city. Each listing includes detailed information 
              about ratings, reviews, services, and contact details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

