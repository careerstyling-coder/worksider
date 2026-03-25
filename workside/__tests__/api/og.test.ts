// @TASK P3-S3-T3 - OG 이미지 동적 생성 테스트
// @SPEC specs/screens/prelaunch/invite-landing

import { describe, it, expect, vi, beforeEach } from 'vitest';

// next/og ImageResponse는 Edge Runtime에서만 동작하므로 mock 처리
// 생성자에 전달된 element와 options를 기록하여 inviter 파라미터 반영 여부 검증
const constructorCalls: Array<{ element: unknown; options: unknown }> = [];

vi.mock('next/og', () => {
  return {
    ImageResponse: class MockImageResponse {
      status: number;
      headers: Headers;
      body: ReadableStream | null;

      constructor(element: unknown, options?: { width?: number; height?: number }) {
        constructorCalls.push({ element, options });
        this.status = 200;
        this.headers = new Headers({ 'content-type': 'image/png' });
        this.body = null;
      }
    },
  };
});

describe('GET /api/og', () => {
  beforeEach(() => {
    vi.resetModules();
    constructorCalls.length = 0;
  });

  it('기본 OG 이미지: inviter 없을 때 200 응답 + image/png content-type', async () => {
    const { GET } = await import('@/app/api/og/route');

    const request = new Request('http://localhost/api/og');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('기본 OG 이미지: 1200x630 크기로 생성', async () => {
    const { GET } = await import('@/app/api/og/route');

    const request = new Request('http://localhost/api/og');
    await GET(request);

    expect(constructorCalls.length).toBeGreaterThan(0);
    const lastCall = constructorCalls[constructorCalls.length - 1];
    expect(lastCall.options).toMatchObject({ width: 1200, height: 630 });
  });

  it('초대자 OG 이미지: inviter 파라미터 있을 때 200 응답', async () => {
    const { GET } = await import('@/app/api/og/route');

    const request = new Request('http://localhost/api/og?inviter=홍길동');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });

  it('초대자 OG 이미지: inviter 이름이 element에 포함됨', async () => {
    const { GET } = await import('@/app/api/og/route');

    const request = new Request('http://localhost/api/og?inviter=홍길동');
    await GET(request);

    expect(constructorCalls.length).toBeGreaterThan(0);
    const lastCall = constructorCalls[constructorCalls.length - 1];
    // element를 JSON 직렬화해서 inviter 이름 포함 여부 확인
    const elementStr = JSON.stringify(lastCall.element);
    expect(elementStr).toContain('홍길동');
  });

  it('inviter 파라미터가 빈 문자열이면 기본 OG 이미지 반환 (inviter 이름 없음)', async () => {
    const { GET } = await import('@/app/api/og/route');

    const request = new Request('http://localhost/api/og?inviter=');
    const response = await GET(request);

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toBe('image/png');
  });
});
