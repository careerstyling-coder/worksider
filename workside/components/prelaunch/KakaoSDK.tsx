'use client';

import Script from 'next/script';

export function KakaoSDK() {
  return (
    <Script
      src="https://t1.kakaocdn.net/kakao_js_sdk/2.7.4/kakao.min.js"
      integrity="sha384-DKYJZ8NLiK8MN4/C5P2ezmFnkrysYczQosi1y6YC9mPkHEHoKEJf/ILjYKMmco4"
      crossOrigin="anonymous"
      strategy="afterInteractive"
      onLoad={() => {
        if (typeof window !== 'undefined' && (window as any).Kakao && !(window as any).Kakao.isInitialized()) {
          (window as any).Kakao.init('7be88ea0292320f0de3f6accce9ffd7c');
        }
      }}
    />
  );
}
