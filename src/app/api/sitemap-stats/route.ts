import { NextResponse } from 'next/server';
import { getSitemapStats } from '@/lib/dynamicSitemapService';

export async function GET() {
  try {
    const stats = await getSitemapStats();
    
    return NextResponse.json({
      success: true,
      ...stats
    });
    
  } catch (error) {
    console.error('Error getting sitemap stats:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get sitemap statistics' },
      { status: 500 }
    );
  }
}
