import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Workside — 직장인 성장 커뮤니티",
  description: "Workstyle DNA 진단으로 나만의 업무 성향을 파악하고, 동료와 비교해보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased bg-bg-page text-text-primary">
        {children}
      </body>
    </html>
  );
}
