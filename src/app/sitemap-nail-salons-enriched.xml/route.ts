import { NextResponse } from 'next/server';
import { getDataFromR2 } from '@/lib/r2Service';

/**
 * Dynamic Sitemap for Enriched Salons
 * 
 * Reads the consolidated index from R2 (created by generate-enriched-sitemap-index.ts)
 * and generates a high-quality sitemap with 21,000+ salons.
 * 
 * CACHING: Uses long-lived Vercel Edge caching.
 */

// Allow runtime generation but with heavy caching
export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

export interface IndexItem {
    url: string;
    rating: number;
    reviews: number;
    lastmod: string;
    score: number;
}

export interface EnrichedSitemapIndex {
    lastUpdated: string;
    total: number;
    items: IndexItem[];
}

export async function GET() {
    const baseUrl = 'https://nailartai.app';

    try {
        // 1. Fetch index from R2
        const data = await getDataFromR2('nail-salons/sitemap-enriched-index.json') as EnrichedSitemapIndex | null;

        if (!data || !data.items) {
            console.log('⚠️ Enriched sitemap index not found or empty');
            return new NextResponse('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
                status: 200,
                headers: { 'Content-Type': 'application/xml' },
            });
        }

        // 2. Generate XML
        // Google recommends splitting sitemaps if they exceed 50,000 URLs.
        // We are at 21,000, so one file is fine.

        let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;

        // Process all items
        data.items.forEach(item => {
            // Priority based on score
            let priority = '0.6';
            if (item.score >= 80) priority = '0.9';
            else if (item.score >= 60) priority = '0.8';
            else if (item.score >= 40) priority = '0.7';

            xml += `
  <url>
    <loc>${baseUrl}${item.url}</loc>
    <lastmod>${item.lastmod.split('T')[0]}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${priority}</priority>
  </url>`;
        });

        xml += `
</urlset>`;

        return new NextResponse(xml, {
            status: 200,
            headers: {
                'Content-Type': 'application/xml',
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
            },
        });
    } catch (error) {
        console.error('Error generating enriched sitemap:', error);
        return new NextResponse('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', {
            status: 500,
            headers: { 'Content-Type': 'application/xml' },
        });
    }
}
