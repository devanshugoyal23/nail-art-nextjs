import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const headerPassword = request.headers.get('X-Admin-Password');
    const expectedPassword = process.env.ADMIN_PASSWORD;
    
    // SECURITY: Always require a password - no development fallback
    if (!expectedPassword) {
      console.error('SECURITY WARNING: ADMIN_PASSWORD not set in environment variables');
      return NextResponse.json(
        { success: false, error: 'Admin password not configured. Please set ADMIN_PASSWORD environment variable.' },
        { status: 500 }
      );
    }
    
    // Check password from either body or header
    const providedPassword = password || headerPassword;
    
    if (!providedPassword || providedPassword !== expectedPassword) {
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    return NextResponse.json({ success: true, message: 'Authentication successful' });
  } catch (error) {
    console.error('Admin verification error:', error);
    return NextResponse.json(
      { success: false, error: 'Authentication failed' },
      { status: 500 }
    );
  }
}
