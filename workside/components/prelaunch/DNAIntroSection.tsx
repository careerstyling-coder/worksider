// @TASK P2-S1-T1 - 랜딩 페이지 DNAIntroSection (압축 레이아웃)
// @SPEC specs/screens/prelaunch/landing

interface DNACard {
  label: string;
  icon: string;
  description: string;
}

const DNA_CARDS: DNACard[] = [
  {
    label: 'Practice',
    icon: '⚙️',
    description: '업무를 계획하고 실행하는 방식',
  },
  {
    label: 'Communication',
    icon: '🤝',
    description: '팀과 소통하는 스타일',
  },
  {
    label: 'Politics',
    icon: '🎯',
    description: '조직 내 관계와 영향력',
  },
  {
    label: 'Self-leadership',
    icon: '🚀',
    description: '스스로를 이끄는 힘',
  },
];

export function DNAIntroSection() {
  return (
    <section className="bg-slate-50 py-8 px-6">
      <div className="max-w-3xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-5">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1">
            Work Style DNA의 4가지 축
          </h2>
          <p className="text-slate-500 text-sm sm:text-base">
            일하는 방식을 4가지 관점으로 AI가 분석합니다
          </p>
        </div>

        {/* 4열 가로 배치 (모바일은 2x2) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {DNA_CARDS.map((card) => (
            <div
              key={card.label}
              data-testid="dna-card"
              className="bg-white rounded-xl p-4 border border-slate-200 text-center"
            >
              <span className="text-2xl block mb-2" aria-hidden="true">
                {card.icon}
              </span>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                {card.label}
              </h3>
              <p className="text-slate-400 text-xs leading-snug">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
