/**
 * Types for Salon Data Enrichment System
 *
 * Two-tier storage approach:
 * 1. Raw data from Google Maps API (stored for reuse)
 * 2. Enriched data processed by Gemini (ready for display)
 */

// ========================================
// RAW DATA FROM GOOGLE MAPS API
// ========================================

export interface RawPlaceDetails {
  placeId: string;
  name: string;
  formattedAddress?: string;
  formattedPhoneNumber?: string;
  internationalPhoneNumber?: string;
  website?: string;
  rating?: number;
  userRatingsTotal?: number;
  priceLevel?: number;
  businessStatus?: string;
  openingHours?: {
    weekdayText?: string[];
    periods?: Array<{
      open: { day: number; time: string };
      close: { day: number; time: string };
    }>;
  };
  reviews?: Array<{
    authorName: string;
    authorUrl?: string;
    language?: string;
    profilePhotoUrl?: string;
    rating: number;
    relativeTimeDescription: string;
    text: string;
    time: number;
  }>;
  types?: string[];
  geometry?: {
    location: { lat: number; lng: number };
    viewport?: {
      northeast: { lat: number; lng: number };
      southwest: { lat: number; lng: number };
    };
  };
  addressComponents?: Array<{
    longName: string;
    shortName: string;
    types: string[];
  }>;
  utcOffset?: number;
  adrAddress?: string;
  vicinity?: string;
  permanentlyClosed?: boolean;
  plusCode?: {
    compoundCode?: string;
    globalCode?: string;
  };
}

export interface RawNearbyPlace {
  placeId: string;
  name: string;
  types: string[];
  vicinity?: string;
  rating?: number;
  userRatingsTotal?: number;
  geometry: {
    location: { lat: number; lng: number };
  };
  priceLevel?: number;
  openingHours?: {
    openNow?: boolean;
  };
  distance?: number; // Calculated distance in meters
}

export interface RawPopularTimes {
  popularTimes?: Array<{
    day: number; // 0 = Sunday, 1 = Monday, etc.
    data: number[]; // 24 hours, 0-100 for each hour
  }>;
  currentPopularity?: number;
  timeSpent?: Array<{ min: number; max: number }>;
}

export interface RawSalonData {
  placeId: string;
  fetchedAt: string; // ISO timestamp
  ttl: number; // Time to live in seconds (default 30 days)

  // Core place details
  placeDetails: RawPlaceDetails;

  // Nearby places (competitors, parking, transit)
  nearby: {
    competitors?: RawNearbyPlace[]; // Other nail salons within 1km
    parking?: RawNearbyPlace[]; // Parking lots/garages within 500m
    transit?: RawNearbyPlace[]; // Bus stops, subway stations within 500m
    restaurants?: RawNearbyPlace[]; // Restaurants within 500m
    shopping?: RawNearbyPlace[]; // Shopping centers within 500m
  };

  // Popular times data (if available)
  popularTimes?: RawPopularTimes;
}

// ========================================
// ENRICHED DATA PROCESSED BY GEMINI
// ========================================

export interface EnrichedSection {
  title: string;
  content: string; // HTML or markdown
  wordCount: number;
  generatedAt: string; // ISO timestamp
}

export interface ServiceDetail {
  name: string;
  description: string;
  estimatedPrice?: string;
  duration?: string;
  popularity?: 'high' | 'medium' | 'low';
}

export interface StaffMember {
  name: string;
  role?: string;
  specialties: string[];
  description: string;
  reviewMentions: number;
}

export interface BestTimeToVisit {
  period: string; // e.g., "Monday 10am-12pm"
  crowdLevel: 'low' | 'medium' | 'high';
  reason: string;
  waitTime?: string;
}

export interface ParkingOption {
  type: 'street' | 'lot' | 'garage' | 'private';
  name?: string;
  distance?: string;
  cost?: string;
  notes?: string;
  placeId?: string;
}

export interface NearbyAmenity {
  name: string;
  type: string;
  distance: string;
  description?: string;
  placeId?: string;
  rating?: number;
}

export interface ReviewInsight {
  category: string; // e.g., "Cleanliness", "Service Quality", "Value for Money"
  sentiment: 'positive' | 'neutral' | 'negative';
  score: number; // 0-100
  keyPhrases: string[];
  exampleQuotes: string[];
}

export interface FAQItem {
  question: string;
  answer: string;
  source: 'reviews' | 'gemini' | 'inferred';
}

export interface DesignRecommendation {
  designId: string;
  designName: string;
  designSlug: string;
  category: string;
  imageUrl: string;
  reason: string; // Why this design is recommended for this salon
  matchScore: number; // 0-100
}

export interface EnrichedSalonData {
  placeId: string;
  enrichedAt: string; // ISO timestamp
  version: string; // Versioning for cache invalidation
  ttl: number; // Time to live in seconds

