/**
 * API Route: POST /api/admin/enrichment/pause
 *
 * Pauses the running enrichment process
 */

import { NextResponse } from 'next/server';
import { stopEnrichment } from '@/lib/enrichmentProgressService';

export async function POST() {
  try {
    stopEnrichment();
    return NextResponse.json({ success: true, message: 'Enrichment paused' });
  } catch (error) {
    console.error('Error pausing enrichment:', error);
    return NextResponse.json({ error: 'Failed to pause' }, { status: 500 });
  }
}
