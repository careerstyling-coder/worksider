// @TASK P2-R2-T3 - DNA persona determination tests
// @SPEC docs/planning/02-trd.md#dna-persona

import { describe, it, expect } from 'vitest';
import { determinePersona, PERSONAS } from '@/lib/dna/persona';
import type { DNAScores } from '@/lib/dna/scoring';

describe('determinePersona', () => {
  it('should return "strategic achiever" when P >= 60 and S >= 60', () => {
    const scores: DNAScores = { p_score: 80, c_score: 40, pol_score: 30, s_score: 70 };
    const persona = determinePersona(scores);
    expect(persona.label).toBe('전략적 성과자');
  });

  it('should return "practical expert" when P >= 60 and C < 50', () => {
    const scores: DNAScores = { p_score: 75, c_score: 30, pol_score: 40, s_score: 40 };
    const persona = determinePersona(scores);
    expect(persona.label).toBe('실무형 전문가');
  });

  it('should return "collaborative coordinator" when C >= 60 and Pol >= 50', () => {
    const scores: DNAScores = { p_score: 40, c_score: 70, pol_score: 55, s_score: 30 };
    const persona = determinePersona(scores);
    expect(persona.label).toBe('협력적 조정자');
  });

  it('should return "autonomous independent" when S >= 70', () => {
    const scores: DNAScores = { p_score: 40, c_score: 55, pol_score: 40, s_score: 75 };
    const persona = determinePersona(scores);
    expect(persona.label).toBe('자율형 독립가');
  });

  it('should return "organizational politician" when Pol >= 70', () => {
    const scores: DNAScores = { p_score: 40, c_score: 40, pol_score: 80, s_score: 40 };
    const persona = determinePersona(scores);
    expect(persona.label).toBe('조직형 정치인');
  });

  it('should return "balanced moderate" as fallback', () => {
    const scores: DNAScores = { p_score: 45, c_score: 45, pol_score: 45, s_score: 45 };
    const persona = determinePersona(scores);
    expect(persona.label).toBe('중도형 균형가');
  });

  describe('priority ordering', () => {
    it('should prioritize "strategic achiever" over "practical expert" when both match', () => {
      // P >= 60, S >= 60, C < 50 -> matches both strategic achiever and practical expert
      const scores: DNAScores = { p_score: 80, c_score: 30, pol_score: 40, s_score: 70 };
      const persona = determinePersona(scores);
      expect(persona.label).toBe('전략적 성과자');
    });

    it('should prioritize "strategic achiever" over "autonomous independent" when both match', () => {
      // P >= 60, S >= 70 -> matches both
      const scores: DNAScores = { p_score: 65, c_score: 50, pol_score: 40, s_score: 75 };
      const persona = determinePersona(scores);
      expect(persona.label).toBe('전략적 성과자');
    });

    it('should prioritize "collaborative coordinator" over "organizational politician"', () => {
      // C >= 60, Pol >= 70 -> matches both
      const scores: DNAScores = { p_score: 40, c_score: 65, pol_score: 75, s_score: 30 };
      const persona = determinePersona(scores);
      expect(persona.label).toBe('협력적 조정자');
    });
  });

  describe('edge cases', () => {
    it('should handle exact threshold values for strategic achiever', () => {
      const scores: DNAScores = { p_score: 60, c_score: 50, pol_score: 50, s_score: 60 };
      const persona = determinePersona(scores);
      expect(persona.label).toBe('전략적 성과자');
    });

    it('should handle scores just below threshold', () => {
      const scores: DNAScores = { p_score: 59, c_score: 49, pol_score: 49, s_score: 59 };
      const persona = determinePersona(scores);
      expect(persona.label).toBe('중도형 균형가');
    });

    it('should always have a description', () => {
      const scores: DNAScores = { p_score: 50, c_score: 50, pol_score: 50, s_score: 50 };
      const persona = determinePersona(scores);
      expect(persona.description).toBeDefined();
      expect(persona.description.length).toBeGreaterThan(0);
    });

    it('should handle all-zero scores', () => {
      const scores: DNAScores = { p_score: 0, c_score: 0, pol_score: 0, s_score: 0 };
      const persona = determinePersona(scores);
      expect(persona.label).toBe('중도형 균형가');
    });

    it('should handle all-100 scores', () => {
      const scores: DNAScores = { p_score: 100, c_score: 100, pol_score: 100, s_score: 100 };
      const persona = determinePersona(scores);
      // P >= 60, S >= 60 -> strategic achiever (first match)
      expect(persona.label).toBe('전략적 성과자');
    });
  });

  describe('PERSONAS constant', () => {
    it('should have exactly 6 personas', () => {
      expect(PERSONAS).toHaveLength(6);
    });

    it('should have the last persona as fallback (always true)', () => {
      const fallback = PERSONAS[PERSONAS.length - 1];
      const anyScores: DNAScores = { p_score: 0, c_score: 0, pol_score: 0, s_score: 0 };
      expect(fallback.condition(anyScores)).toBe(true);
    });

    it('each persona should have label, description, and condition', () => {
      PERSONAS.forEach((p) => {
        expect(p.label).toBeDefined();
        expect(p.description).toBeDefined();
        expect(typeof p.condition).toBe('function');
      });
    });
  });
});
