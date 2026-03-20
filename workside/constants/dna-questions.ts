// @TASK P2-R2-T2 - DNA diagnostic questions data
// @SPEC docs/planning/02-trd.md#dna-questions

export interface DNAQuestion {
  id: string;
  text: string;
  axis: 'P' | 'C' | 'Pol' | 'S';
  weight: number;
  reversed?: boolean;
}

/**
 * Semi DNA diagnosis: 12 questions (3 per axis)
 * Response scale: 1-7 Likert
 * Axes: P(Performance), C(Collaboration), Pol(Politics), S(Self-direction)
 */
export const SEMI_QUESTIONS: DNAQuestion[] = [
  // P axis - Performance (성과 지향)
  { id: 'P1', text: '나는 결과물의 완성도를 최우선으로 생각한다', axis: 'P', weight: 1 },
  { id: 'P2', text: '업무 목표 달성이 가장 중요하다', axis: 'P', weight: 1 },
  { id: 'P3', text: '효율적인 프로세스를 선호한다', axis: 'P', weight: 1 },

  // C axis - Collaboration (협업 지향)
  { id: 'C1', text: '동료들과 의견을 나누는 것을 즐긴다', axis: 'C', weight: 1 },
  { id: 'C2', text: '함께 일할 때 더 좋은 결과가 나온다고 믿는다', axis: 'C', weight: 1 },
  { id: 'C3', text: '동료의 피드백을 적극 수용한다', axis: 'C', weight: 1 },

  // Pol axis - Politics (정치 감각)
  { id: 'Pol1', text: '조직 내 관계와 역학을 잘 파악한다', axis: 'Pol', weight: 1 },
  { id: 'Pol2', text: '상황에 따라 소통 방식을 조절한다', axis: 'Pol', weight: 1 },
  { id: 'Pol3', text: '조직의 의사결정 과정을 이해하고 활용한다', axis: 'Pol', weight: 1 },

  // S axis - Self-direction (자율 지향)
  { id: 'S1', text: '스스로 일정을 관리하는 것을 선호한다', axis: 'S', weight: 1 },
  { id: 'S2', text: '독립적으로 문제를 해결하는 편이다', axis: 'S', weight: 1 },
  { id: 'S3', text: '자율적인 환경에서 더 잘 일한다', axis: 'S', weight: 1 },
];

/**
 * Full DNA diagnosis: 40 questions (10 per axis)
 */
