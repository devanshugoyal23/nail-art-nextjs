import { Metadata } from 'next';
import Link from 'next/link';
import { getAllStatesWithSalons, generateStateSlug } from '@/lib/nailSalonService';

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
  },
};

export default async function NailSalonsPage() {
  const states = await getAllStatesWithSalons();

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {states.map((state) => (
            <Link
              key={state.code}
              href={`/nail-salons/${generateStateSlug(state.name)}`}
              className="group bg-white rounded-xl p-6 text-center ring-1 ring-[#ee2b8c]/15 hover:ring-[#ee2b8c]/30 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="text-3xl mb-2">💅</div>
              <h3 className="font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors mb-1">
                {state.name}
              </h3>
              <p className="text-sm text-[#1b0d14]/60">{state.code}</p>
              {state.salonCount > 0 && (
                <p className="text-xs text-[#ee2b8c] mt-2">
                  {state.salonCount} salons
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
            Find the Perfect Nail Salon
          </h2>
          <div className="prose prose-lg text-[#1b0d14]/70">
            <p>
              Whether you're looking for a quick manicure, a luxurious spa experience, or 
              intricate nail art designs, our comprehensive directory helps you find the best 
              nail salons in your area. Browse by state to discover top-rated salons with 
              detailed information including ratings, reviews, contact details, and more.
            </p>
            <h3 className="text-xl font-bold text-[#1b0d14] mt-6 mb-3">
              What to Look For in a Nail Salon
            </h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Professional licensing and certification</li>
              <li>High ratings and positive customer reviews</li>
              <li>Clean, sanitized workspace</li>
              <li>Wide range of services (manicure, pedicure, nail art, etc.)</li>
              <li>Convenient location and hours</li>
              <li>Quality products and tools</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

