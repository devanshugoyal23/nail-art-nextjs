import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getNailSalonsForLocation, generateStateSlug, generateCitySlug, generateSlug } from '@/lib/nailSalonService';
import OptimizedImage from '@/components/OptimizedImage';

interface CityPageProps {
  params: Promise<{
    state: string;
    city: string;
  }>;
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const stateName = decodeURIComponent(resolvedParams.state).replace(/-/g, ' ');
  const cityName = decodeURIComponent(resolvedParams.city).replace(/-/g, ' ');
  const formattedState = stateName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
  const formattedCity = cityName.split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');

  return {
    title: `Nail Salons in ${formattedCity}, ${formattedState} | Best Nail Salons Near You`,
    description: `Find the best nail salons, nail spas, and nail art studios in ${formattedCity}, ${formattedState}. Browse top-rated salons with reviews, ratings, phone numbers, and addresses.`,
    openGraph: {
      title: `Nail Salons in ${formattedCity}, ${formattedState}`,
      description: `Discover top-rated nail salons in ${formattedCity}, ${formattedState}.`,
    },
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
    salons = await getNailSalonsForLocation(formattedState, formattedCity, 100);
  } catch (error) {
    console.error(`Error fetching salons for ${formattedCity}, ${formattedState}:`, error);
    notFound();
  }

  if (salons.length === 0) {
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
                href={`/nail-salons/${stateSlug}`}
                className="text-[#ee2b8c] hover:text-[#ee2b8c]/80 text-sm font-medium inline-flex items-center gap-2"
              >
                ← Back to {formattedState}
              </Link>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-[#1b0d14] mb-6">
              Nail Salons in {formattedCity}, {formattedState}
            </h1>
            <p className="text-xl md:text-2xl text-[#1b0d14]/70 max-w-4xl mx-auto mb-8">
              Discover {salons.length} top-rated nail salons, nail spas, and nail art studios in {formattedCity}
            </p>
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
          {salons.map((salon, index) => (
            <Link
              key={salon.placeId ? salon.placeId : `${generateSlug(salon.name)}-${index}`}
              href={`/nail-salons/${stateSlug}/${citySlug}/${generateSlug(salon.name)}`}
              className="group bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors mb-2">
                    {salon.name}
                  </h3>
                  {salon.rating && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-semibold text-[#1b0d14]">{salon.rating}</span>
                      {salon.reviewCount && (
                        <span className="text-sm text-[#1b0d14]/60">
                          ({salon.reviewCount} {salon.reviewCount === 1 ? 'review' : 'reviews'})
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {salon.address && (
                <p className="text-[#1b0d14]/70 text-sm mb-3 flex items-start gap-2">
                  <span>📍</span>
                  <span>{salon.address}</span>
                </p>
              )}

              {salon.phone && (
                <p className="text-[#1b0d14]/70 text-sm mb-3 flex items-center gap-2">
                  <span>📞</span>
                  <a
                    href={`tel:${salon.phone}`}
                    className="hover:text-[#ee2b8c] transition-colors"
                  >
                    {salon.phone}
                  </a>
                </p>
              )}

              {salon.openingHours && salon.openingHours.length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-[#1b0d14]/60 mb-1">Hours:</p>
                  <p className="text-sm text-[#1b0d14]/70">{salon.openingHours[0]}</p>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-[#ee2b8c]/10">
                <span className="text-[#ee2b8c] text-sm font-medium group-hover:underline">
                  View Details →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SEO Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
            Best Nail Salons in {formattedCity}, {formattedState}
          </h2>
          <div className="prose prose-lg text-[#1b0d14]/70">
            <p>
              Find the perfect nail salon in {formattedCity}, {formattedState}. Our directory 
              features top-rated salons offering a wide range of services including manicures, 
              pedicures, nail art, gel polish, and more. Each salon listing includes detailed 
              information to help you make the best choice.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

