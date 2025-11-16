/**
 * API Route: POST /api/admin/enrichment/retry-failed
 *
 * Retry all failed salons
 */

import { NextResponse } from 'next/server';
import { loadProgress, updateProgress } from '@/lib/enrichmentProgressService';
import { retryFailedSalons } from '@/lib/batchEnrichmentService';

export async function POST() {
  try {
    const progress = loadProgress();

    if (progress.isRunning) {
      return NextResponse.json({ error: 'Cannot retry while enrichment is running' }, { status: 400 });
    }

    if (progress.failedSalons.length === 0) {
      return NextResponse.json({ error: 'No failed salons to retry' }, { status: 400 });
    }

    // Start retry process
    updateProgress({ isRunning: true });

    retryFailedSalons().catch((error) => {
      console.error('Retry failed salons error:', error);
    });

    return NextResponse.json({
      success: true,
      message: `Retrying ${progress.failedSalons.length} failed salons`,
    });
  } catch (error) {
    console.error('Error retrying failed salons:', error);
    return NextResponse.json({ error: 'Failed to retry' }, { status: 500 });
  }
}
