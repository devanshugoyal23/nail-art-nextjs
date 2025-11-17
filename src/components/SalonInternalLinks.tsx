import Link from 'next/link';
import { NailSalon, generateSlug } from '@/lib/nailSalonService';
import {
  CityGroup,
  getPriceLevelText,
} from '@/lib/salonInternalLinking';

interface NearbyCitiesSectionProps {
  nearbyCities: CityGroup[];
  currentState: string;
  currentStateSlug: string;
}

export function NearbyCitiesSection({ nearbyCities, currentState, currentStateSlug }: NearbyCitiesSectionProps) {
  if (nearbyCities.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
      <h2 className="text-xl font-bold text-[#1b0d14] mb-2 flex items-center gap-2">
        <span>🗺️</span>
        <span>Nearby Cities</span>
      </h2>
      <p className="text-sm text-[#1b0d14]/60 mb-4">
        Explore nail salons in cities near you
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {nearbyCities.map((cityGroup) => (
          <Link
            key={cityGroup.citySlug}
            href={`/nail-salons/${currentStateSlug}/${cityGroup.citySlug}`}
            className="block p-4 rounded-lg border border-[#ee2b8c]/20 hover:border-[#ee2b8c]/40 hover:bg-[#f8f6f7] transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
                {cityGroup.city}, {currentState}
              </h3>
              <span className="text-xs text-[#1b0d14]/50 whitespace-nowrap ml-2">
                {cityGroup.distance} mi
              </span>
            </div>
            <div className="space-y-1">
              {cityGroup.topRated && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-sm text-[#1b0d14]/70">
                    {cityGroup.topRated.name.length > 30
                      ? cityGroup.topRated.name.substring(0, 30) + '...'
                      : cityGroup.topRated.name
                    }
                  </span>
                </div>
              )}
              <p className="text-xs text-[#1b0d14]/50">
                {cityGroup.salons.length} {cityGroup.salons.length === 1 ? 'salon' : 'salons'} available
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface SimilarQualitySalonsSectionProps {
  salons: NailSalon[];
  currentState: string;
  currentStateSlug: string;
}

export function SimilarQualitySalonsSection({
  salons,
  currentState,
  currentStateSlug
}: SimilarQualitySalonsSectionProps) {
  if (salons.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
      <h2 className="text-xl font-bold text-[#1b0d14] mb-2 flex items-center gap-2">
        <span>⭐</span>
        <span>Similar Quality Salons in {currentState}</span>
      </h2>
      <p className="text-sm text-[#1b0d14]/60 mb-4">
        Other highly-rated salons you might like
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {salons.map((salon) => {
          const citySlug = salon.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const salonSlug = generateSlug(salon.name);

          return (
            <Link
              key={`${citySlug}-${salonSlug}`}
              href={`/nail-salons/${currentStateSlug}/${citySlug}/${salonSlug}`}
              className="block p-4 rounded-lg border border-[#ee2b8c]/20 hover:border-[#ee2b8c]/40 hover:bg-[#f8f6f7] transition-all duration-300"
            >
              <h3 className="font-semibold text-[#1b0d14] mb-1 hover:text-[#ee2b8c] transition-colors line-clamp-1">
                {salon.name}
              </h3>
              <p className="text-xs text-[#1b0d14]/60 mb-2 line-clamp-1">
                {salon.city}, {currentState}
              </p>
              {salon.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-sm font-semibold text-[#1b0d14]">{salon.rating}</span>
                  {salon.reviewCount && (
                    <span className="text-xs text-[#1b0d14]/50">
                      ({salon.reviewCount})
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface PriceLevelSalonsSectionProps {
  salons: NailSalon[];
  priceLevel: string;
  currentState: string;
  currentStateSlug: string;
}

export function PriceLevelSalonsSection({
  salons,
  priceLevel,
  currentState,
  currentStateSlug
}: PriceLevelSalonsSectionProps) {
  if (salons.length === 0) return null;

  const priceLevelText = getPriceLevelText(priceLevel);
  const priceEmoji = priceLevel === 'INEXPENSIVE' ? '💰' : priceLevel === 'MODERATE' ? '💰💰' : priceLevel === 'EXPENSIVE' ? '💰💰💰' : '💰💰💰💰';

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
      <h2 className="text-xl font-bold text-[#1b0d14] mb-2 flex items-center gap-2">
        <span>{priceEmoji}</span>
        <span>{priceLevelText} Options in {currentState}</span>
      </h2>
      <p className="text-sm text-[#1b0d14]/60 mb-4">
        More salons with similar pricing
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {salons.map((salon) => {
          const citySlug = salon.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const salonSlug = generateSlug(salon.name);

          return (
            <Link
              key={`${citySlug}-${salonSlug}`}
              href={`/nail-salons/${currentStateSlug}/${citySlug}/${salonSlug}`}
              className="block p-4 rounded-lg border border-[#ee2b8c]/20 hover:border-[#ee2b8c]/40 hover:bg-[#f8f6f7] transition-all duration-300"
            >
              <h3 className="font-semibold text-[#1b0d14] mb-1 hover:text-[#ee2b8c] transition-colors line-clamp-1">
                {salon.name}
              </h3>
              <p className="text-xs text-[#1b0d14]/60 mb-2 line-clamp-1">
                {salon.city}, {currentState}
              </p>
              <div className="flex items-center justify-between">
                {salon.rating && (
                  <div className="flex items-center gap-2">
                    <span className="text-yellow-500 text-sm">⭐</span>
                    <span className="text-sm font-semibold text-[#1b0d14]">{salon.rating}</span>
                  </div>
                )}
                <span className="text-xs text-blue-600 font-medium">{priceEmoji}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface TopRatedSalonsSectionProps {
  salons: NailSalon[];
  currentState: string;
  currentStateSlug: string;
}

export function TopRatedSalonsSection({
  salons,
  currentState,
  currentStateSlug
}: TopRatedSalonsSectionProps) {
  if (salons.length === 0) return null;

  return (
    <div className="bg-white rounded-xl p-6 ring-1 ring-[#ee2b8c]/15 shadow-sm">
      <h2 className="text-xl font-bold text-[#1b0d14] mb-2 flex items-center gap-2">
        <span>🏆</span>
        <span>Top-Rated Salons in {currentState}</span>
      </h2>
      <p className="text-sm text-[#1b0d14]/60 mb-4">
        The best-reviewed nail salons across the state
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {salons.map((salon) => {
          const citySlug = salon.city.toLowerCase().replace(/[^a-z0-9]+/g, '-');
          const salonSlug = generateSlug(salon.name);

          return (
            <Link
              key={`${citySlug}-${salonSlug}`}
              href={`/nail-salons/${currentStateSlug}/${citySlug}/${salonSlug}`}
              className="block p-4 rounded-lg border border-[#ee2b8c]/20 hover:border-[#ee2b8c]/40 hover:bg-[#f8f6f7] transition-all duration-300 group"
            >
              <h3 className="font-semibold text-[#1b0d14] mb-1 group-hover:text-[#ee2b8c] transition-colors line-clamp-2 min-h-[2.5rem]">
                {salon.name}
              </h3>
              <p className="text-xs text-[#1b0d14]/60 mb-2 line-clamp-1">
                {salon.city}
              </p>
              {salon.rating && (
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-sm font-bold text-[#1b0d14]">{salon.rating}</span>
                  {salon.reviewCount && (
                    <span className="text-xs text-[#1b0d14]/50">
                      ({salon.reviewCount})
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

interface ExploreMoreLinksSectionProps {
  currentState: string;
  currentStateSlug: string;
  currentCity: string;
  currentCitySlug: string;
}

export function ExploreMoreLinksSection({
  currentState,
  currentStateSlug,
  currentCity,
  currentCitySlug,
}: ExploreMoreLinksSectionProps) {
  return (
    <div className="bg-gradient-to-r from-[#ee2b8c]/5 to-[#ee2b8c]/10 rounded-xl p-6 ring-1 ring-[#ee2b8c]/20">
      <h2 className="text-lg font-bold text-[#1b0d14] mb-4 flex items-center gap-2">
        <span>🔍</span>
        <span>Explore More</span>
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Link
          href={`/nail-salons/${currentStateSlug}/${currentCitySlug}`}
          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all group"
        >
          <span className="text-2xl">🏙️</span>
          <div>
            <p className="text-sm font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
              All {currentCity} Salons
            </p>
            <p className="text-xs text-[#1b0d14]/60">Browse complete directory</p>
          </div>
        </Link>
        <Link
          href={`/nail-salons/${currentStateSlug}`}
          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all group"
        >
          <span className="text-2xl">📍</span>
          <div>
            <p className="text-sm font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
              {currentState} Cities
            </p>
            <p className="text-xs text-[#1b0d14]/60">View all locations</p>
          </div>
        </Link>
        <Link
          href="/nail-art-gallery"
          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all group"
        >
          <span className="text-2xl">🎨</span>
          <div>
            <p className="text-sm font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
              Design Gallery
            </p>
            <p className="text-xs text-[#1b0d14]/60">Get inspiration</p>
          </div>
        </Link>
        <Link
          href="/nail-salons"
          className="flex items-center gap-3 p-3 bg-white rounded-lg hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all group"
        >
          <span className="text-2xl">🗺️</span>
          <div>
            <p className="text-sm font-semibold text-[#1b0d14] group-hover:text-[#ee2b8c] transition-colors">
              All States
            </p>
            <p className="text-xs text-[#1b0d14]/60">Find salons nationwide</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
