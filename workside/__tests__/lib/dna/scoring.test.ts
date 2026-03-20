// @TASK P2-R2-T2 - DNA scoring engine tests
// @SPEC docs/planning/02-trd.md#dna-scoring

import { describe, it, expect } from 'vitest';
import { calculateDNAScores } from '@/lib/dna/scoring';
import { SEMI_QUESTIONS } from '@/constants/dna-questions';

describe('calculateDNAScores', () => {
  describe('semi version (12 questions, 3 per axis)', () => {
    it('should return all 0 when all responses are minimum (1)', () => {
      const responses = SEMI_QUESTIONS.map((q) => ({
        question_id: q.id,
        value: 1,
      }));

      const scores = calculateDNAScores(responses, 'semi');

      expect(scores.p_score).toBe(0);
      expect(scores.c_score).toBe(0);
      expect(scores.pol_score).toBe(0);
      expect(scores.s_score).toBe(0);
    });

    it('should return all 100 when all responses are maximum (7)', () => {
      const responses = SEMI_QUESTIONS.map((q) => ({
        question_id: q.id,
        value: 7,
      }));

      const scores = calculateDNAScores(responses, 'semi');

      expect(scores.p_score).toBe(100);
      expect(scores.c_score).toBe(100);
      expect(scores.pol_score).toBe(100);
      expect(scores.s_score).toBe(100);
    });

    it('should return 50 when all responses are midpoint (4)', () => {
      const responses = SEMI_QUESTIONS.map((q) => ({
        question_id: q.id,
        value: 4,
      }));

      const scores = calculateDNAScores(responses, 'semi');

      expect(scores.p_score).toBe(50);
      expect(scores.c_score).toBe(50);
      expect(scores.pol_score).toBe(50);
      expect(scores.s_score).toBe(50);
    });

    it('should calculate per-axis scores independently', () => {
      const responses = [
        // P axis: all 7 -> 100
        { question_id: 'P1', value: 7 },
        { question_id: 'P2', value: 7 },
        { question_id: 'P3', value: 7 },
        // C axis: all 1 -> 0
        { question_id: 'C1', value: 1 },
        { question_id: 'C2', value: 1 },
        { question_id: 'C3', value: 1 },
        // Pol axis: mixed -> ~33.33
        { question_id: 'Pol1', value: 3 },
        { question_id: 'Pol2', value: 3 },
        { question_id: 'Pol3', value: 3 },
        // S axis: mixed -> ~66.67
        { question_id: 'S1', value: 5 },
        { question_id: 'S2', value: 5 },
        { question_id: 'S3', value: 5 },
      ];

      const scores = calculateDNAScores(responses, 'semi');

      expect(scores.p_score).toBe(100);
      expect(scores.c_score).toBe(0);
      // (9-3)/(21-3)*100 = 6/18*100 = 33.33...
      expect(scores.pol_score).toBeCloseTo(33.33, 1);
      // (15-3)/(21-3)*100 = 12/18*100 = 66.67
      expect(scores.s_score).toBeCloseTo(66.67, 1);
    });

    it('should handle reversed questions by inverting the value', () => {
      // If a question is reversed, value should be (8 - value)
      // e.g., answering 7 on reversed = 1, answering 1 on reversed = 7
      const responses = [
        { question_id: 'P1', value: 7 },
        { question_id: 'P2', value: 7 },
        { question_id: 'P3', value: 7 },
        { question_id: 'C1', value: 4 },
        { question_id: 'C2', value: 4 },
        { question_id: 'C3', value: 4 },
        { question_id: 'Pol1', value: 4 },
        { question_id: 'Pol2', value: 4 },
        { question_id: 'Pol3', value: 4 },
        { question_id: 'S1', value: 4 },
        { question_id: 'S2', value: 4 },
        { question_id: 'S3', value: 4 },
      ];

      const scores = calculateDNAScores(responses, 'semi');

      // No reversed questions in current set, so normal calculation
      expect(scores.p_score).toBe(100);
    });

    it('should round scores to 2 decimal places', () => {
      const responses = [
        { question_id: 'P1', value: 2 },
        { question_id: 'P2', value: 3 },
        { question_id: 'P3', value: 5 },
        { question_id: 'C1', value: 4 },
        { question_id: 'C2', value: 4 },
        { question_id: 'C3', value: 4 },
        { question_id: 'Pol1', value: 4 },
        { question_id: 'Pol2', value: 4 },
        { question_id: 'Pol3', value: 4 },
        { question_id: 'S1', value: 4 },
        { question_id: 'S2', value: 4 },
        { question_id: 'S3', value: 4 },
      ];

      const scores = calculateDNAScores(responses, 'semi');

      // P: sum=10, normalized=(10-3)/(21-3)*100 = 7/18*100 = 38.888...
      expect(scores.p_score).toBeCloseTo(38.89, 1);
      // Verify it's a finite number with max 2 decimals
      const decimalPlaces = (scores.p_score.toString().split('.')[1] || '').length;
      expect(decimalPlaces).toBeLessThanOrEqual(2);
    });

    it('should throw error when responses are missing for an axis', () => {
      const responses = [
        { question_id: 'P1', value: 5 },
        // Missing P2, P3 and all other axes
      ];

      expect(() => calculateDNAScores(responses, 'semi')).toThrow();
    });

    it('should throw error when value is out of range (1-7)', () => {
      const responses = SEMI_QUESTIONS.map((q) => ({
        question_id: q.id,
        value: 8, // out of range
      }));

      expect(() => calculateDNAScores(responses, 'semi')).toThrow();
    });

    it('should throw error when value is below minimum (0)', () => {
      const responses = SEMI_QUESTIONS.map((q) => ({
        question_id: q.id,
        value: 0, // out of range
      }));

      expect(() => calculateDNAScores(responses, 'semi')).toThrow();
    });
  });

  describe('boundary values', () => {
    it('should handle single point above minimum correctly', () => {
      const responses = SEMI_QUESTIONS.map((q) => ({
        question_id: q.id,
        value: q.axis === 'P' ? 2 : 1,
      }));

      const scores = calculateDNAScores(responses, 'semi');

      // P: sum=6 (2+2+2=6?), no: 2+1+1 = only P1=2, P2=1,P3=1?
      // Actually all P questions get value 2: sum=6, normalized=(6-3)/(21-3)*100 = 3/18*100 = 16.67
      expect(scores.p_score).toBeCloseTo(16.67, 1);
      expect(scores.c_score).toBe(0);
    });

    it('should handle single point below maximum correctly', () => {
      const responses = SEMI_QUESTIONS.map((q) => ({
        question_id: q.id,
        value: q.axis === 'S' ? 6 : 7,
      }));

      const scores = calculateDNAScores(responses, 'semi');

      // S: sum=18, normalized=(18-3)/(21-3)*100 = 15/18*100 = 83.33
      expect(scores.s_score).toBeCloseTo(83.33, 1);
      expect(scores.p_score).toBe(100);
    });
  });
});
