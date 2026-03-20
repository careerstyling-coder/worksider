// @TASK P2-R2-T3 - DNA persona determination logic
// @SPEC docs/planning/02-trd.md#dna-persona

import type { DNAScores } from '@/lib/dna/scoring';
import { PERSONA_DETAILS } from '@/constants/personas';

export interface Persona {
  label: string;
  description: string;
  condition: (scores: DNAScores) => boolean;
}

/**
 * Persona definitions ordered by priority (first match wins).
 * The last entry is always a fallback.
 */
export const PERSONAS: Persona[] = [
  {
    label: '전략적 성과자',
    description: PERSONA_DETAILS['전략적 성과자'].description,
    condition: (s: DNAScores) => s.p_score >= 60 && s.s_score >= 60,
  },
  {
    label: '실무형 전문가',
    description: PERSONA_DETAILS['실무형 전문가'].description,
    condition: (s: DNAScores) => s.p_score >= 60 && s.c_score < 50,
  },
  {
    label: '협력적 조정자',
    description: PERSONA_DETAILS['협력적 조정자'].description,
    condition: (s: DNAScores) => s.c_score >= 60 && s.pol_score >= 50,
  },
  {
    label: '자율형 독립가',
    description: PERSONA_DETAILS['자율형 독립가'].description,
    condition: (s: DNAScores) => s.s_score >= 70,
  },
  {
    label: '조직형 정치인',
    description: PERSONA_DETAILS['조직형 정치인'].description,
    condition: (s: DNAScores) => s.pol_score >= 70,
  },
  {
    label: '중도형 균형가',
    description: PERSONA_DETAILS['중도형 균형가'].description,
    condition: () => true, // fallback
  },
];

/**
 * Determine the persona based on DNA scores.
 * Returns the first matching persona (priority order).
 */
export function determinePersona(scores: DNAScores): { label: string; description: string } {
  const matched = PERSONAS.find((p) => p.condition(scores));
  // Fallback always matches, so matched is never undefined
  return { label: matched!.label, description: matched!.description };
}
