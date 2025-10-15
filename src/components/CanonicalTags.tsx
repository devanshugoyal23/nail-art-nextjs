import Head from 'next/head';

interface CanonicalTagsProps {
  canonicalUrl: string;
  noIndex?: boolean;
}

/**
 * Canonical Tags Component - Prevents duplicate content issues
 * Add this to gallery item pages to point to canonical design URLs
 */
export default function CanonicalTags({ canonicalUrl, noIndex = true }: CanonicalTagsProps) {
  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
      {noIndex && <meta name="robots" content="noindex, follow" />}
    </Head>
  );
}

/**
 * Generate canonical URL for gallery items
 */
export function generateCanonicalUrl(item: {
  id: string;
  category?: string;
  design_name?: string;
}): string {
  const baseUrl = 'https://nailartai.app';
  const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design';
  const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
  const idSuffix = item.id.slice(-8);
  
  return `${baseUrl}/${categorySlug}/${designSlug}-${idSuffix}`;
}

/**
 * SEO Meta Tags for preventing duplication
 */
export function DuplicatePreventionMeta({ 
  canonicalUrl, 
  title, 
  description 
}: {
  canonicalUrl: string;
  title: string;
  description: string;
}) {
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content="noindex, follow" />
      
      {/* Open Graph tags pointing to canonical */}
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      
      {/* Twitter tags pointing to canonical */}
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Head>
  );
}
