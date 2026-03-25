// @TASK P2-S1-T1 - 랜딩 페이지 HeroSection
// @SPEC specs/screens/prelaunch/landing

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 min-h-[85vh] flex flex-col items-center justify-center px-6 py-24 text-center">
      {/* 배경 장식 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto">
        {/* 배지 */}
        <span className="inline-block mb-6 px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-sm font-medium tracking-wide">
          Workside 프리론칭
        </span>

        {/* 메인 타이틀 */}
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight mb-6">
          당신의 일 스타일을 먼저
        </h1>

        {/* 서브타이틀 */}
        <p className="text-lg sm:text-xl text-slate-300 leading-relaxed mb-10">
          첫 500명을 위한 특별한 기회
        </p>

        <p className="text-slate-400 text-base">
          나만의 Work Style DNA를 먼저 발견하고,<br className="hidden sm:block" />
          같은 성향의 동료들과 연결되세요.
        </p>
      </div>

      {/* 스크롤 유도 */}
      <div
        data-testid="scroll-hint"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-slate-500"
      >
        <span className="text-xs tracking-widest uppercase">스크롤</span>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="animate-bounce"
          aria-hidden="true"
        >
          <path
            d="M10 3v14M10 17l-5-5M10 17l5-5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </section>
  );
}
