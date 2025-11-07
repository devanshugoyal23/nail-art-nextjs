import { NailSalon } from '@/lib/nailSalonService';

interface SalonStructuredDataProps {
  salon: NailSalon;
  salonDetails: { description?: string; faq?: Array<{ question: string; answer: string }>; [key: string]: unknown };
  stateSlug: string;
  citySlug: string;
  slug: string;
}

export function SalonStructuredData({ 
  salon, 
  salonDetails, 
  stateSlug, 
  citySlug, 
  slug 
}: SalonStructuredDataProps) {
  // Parse opening hours for schema
  const parseOpeningHours = (hours?: string[]): Array<{ '@type': string; dayOfWeek: string; opens?: string; closes?: string }> => {
    if (!hours || hours.length === 0) return [];
    
    const dayMap: { [key: string]: string } = {
      'monday': 'Monday',
      'tuesday': 'Tuesday',
      'wednesday': 'Wednesday',
      'thursday': 'Thursday',
      'friday': 'Friday',
      'saturday': 'Saturday',
      'sunday': 'Sunday'
    };

    return hours.map(hourStr => {
      // Format: "Monday: 9:00 AM – 7:00 PM" or "Monday: Closed"
      const match = hourStr.match(/^([^:]+):\s*(.+)$/);
      if (!match) return null;

      const dayName = match[1].trim().toLowerCase();
      const timeStr = match[2].trim();
      
      // Find matching day
      const day = Object.keys(dayMap).find(d => dayName.includes(d));
      if (!day || timeStr.toLowerCase().includes('closed')) return null;

      // Parse time (e.g., "9:00 AM – 7:00 PM")
      const timeMatch = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)\s*[–-]\s*(\d{1,2}):(\d{2})\s*(AM|PM)/);
      if (!timeMatch) return null;

      // Convert opening time to 24-hour format
      let openHour = parseInt(timeMatch[1]);
      if (timeMatch[3] === 'PM' && openHour !== 12) openHour += 12;
      if (timeMatch[3] === 'AM' && openHour === 12) openHour = 0;
      const opens = `${openHour.toString().padStart(2, '0')}:${timeMatch[2]}`;

      // Convert closing time to 24-hour format
      let closeHour = parseInt(timeMatch[4]);
      if (timeMatch[6] === 'PM' && closeHour !== 12) closeHour += 12;
      if (timeMatch[6] === 'AM' && closeHour === 12) closeHour = 0;
      const closes = `${closeHour.toString().padStart(2, '0')}:${timeMatch[5]}`;

      return {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": dayMap[day],
        "opens": opens,
        "closes": closes
      };
    }).filter((hour): hour is { '@type': string; dayOfWeek: string; opens: string; closes: string } => hour !== null);
  };

  // Get price range
  const getPriceRange = (): string | undefined => {
    if (!salon.priceLevel) return undefined;
    switch (salon.priceLevel) {
      case 'INEXPENSIVE': return '$';
      case 'MODERATE': return '$$';
      case 'EXPENSIVE': return '$$$';
      case 'VERY_EXPENSIVE': return '$$$$';
      default: return undefined;
    }
  };

  // Build address object
  const address = salon.address ? {
    "@type": "PostalAddress",
    "streetAddress": salon.address.split(',')[0] || salon.address,
    "addressLocality": salon.city,
    "addressRegion": salon.state,
    "addressCountry": "US"
  } : undefined;

  // Build geo coordinates if available
  const geo = (salon.latitude && salon.longitude) ? {
    "@type": "GeoCoordinates",
    "latitude": salon.latitude.toString(),
    "longitude": salon.longitude.toString()
  } : undefined;

  // Build aggregate rating
  const aggregateRating = salon.rating ? {
    "@type": "AggregateRating",
    "ratingValue": salon.rating.toString(),
    "reviewCount": (salon.reviewCount || 0).toString(),
    "bestRating": "5",
    "worstRating": "1"
  } : undefined;

  // Filter valid photos (with non-empty URLs)
  const validPhotos = salon.photos?.filter(photo => photo.url && photo.url.trim() !== '') || [];

  // Main LocalBusiness schema
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "BeautySalon",
    "name": salon.name,
    "image": validPhotos.length > 0 ? validPhotos[0].url : undefined,
    "address": address,
    "geo": geo,
    "url": salon.website || `https://nailartai.app/nail-salons/${stateSlug}/${citySlug}/${slug}`,
    "telephone": salon.phone,
    "priceRange": getPriceRange(),
    "openingHoursSpecification": parseOpeningHours(salon.openingHours || salon.currentOpeningHours?.weekdayDescriptions),
    "aggregateRating": aggregateRating,
    "description": salonDetails?.description || salonDetails?.placeSummary || `${salon.name} is a professional nail salon located in ${salon.city}, ${salon.state}.`
  };

  // Remove undefined fields
  Object.keys(localBusinessSchema).forEach(key => {
    if (localBusinessSchema[key as keyof typeof localBusinessSchema] === undefined) {
      delete localBusinessSchema[key as keyof typeof localBusinessSchema];
    }
  });

  // Build breadcrumb schema
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Nail Salons",
        "item": "https://nailartai.app/nail-salons"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": salon.state,
        "item": `https://nailartai.app/nail-salons/${stateSlug}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": salon.city,
        "item": `https://nailartai.app/nail-salons/${stateSlug}/${citySlug}`
      },
      {
        "@type": "ListItem",
        "position": 4,
        "name": salon.name,
        "item": `https://nailartai.app/nail-salons/${stateSlug}/${citySlug}/${slug}`
      }
    ]
  };

  // Build review schemas (up to 5 reviews)
  const reviewSchemas = (salonDetails?.placeReviews as Array<{ rating?: number; text?: string; authorName?: string; publishTime?: string }> | undefined)?.slice(0, 5).map((review: { rating?: number; text?: string; authorName?: string; publishTime?: string }) => ({
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "BeautySalon",
      "name": salon.name
    },
    "reviewRating": review.rating ? {
      "@type": "Rating",
      "ratingValue": review.rating.toString(),
      "bestRating": "5",
      "worstRating": "1"
    } : undefined,
    "author": review.authorName ? {
      "@type": "Person",
      "name": review.authorName
    } : undefined,
    "reviewBody": review.text || undefined,
    "datePublished": review.publishTime || undefined
  })).filter((review) => review.reviewBody || review.reviewRating) || [];

  // Build ImageObject schemas for salon photos (only valid photos with URLs)
  const imageSchemas = validPhotos.length > 0 
    ? validPhotos.slice(0, 6).map((photo: { url: string; name?: string; authorAttributions?: Array<{ displayName?: string; uri?: string }> }, index: number) => {
        const photoTypes = ['exterior', 'interior', 'service area', 'nail art station', 'waiting area', 'treatment room'];
        const photoType = photoTypes[index] || 'interior';
        
        return {
          "@context": "https://schema.org",
          "@type": "ImageObject",
          "contentUrl": photo.url,
          "description": `${salon.name} nail salon ${photoType} in ${salon.city}, ${salon.state}`,
          "name": `${salon.name} - ${photoType}`,
          "license": "https://creativecommons.org/licenses/by/4.0/",
          "creator": photo.authorAttributions?.[0]?.displayName ? {
            "@type": "Person",
            "name": photo.authorAttributions[0].displayName
          } : undefined
        };
      })
    : [];

  return (
    <>
      {/* LocalBusiness Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
      />
      
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* Review Schemas */}
      {reviewSchemas.map((review: object, index: number) => (
        <script
          key={`review-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(review) }}
        />
      ))}
      
      {/* ImageObject Schemas */}
      {imageSchemas.map((image: object, index: number) => (
        <script
          key={`image-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(image) }}
        />
      ))}
    </>
  );
}

