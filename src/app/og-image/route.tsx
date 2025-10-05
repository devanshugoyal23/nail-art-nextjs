import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'system-ui',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            borderRadius: '20px',
            backdropFilter: 'blur(10px)',
          }}
        >
          <h1
            style={{
              fontSize: '72px',
              fontWeight: 'bold',
              color: 'white',
              margin: '0 0 20px 0',
              textAlign: 'center',
              lineHeight: '1.1',
            }}
          >
            AI Nail Art Studio
          </h1>
          <p
            style={{
              fontSize: '32px',
              color: 'rgba(255, 255, 255, 0.9)',
              margin: '0',
              textAlign: 'center',
              maxWidth: '800px',
            }}
          >
            Virtual Try-On & Design Generator
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: '30px',
              gap: '20px',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
              }}
            >
              🎨
            </div>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
              }}
            >
              💅
            </div>
            <div
              style={{
                width: '60px',
                height: '60px',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '30px',
              }}
            >
              ✨
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
}
