import { NextRequest, NextResponse } from 'next/server';
import { slugify } from './lib/slugify';

// Simple admin authentication middleware
export function middleware(request: NextRequest) {
  const url = request.nextUrl;
  const { pathname } = url;

  // Optional canonical host redirect (disabled by default to avoid platform loops)
  // Enable by setting ENABLE_HOST_REDIRECT=1 and NEXT_PUBLIC_SITE_URL to your canonical origin
  if (process.env.ENABLE_HOST_REDIRECT === '1' && process.env.NEXT_PUBLIC_SITE_URL) {
    try {
      const canonicalHost = new URL(process.env.NEXT_PUBLIC_SITE_URL).hostname;
      if (url.hostname !== canonicalHost && !url.hostname.endsWith('.vercel.app')) {
        const redirectUrl = new URL(url.toString());
        redirectUrl.hostname = canonicalHost;
        return NextResponse.redirect(redirectUrl, 308);
      }
    } catch {
      // ignore malformed URL
    }
  }

  // Skip normalization for assets/system routes
  const isSystemOrAsset =
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname === '/favicon.ico' ||
    pathname.startsWith('/sitemap') ||
    pathname === '/robots.txt' ||
    pathname === '/manifest.json' ||
    pathname === '/sw.js';

  // Trailing slash normalization (remove, except root)
  if (!isSystemOrAsset && pathname.length > 1 && pathname.endsWith('/')) {
    const normalized = pathname.replace(/\/+$/, '');
    const redirectUrl = new URL(url.toString());
    redirectUrl.pathname = normalized;
    return NextResponse.redirect(redirectUrl, 308);
  }

  // Slug normalization for known patterns
  if (!isSystemOrAsset) {
    // /nail-art-gallery/category/:name
    if (pathname.startsWith('/nail-art-gallery/category/')) {
      const base = '/nail-art-gallery/category/';
      const raw = decodeURIComponent(pathname.slice(base.length));
      const normalizedName = slugify(raw);
      const targetPath = `${base}${normalizedName}`;
      if (targetPath !== pathname) {
        const redirectUrl = new URL(url.toString());
        redirectUrl.pathname = targetPath;
        return NextResponse.redirect(redirectUrl, 308);
      }
    }

    // Design canonical URLs: /:category/:slug(-idSuffix)
    const parts = pathname.split('/').filter(Boolean);
    const reserved = new Set(['categories', 'nail-art-gallery', 'try-on', 'faq', 'nail-art-hub', 'christmas-nail-art', 'nail-colors', 'techniques', 'nail-art']);
    if (parts.length === 2 && !reserved.has(parts[0])) {
      const normCategory = slugify(decodeURIComponent(parts[0]));
      const normSlug = slugify(decodeURIComponent(parts[1]));
      const targetPath = `/${normCategory}/${normSlug}`;
      if (targetPath !== pathname) {
        const redirectUrl = new URL(url.toString());
        redirectUrl.pathname = targetPath;
        return NextResponse.redirect(redirectUrl, 308);
      }
    }
  }

  // Check if accessing admin routes (except login page)
  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const expectedPassword = process.env.ADMIN_PASSWORD;

    // SECURITY: Always require a password - no development fallback
    if (!expectedPassword) {
      console.error('SECURITY WARNING: ADMIN_PASSWORD not set in environment variables');
      return new NextResponse('Admin password not configured. Please set ADMIN_PASSWORD environment variable.', {
        status: 500,
        headers: {
          'Content-Type': 'text/plain'
        }
      });
    }

    // Check for admin password in headers or cookies
    const adminPassword = request.headers.get('x-admin-password') ||
      request.cookies.get('admin-auth')?.value;

    // Check if password matches
    if (!adminPassword || adminPassword !== expectedPassword) {
      // Redirect to login page instead of triggering basic auth
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Add security headers to all responses
  const response = NextResponse.next();

  // Security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // CORS headers for API routes
  if (pathname.startsWith('/api')) {
    const allowedOrigins = [
      process.env.NEXT_PUBLIC_SITE_URL || 'https://nailartai.app',
      'http://localhost:3000',
      'https://localhost:3000'
    ];

    const origin = request.headers.get('origin');
    const allowedOrigin = allowedOrigins.includes(origin || '') ? origin : allowedOrigins[0];

    response.headers.set('Access-Control-Allow-Origin', allowedOrigin || '*');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Admin-Password, X-API-Key');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers: response.headers });
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Admin routes only (authentication required)
    '/admin/:path*',

    // API routes only (CORS and security headers)
    '/api/:path*',

    // REMOVED: Broad category/slug matcher that was triggering on every page
    // Next.js handles static pages natively - no middleware needed
    // This single change reduces function invocations by ~100K/month
  ]
};
