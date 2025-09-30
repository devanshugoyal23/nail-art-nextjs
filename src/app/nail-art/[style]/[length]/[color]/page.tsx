import { Metadata } from 'next';
import Link from 'next/link';
import { NAIL_ART_DESIGNS } from '@/lib/constants';

interface SEOPageProps {
  params: {
    style: string;
    length: string;
    color: string;
  };
}

const capitalize = (s?: string) => (s ? s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : '');

export async function generateMetadata({ params }: SEOPageProps): Promise<Metadata> {
  const { style, length, color } = params;
  const h1 = `${capitalize(style)} ${capitalize(length)} ${capitalize(color)} Nail Art`;
  const description = `Explore ${h1}. Curated designs with real photos, prompts, and a virtual try-on.`;

  return {
    title: `${h1} | AI Nail Art Studio`,
    description,
    openGraph: {
      title: h1,
      description,
    },
  };
}

export default function SEOPage({ params }: SEOPageProps) {
  const { style, length, color } = params;
  const h1 = `${capitalize(style)} ${capitalize(length)} ${capitalize(color)} Nail Art`;
  const description = `Explore ${h1}. Curated designs with real photos, prompts, and a virtual try-on.`;

  // Filter designs based on parameters (you can enhance this logic)
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
        <h2 className="text-lg font-semibold text-gray-200 mb-3">Discover more</h2>
        <div className="flex flex-wrap gap-2">
          {['almond','coffin','square','oval','stiletto'].map(s => (
            <Link key={s} href={`/nail-art/${s}`} className="px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700">
              {capitalize(s)} Nails
            </Link>
          ))}
          {['short','medium','long'].map(l => (
            <Link key={l} href={`/nail-art/${style}/${l}`} className="px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700">
              {capitalize(l)} Length
            </Link>
          ))}
          {['milky-white','baby-pink','chrome-silver','emerald-green','black'].map(c => (
            <Link key={c} href={`/nail-art/${style}/${length}/${c}`} className="px-3 py-1 bg-gray-800 rounded-full hover:bg-gray-700">
              {capitalize(c)}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
