
import React from 'react';
import { NailArtDesign } from '@/lib/types';
import Link from 'next/link';

interface NailArtCardProps {
  design: NailArtDesign;
}

const NailArtCard: React.FC<NailArtCardProps> = ({ design }) => {
  return (
    <Link href={`/designs/${design.id}`} className="block group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-indigo-500/50 transition-all duration-300 transform hover:-translate-y-1">
      <div className="relative">
        <img src={design.image} alt={design.name} className="w-full h-56 object-cover" />
        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-opacity duration-300"></div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-indigo-400 transition-colors duration-300">{design.name}</h3>
        <p className="text-sm text-gray-400 mt-1">{design.category}</p>
      </div>
    </Link>
  );
};

export default NailArtCard;
