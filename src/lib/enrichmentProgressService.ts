/**
 * Enrichment Progress Service
 *
 * Manages batch enrichment progress using a JSON file
 * Tracks: enriched salons, failed salons, costs, completed cities, logs
 */

import fs from 'fs';
import path from 'path';

const PROGRESS_FILE = path.join(process.cwd(), 'data', 'enrichment-progress.json');

export interface EnrichmentProgress {
  isRunning: boolean;
  totalSalons: number;
  enriched: number;
  failed: number;
  skipped: number;
  currentState?: string;
  currentCity?: string;
  costs: {
    googleMaps: number;
    gemini: number;
    total: number;
  };
  completedCities: string[];
  failedSalons: Array<{
    placeId: string;
    name: string;
    error: string;
    retries: number;
  }>;
  lastUpdated: string;
  estimatedTimeRemaining?: string;
  logsLast100: string[];
  config?: {
    batchSize: number;
    source: 'sitemap' | 'manual';
    state?: string;
    city?: string;
  };
}

const DEFAULT_PROGRESS: EnrichmentProgress = {
  isRunning: false,
  totalSalons: 0,
  enriched: 0,
  failed: 0,
  skipped: 0,
  costs: {
    googleMaps: 0,
    gemini: 0,
    total: 0,
  },
  completedCities: [],
  failedSalons: [],
  lastUpdated: new Date().toISOString(),
  logsLast100: [],
};

/**
 * Ensure data directory exists
 */
function ensureDataDirectory() {
  const dataDir = path.dirname(PROGRESS_FILE);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
}

/**
 * Load progress from JSON file
 */
export function loadProgress(): EnrichmentProgress {
  try {
    ensureDataDirectory();
    if (fs.existsSync(PROGRESS_FILE)) {
      const data = fs.readFileSync(PROGRESS_FILE, 'utf-8');
      return JSON.parse(data);
    }
    return { ...DEFAULT_PROGRESS };
  } catch (error) {
    console.error('Error loading progress:', error);
    return { ...DEFAULT_PROGRESS };
  }
}

/**
 * Save progress to JSON file
 */
export function saveProgress(progress: EnrichmentProgress) {
  try {
    ensureDataDirectory();
    progress.lastUpdated = new Date().toISOString();
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2));
  } catch (error) {
    console.error('Error saving progress:', error);
  }
}

/**
 * Update progress (merge with existing)
 */
export function updateProgress(updates: Partial<EnrichmentProgress>) {
  const current = loadProgress();
  const updated = { ...current, ...updates };
  saveProgress(updated);
  return updated;
}

/**
 * Add log entry (keeps last 100)
 */
export function addLog(message: string) {
  const progress = loadProgress();
  const timestamp = new Date().toLocaleTimeString();
  const logEntry = `[${timestamp}] ${message}`;

  progress.logsLast100.push(logEntry);
  if (progress.logsLast100.length > 100) {
    progress.logsLast100 = progress.logsLast100.slice(-100);
  }

  saveProgress(progress);
  console.log(logEntry);
}

/**
 * Mark salon as enriched successfully
 */
export function markSalonEnriched(salonName: string, costs: { googleMaps: number; gemini: number }) {
  const progress = loadProgress();

  progress.enriched += 1;
  progress.costs.googleMaps += costs.googleMaps;
  progress.costs.gemini += costs.gemini;
  progress.costs.total = progress.costs.googleMaps + progress.costs.gemini;

  saveProgress(progress);
  addLog(`✅ Enriched: ${salonName} (Total: ${progress.enriched}/${progress.totalSalons})`);
}

/**
 * Mark salon as failed
 */
export function markSalonFailed(placeId: string, name: string, error: string) {
  const progress = loadProgress();

  progress.failed += 1;

  // Check if already in failed list
  const existing = progress.failedSalons.find((s) => s.placeId === placeId);
  if (existing) {
    existing.retries += 1;
    existing.error = error;
  } else {
    progress.failedSalons.push({
      placeId,
      name,
      error,
      retries: 0,
    });
  }

  saveProgress(progress);
  addLog(`❌ Failed: ${name} - ${error}`);
}

/**
 * Mark city as completed
 */
export function markCityCompleted(state: string, city: string) {
  const progress = loadProgress();

  const cityKey = `${state}/${city}`;
  if (!progress.completedCities.includes(cityKey)) {
    progress.completedCities.push(cityKey);
  }

  saveProgress(progress);
  addLog(`🏙️  Completed: ${cityKey}`);
}

/**
 * Set current location
 */
export function setCurrentLocation(state: string, city: string) {
  updateProgress({
    currentState: state,
    currentCity: city,
  });
}

/**
 * Start enrichment
 */
export function startEnrichment(config: {
  batchSize: number;
  source: 'sitemap' | 'manual';
  state?: string;
  city?: string;
  totalSalons: number;
}) {
  updateProgress({
    isRunning: true,
    config,
    totalSalons: config.totalSalons,
  });
  addLog(`🚀 Started enrichment: ${config.totalSalons} salons, batch size ${config.batchSize}`);
}

/**
 * Stop enrichment
 */
export function stopEnrichment() {
  updateProgress({ isRunning: false });
  addLog(`⏸️  Stopped enrichment`);
}

/**
 * Reset progress
 */
export function resetProgress() {
  saveProgress({ ...DEFAULT_PROGRESS });
  addLog(`🔄 Reset progress`);
}

/**
 * Calculate estimated time remaining
 */
export function updateTimeEstimate() {
  const progress = loadProgress();

  if (progress.enriched === 0) {
    updateProgress({ estimatedTimeRemaining: 'Calculating...' });
    return;
  }

  const elapsedMs = Date.now() - new Date(progress.lastUpdated).getTime();
  const msPerSalon = elapsedMs / progress.enriched;
  const remaining = progress.totalSalons - progress.enriched;
  const remainingMs = remaining * msPerSalon;

  const hours = Math.floor(remainingMs / (1000 * 60 * 60));
  const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));

  const estimate = hours > 0 ? `~${hours}h ${minutes}m remaining` : `~${minutes}m remaining`;

  updateProgress({ estimatedTimeRemaining: estimate });
}
