// @TASK P2-S2-T2 - SNS 공유 유틸 테스트
// @SPEC specs/screens/prelaunch/reserved

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  copyToClipboard,
  shareToTwitter,
  shareToKakao,
  getInviteLink,
} from '@/lib/share';

describe('copyToClipboard', () => {
  const mockWriteText = vi.fn();

  beforeEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: { clipboard: { writeText: mockWriteText } },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('navigator.clipboard.writeText 호출', async () => {
    mockWriteText.mockResolvedValue(undefined);
    await copyToClipboard('https://workside.app/prelaunch?ref=ABC123');
    expect(mockWriteText).toHaveBeenCalledWith('https://workside.app/prelaunch?ref=ABC123');
  });

  it('성공 시 true 반환', async () => {
    mockWriteText.mockResolvedValue(undefined);
    const result = await copyToClipboard('test text');
    expect(result).toBe(true);
  });

  it('실패 시 false 반환', async () => {
    mockWriteText.mockRejectedValue(new Error('Permission denied'));
    const result = await copyToClipboard('test text');
    expect(result).toBe(false);
  });
});

describe('shareToTwitter', () => {
  const mockWindowOpen = vi.fn();

  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: { open: mockWindowOpen },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('window.open 호출', () => {
    shareToTwitter({ text: 'Workside 예약 완료!', url: 'https://workside.app' });
    expect(mockWindowOpen).toHaveBeenCalled();
  });

  it('Twitter intent URL 사용', () => {
    shareToTwitter({ text: '테스트', url: 'https://workside.app' });
    const call = mockWindowOpen.mock.calls[0][0] as string;
    expect(call).toContain('twitter.com/intent/tweet');
  });

  it('text 파라미터 포함', () => {
    shareToTwitter({ text: 'Workside 예약!', url: 'https://workside.app' });
    const call = mockWindowOpen.mock.calls[0][0] as string;
    expect(decodeURIComponent(call)).toContain('Workside 예약!');
  });

  it('url 파라미터 포함', () => {
    shareToTwitter({ text: '공유', url: 'https://workside.app/ref=TEST' });
    const call = mockWindowOpen.mock.calls[0][0] as string;
    expect(decodeURIComponent(call)).toContain('workside.app');
  });

  it('_blank 타겟으로 열기', () => {
    shareToTwitter({ text: '공유', url: 'https://workside.app' });
    expect(mockWindowOpen.mock.calls[0][1]).toBe('_blank');
  });
});

describe('shareToKakao', () => {
  afterEach(() => {
    vi.clearAllMocks();
    // @ts-expect-error - cleanup
    delete globalThis.window?.Kakao;
  });

  it('window.Kakao 없으면 에러 없이 종료', () => {
    Object.defineProperty(globalThis, 'window', {
      value: {},
      writable: true,
      configurable: true,
    });
    expect(() =>
      shareToKakao({ title: '제목', description: '설명', link: 'https://workside.app' })
    ).not.toThrow();
  });

  it('window.Kakao 있으면 SDK 호출', () => {
    const mockSendDefault = vi.fn();
    Object.defineProperty(globalThis, 'window', {
      value: {
        Kakao: {
          isInitialized: () => true,
          Share: { sendDefault: mockSendDefault },
        },
      },
      writable: true,
      configurable: true,
    });
    shareToKakao({ title: '워크사이드', description: '프리런치', link: 'https://workside.app' });
    expect(mockSendDefault).toHaveBeenCalled();
  });
});

describe('getInviteLink', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'window', {
      value: { location: { origin: 'https://workside.app' } },
      writable: true,
      configurable: true,
    });
  });

  it('전체 초대 URL 반환', () => {
    const link = getInviteLink('ABC123');
    expect(link).toBe('https://workside.app/prelaunch?ref=ABC123');
  });

  it('inviteCode를 URL에 포함', () => {
    const link = getInviteLink('XYZ789');
    expect(link).toContain('XYZ789');
  });

  it('/prelaunch 경로 포함', () => {
    const link = getInviteLink('CODE001');
    expect(link).toContain('/prelaunch');
  });

  it('window 없는 환경에서도 동작', () => {
    Object.defineProperty(globalThis, 'window', {
      value: undefined,
      writable: true,
      configurable: true,
    });
    const link = getInviteLink('CODE001');
    expect(link).toContain('CODE001');
    expect(link).toContain('/prelaunch');
  });
});
