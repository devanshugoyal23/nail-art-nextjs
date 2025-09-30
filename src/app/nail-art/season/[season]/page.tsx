import { Metadata } from 'next';
import Link from 'next/link';
import { NAIL_ART_DESIGNS } from '@/lib/constants';

interface SeasonPageProps {
  params: {
    season: string;
  };
}

const capitalize = (s?: string) => (s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');

export async function generateMetadata({ params }: SeasonPageProps): Promise<Metadata> {
  const { season } = params;
  const h1 = `${capitalize(season)} Nail Art Ideas`;
  const description = `Beautiful ${season} nail art designs. Get inspired by seasonal colors and themes.`;

  return {
    title: `${h1} | AI Nail Art Studio`,
    description,
    openGraph: {
      title: h1,
      description,
    },
  };
}

export default function SeasonPage({ params }: SeasonPageProps) {
  const { season } = params;
  const h1 = `${capitalize(season)} Nail Art Ideas`;
  const description = `Beautiful ${season} nail art designs. Get inspired by seasonal colors and themes.`;

  // Filter designs based on season
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
        <h2 className="text-lg font-semibold text-gray-200 mb-3">All seasons</h2>
        <div className="flex flex-wrap gap-2">
          {['spring','summer','autumn','winter','christmas','halloween'].map(seas => (
            <Link key={seas} href={`/nail-art/season/${seas}`} className="px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700">
              {capitalize(seas)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
