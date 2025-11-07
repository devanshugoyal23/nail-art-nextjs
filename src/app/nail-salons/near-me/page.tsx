'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Client-side slug generation (same logic as server-side)
function generateStateSlug(state: string): string {
  return state.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function generateCitySlug(city: string): string {
  return city.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function NearMePage() {
  const [userLocation, setUserLocation] = useState<{ state: string; city: string } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nearbySalons, setNearbySalons] = useState<any[]>([]);
  const [popularStates, setPopularStates] = useState<any[]>([]);

  useEffect(() => {
    // Popular states (hardcoded for now, can be fetched from API if needed)
    const popular = [
      { name: 'California', code: 'CA' },
      { name: 'New York', code: 'NY' },
      { name: 'Texas', code: 'TX' },
      { name: 'Florida', code: 'FL' },
      { name: 'Illinois', code: 'IL' },
      { name: 'Pennsylvania', code: 'PA' },
    ];
    setPopularStates(popular);
    setIsLoading(false);

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Reverse geocoding to get state and city
            // Using a free reverse geocoding service
            const response = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            
            if (response.ok) {
              const data = await response.json();
              const state = data.principalSubdivision || data.administrativeArea || '';
              const city = data.city || data.locality || '';
              
              if (state && city) {
                setUserLocation({ state, city });
                
                // Try to fetch salons for the detected city via API
                try {
                  const apiResponse = await fetch(
                    `/api/nail-salons/salons?state=${encodeURIComponent(state)}&city=${encodeURIComponent(city)}&limit=6`
                  );
                  if (apiResponse.ok) {
                    const result = await apiResponse.json();
                    if (result.success && result.data) {
                      setNearbySalons(result.data);
                    }
                  }
                } catch (error) {
                  console.error('Error fetching salons:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error getting location:', error);
            setLocationError('Could not determine your location. Please select a state below.');
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Location access denied. Please select a state below.');
        }
      );
    } else {
      setLocationError('Geolocation is not supported by your browser. Please select a state below.');
    }
  }, []);

  return (
    <div className="min-h-screen bg-[#f8f6f7]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#ee2b8c]/10 to-[#f8f6f7]">
        <div className="relative max-w-7xl mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-[#1b0d14] mb-6">
              Nail Salons Near Me
            </h1>
            <p className="text-xl md:text-2xl text-[#1b0d14]/70 max-w-4xl mx-auto mb-8">
              Find the best nail salons, nail spas, and nail art studios in your area. 
              Browse by location or let us detect your location to show nearby salons.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ee2b8c] mx-auto mb-4"></div>
            <p className="text-[#1b0d14]/70">Detecting your location...</p>
          </div>
        ) : userLocation ? (
          <>
            {/* Detected Location Section */}
            <div className="mb-12 bg-white rounded-xl p-8 ring-1 ring-[#ee2b8c]/15 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-3xl">📍</span>
                <div>
                  <h2 className="text-2xl font-bold text-[#1b0d14]">
                    Salons Near {userLocation.city}, {userLocation.state}
                  </h2>
                  <p className="text-[#1b0d14]/70">
                    We found salons in your area
                  </p>
                </div>
              </div>

              {nearbySalons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                  {nearbySalons.map((salon) => (
                    <Link
                      key={salon.placeId || salon.name}
                      href={`/nail-salons/${generateStateSlug(userLocation.state)}/${generateCitySlug(userLocation.city)}/${salon.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}`}
                      className="bg-[#f8f6f7] rounded-lg p-4 hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all"
                    >
                      <h3 className="font-bold text-lg text-[#1b0d14] mb-2">{salon.name}</h3>
                      <p className="text-sm text-[#1b0d14]/70 mb-2">{salon.address}</p>
                      {salon.rating && (
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-sm font-semibold">{salon.rating}</span>
                          {salon.reviewCount && (
                            <span className="text-sm text-[#1b0d14]/60">
                              ({salon.reviewCount} reviews)
                            </span>
                          )}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="text-[#1b0d14]/70 mb-6">
                  No salons found in {userLocation.city}. Try browsing by state instead.
                </p>
              )}

              <div className="flex gap-4">
                <Link
                  href={`/nail-salons/${generateStateSlug(userLocation.state)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#ee2b8c] text-white rounded-lg hover:bg-[#ee2b8c]/90 transition-colors font-semibold"
                >
                  View All Salons in {userLocation.state}
                  <span>→</span>
                </Link>
                <Link
                  href={`/nail-salons/${generateStateSlug(userLocation.state)}/${generateCitySlug(userLocation.city)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#ee2b8c] text-[#ee2b8c] rounded-lg hover:bg-[#ee2b8c]/5 transition-colors font-semibold"
                >
                  View All in {userLocation.city}
                </Link>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Location Error Message */}
            {locationError && (
              <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                <p className="text-[#1b0d14]/70">{locationError}</p>
              </div>
            )}
          </>
        )}

        {/* Browse by Popular States */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-[#1b0d14] mb-6">
            Browse by Popular States
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {popularStates.map((state) => (
              <Link
                key={state.code}
                href={`/nail-salons/${generateStateSlug(state.name)}`}
                className="bg-white rounded-lg p-4 text-center hover:ring-2 hover:ring-[#ee2b8c]/30 transition-all"
              >
                <div className="text-2xl font-bold text-[#ee2b8c] mb-2">{state.code}</div>
                <div className="text-sm font-semibold text-[#1b0d14]">{state.name}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Browse All States */}
        <div className="bg-white rounded-xl p-8 ring-1 ring-[#ee2b8c]/15 shadow-sm">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
            Can't find your location?
          </h2>
          <p className="text-[#1b0d14]/70 mb-6">
            Browse our comprehensive directory of nail salons by state. We have listings for all 50 US states.
          </p>
          <Link
            href="/nail-salons"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#ee2b8c] text-white rounded-lg hover:bg-[#ee2b8c]/90 transition-colors font-semibold"
          >
            Browse All States
            <span>→</span>
          </Link>
        </div>

        {/* Helpful Tips */}
        <div className="mt-12 bg-gradient-to-br from-[#ee2b8c]/10 to-[#f8f6f7] rounded-xl p-8 ring-1 ring-[#ee2b8c]/15">
          <h2 className="text-2xl font-bold text-[#1b0d14] mb-4">
            Tips for Finding the Best Nail Salon
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-[#1b0d14] mb-2">✓ Check Reviews</h3>
              <p className="text-sm text-[#1b0d14]/70">
                Look for salons with high ratings (4.5+ stars) and read recent customer reviews.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#1b0d14] mb-2">✓ Verify Services</h3>
              <p className="text-sm text-[#1b0d14]/70">
                Make sure the salon offers the services you need (manicure, pedicure, nail art, etc.).
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#1b0d14] mb-2">✓ Check Hours</h3>
              <p className="text-sm text-[#1b0d14]/70">
                Verify opening hours and whether they accept walk-ins or require appointments.
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-[#1b0d14] mb-2">✓ Visit in Person</h3>
              <p className="text-sm text-[#1b0d14]/70">
                If possible, visit the salon beforehand to check cleanliness and atmosphere.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

