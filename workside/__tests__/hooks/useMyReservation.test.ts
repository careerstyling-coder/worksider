// @TASK P3-S4-T2 - useMyReservation hook 테스트
// @SPEC specs/screens/prelaunch/my-reservation

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useMyReservation } from '@/hooks/useMyReservation';

// localStorage mock
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
  };
})();

Object.defineProperty(globalThis, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// fetch mock
const mockFetch = vi.fn();
Object.defineProperty(globalThis, 'fetch', {
  value: mockFetch,
  writable: true,
});

const MOCK_RESERVATION = {
  id: 'res-uuid-001',
  email: 'test@example.com',
  queue_position: 42,
  invite_code: 'WORK2024',
  industry: 'tech',
  experience_years: '5',
};

const MOCK_INVITE_TRACKING = {
  records: [
    { id: '1', converted: true },
    { id: '2', converted: false },
    { id: '3', converted: true },
  ],
  successful_invites: 2,
};

const MOCK_REWARDS = {
  rewards: [
    { id: 'r1', type: 'early_adopter_badge', status: 'locked', unlocked_at: null },
    { id: 'r2', type: 'priority_access', status: 'locked', unlocked_at: null },
  ],
};

describe('useMyReservation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('localStorage에 이메일이 없으면 email이 null이고 로딩하지 않는다', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const { result } = renderHook(() => useMyReservation());

    expect(result.current.loading).toBe(false);
    expect(result.current.reservation).toBeNull();
    expect(result.current.error).toBe('이메일 정보가 없습니다');
  });

  it('정상 데이터 로드: reservation → invite_tracking + rewards 순차/병렬 호출', async () => {
    localStorageMock.getItem.mockReturnValue('test@example.com');

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_RESERVATION,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_INVITE_TRACKING,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_REWARDS,
      });

    const { result } = renderHook(() => useMyReservation());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reservation).toEqual(MOCK_RESERVATION);
    expect(result.current.inviteStats).toEqual({ successful_invites: 2 });
    expect(result.current.rewards).toEqual(MOCK_REWARDS.rewards);
    expect(result.current.error).toBeNull();
  });

  it('reservation API 404 → error 상태, reservation은 null', async () => {
    localStorageMock.getItem.mockReturnValue('notfound@example.com');

    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: async () => ({ error: '예약 정보를 찾을 수 없습니다' }),
    });

    const { result } = renderHook(() => useMyReservation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reservation).toBeNull();
    expect(result.current.error).toBe('예약 정보를 찾을 수 없습니다');
    expect(result.current.inviteStats).toBeNull();
    expect(result.current.rewards).toBeNull();
  });

  it('invite_tracking API 실패 시 partial 결과 반환 (reservation은 유지)', async () => {
    localStorageMock.getItem.mockReturnValue('test@example.com');

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_RESERVATION,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'server error' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_REWARDS,
      });

    const { result } = renderHook(() => useMyReservation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reservation).toEqual(MOCK_RESERVATION);
    expect(result.current.inviteStats).toEqual({ successful_invites: 0 });
    expect(result.current.rewards).toEqual(MOCK_REWARDS.rewards);
    expect(result.current.error).toBeNull();
  });

  it('rewards API 실패 시 partial 결과 반환 (reservation + inviteStats는 유지)', async () => {
    localStorageMock.getItem.mockReturnValue('test@example.com');

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_RESERVATION,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => MOCK_INVITE_TRACKING,
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'server error' }),
      });

    const { result } = renderHook(() => useMyReservation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reservation).toEqual(MOCK_RESERVATION);
    expect(result.current.inviteStats).toEqual({ successful_invites: 2 });
    expect(result.current.rewards).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('네트워크 에러 시 error 상태 설정', async () => {
    localStorageMock.getItem.mockReturnValue('test@example.com');

    mockFetch.mockRejectedValueOnce(new Error('Network Error'));

    const { result } = renderHook(() => useMyReservation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.reservation).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('올바른 API 순서로 호출: reservation 먼저, 그 다음 invite_tracking + rewards 병렬', async () => {
    localStorageMock.getItem.mockReturnValue('test@example.com');

    const callOrder: string[] = [];

    mockFetch.mockImplementation((url: string) => {
      if (url.includes('/api/reservations')) {
        callOrder.push('reservations');
        return Promise.resolve({
          ok: true,
          json: async () => MOCK_RESERVATION,
        });
      }
      if (url.includes('/api/invite-tracking')) {
        callOrder.push('invite-tracking');
        return Promise.resolve({
          ok: true,
          json: async () => MOCK_INVITE_TRACKING,
        });
      }
      if (url.includes('/api/rewards')) {
        callOrder.push('rewards');
        return Promise.resolve({
          ok: true,
          json: async () => MOCK_REWARDS,
        });
      }
      return Promise.reject(new Error(`Unknown URL: ${url}`));
    });

    const { result } = renderHook(() => useMyReservation());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(callOrder[0]).toBe('reservations');
    expect(callOrder).toContain('invite-tracking');
    expect(callOrder).toContain('rewards');
    expect(mockFetch).toHaveBeenCalledTimes(3);
  });
});
