/**
 * Cache Service
 * 
 * Advanced caching strategy with TTL, memory management,
 * and performance monitoring for the optimized data service.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  accessCount: number;
  lastAccessed: number;
  size: number;
}

interface CacheConfig {
  maxSize: number;           // Maximum cache size in bytes
  maxEntries: number;        // Maximum number of entries
  defaultTTL: number;        // Default TTL in milliseconds
  cleanupInterval: number;   // Cleanup interval in milliseconds
}

interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  totalSize: number;
  entryCount: number;
  hitRate: number;
}

class CacheService {
  private cache = new Map<string, CacheEntry<unknown>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0,
    entryCount: 0,
    hitRate: 0
  };
  
  private config: CacheConfig = {
    maxSize: 50 * 1024 * 1024,    // 50MB
    maxEntries: 1000,
    defaultTTL: 60 * 60 * 1000,   // 1 hour
    cleanupInterval: 5 * 60 * 1000 // 5 minutes
  };
  
  private cleanupTimer: NodeJS.Timeout | null = null;
  
  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }
    
    this.startCleanupTimer();
  }
  
  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.updateHitRate();
      return null;
    }
    
    // Update access info
    entry.accessCount++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.updateHitRate();
    
    return entry.data as T;
  }
  
  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    const size = this.calculateSize(data);
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTTL,
      accessCount: 0,
      lastAccessed: Date.now(),
      size
    };
    
    // Check if we need to evict entries
    this.ensureSpace(size);
    
    // Remove existing entry if it exists
    const existing = this.cache.get(key);
    if (existing) {
      this.stats.totalSize -= existing.size;
      this.stats.entryCount--;
    }
    
    // Add new entry
    this.cache.set(key, entry);
    this.stats.totalSize += size;
    this.stats.entryCount++;
  }
  
  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
  
  /**
   * Delete entry from cache
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    this.cache.delete(key);
    this.stats.totalSize -= entry.size;
    this.stats.entryCount--;
    
    return true;
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      totalSize: 0,
      entryCount: 0,
      hitRate: 0
    };
  }
  
  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }
  
  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }
  
  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
  
  /**
   * Force cleanup of expired entries
   */
  cleanup(): number {
    let cleaned = 0;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
        this.stats.totalSize -= entry.size;
        this.stats.entryCount--;
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  /**
   * Get memory usage info
   */
  getMemoryUsage(): {
    used: number;
    max: number;
    percentage: number;
    entries: number;
    maxEntries: number;
  } {
    return {
      used: this.stats.totalSize,
      max: this.config.maxSize,
      percentage: (this.stats.totalSize / this.config.maxSize) * 100,
      entries: this.stats.entryCount,
      maxEntries: this.config.maxEntries
    };
  }
  
  /**
   * Get cache keys
   */
  getKeys(): string[] {
    return Array.from(this.cache.keys());
  }
  
  /**
   * Get cache entry info
   */
  getEntryInfo(key: string): {
    exists: boolean;
    age: number;
    ttl: number;
    accessCount: number;
    size: number;
    expired: boolean;
  } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    const now = Date.now();
    return {
      exists: true,
      age: now - entry.timestamp,
      ttl: entry.ttl,
      accessCount: entry.accessCount,
      size: entry.size,
      expired: now - entry.timestamp > entry.ttl
    };
  }
  
  /**
   * Calculate approximate size of data
   */
  private calculateSize(data: unknown): number {
    try {
      return JSON.stringify(data).length * 2; // Rough estimate
    } catch {
      return 1024; // Default size if calculation fails
    }
  }
  
  /**
   * Ensure there's enough space for new entry
   */
  private ensureSpace(requiredSize: number): void {
    // Check size limit
    while (this.stats.totalSize + requiredSize > this.config.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }
    
    // Check entry count limit
    while (this.cache.size >= this.config.maxEntries && this.cache.size > 0) {
      this.evictLRU();
    }
  }
  
  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      const entry = this.cache.get(oldestKey);
      if (entry) {
        this.cache.delete(oldestKey);
        this.stats.totalSize -= entry.size;
        this.stats.entryCount--;
        this.stats.evictions++;
      }
    }
  }
  
  /**
   * Update hit rate
   */
  private updateHitRate(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;
  }
  
  /**
   * Start cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    
    this.cleanupTimer = setInterval(() => {
      const cleaned = this.cleanup();
      if (cleaned > 0) {
        console.log(`🧹 Cache cleanup: removed ${cleaned} expired entries`);
      }
    }, this.config.cleanupInterval);
  }
  
  /**
   * Stop cleanup timer
   */
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.clear();
  }
}

// Create global cache instance
const cacheService = new CacheService({
  maxSize: 50 * 1024 * 1024,    // 50MB
  maxEntries: 1000,
  defaultTTL: 60 * 60 * 1000,   // 1 hour
  cleanupInterval: 5 * 60 * 1000 // 5 minutes
});

export default cacheService;

// Export utility functions
export function getCacheStats(): CacheStats {
  return cacheService.getStats();
}

export function getCacheMemoryUsage() {
  return cacheService.getMemoryUsage();
}

export function clearCache(): void {
  cacheService.clear();
}

export function cleanupCache(): number {
  return cacheService.cleanup();
}

// Export the cache service instance for advanced usage
export { cacheService };