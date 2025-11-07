import { NextResponse } from 'next/server';
import { 
  submitToIndexNow,
  submitSitemapToIndexNow,
  submitNewDesign,
  submitUpdatedDesign
} from '@/lib/indexnowService';

// Simple header-based admin auth to protect the endpoint
function isAuthorized(request: Request): boolean {
  const adminToken = process.env.ADMIN_API_TOKEN;
  const provided = request.headers.get('x-admin-token');
  if (!adminToken) {
    // If no token configured, block by default for safety
    return false;
  }
  return Boolean(provided && provided === adminToken);
}

export async function POST(request: Request) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const { urls, type, designId, category, designName } = body || {};

    if (Array.isArray(urls) && urls.length > 0) {
      const ok = await submitToIndexNow(urls);
      return NextResponse.json({ success: ok, submitted: urls.length });
    }

    if (type === 'sitemaps') {
      const ok = await submitSitemapToIndexNow();
      return NextResponse.json({ success: ok, submitted: 'sitemaps' });
    }

    if (type === 'design') {
      if (!designId || !category || !designName) {
        return NextResponse.json({ error: 'Missing designId, category, or designName' }, { status: 400 });
      }
      const ok = await submitNewDesign(String(designId), String(category), String(designName));
      return NextResponse.json({ success: ok, submitted: 'design' });
    }

    if (type === 'updatedDesign') {
      if (!designId || !category || !designName) {
        return NextResponse.json({ error: 'Missing designId, category, or designName' }, { status: 400 });
      }
      const ok = await submitUpdatedDesign(String(designId), String(category), String(designName));
      return NextResponse.json({ success: ok, submitted: 'updatedDesign' });
    }

    return NextResponse.json({ error: 'Provide { urls: string[] } or { type }' }, { status: 400 });
  } catch (error) {
    console.error('IndexNow submit error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}





