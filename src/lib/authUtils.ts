import { NextRequest } from 'next/server';

export interface AuthResult {
  isAuthenticated: boolean;
  isAdmin: boolean;
  error?: string;
}

/**
 * Check if request is authenticated for admin operations
 */
export function checkAdminAuth(request: NextRequest): AuthResult {
  const adminPassword = request.headers.get('x-admin-password');
  const cookieAuth = request.cookies.get('admin-auth')?.value;
  
  const expectedPassword = process.env.ADMIN_PASSWORD;
  
  // If no password is set in environment, allow access (for development)
  if (!expectedPassword) {
    return { isAuthenticated: true, isAdmin: true };
  }
  
  const providedPassword = adminPassword || cookieAuth;
  
  if (!providedPassword || providedPassword !== expectedPassword) {
    return { 
      isAuthenticated: false, 
      isAdmin: false, 
      error: 'Admin authentication required' 
    };
  }
  
  return { isAuthenticated: true, isAdmin: true };
}

/**
 * Check if request is authenticated for public operations
 */
export function checkPublicAuth(): AuthResult {
  // For now, we'll allow public access but with rate limiting
  // In the future, you might want to implement API keys or user authentication
  return { isAuthenticated: true, isAdmin: false };
}

/**
 * Validate API key for external access
 */
export function validateApiKey(request: NextRequest): AuthResult {
  const apiKey = request.headers.get('x-api-key');
  const expectedApiKey = process.env.API_KEY;
  
  if (!expectedApiKey) {
    // If no API key is set, allow access (for development)
    return { isAuthenticated: true, isAdmin: false };
  }
  
  if (!apiKey || apiKey !== expectedApiKey) {
    return { 
      isAuthenticated: false, 
      isAdmin: false, 
      error: 'Valid API key required' 
    };
  }
  
  return { isAuthenticated: true, isAdmin: false };
}
