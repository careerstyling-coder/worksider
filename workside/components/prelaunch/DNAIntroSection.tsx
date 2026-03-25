// @TASK P2-S1-T1 - 랜딩 페이지 DNAIntroSection
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
    description: '업무를 계획하고 실행하는 방식. 체계적 접근과 유연한 적응 사이의 균형.',
  },
  {
    label: 'Communication',
    icon: '🤝',
    description: '팀과 소통하는 스타일. 직접적 표현과 맥락적 소통의 조화.',
  },
  {
    label: 'Politics',
    icon: '🎯',
    description: '조직 내 관계와 영향력. 원칙 중심과 유연한 대응의 균형.',
  },
  {
    label: 'Self-leadership',
    icon: '🚀',
    description: '스스로를 이끄는 힘. 내적 동기와 외적 자극을 활용하는 방식.',
  },
];

export function DNAIntroSection() {
  return (
    <section className="bg-slate-50 py-20 px-6">
      <div className="max-w-3xl mx-auto">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
            Work Style DNA 4축
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            일하는 방식을 4가지 관점으로 측정합니다
          </p>
        </div>

        {/* 2x2 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          {DNA_CARDS.map((card) => (
            <div
              key={card.label}
              data-testid="dna-card"
              className="bg-white rounded-xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0" aria-hidden="true">
                  {card.icon}
                </span>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">
                    {card.label}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
