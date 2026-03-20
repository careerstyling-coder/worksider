// @TASK P2-R2-T4 - Diagnosis completion integration tests
// @SPEC docs/planning/02-trd.md#dna-complete-diagnosis

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { completeDiagnosis } from '@/lib/dna/complete-diagnosis';

// Mock generateShareToken
vi.mock('@/lib/dna/share', () => ({
  generateShareToken: vi.fn(() => 'mock-share-token-uuid'),
}));

// Mock scoring
vi.mock('@/lib/dna/scoring', () => ({
  calculateDNAScores: vi.fn(() => ({
    p_score: 75,
    c_score: 50,
    pol_score: 60,
    s_score: 80,
  })),
}));

// Mock persona
vi.mock('@/lib/dna/persona', () => ({
  determinePersona: vi.fn(() => ({
    label: '전략적 성과자',
    description: '목표 지향적이며 효율적으로 성과를 만들어내는 타입입니다.',
  })),
}));

function createMockSupabase(overrides: {
  responsesData?: { question_id: string; value: number }[];
  responsesError?: { message: string } | null;
  insertData?: Record<string, unknown>;
  insertError?: { message: string } | null;
  updateData?: Record<string, unknown>;
  updateError?: { message: string } | null;
  sessionData?: { id: string; version: string } | null;
  sessionError?: { message: string } | null;
} = {}) {
  const {
    responsesData = [
      { question_id: 'P1', value: 7 },
      { question_id: 'P2', value: 7 },
      { question_id: 'P3', value: 5 },
      { question_id: 'C1', value: 4 },
      { question_id: 'C2', value: 4 },
      { question_id: 'C3', value: 4 },
      { question_id: 'Pol1', value: 5 },
      { question_id: 'Pol2', value: 5 },
      { question_id: 'Pol3', value: 4 },
      { question_id: 'S1', value: 6 },
      { question_id: 'S2', value: 6 },
      { question_id: 'S3', value: 6 },
    ],
    responsesError = null,
    insertData = { id: 'result-uuid', share_token: 'mock-share-token-uuid' },
    insertError = null,
    updateData = { id: 'session-uuid', status: 'completed' },
    updateError = null,
    sessionData = { id: 'session-uuid', version: 'semi' },
    sessionError = null,
  } = overrides;

  // Track which table is being queried
  const mock = {
    from: vi.fn((table: string) => {
      if (table === 'dna_responses') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              order: vi.fn(() =>
                Promise.resolve({ data: responsesData, error: responsesError })
              ),
            })),
          })),
        };
      }
      if (table === 'dna_results') {
        return {
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: insertData, error: insertError })
              ),
            })),
          })),
        };
      }
      if (table === 'dna_sessions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              single: vi.fn(() =>
                Promise.resolve({ data: sessionData, error: sessionError })
              ),
            })),
          })),
          update: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => ({
                single: vi.fn(() =>
                  Promise.resolve({ data: updateData, error: updateError })
                ),
              })),
            })),
          })),
        };
      }
      return {};
    }),
  };

  return mock;
}

describe('completeDiagnosis', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should complete diagnosis flow and return result', async () => {
    const supabase = createMockSupabase();
    const result = await completeDiagnosis('session-uuid', supabase);

    expect(result).toBeDefined();
    expect(result.scores).toEqual({
      p_score: 75,
      c_score: 50,
      pol_score: 60,
      s_score: 80,
    });
    expect(result.persona.label).toBe('전략적 성과자');
    expect(result.shareToken).toBe('mock-share-token-uuid');
  });

  it('should query responses from dna_responses table', async () => {
    const supabase = createMockSupabase();
    await completeDiagnosis('session-uuid', supabase);

    expect(supabase.from).toHaveBeenCalledWith('dna_sessions');
    expect(supabase.from).toHaveBeenCalledWith('dna_responses');
  });

  it('should insert result into dna_results table', async () => {
    const supabase = createMockSupabase();
    await completeDiagnosis('session-uuid', supabase);

    expect(supabase.from).toHaveBeenCalledWith('dna_results');
  });

  it('should update session status to completed', async () => {
    const supabase = createMockSupabase();
    await completeDiagnosis('session-uuid', supabase);

    expect(supabase.from).toHaveBeenCalledWith('dna_sessions');
  });

  it('should throw error when no responses found', async () => {
    const supabase = createMockSupabase({
      responsesData: [],
    });

    await expect(completeDiagnosis('session-uuid', supabase)).rejects.toThrow(
      '응답 데이터가 없습니다'
    );
  });

  it('should throw error when responses query fails', async () => {
    const supabase = createMockSupabase({
      responsesData: undefined as unknown as { question_id: string; value: number }[],
      responsesError: { message: 'DB error' },
    });

    await expect(completeDiagnosis('session-uuid', supabase)).rejects.toThrow();
  });

  it('should throw error when session not found', async () => {
    const supabase = createMockSupabase({
      sessionData: null,
      sessionError: { message: 'Not found' },
    });

    await expect(completeDiagnosis('session-uuid', supabase)).rejects.toThrow();
  });

  it('should throw error when result insert fails', async () => {
    const supabase = createMockSupabase({
      insertError: { message: 'Insert failed' },
    });

    await expect(completeDiagnosis('session-uuid', supabase)).rejects.toThrow();
  });
});
