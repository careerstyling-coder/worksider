// @TASK P3-S3-T3 - OG 이미지 동적 생성 (SCR-3: inviter 파라미터 기반)
// @SPEC specs/screens/prelaunch/invite-landing

import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // SCR-3: inviter 파라미터 (초대 랜딩 OG)
  const inviter = searchParams.get('inviter') || '';

  // DNA 결과 파라미터 (기존 호환)
  const label = searchParams.get('label') || '';
  const p = searchParams.get('p') || '';
  const c = searchParams.get('c') || '';
  const pol = searchParams.get('pol') || '';
  const s = searchParams.get('s') || '';

  const isDnaMode = label || p || c || pol || s;

  if (isDnaMode) {
    // DNA 결과 OG (기존 기능 유지)
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
            {label || 'Work DNA'}
          </div>
          <div style={{ display: 'flex', gap: 40, fontSize: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 'bold' }}>{p || '50'}</div>
              <div style={{ opacity: 0.7 }}>P</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 'bold' }}>{c || '50'}</div>
              <div style={{ opacity: 0.7 }}>C</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 'bold' }}>{pol || '50'}</div>
              <div style={{ opacity: 0.7 }}>Pol</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: 36, fontWeight: 'bold' }}>{s || '50'}</div>
              <div style={{ opacity: 0.7 }}>S</div>
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // 초대 랜딩 OG (SCR-3): inviter 있으면 "{inviter}님이 추천하는 Workside", 없으면 기본 OG
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
          background: 'linear-gradient(135deg, #f97316 0%, #fb923c 30%, #3b82f6 70%, #1d4ed8 100%)',
          color: 'white',
          fontFamily: 'sans-serif',
          padding: '60px',
        }}
      >
        {/* 로고/브랜드 영역 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 32,
            gap: 12,
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              fontWeight: 'bold',
            }}
          >
            W
          </div>
          <span style={{ fontSize: 28, fontWeight: 'bold', letterSpacing: '-0.5px' }}>
            Workside
          </span>
        </div>

        {/* 메인 카피 */}
        {inviter ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 22,
                opacity: 0.9,
                fontWeight: 400,
                letterSpacing: '0.5px',
              }}
            >
              {inviter}님이 추천하는
            </div>
            <div
              style={{
                fontSize: 52,
                fontWeight: 'bold',
                letterSpacing: '-1px',
                lineHeight: 1.1,
                textAlign: 'center',
              }}
            >
              Workside
            </div>
          </div>
        ) : (
          <div
            style={{
              fontSize: 52,
              fontWeight: 'bold',
              letterSpacing: '-1px',
              lineHeight: 1.1,
              textAlign: 'center',
            }}
          >
            Workside
          </div>
        )}

        {/* 서비스 소개 */}
        <div
          style={{
            marginTop: 24,
            fontSize: 20,
            opacity: 0.85,
            textAlign: 'center',
            maxWidth: 680,
            lineHeight: 1.5,
          }}
        >
          나의 일하는 방식을 DNA로 분석하고, 같은 성향의 팀을 연결합니다
        </div>

        {/* 하단 태그 */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            gap: 12,
          }}
        >
          {['Work DNA', '팀 매칭', '프리랜서'].map((tag) => (
            <div
              key={tag}
              style={{
                padding: '8px 20px',
                borderRadius: 100,
                background: 'rgba(255,255,255,0.2)',
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