export const FULL_QUESTIONS: DNAQuestion[] = [
  // P axis - Performance (성과 지향) 10문항
  { id: 'FP1', text: '나는 결과물의 완성도를 최우선으로 생각한다', axis: 'P', weight: 1 },
  { id: 'FP2', text: '업무 목표 달성이 가장 중요하다', axis: 'P', weight: 1 },
  { id: 'FP3', text: '효율적인 프로세스를 선호한다', axis: 'P', weight: 1 },
  { id: 'FP4', text: '데드라인을 지키는 것은 나에게 매우 중요하다', axis: 'P', weight: 1 },
  { id: 'FP5', text: '성과 지표로 업무를 평가받는 것을 선호한다', axis: 'P', weight: 1 },
  { id: 'FP6', text: '업무에서 최고의 품질을 추구한다', axis: 'P', weight: 1 },
  { id: 'FP7', text: '목표를 세우고 이를 달성할 때 큰 성취감을 느낀다', axis: 'P', weight: 1 },
  { id: 'FP8', text: '일을 빠르게 처리하는 편이다', axis: 'P', weight: 1 },
  { id: 'FP9', text: '결과를 내기 위해 필요한 노력을 아끼지 않는다', axis: 'P', weight: 1 },
  { id: 'FP10', text: '체계적인 계획을 세우고 실행한다', axis: 'P', weight: 1 },

  // C axis - Collaboration (협업 지향) 10문항
  { id: 'FC1', text: '동료들과 의견을 나누는 것을 즐긴다', axis: 'C', weight: 1 },
  { id: 'FC2', text: '함께 일할 때 더 좋은 결과가 나온다고 믿는다', axis: 'C', weight: 1 },
  { id: 'FC3', text: '동료의 피드백을 적극 수용한다', axis: 'C', weight: 1 },
  { id: 'FC4', text: '함께 일하는 사람들의 분위기를 살피고 배려하는 편이다', axis: 'C', weight: 1 },
  { id: 'FC5', text: '갈등 상황에서 중재자 역할을 자주 한다', axis: 'C', weight: 1 },
  { id: 'FC6', text: '다른 사람의 의견을 경청하는 편이다', axis: 'C', weight: 1 },
  { id: 'FC7', text: '협업 프로젝트에서 적극적으로 참여한다', axis: 'C', weight: 1 },
  { id: 'FC8', text: '동료가 어려움을 겪을 때 도움을 주고 싶다', axis: 'C', weight: 1 },
  { id: 'FC9', text: '회의에서 활발하게 토론하는 것을 좋아한다', axis: 'C', weight: 1 },
  { id: 'FC10', text: '다양한 관점을 모으면 더 나은 결정이 가능하다', axis: 'C', weight: 1 },

  // Pol axis - Politics (정치 감각) 10문항
  { id: 'FPol1', text: '조직 내 관계와 역학을 잘 파악한다', axis: 'Pol', weight: 1 },
  { id: 'FPol2', text: '상황에 따라 소통 방식을 조절한다', axis: 'Pol', weight: 1 },
  { id: 'FPol3', text: '조직의 의사결정 과정을 이해하고 활용한다', axis: 'Pol', weight: 1 },
  { id: 'FPol4', text: '핵심 인물이 누구인지 빠르게 파악하는 편이다', axis: 'Pol', weight: 1 },
  { id: 'FPol5', text: '상대방의 관심사를 파악해 대화를 이끈다', axis: 'Pol', weight: 1 },
  { id: 'FPol6', text: '조직 문화에 맞게 행동을 조절할 수 있다', axis: 'Pol', weight: 1 },
  { id: 'FPol7', text: '비공식적인 소통 채널을 잘 활용한다', axis: 'Pol', weight: 1 },
  { id: 'FPol8', text: '회사의 정치적 역학 관계를 이해하는 것이 중요하다', axis: 'Pol', weight: 1 },
  { id: 'FPol9', text: '네트워킹을 통해 업무 기회를 확대한다', axis: 'Pol', weight: 1 },
  { id: 'FPol10', text: '전략적으로 사람들과 관계를 형성한다', axis: 'Pol', weight: 1 },

  // S axis - Self-direction (자율 지향) 10문항
  { id: 'FS1', text: '스스로 일정을 관리하는 것을 선호한다', axis: 'S', weight: 1 },
  { id: 'FS2', text: '독립적으로 문제를 해결하는 편이다', axis: 'S', weight: 1 },
  { id: 'FS3', text: '자율적인 환경에서 더 잘 일한다', axis: 'S', weight: 1 },
  { id: 'FS4', text: '세밀한 관리보다는 자유로운 환경을 선호한다', axis: 'S', weight: 1 },
  { id: 'FS5', text: '내가 결정한 방식으로 일할 때 효율이 높다', axis: 'S', weight: 1 },
  { id: 'FS6', text: '새로운 일을 스스로 찾아서 하는 편이다', axis: 'S', weight: 1 },
  { id: 'FS7', text: '상사의 지시 없이도 주도적으로 업무를 진행한다', axis: 'S', weight: 1 },
  { id: 'FS8', text: '업무 방식에 대한 재량권이 중요하다', axis: 'S', weight: 1 },
  { id: 'FS9', text: '자기 주도적 학습을 즐긴다', axis: 'S', weight: 1 },
  { id: 'FS10', text: '규칙보다 유연성을 더 중요시한다', axis: 'S', weight: 1 },
];

/** Question count per axis by version */
export const QUESTIONS_PER_AXIS = {
  semi: 3,
  full: 10, // future
} as const;