  // Source reviews used to generate this content (for migration from /raw)
  sourceReviews?: Array<{
    authorName: string;
    authorUrl?: string;
    language?: string;
    profilePhotoUrl?: string;
    rating: number;
    relativeTimeDescription: string;
    text: string;
    time: number;
  }>;

  // TIER 1: ESSENTIAL SECTIONS
  sections: {
    // 1. Enhanced About Section (500-750 words)
    about?: EnrichedSection;

    // 2. Real Customer Reviews Display (300-500 words)
    customerReviews?: {
      summary: string;
      totalReviews: number;
      averageRating: number;
      ratingDistribution: { [key: number]: number };
      featuredReviews: Array<{
        authorName: string;
        rating: number;
        text: string;
        date: string;
        helpful?: boolean;
      }>;
      generatedAt: string;
    };

    // 3. Review Insights & Sentiment Analysis (400-600 words)
    reviewInsights?: {
      summary: string;
      overallSentiment: 'positive' | 'neutral' | 'negative';
      insights: ReviewInsight[];
      strengths: string[];
      improvements: string[];
      generatedAt: string;
    };

    // 4. Recommended Nail Designs from Our Gallery (400-600 words)
    recommendedDesigns?: {
      summary: string;
      designs: DesignRecommendation[];
      generatedAt: string;
    };

    // 5. Data-Driven FAQ (400-600 words)
    faq?: {
      summary: string;
      questions: FAQItem[];
      generatedAt: string;
    };

    // TIER 2: HIGH-VALUE SECTIONS

    // 6. Service Breakdown (350-500 words)
    services?: {
      summary: string;
      categories: Array<{
        name: string;
        services: ServiceDetail[];
      }>;
      generatedAt: string;
    };

    // 7. Staff & Expertise Highlights (300-450 words)
    staff?: {
      summary: string;
      teamSize?: string;
      members: StaffMember[];
      generatedAt: string;
    };

    // 8. Best Times to Visit (250-350 words)
    bestTimes?: {
      summary: string;
      recommendations: BestTimeToVisit[];
      busiestTimes: string[];
      quietestTimes: string[];
      generatedAt: string;
    };

    // 9. Parking & Transportation Guide (200-300 words)
    parking?: {
      summary: string;
      options: ParkingOption[];
      transitOptions?: string[];
      generatedAt: string;
    };

    // 10. Nearby Amenities (250-350 words)
    nearbyAmenities?: {
      summary: string;
      amenities: NearbyAmenity[];
      generatedAt: string;
    };

    // 11. Photo Gallery & Virtual Tour (200-300 words)
    photoGallery?: {
      summary: string;
      photos: Array<{
        url: string;
        caption: string;
        category: 'exterior' | 'interior' | 'service' | 'work' | 'team';
      }>;
      generatedAt: string;
    };

    // TIER 3: NICE-TO-HAVE SECTIONS

    // 12. First-Time Visitor Guide (300-400 words)
    firstTimeGuide?: EnrichedSection;

    // 13. Seasonal Nail Art Trends (250-350 words)
    seasonalTrends?: EnrichedSection;

    // 14. Nail Care Tips & Aftercare (300-400 words)
    nailCareTips?: EnrichedSection;

    // 15. Appointment & Walk-in Info (200-300 words)
    appointmentInfo?: EnrichedSection;

    // 16. Pricing Transparency (200-300 words)
    pricingInfo?: EnrichedSection;

    // 17. Safety & Hygiene Practices (250-350 words)
    safetyPractices?: EnrichedSection;

    // 18. Special Events & Promotions (200-300 words)
    specialEvents?: EnrichedSection;

    // 19. Loyalty & Membership Programs (150-250 words)
    loyaltyPrograms?: EnrichedSection;

    // 20. Community Involvement (200-300 words)
    communityInvolvement?: EnrichedSection;
  };

  // Metadata
  metadata: {
    totalWordCount: number;
    sectionsGenerated: number;
    tier1Complete: boolean;
    tier2Complete: boolean;
    tier3Complete: boolean;
    apiCosts: {
      googleMaps: number;
      gemini: number;
      total: number;
    };
    processingTime: number; // milliseconds
  };
}

// ========================================
// HELPER TYPES
// ========================================

export type EnrichmentTier = 'tier1' | 'tier2' | 'tier3' | 'all';

export interface EnrichmentConfig {
  tiers: EnrichmentTier[];
  forceRefresh?: boolean;
  includePopularTimes?: boolean;
  includeNearby?: boolean;
  maxReviews?: number;
  maxDesigns?: number;
}

export interface EnrichmentResult {
  success: boolean;
  placeId: string;
  enrichedData?: EnrichedSalonData;
  rawDataCached: boolean;
  enrichedDataCached: boolean;
  errors?: string[];
  warnings?: string[];
  costs: {
    googleMaps: number;
    gemini: number;
    r2: number;
    total: number;
  };
  timing: {
    fetchRaw: number;
    enrichment: number;
    storage: number;
    total: number;
  };
}
