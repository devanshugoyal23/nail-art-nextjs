/**
 * API Route: POST /api/admin/enrichment/resume
 *
 * Resumes enrichment from last checkpoint
 */

import { NextResponse } from 'next/server';
import { loadProgress, updateProgress } from '@/lib/enrichmentProgressService';
import { startBatchEnrichment } from '@/lib/batchEnrichmentService';

export async function POST() {
  try {
    const progress = loadProgress();

    if (!progress.config) {
      return NextResponse.json({ error: 'No previous enrichment to resume' }, { status: 400 });
    }

    if (progress.isRunning) {
      return NextResponse.json({ error: 'Enrichment already running' }, { status: 400 });
    }

    // Resume with previous config
    updateProgress({ isRunning: true });

    startBatchEnrichment(progress.config, true).catch((error) => {
      console.error('Resume enrichment error:', error);
    });

    return NextResponse.json({ success: true, message: 'Enrichment resumed' });
  } catch (error) {
    console.error('Error resuming enrichment:', error);
    return NextResponse.json({ error: 'Failed to resume' }, { status: 500 });
  }
}
