import { ImageResponse } from 'next/og';
import { getGalleryItemBySlug } from '@/lib/galleryService';

export const runtime = 'edge';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ category: string; slug: string }> }
) {
  try {
    const { category, slug } = await params;
    const item = await getGalleryItemBySlug(category, slug);
    
    if (!item) {
      return new Response('Design not found', { status: 404 });
    }

    return new ImageResponse(
      (
        <div
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'system-ui',
            padding: '40px',
          }}
        >
          {/* Left side - Design info */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-start',
              justifyContent: 'center',
              flex: '1',
              paddingRight: '40px',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(0, 0, 0, 0.3)',
                borderRadius: '20px',
                padding: '30px',
                backdropFilter: 'blur(10px)',
                width: '100%',
              }}
            >
              <h1
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  color: 'white',
                  margin: '0 0 20px 0',
                  lineHeight: '1.1',
                }}
              >
                {item.design_name || 'AI Nail Art Design'}
              </h1>
              
              {item.category && (
                <div
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '18px',
                    marginBottom: '20px',
                    display: 'inline-block',
                  }}
                >
                  {item.category}
                </div>
              )}
              
              <p
                style={{
                  fontSize: '24px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: '0 0 20px 0',
                  lineHeight: '1.4',
                }}
              >
                {item.prompt || 'AI-generated nail art design'}
              </p>
              
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '15px',
                  marginTop: '20px',
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    backgroundColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                  }}
                >
                  🎨
                </div>
                <span
                  style={{
                    color: 'white',
                    fontSize: '20px',
                    fontWeight: '600',
                  }}
                >
                  AI Nail Art Studio
                </span>
              </div>
            </div>
          </div>
          
          {/* Right side - Design preview */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flex: '1',
              maxWidth: '400px',
            }}
          >
            <div
              style={{
                width: '300px',
                height: '400px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backdropFilter: 'blur(10px)',
                border: '2px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              <div
                style={{
                  fontSize: '80px',
                  color: 'rgba(255, 255, 255, 0.8)',
                }}
              >
                💅
              </div>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    return new Response('Error generating image', { status: 500 });
  }
}
