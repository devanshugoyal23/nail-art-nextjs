import { NAIL_ART_DESIGNS } from "@/lib/constants";
import NailArtCard from "@/components/NailArtCard";

export default function DesignsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mb-8">Nail Art Design Gallery</h1>
      <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
        Browse our curated collection of stunning nail art designs. Click on any design to learn more and try it on virtually.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {NAIL_ART_DESIGNS.map(design => (
          <NailArtCard key={design.id} design={design} />
        ))}
      </div>
    </div>
  );
}



