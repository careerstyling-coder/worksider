// @TASK P3-S3-T2 - useInviteCode hook 테스트
// @SPEC specs/screens/prelaunch/invite-landing

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useInviteCode } from '@/hooks/useInviteCode';

const mockInviterData = {
  id: 'inviter-uuid-123',
  email: 'inviter@test.com',
  invite_code: 'abc123',
  queue_position: 5,
};

describe('useInviteCode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('초기 상태는 loading=true, inviterName=null이어야 한다', () => {
    const mockFetch = vi.fn().mockReturnValue(new Promise(() => {}));
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useInviteCode('abc123'));

    expect(result.current.loading).toBe(true);
    expect(result.current.inviterName).toBeNull();
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('유효한 초대코드이면 inviterName을 반환하고 isValid=true', async () => {
    const mockFetch = vi.fn()
      // 1st call: GET /api/reservations?invite_code=abc123
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockInviterData,
      })
      // 2nd call: POST /api/invite-tracking
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'track-1', inviter_id: 'inviter-uuid-123', invite_code: 'abc123' }),
      });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useInviteCode('abc123'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.inviterName).toBe('inviter@test.com');
    expect(result.current.error).toBeNull();
  });

  it('무효한 초대코드이면 isValid=false, inviterName=null', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: '예약 정보를 찾을 수 없습니다' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useInviteCode('invalid-code'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.inviterName).toBeNull();
  });

  it('초대코드 조회 성공 시 POST /api/invite-tracking 호출', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockInviterData,
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'track-1', inviter_id: 'inviter-uuid-123', invite_code: 'abc123' }),
      });
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useInviteCode('abc123'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/invite-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: 'abc123' }),
    });
  });

  it('invite_code가 undefined이면 fetch를 호출하지 않는다', () => {
    const mockFetch = vi.fn();
    vi.stubGlobal('fetch', mockFetch);

    renderHook(() => useInviteCode(undefined));

    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('invite_code가 undefined이면 loading=false, isValid=false', async () => {
    const { result } = renderHook(() => useInviteCode(undefined));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.inviterName).toBeNull();
  });

  it('네트워크 에러 시 error 상태를 설정한다', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useInviteCode('abc123'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(false);
    expect(result.current.error).toBeTruthy();
  });

  it('클릭 추적 실패해도 inviterName은 반환된다 (비크리티컬)', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockInviterData,
      })
      .mockRejectedValueOnce(new Error('tracking failed'));
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useInviteCode('abc123'));

    await act(async () => {
      await new Promise((r) => setTimeout(r, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.inviterName).toBe('inviter@test.com');
  });
});
