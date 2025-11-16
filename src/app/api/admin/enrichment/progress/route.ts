/**
 * API Route: GET /api/admin/enrichment/progress
 *
 * Returns current enrichment progress
 */

import { NextResponse } from 'next/server';
import { loadProgress } from '@/lib/enrichmentProgressService';

export async function GET() {
  try {
    const progress = loadProgress();
    return NextResponse.json(progress);
  } catch (error) {
    console.error('Error fetching progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }
}
