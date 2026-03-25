// @TASK P2-S2-T2 - useInviteProgress hook 테스트
// @SPEC specs/screens/prelaunch/reserved
// @TEST __tests__/hooks/useInviteProgress.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useInviteProgress } from '@/hooks/useInviteProgress';

describe('useInviteProgress', () => {
  const mockFetch = vi.fn();

  beforeEach(() => {
    globalThis.fetch = mockFetch;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('초기 상태는 loading: true, current: 0, rewards: []', () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useInviteProgress('res-123'));
    expect(result.current.loading).toBe(true);
    expect(result.current.current).toBe(0);
    expect(result.current.total).toBe(5);
    expect(result.current.rewards).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('reservationId로 GET /api/rewards 호출', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        rewards: [
          { id: 'r1', type: 'early_adopter_badge', status: 'pending', reservation_id: 'res-123' },
          { id: 'r2', type: 'priority_access', status: 'pending', reservation_id: 'res-123' },
        ],
      }),
    });

    renderHook(() => useInviteProgress('res-123'));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/rewards?reservation_id=res-123')
      );
    });
  });

  it('성공 시 rewards 배열 반환, loading: false', async () => {
    const mockRewards = [
      { id: 'r1', type: 'early_adopter_badge', status: 'pending', reservation_id: 'res-123' },
      { id: 'r2', type: 'priority_access', status: 'pending', reservation_id: 'res-123' },
    ];
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ rewards: mockRewards }),
    });

    const { result } = renderHook(() => useInviteProgress('res-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.rewards).toEqual(mockRewards);
    expect(result.current.error).toBeNull();
  });

  it('성공 시 total은 항상 5', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ rewards: [] }),
    });

    const { result } = renderHook(() => useInviteProgress('res-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.total).toBe(5);
  });

  it('invite_success_count 없으면 current는 0', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        rewards: [
          { id: 'r1', type: 'early_adopter_badge', status: 'pending', reservation_id: 'res-123' },
        ],
      }),
    });

    const { result } = renderHook(() => useInviteProgress('res-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.current).toBe(0);
  });

  it('invite_success_count가 있으면 current에 반영', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        rewards: [],
        invite_success_count: 3,
      }),
    });

    const { result } = renderHook(() => useInviteProgress('res-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.current).toBe(3);
  });

  it('API 에러 시 error 메시지 반환, loading: false', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ error: 'Internal server error' }),
    });

    const { result } = renderHook(() => useInviteProgress('res-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.rewards).toEqual([]);
  });

  it('네트워크 에러 시 error 메시지 반환', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useInviteProgress('res-123'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('reservationId 없으면 fetch 호출 안 함', () => {
    const { result } = renderHook(() => useInviteProgress(''));
    expect(mockFetch).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);
  });
});
