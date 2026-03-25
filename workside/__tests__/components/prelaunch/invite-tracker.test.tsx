// @TASK P3-S3-T2 - 초대 클릭 추적 컴포넌트 테스트
// @SPEC specs/screens/prelaunch/invite-landing

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { InviteTracker } from '@/components/prelaunch/InviteTracker';

describe('InviteTracker', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders null (no UI output)', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'track-1' }),
    });

    const { container } = render(<InviteTracker invite_code="abc123" />);

    // useEffect 완료 대기
    await new Promise((r) => setTimeout(r, 0));

    expect(container.firstChild).toBeNull();
  });

  it('호출 시 POST /api/invite-tracking으로 추적 API 호출', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'track-1' }),
    });

    render(<InviteTracker invite_code="abc123" />);

    // useEffect는 비동기이므로 마이크로태스크 대기
    await new Promise((r) => setTimeout(r, 0));

    expect(fetchSpy).toHaveBeenCalledWith('/api/invite-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: 'abc123' }),
    });
  });

  it('invite_code가 빈 문자열이면 fetch 호출 안 함', () => {
    render(<InviteTracker invite_code="" />);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('fetch 실패해도 에러 처리 없음 (silent failure)', async () => {
    fetchSpy.mockRejectedValue(new Error('Network error'));

    // console.error 스파이로 에러 출력 확인
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<InviteTracker invite_code="abc123" />);

    await new Promise((r) => setTimeout(r, 0));

    expect(fetchSpy).toHaveBeenCalled();
    expect(consoleErrorSpy).not.toHaveBeenCalled();

    consoleErrorSpy.mockRestore();
  });

  it('invite_code 변경 시 새로운 API 호출 (dependency)', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'track-1' }),
    });

    const { rerender } = render(<InviteTracker invite_code="code1" />);

    await new Promise((r) => setTimeout(r, 0));

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // invite_code 변경
    rerender(<InviteTracker invite_code="code2" />);

    await new Promise((r) => setTimeout(r, 0));

    expect(fetchSpy).toHaveBeenCalledTimes(2);
    expect(fetchSpy).toHaveBeenLastCalledWith('/api/invite-tracking', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invite_code: 'code2' }),
    });
  });

  it('invite_code가 동일하면 중복 호출 없음', async () => {
    fetchSpy.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'track-1' }),
    });

    const { rerender } = render(<InviteTracker invite_code="abc123" />);

    await new Promise((r) => setTimeout(r, 0));

    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // 동일한 invite_code로 rerender
    rerender(<InviteTracker invite_code="abc123" />);

    await new Promise((r) => setTimeout(r, 0));

    // useEffect dependency가 동일하므로 추가 호출 없음
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('Content-Type 헤더가 application/json', async () => {
    fetchSpy.mockResolvedValue({ ok: true });

    render(<InviteTracker invite_code="abc123" />);

    await new Promise((r) => setTimeout(r, 0));

    const callArgs = fetchSpy.mock.calls[0][1];
    expect(callArgs?.headers?.['Content-Type']).toBe('application/json');
  });
});
