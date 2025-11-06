interface DirectoryStructuredDataProps {
  type: 'states' | 'state' | 'city';
  stateName?: string;
  cityName?: string;
  stateSlug?: string;
  citySlug?: string;
  itemCount?: number;
}

export function DirectoryStructuredData({ 
  type, 
  stateName, 
  cityName, 
  stateSlug, 
  citySlug,
  itemCount 
}: DirectoryStructuredDataProps) {
  // Build breadcrumb based on type
  const breadcrumbItems = [];
  
  breadcrumbItems.push({
    "@type": "ListItem",
    "position": 1,
    "name": "Home",
    "item": "https://nailartai.app"
  });
  
  breadcrumbItems.push({
    "@type": "ListItem",
    "position": 2,
    "name": "Nail Salons",
    "item": "https://nailartai.app/nail-salons"
  });
  
  if (type === 'state' || type === 'city') {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 3,
      "name": stateName,
      "item": `https://nailartai.app/nail-salons/${stateSlug}`
    });
  }
  
  if (type === 'city') {
    breadcrumbItems.push({
      "@type": "ListItem",
      "position": 4,
      "name": cityName,
      "item": `https://nailartai.app/nail-salons/${stateSlug}/${citySlug}`
    });
  }
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems
  };
  
  // Build CollectionPage schema
  let collectionName = "Nail Salons Directory - Browse by State";
  let collectionDescription = "Find the best nail salons across all US states";
  let collectionUrl = "https://nailartai.app/nail-salons";
  
  if (type === 'state') {
    collectionName = `Nail Salons in ${stateName}`;
    collectionDescription = `Find the best nail salons in ${stateName} by city`;
    collectionUrl = `https://nailartai.app/nail-salons/${stateSlug}`;
  } else if (type === 'city') {
    collectionName = `Nail Salons in ${cityName}, ${stateName}`;
    collectionDescription = `Discover top-rated nail salons in ${cityName}, ${stateName}`;
    collectionUrl = `https://nailartai.app/nail-salons/${stateSlug}/${citySlug}`;
  }
  
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": collectionName,
    "description": collectionDescription,
    "url": collectionUrl,
    "numberOfItems": itemCount || 0
  };
  
  return (
    <>
      {/* Breadcrumb Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      
      {/* CollectionPage Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
    </>
  );
}

