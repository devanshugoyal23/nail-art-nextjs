import { notFound } from "next/navigation";
import Link from "next/link";
import { NAIL_ART_DESIGNS } from "@/lib/constants";
import { Metadata } from "next";

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
          <img src={design.image} alt={design.name} className="w-full h-auto object-cover rounded-lg shadow-md" />
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
       <div className="text-center mt-8">
        <Link href="/designs" className="text-indigo-400 hover:text-indigo-300 transition-colors">
          &larr; Back to all designs
        </Link>
      </div>
    </div>
  );
}
