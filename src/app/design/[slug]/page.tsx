import { notFound, permanentRedirect } from "next/navigation";
import { generateGalleryItemUrl, getGalleryItemByDesignSlug } from "@/lib/galleryService";

interface DesignDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function DesignDetailPage({ params }: DesignDetailPageProps) {
    const resolvedParams = await params;
    const item = await getGalleryItemByDesignSlug(resolvedParams.slug);

    if (!item) {
      notFound();
    }

  const canonicalPath = generateGalleryItemUrl(item);
  permanentRedirect(canonicalPath);
  return undefined as never;
}


