import { notFound, redirect } from "next/navigation";
import { getGalleryItem, generateGalleryItemUrl } from "@/lib/galleryService";
import { Metadata } from "next";

interface GalleryDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({ params }: GalleryDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const item = await getGalleryItem(resolvedParams.id);
  
  if (!item) {
    return {
      title: "Design Not Found",
    };
  }

  const title = item.design_name || 'Generated Nail Art';
  const description = item.prompt || 'AI-generated nail art design';

  const canonicalUrl = generateGalleryItemUrl(item);

  return {
    title: `${title} | Nail Art AI`,
    description: description,
    alternates: {
      canonical: `https://nailartai.app${canonicalUrl}`,
    },
    openGraph: {
      title: title,
      description: description,
      images: [item.image_url],
      url: `https://nailartai.app${canonicalUrl}`,
      type: 'article',
      siteName: 'Nail Art AI',
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [item.image_url],
    },
    other: {
      // Pinterest metadata
      'pinterest:title': title,
      'pinterest:description': description,
      'pinterest:image': item.image_url,
      'pinterest:image:width': '1000',
      'pinterest:image:height': '1500',
      'pinterest:board': item.category ? `${item.category} Nail Art Ideas` : 'Nail Art Ideas',
      'pinterest:category': 'beauty',
      'pinterest:type': 'article',
    },
  };
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const resolvedParams = await params;
  const item = await getGalleryItem(resolvedParams.id);

  if (!item) {
    notFound();
  }

  // Redirect to SEO-friendly URL
  const seoUrl = generateGalleryItemUrl(item);
  redirect(seoUrl);
}
