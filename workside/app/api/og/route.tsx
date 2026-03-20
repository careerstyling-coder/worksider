// @TASK P2-R2-T4 - OG image dynamic generation API
// @SPEC docs/planning/02-trd.md#dna-og-image

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const label = searchParams.get('label') || 'Work DNA';
  const p = searchParams.get('p') || '50';
  const c = searchParams.get('c') || '50';
  const pol = searchParams.get('pol') || '50';
  const s = searchParams.get('s') || '50';

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          background:
            'linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ fontSize: 28, opacity: 0.8, marginBottom: 8 }}>
          Workside DNA
        </div>
        <div style={{ fontSize: 48, fontWeight: 'bold', marginBottom: 32 }}>
          {label}
        </div>
        <div style={{ display: 'flex', gap: 40, fontSize: 24 }}>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 'bold' }}>{p}</div>
            <div style={{ opacity: 0.7 }}>P</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 'bold' }}>{c}</div>
            <div style={{ opacity: 0.7 }}>C</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 'bold' }}>{pol}</div>
            <div style={{ opacity: 0.7 }}>Pol</div>
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 'bold' }}>{s}</div>
            <div style={{ opacity: 0.7 }}>S</div>
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
