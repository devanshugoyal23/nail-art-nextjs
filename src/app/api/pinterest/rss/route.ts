import { NextRequest, NextResponse } from 'next/server';
import { getGalleryItems } from '@/lib/galleryService';
import { createPinterestRichPinDataFromItem } from '@/lib/pinterestRichPinsService';

/**
 * Pinterest RSS Feed for Rich Pins
 * Generates RSS feed optimized for Pinterest automation tools
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category');
    const sortBy = searchParams.get('sortBy') || 'newest';

    // Get gallery items
    const result = await getGalleryItems({
      page: 1,
      limit: Math.min(limit, 100), // Max 100 items per feed
      sortBy: sortBy as 'newest' | 'popular' | 'trending',
      category: category || undefined
    });

    const items = result.items;

    // Generate RSS XML
    const rssItems = items.map(item => {
      const designSlug = item.design_name?.toLowerCase().replace(/\s+/g, '-') || 'design';
      const idSuffix = item.id.slice(-8);
      const slug = `${designSlug}-${idSuffix}`;
      const categorySlug = item.category?.toLowerCase().replace(/\s+/g, '-') || 'design';
      
      // Generate page URL
      const pageUrl = `https://nailartai.app/${categorySlug}/${slug}`;
      
      // Create Pinterest Rich Pin data
      const richPinData = createPinterestRichPinDataFromItem(item, pageUrl);

      // Format date for RSS
      const pubDate = new Date(item.created_at).toUTCString();

      return `
    <item>
      <title><![CDATA[${richPinData.title}]]></title>
      <description><![CDATA[${richPinData.description}]]></description>
      <link>${pageUrl}</link>
      <guid isPermaLink="true">${pageUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <category><![CDATA[${item.category || 'Nail Art'}]]></category>
      <enclosure url="${item.image_url}" type="image/jpeg" length="0"/>
      
      <!-- Pinterest Rich Pins Meta Data -->
      <pinterest:title><![CDATA[${richPinData.title}]]></pinterest:title>
      <pinterest:description><![CDATA[${richPinData.description}]]></pinterest:description>
      <pinterest:image>${item.image_url}</pinterest:image>
      <pinterest:board>${richPinData.category ? `${richPinData.category} Nail Art Ideas` : 'Nail Art Ideas'}</pinterest:board>
      <pinterest:category>beauty</pinterest:category>
      <pinterest:type>article</pinterest:type>
      
      <!-- Article Meta Data -->
      <article:author><![CDATA[${richPinData.author}]]></article:author>
      <article:published_time>${richPinData.publishedTime}</article:published_time>
      <article:section><![CDATA[${richPinData.section}]]></article:section>
      <article:tag><![CDATA[${richPinData.tags.join(', ')}]]></article:tag>
      
      <!-- Additional Pinterest Optimization -->
      <pinterest:url>${pageUrl}</pinterest:url>
      <pinterest:domain>nailartai.app</pinterest:domain>
    </item>`;
    }).join('');

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:content="http://purl.org/rss/1.0/modules/content/"
     xmlns:dc="http://purl.org/dc/elements/1.1/"
     xmlns:atom="http://www.w3.org/2005/Atom"
     xmlns:sy="http://purl.org/rss/1.0/modules/syndication/"
     xmlns:slash="http://purl.org/rss/1.0/modules/slash/"
     xmlns:pinterest="https://www.pinterest.com/xmlns/"
     xmlns:article="https://www.pinterest.com/xmlns/article/">
  
  <channel>
    <title><![CDATA[Nail Art AI - Pinterest Rich Pins Feed]]></title>
    <description><![CDATA[Latest nail art designs optimized for Pinterest Rich Pins. Discover beautiful nail art ideas, tutorials, and inspiration.]]></description>
    <link>https://nailartai.app</link>
    <atom:link href="https://nailartai.app/api/pinterest/rss" rel="self" type="application/rss+xml"/>
    <language>en-us</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <sy:updatePeriod>hourly</sy:updatePeriod>
    <sy:updateFrequency>1</sy:updateFrequency>
    <generator>Nail Art AI Pinterest RSS Generator</generator>
    <managingEditor>nailartai@example.com (Nail Art AI)</managingEditor>
    <webMaster>nailartai@example.com (Nail Art AI)</webMaster>
    <copyright>Copyright ${new Date().getFullYear()} Nail Art AI</copyright>
    <image>
      <url>https://nailartai.app/logo.png</url>
      <title>Nail Art AI</title>
      <link>https://nailartai.app</link>
      <width>144</width>
      <height>144</height>
    </image>
    
    ${rssItems}
    
  </channel>
</rss>`;

    return new NextResponse(rssXml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600', // Cache for 1 hour
      },
    });

  } catch (error) {
    console.error('Pinterest RSS feed error:', error);
    return NextResponse.json({
      error: 'Failed to generate Pinterest RSS feed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
