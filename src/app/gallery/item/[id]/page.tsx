import { notFound, redirect } from "next/navigation";
import { getGalleryItem, generateGalleryItemUrl } from "@/lib/galleryService";
import { Metadata } from "next";

interface GalleryDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: GalleryDetailPageProps): Promise<Metadata> {
  const item = await getGalleryItem(params.id);
  
  if (!item) {
    return {
      title: "Design Not Found",
    };
  }

  const title = item.design_name || 'Generated Nail Art';
  const description = item.prompt || 'AI-generated nail art design';

  return {
    title: `${title} | AI Nail Art Studio`,
    description: description,
    openGraph: {
      title: title,
      description: description,
      images: [item.image_url],
    },
  };
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const item = await getGalleryItem(params.id);

  if (!item) {
    notFound();
  }

  // Redirect to SEO-friendly URL
  const seoUrl = generateGalleryItemUrl(item);
  redirect(seoUrl);
}
