// @TASK P2-R2-T4 - Diagnosis completion logic
// @SPEC docs/planning/02-trd.md#dna-complete-diagnosis

import { calculateDNAScores, type DNAScores } from '@/lib/dna/scoring';
import { determinePersona } from '@/lib/dna/persona';
import { generateShareToken } from '@/lib/dna/share';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface DiagnosisResult {
  scores: DNAScores;
  persona: { label: string; description: string };
  shareToken: string;
  resultRecord: Record<string, unknown>;
}

/**
 * Complete the DNA diagnosis flow:
 * 1. Fetch the session to determine version (semi/full)
 * 2. Fetch all responses for the session
 * 3. Calculate DNA scores
 * 4. Determine persona
 * 5. Insert dna_results record (with share_token)
 * 6. Update session status to 'completed'
 * 7. Return the result
 */
export async function completeDiagnosis(
  sessionId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any, any, any>
): Promise<DiagnosisResult> {
  // 1. Fetch session to get version
  const { data: session, error: sessionError } = await supabase
    .from('dna_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();

  if (sessionError || !session) {
    throw new Error(
      sessionError?.message ?? '세션을 찾을 수 없습니다'
    );
  }

  const version = (session.version as 'semi' | 'full') || 'semi';

  // 2. Fetch all responses for the session
  const { data: responses, error: responsesError } = await supabase
    .from('dna_responses')
    .select('question_id, value')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: true });

  if (responsesError) {
    throw new Error(
      `응답 조회 실패: ${responsesError.message}`
    );
  }

  if (!responses || responses.length === 0) {
    throw new Error('응답 데이터가 없습니다');
  }

  // 3. Calculate DNA scores
  const scores = calculateDNAScores(responses, version);

  // 4. Determine persona
  const persona = determinePersona(scores);

  // 5. Generate share token and insert dna_results
  const shareToken = generateShareToken();

  const { data: resultRecord, error: insertError } = await supabase
    .from('dna_results')
    .insert({
      session_id: sessionId,
      user_id: session.user_id ?? null,
      p_score: scores.p_score,
      c_score: scores.c_score,
      pol_score: scores.pol_score,
      s_score: scores.s_score,
      persona_label: persona.label,
      persona_description: persona.description,
      version,
      share_token: shareToken,
    })
    .select()
    .single();

  if (insertError) {
    throw new Error(
      `결과 저장 실패: ${insertError.message}`
    );
  }

  // 6. Update session status to completed
  const { error: updateError } = await supabase
    .from('dna_sessions')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (updateError) {
    throw new Error(
      `세션 업데이트 실패: ${updateError.message}`
    );
  }

  // 7. Return result
  return {
    scores,
    persona,
    shareToken,
    resultRecord: resultRecord ?? {},
  };
}
