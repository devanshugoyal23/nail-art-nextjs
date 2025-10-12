import { NextRequest } from 'next/server';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (request: NextRequest) => string;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitFunction {
  (request: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  };
  maxRequests: number;
}

// In-memory store for rate limiting (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function createRateLimiter(config: RateLimitConfig): RateLimitFunction {
  const rateLimitFunction = function rateLimit(request: NextRequest): {
    allowed: boolean;
    remaining: number;
    resetTime: number;
    error?: string;
  } {
    const key = config.keyGenerator 
      ? config.keyGenerator(request)
      : getClientIP(request);
    
    const now = Date.now();
    
    // Get or create entry
    let entry = rateLimitStore.get(key);
    
    if (!entry || entry.resetTime < now) {
      // Create new window
      entry = {
        count: 0,
        resetTime: now + config.windowMs
      };
    }
    
    entry.count++;
    rateLimitStore.set(key, entry);
    
    const remaining = Math.max(0, config.maxRequests - entry.count);
    const allowed = entry.count <= config.maxRequests;
    
    return {
      allowed,
      remaining,
      resetTime: entry.resetTime,
      error: !allowed ? `Rate limit exceeded. Try again in ${Math.ceil((entry.resetTime - now) / 1000)} seconds.` : undefined
    };
  } as RateLimitFunction;
  
  // Add the maxRequests property to the function
  rateLimitFunction.maxRequests = config.maxRequests;
  
  return rateLimitFunction;
}

function getClientIP(request: NextRequest): string {
  // Try to get real IP from headers (for production with proxy)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  
  if (cfConnectingIP) return cfConnectingIP;
  if (realIP) return realIP;
  if (forwarded) return forwarded.split(',')[0].trim();
  
  // Fallback to a default key
  return 'unknown';
}

// Predefined rate limiters
export const rateLimiters = {
  // Strict rate limiting for AI generation (expensive operations)
  aiGeneration: createRateLimiter({
    maxRequests: 10, // 10 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    keyGenerator: (request) => `ai:${getClientIP(request)}`
  }),
  
  // Moderate rate limiting for gallery operations
  gallery: createRateLimiter({
    maxRequests: 50, // 50 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    keyGenerator: (request) => `gallery:${getClientIP(request)}`
  }),
  
  // Lenient rate limiting for read operations
  read: createRateLimiter({
    maxRequests: 200, // 200 requests
    windowMs: 15 * 60 * 1000, // per 15 minutes
    keyGenerator: (request) => `read:${getClientIP(request)}`
  }),
  
  // Very strict for admin operations
  admin: createRateLimiter({
    maxRequests: 100, // 100 requests
    windowMs: 60 * 60 * 1000, // per hour
    keyGenerator: (request) => `admin:${getClientIP(request)}`
  })
};

export function checkRateLimit(
  request: NextRequest, 
  limiter: RateLimitFunction
): { allowed: boolean; headers: Record<string, string>; error?: string } {
  const result = limiter(request);
  
  const headers = {
    'X-RateLimit-Limit': limiter.maxRequests?.toString() || '200',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': Math.ceil(result.resetTime / 1000).toString(),
  };
  
  return {
    allowed: result.allowed,
    headers,
    error: result.error
  };
}
