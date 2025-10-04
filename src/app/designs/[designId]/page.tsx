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
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg shadow-xl p-8 flex flex-col md:flex-row gap-8">
        <div className="md:w-1/2">
          <Image src={design.image} alt={design.name} width={600} height={400} className="w-full h-auto object-cover rounded-lg shadow-md" />
        </div>
        <div className="md:w-1/2 flex flex-col">
          <div>
            <span className="text-indigo-400 font-semibold mb-2">{design.category}</span>
            <h1 className="text-4xl font-bold mb-4">{design.name}</h1>
            <p className="text-gray-300 mb-6">{design.description}</p>

            {/* AI Prompt Display */}
            <div className="mb-8">
              <h4 className="text-sm font-semibold text-gray-400 mb-2">AI Generation Prompt</h4>
              <p className="text-sm text-indigo-200 bg-gray-900/50 p-3 rounded-md font-mono italic border border-gray-700">
                &ldquo;{design.prompt}&rdquo;
              </p>
            </div>
          </div>
          
          <div className="mt-auto">
            <Link
              href={`/try-on?design=${design.id}`}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 duration-300 shadow-lg shadow-indigo-500/50 text-center block"
            >
              Try This Design
            </Link>
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
