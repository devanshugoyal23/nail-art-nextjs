import { Metadata } from 'next';
import Link from 'next/link';
import { NAIL_ART_DESIGNS } from '@/lib/constants';

interface OccasionPageProps {
  params: {
    occasion: string;
  };
}

const capitalize = (s?: string) => (s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');

export async function generateMetadata({ params }: OccasionPageProps): Promise<Metadata> {
  const { occasion } = params;
  const h1 = `${capitalize(occasion)} Nail Art Ideas`;
  const description = `Perfect ${occasion} nail art designs. Find the ideal manicure for your special occasion.`;

  return {
    title: `${h1} | AI Nail Art Studio`,
    description,
    openGraph: {
      title: h1,
      description,
    },
  };
}

export default function OccasionPage({ params }: OccasionPageProps) {
  const { occasion } = params;
  const h1 = `${capitalize(occasion)} Nail Art Ideas`;
  const description = `Perfect ${occasion} nail art designs. Find the ideal manicure for your special occasion.`;

  // Filter designs based on occasion
  const filtered = NAIL_ART_DESIGNS.filter(() => {
    // Add your filtering logic here based on design tags or categories
    return true; // For now, show all designs
  }).slice(0, 24);

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">{h1}</h1>
      <p className="text-center text-gray-400 mb-10">{description}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filtered.map(d => (
          <Link key={d.id} href={`/designs/${d.id}`} className="bg-gray-800 rounded-lg overflow-hidden hover:opacity-95">
            <img src={d.image} alt={d.name} loading="lazy" className="w-full h-56 object-cover" />
            <div className="p-3">
              <div className="text-sm text-indigo-400">{d.category}</div>
              <div className="font-semibold">{d.name}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-sm text-gray-400">
        <h2 className="text-lg font-semibold text-gray-200 mb-3">More occasions</h2>
        <div className="flex flex-wrap gap-2">
          {['wedding','prom','graduation','birthday','date-night'].map(occ => (
            <Link key={occ} href={`/nail-art/occasion/${occ}`} className="px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700">
              {capitalize(occ)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
