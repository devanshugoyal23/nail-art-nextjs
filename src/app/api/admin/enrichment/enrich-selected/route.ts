/**
 * API Route: POST /api/admin/enrichment/enrich-selected
 *
 * Enrich specific selected salons
 */

import { NextRequest, NextResponse } from 'next/server';
import { loadProgress, updateProgress } from '@/lib/enrichmentProgressService';
import { enrichSelectedSalons } from '@/lib/batchEnrichmentService';

export async function POST(request: NextRequest) {
  try {
    const progress = loadProgress();

    if (progress.isRunning) {
      return NextResponse.json({ error: 'Enrichment already running' }, { status: 400 });
    }

    const body = await request.json();
    const { placeIds } = body;

    if (!placeIds || !Array.isArray(placeIds) || placeIds.length === 0) {
      return NextResponse.json({ error: 'No salons selected' }, { status: 400 });
    }

    // Start enrichment in background (non-blocking)
    updateProgress({ isRunning: true });

    enrichSelectedSalons(placeIds).catch((error) => {
      console.error('Selected enrichment error:', error);
    });

    return NextResponse.json({
      success: true,
      message: `Starting enrichment for ${placeIds.length} salon(s)`,
    });
  } catch (error) {
    console.error('Error starting selected enrichment:', error);
    return NextResponse.json({ error: 'Failed to start enrichment' }, { status: 500 });
  }
}
