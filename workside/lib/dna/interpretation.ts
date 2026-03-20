/**
 * 점수 기반 동적 해석 엔진
 * 같은 페르소나라도 축 점수의 정도에 따라 미묘하게 다른 해석을 생성
 */

interface Scores {
  p: number;
  c: number;
  pol: number;
  s: number;
}

type Level = 'very_high' | 'high' | 'mid' | 'low' | 'very_low';

function getLevel(score: number): Level {
  if (score >= 80) return 'very_high';
  if (score >= 65) return 'high';
  if (score >= 45) return 'mid';
  if (score >= 30) return 'low';
  return 'very_low';
}

// ── 축별 점수 해석 ──

const AXIS_INTERPRETATIONS: Record<string, Record<Level, string>> = {
  p: {
    very_high: '실행력이 매우 높습니다. 목표를 향한 추진력이 압도적이며, 주변 사람들도 당신의 에너지에 영향을 받습니다. 때로는 속도를 조절하며 동료와 보조를 맞추는 것도 전략이에요.',
    high: '실행력이 높은 편입니다. 목표를 세우면 꾸준히 달려가는 힘이 있으며, 적당한 긴장감 속에서 가장 좋은 성과를 냅니다.',
    mid: '실행력은 상황에 따라 유연하게 발휘됩니다. 급하게 달리기보다 판단 후 움직이는 신중함이 있어요.',
    low: '실행에 옮기기 전 충분히 생각하는 편입니다. 이 신중함이 실수를 줄여주지만, 가끔은 먼저 시작해보는 것도 새로운 발견을 가져다줘요.',
    very_low: '깊이 생각한 후에 움직이는 사색형입니다. 행동보다 사고에 에너지를 쓰는 당신만의 리듬이 있어요. 작은 실행부터 시작하면 자신감이 쌓여갑니다.',
  },
  c: {
    very_high: '협력에 대한 열정이 매우 강합니다. 함께할 때 에너지가 올라가고, 동료의 성장이 곧 나의 기쁨인 사람이에요. 다만 혼자만의 시간도 챙기세요.',
    high: '동료와 함께 일하는 것을 즐기며, 소통을 통해 더 나은 결과를 만드는 경험을 자주 합니다.',
    mid: '협업과 독립 작업 사이에서 균형을 잘 잡습니다. 필요할 때 협력하고, 집중이 필요할 때는 혼자 일하는 유연함이 있어요.',
    low: '독립적으로 일하는 것이 더 편합니다. 이것은 약점이 아니라 깊은 집중이 필요한 업무에서 빛나는 강점이에요.',
    very_low: '혼자 일할 때 최고의 집중력을 발휘합니다. 협업이 필요한 순간에는 짧고 효율적인 소통을 선호해요. 정기적인 체크인 루틴을 만들면 고립 없이 독립성을 유지할 수 있어요.',
  },
  pol: {
    very_high: '조직의 역학을 읽는 능력이 탁월합니다. 누가 어떤 영향력을 가지고 있는지 직감적으로 파악하며, 이 능력을 조직의 성장을 위해 활용하면 진정한 리더십이 됩니다.',
    high: '상황을 읽고 적절하게 대응하는 감각이 있습니다. 때와 장소에 맞는 소통 방식을 자연스럽게 조절해요.',
    mid: '조직의 흐름을 어느 정도 파악하면서도, 지나치게 정치적이지 않은 균형감이 있습니다.',
    low: '정치적 역학보다 실력으로 인정받는 것을 선호합니다. 이 진정성이 주변의 신뢰를 만드는 원천이에요.',
    very_low: '조직 정치에 관심이 거의 없고, 순수하게 일 자체에 집중합니다. 이 순수함이 강점이지만, 최소한의 조직 역학 이해는 당신의 좋은 아이디어가 묻히지 않게 해줘요.',
  },
  s: {
    very_high: '자율성에 대한 욕구가 매우 강합니다. 누군가가 관리하는 것을 불편하게 느끼며, 자유로운 환경에서 창의적인 결과를 냅니다. 이 자율성을 인정받는 환경을 찾는 것이 중요해요.',
    high: '자기주도적으로 일하는 것을 선호하며, 스스로 일정을 관리하고 문제를 해결하는 능력이 있습니다.',
    mid: '적절한 가이드와 자율성의 균형을 추구합니다. 방향이 주어지면 그 안에서 자유롭게 움직이는 스타일이에요.',
    low: '체계적인 구조 안에서 안정적으로 일하는 것을 선호합니다. 명확한 가이드라인이 오히려 당신의 생산성을 높여줘요.',
    very_low: '명확한 지시와 체계가 있을 때 가장 편안하게 일합니다. 이것은 규율과 안정을 중시하는 당신만의 업무 철학이에요. 점진적으로 작은 결정부터 스스로 해보면 새로운 자신감을 발견할 수 있어요.',
  },
};

// ── 동적 종합 해석 생성 ──

export function generateDynamicInterpretation(scores: Scores, personaLabel: string): {
  axisInsights: { axis: string; label: string; score: number; interpretation: string }[];
  overallNuance: string;
} {
  const axes = [
    { axis: 'p', label: '실행력', score: scores.p },
    { axis: 'c', label: '협력', score: scores.c },
    { axis: 'pol', label: '영향력', score: scores.pol },
    { axis: 's', label: '자율성', score: scores.s },
  ];

  const axisInsights = axes.map(a => ({
    ...a,
    interpretation: AXIS_INTERPRETATIONS[a.axis][getLevel(a.score)],
  }));

  // 가장 높은 축과 가장 낮은 축의 차이로 전체적 뉘앙스 결정
  const sorted = [...axes].sort((a, b) => b.score - a.score);
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];
  const gap = highest.score - lowest.score;

  let overallNuance: string;

  if (gap <= 15) {
    overallNuance = `당신의 ${personaLabel} 유형은 모든 축이 비교적 균형 잡혀 있어, 상황에 따라 다양한 역할을 유연하게 수행할 수 있는 안정적인 형태입니다.`;
  } else if (gap <= 30) {
    overallNuance = `당신의 ${personaLabel} 유형은 ${highest.label}(${highest.score})이 두드러지면서도 다른 영역과의 조화가 있어, 전문성과 유연성을 동시에 갖추고 있습니다.`;
  } else {
    overallNuance = `당신의 ${personaLabel} 유형은 ${highest.label}(${highest.score})이 매우 강하고 ${lowest.label}(${lowest.score})과의 차이가 뚜렷합니다. 이 선명한 특성이 당신만의 고유한 업무 스타일을 만들어냅니다. ${lowest.label} 영역을 조금씩 발전시키면 더 큰 시너지를 경험할 수 있어요.`;
  }

  return { axisInsights, overallNuance };
}
