// @TASK P2-S2-T2 - SNS 공유 유틸리티
// @SPEC specs/screens/prelaunch/reserved
// @TEST __tests__/lib/share.test.ts

/**
 * 클립보드에 텍스트 복사
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

interface TwitterShareParams {
  text: string;
  url: string;
}

/**
 * Twitter(X) Intent URL로 공유 창 열기
 */
export function shareToTwitter({ text, url }: TwitterShareParams): void {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  const intentUrl = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
  window.open(intentUrl, '_blank');
}

interface KakaoShareParams {
  title: string;
  description: string;
  link: string;
}

interface KakaoSDK {
  isInitialized(): boolean;
  Share: {
    sendDefault(options: {
      objectType: string;
      content: {
        title: string;
        description: string;
        imageUrl?: string;
        link: { mobileWebUrl: string; webUrl: string };
      };
    }): void;
  };
}

/**
 * Kakao SDK로 카카오톡 공유
 * window.Kakao가 없으면 조용히 종료
 */
export function shareToKakao({ title, description, link }: KakaoShareParams): void {
  if (typeof window === 'undefined') return;

  const kakao = (window as unknown as { Kakao?: KakaoSDK }).Kakao;
  if (!kakao) return;

  kakao.Share.sendDefault({
    objectType: 'feed',
    content: {
      title,
      description,
      link: {
        mobileWebUrl: link,
        webUrl: link,
      },
    },
  });
}

/**
 * inviteCode로 전체 초대 URL 생성
 */
export function getInviteLink(inviteCode: string): string {
  const origin =
    typeof window !== 'undefined' && window?.location?.origin
      ? window.location.origin
      : '';
  return `${origin}/prelaunch?ref=${inviteCode}`;
}
