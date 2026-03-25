// @TASK P2-S1-T2 - useReservation hook 테스트
// @SPEC specs/screens/prelaunch/landing

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useReservation } from '@/hooks/useReservation';

const mockReservationData = {
  id: 'test-uuid-123',
  email: 'test@test.com',
  queue_position: 42,
  invite_code: 'abc123',
  industry: '개발',
  experience_years: '3-5년',
};

const mockFormData = {
  email: 'test@test.com',
  industry: '개발',
  experience_years: '3-5년',
};

describe('useReservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('초기 상태는 idle이어야 한다', () => {
    const { result } = renderHook(() => useReservation());
    expect(result.current.status).toBe('idle');
    expect(result.current.reservation).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('createReservation 호출 시 POST /api/reservations 요청을 보낸다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockReservationData,
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useReservation());

    await act(async () => {
      await result.current.createReservation(mockFormData);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mockFormData),
    });
  });

  it('성공 응답 시 status를 success로 변경하고 reservation 데이터를 반환한다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockReservationData,
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useReservation());

    await act(async () => {
      await result.current.createReservation(mockFormData);
    });

    expect(result.current.status).toBe('success');
    expect(result.current.reservation).toEqual(mockReservationData);
    expect(result.current.error).toBeNull();
  });

  it('호출 중 loading 상태가 된다', async () => {
    let resolvePromise: (value: unknown) => void;
    const pendingPromise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    const mockFetch = vi.fn().mockReturnValue(pendingPromise);
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useReservation());

    act(() => {
      result.current.createReservation(mockFormData);
    });

    expect(result.current.status).toBe('loading');

    // 정리
    await act(async () => {
      resolvePromise!({
        ok: true,
        status: 201,
        json: async () => mockReservationData,
      });
      await pendingPromise;
    });
  });

  it('409 응답 시 error를 "이미 예약하신 이메일입니다"로 설정한다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: '이미 예약된 이메일입니다' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useReservation());

    await act(async () => {
      await result.current.createReservation(mockFormData);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('이미 예약하신 이메일입니다');
    expect(result.current.reservation).toBeNull();
  });

  it('기타 에러 응답 시 error를 "오류가 발생했습니다. 다시 시도해주세요"로 설정한다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal Server Error' }),
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useReservation());

    await act(async () => {
      await result.current.createReservation(mockFormData);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('오류가 발생했습니다. 다시 시도해주세요');
    expect(result.current.reservation).toBeNull();
  });

  it('네트워크 에러 시 error를 "오류가 발생했습니다. 다시 시도해주세요"로 설정한다', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('Network error'));
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useReservation());

    await act(async () => {
      await result.current.createReservation(mockFormData);
    });

    expect(result.current.status).toBe('error');
    expect(result.current.error).toBe('오류가 발생했습니다. 다시 시도해주세요');
    expect(result.current.reservation).toBeNull();
  });

  it('ref 파라미터를 포함해서 요청한다', async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 201,
      json: async () => mockReservationData,
    });
    vi.stubGlobal('fetch', mockFetch);

    const { result } = renderHook(() => useReservation());
    const dataWithRef = { ...mockFormData, ref: 'abc123' };

    await act(async () => {
      await result.current.createReservation(dataWithRef);
    });

    expect(mockFetch).toHaveBeenCalledWith('/api/reservations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataWithRef),
    });
  });
});
