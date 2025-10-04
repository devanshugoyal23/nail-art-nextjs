import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { NAIL_ART_DESIGNS } from "@/lib/constants";
import { Metadata } from "next";
import TagCollection from "@/components/TagCollection";

interface DesignDetailPageProps {
  params: {
    designId: string;
  };
}

export async function generateMetadata({ params }: DesignDetailPageProps): Promise<Metadata> {
  const design = NAIL_ART_DESIGNS.find(d => d.id === params.designId);
  
  if (!design) {
    return {
      title: "Design Not Found",
    };
  }

  return {
    title: `${design.name} | AI Nail Art Studio`,
    description: design.description,
    openGraph: {
      title: design.name,
      description: design.description,
      images: [design.image],
    },
  };
}

export default function DesignDetailPage({ params }: DesignDetailPageProps) {
  const design = NAIL_ART_DESIGNS.find(d => d.id === params.designId);

  if (!design) {
    notFound();
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <Image src={design.image} alt={design.name} width={600} height={500} className="w-full h-[500px] object-cover rounded-lg shadow-md" />
        </div>
        <div className="md:w-1/2 flex flex-col">
          <div>
            <span className="text-indigo-400 font-semibold mb-2">{design.category}</span>
            <h1 className="text-4xl font-bold mb-4">{design.name}</h1>
            <p className="text-gray-300 mb-6">{design.description}</p>

            {/* Enhanced Metadata Sections */}
            <div className="mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-indigo-500/30 transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
                    <h4 className="text-sm font-semibold text-indigo-300">Category</h4>
                  </div>
                  <span className="bg-indigo-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                    {design.category}
                  </span>
                </div>
                
                {/* Style/Type */}
                <div className="bg-gray-800/40 rounded-lg p-4 border border-gray-700/50 hover:border-purple-500/30 transition-colors">
                  <div className="flex items-center mb-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
                    <h4 className="text-sm font-semibold text-purple-300">Style</h4>
                  </div>
                  <span className="bg-purple-600/80 text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-sm">
                    {design.category === 'Abstract' ? 'Artistic' : 
                     design.category === 'Minimalist' ? 'Clean & Simple' :
                     design.category === 'Modern' ? 'Contemporary' : 'Classic'}
                  </span>
                </div>
              </div>
            </div>

          </div>
          
          <div className="mt-auto">
            <div className="flex gap-3">
              <Link
                href={`/try-on?design=${design.id}`}
                className="flex-1 bg-purple-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-purple-700 transition-colors duration-200 text-center"
              >
                Try This Design Virtually
              </Link>
              <a
                href={design.image}
                download={`${design.name.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                className="flex-1 bg-green-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-700 transition-colors duration-200 text-center"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Explore Similar Designs</h2>
        
        {/* Design-Specific Tags */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TagCollection
            title="Colors in this Design"
            tags={[
              { label: 'Red', value: 'red', type: 'color' },
              { label: 'White', value: 'white', type: 'color' },
              { label: 'Gold', value: 'gold', type: 'color' },
              { label: 'Silver', value: 'silver', type: 'color' }
            ]}
            variant="color"
            size="md"
          />
          <TagCollection
            title="Techniques Used"
            tags={[
              { label: 'French Manicure', value: 'french-manicure', type: 'technique' },
              { label: 'Stamping', value: 'stamping', type: 'technique' },
              { label: 'Glitter', value: 'glitter', type: 'technique' }
            ]}
            variant="technique"
            size="md"
          />
          <TagCollection
            title="Perfect For"
            tags={[
              { label: 'Christmas', value: 'christmas', type: 'occasion' },
              { label: 'Holiday', value: 'holiday', type: 'occasion' },
              { label: 'Winter', value: 'winter', type: 'season' },
              { label: 'Party', value: 'party', type: 'occasion' }
            ]}
            variant="occasion"
            size="md"
          />
        </div>
        
        {/* Additional Related Tags */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">More Categories to Explore</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TagCollection
              title="Popular Colors"
              tags={[
                { label: 'Red', value: 'red', type: 'color' },
                { label: 'Blue', value: 'blue', type: 'color' },
                { label: 'Green', value: 'green', type: 'color' },
                { label: 'Purple', value: 'purple', type: 'color' },
                { label: 'Black', value: 'black', type: 'color' },
                { label: 'White', value: 'white', type: 'color' },
                { label: 'Pink', value: 'pink', type: 'color' },
                { label: 'Gold', value: 'gold', type: 'color' }
              ]}
              variant="color"
              size="sm"
            />
            <TagCollection
              title="Popular Techniques"
              tags={[
                { label: 'French Manicure', value: 'french-manicure', type: 'technique' },
                { label: 'Ombre', value: 'ombre', type: 'technique' },
                { label: 'Marble', value: 'marble', type: 'technique' },
                { label: 'Glitter', value: 'glitter', type: 'technique' },
                { label: 'Chrome', value: 'chrome', type: 'technique' },
                { label: 'Geometric', value: 'geometric', type: 'technique' },
                { label: 'Watercolor', value: 'watercolor', type: 'technique' },
                { label: 'Stamping', value: 'stamping', type: 'technique' }
              ]}
              variant="technique"
              size="sm"
            />
            <TagCollection
              title="Perfect Occasions"
              tags={[
                { label: 'Wedding', value: 'wedding', type: 'occasion' },
                { label: 'Party', value: 'party', type: 'occasion' },
                { label: 'Work', value: 'work', type: 'occasion' },
                { label: 'Date Night', value: 'date-night', type: 'occasion' },
                { label: 'Casual', value: 'casual', type: 'occasion' },
                { label: 'Formal', value: 'formal', type: 'occasion' },
                { label: 'Holiday', value: 'holiday', type: 'occasion' },
                { label: 'Summer', value: 'summer', type: 'occasion' }
              ]}
              variant="occasion"
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <Link href="/designs" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          &larr; Back to all designs
        </Link>
      </div>
    </div>
  );
}
