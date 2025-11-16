/**
 * API Route: POST /api/admin/enrichment/start
 *
 * Starts batch enrichment process
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadProgress } from '@/lib/enrichmentProgressService';
import { startBatchEnrichment } from '@/lib/batchEnrichmentService';

export async function POST(request: NextRequest) {
  try {
    const progress = loadProgress();

    if (progress.isRunning) {
      return NextResponse.json({ error: 'Enrichment already running' }, { status: 400 });
    }

    const body = await request.json();
    const { batchSize = 100, source = 'sitemap', state, city } = body;

    // Start enrichment in background (non-blocking)
    startBatchEnrichment({
      batchSize,
      source,
      state,
      city,
    }).catch((error) => {
      console.error('Batch enrichment error:', error);
    });

    return NextResponse.json({ success: true, message: 'Enrichment started' });
  } catch (error) {
    console.error('Error starting enrichment:', error);
    return NextResponse.json({ error: 'Failed to start enrichment' }, { status: 500 });
  }
}
