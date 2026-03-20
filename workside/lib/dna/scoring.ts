// @TASK P2-R2-T2 - DNA score calculation engine
// @SPEC docs/planning/02-trd.md#dna-scoring

import { SEMI_QUESTIONS, FULL_QUESTIONS, QUESTIONS_PER_AXIS } from '@/constants/dna-questions';
import type { DNAQuestion } from '@/constants/dna-questions';

export interface DNAScores {
  p_score: number;
  c_score: number;
  pol_score: number;
  s_score: number;
}

interface Response {
  question_id: string;
  value: number;
}

const LIKERT_MIN = 1;
const LIKERT_MAX = 7;

/**
 * Calculate DNA scores from survey responses.
 *
 * Normalization formula:
 *   score = ((sum - min_possible) / (max_possible - min_possible)) * 100
 *
 * For semi (3 questions per axis, scale 1-7):
 *   min_possible = 3 * 1 = 3
 *   max_possible = 3 * 7 = 21
 *   score = ((sum - 3) / (21 - 3)) * 100 = ((sum - 3) / 18) * 100
 */
export function calculateDNAScores(
  responses: Response[],
  version: 'semi' | 'full'
): DNAScores {
  const questions = version === 'semi' ? SEMI_QUESTIONS : FULL_QUESTIONS;
  const questionsPerAxis = QUESTIONS_PER_AXIS[version];

  // Validate response values
  for (const response of responses) {
    if (response.value < LIKERT_MIN || response.value > LIKERT_MAX) {
      throw new Error(
        `Invalid response value ${response.value} for question ${response.question_id}. Must be between ${LIKERT_MIN} and ${LIKERT_MAX}.`
      );
    }
  }

  // Build response map
  const responseMap = new Map<string, number>();
  for (const r of responses) {
    responseMap.set(r.question_id, r.value);
  }

  // Calculate per-axis raw sums
  const axisSums: Record<string, number> = { P: 0, C: 0, Pol: 0, S: 0 };
  const axisCounts: Record<string, number> = { P: 0, C: 0, Pol: 0, S: 0 };

  for (const question of questions) {
    const rawValue = responseMap.get(question.id);
    if (rawValue === undefined) {
      throw new Error(`Missing response for question ${question.id}`);
    }

    // Handle reversed questions: invert the value
    const value = question.reversed ? (LIKERT_MAX + LIKERT_MIN - rawValue) : rawValue;

    axisSums[question.axis] += value * question.weight;
    axisCounts[question.axis] += 1;
  }

  // Validate all axes have the expected number of responses
  for (const axis of ['P', 'C', 'Pol', 'S'] as const) {
    if (axisCounts[axis] !== questionsPerAxis) {
      throw new Error(
        `Expected ${questionsPerAxis} responses for axis ${axis}, got ${axisCounts[axis]}`
      );
    }
  }

  // Normalize to 0-100
  const minPossible = questionsPerAxis * LIKERT_MIN;
  const maxPossible = questionsPerAxis * LIKERT_MAX;
  const range = maxPossible - minPossible;

  return {
    p_score: normalize(axisSums.P, minPossible, range),
    c_score: normalize(axisSums.C, minPossible, range),
    pol_score: normalize(axisSums.Pol, minPossible, range),
    s_score: normalize(axisSums.S, minPossible, range),
  };
}

/** Normalize a raw sum to 0-100, rounded to 2 decimal places */
function normalize(sum: number, min: number, range: number): number {
  const normalized = ((sum - min) / range) * 100;
  return Math.round(normalized * 100) / 100;
}
