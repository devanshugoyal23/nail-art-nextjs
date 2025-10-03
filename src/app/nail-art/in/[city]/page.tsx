import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { NAIL_ART_DESIGNS } from '@/lib/constants';

interface CityPageProps {
  params: {
    city: string;
  };
}

const capitalize = (s?: string) => (s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city } = params;
  const h1 = `Nail Art in ${capitalize(city)}`;
  const description = `Find the best nail art designs and trends in ${capitalize(city)}. Local inspiration and styles.`;

  return {
    title: `${h1} | AI Nail Art Studio`,
    description,
    openGraph: {
      title: h1,
      description,
    },
  };
}

export default function CityPage({ params }: CityPageProps) {
  const { city } = params;
  const h1 = `Nail Art in ${capitalize(city)}`;
  const description = `Find the best nail art designs and trends in ${capitalize(city)}. Local inspiration and styles.`;

  // Filter designs (you can add city-specific logic here)
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
            <Image src={d.image} alt={d.name} width={400} height={224} loading="lazy" className="w-full h-56 object-cover" />
            <div className="p-3">
              <div className="text-sm text-indigo-400">{d.category}</div>
              <div className="font-semibold">{d.name}</div>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 text-sm text-gray-400">
        <h2 className="text-lg font-semibold text-gray-200 mb-3">Other cities</h2>
        <div className="flex flex-wrap gap-2">
          {['new-york','los-angeles','chicago','houston','phoenix','philadelphia','san-antonio','san-diego','dallas','san-jose'].map(c => (
            <Link key={c} href={`/nail-art/in/${c}`} className="px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700">
              {capitalize(c)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
