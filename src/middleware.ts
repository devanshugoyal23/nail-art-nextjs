import { NextRequest, NextResponse } from 'next/server';

// Simple admin authentication middleware
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
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
    '/admin/:path*',
    '/api/:path*'
  ]
};
