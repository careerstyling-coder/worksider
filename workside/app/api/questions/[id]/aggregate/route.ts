// @TASK P3-S3-T1 - Question Aggregate API (enhanced)
// @SPEC docs/planning/02-trd.md#question-aggregate

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = { params: Promise<{ id: string }> };

interface ResponseRow {
  selected_option: string;
  persona_label: string | null;
}

interface OptionResult {
  option: string;
  count: number;
  percentage: number;
}

interface PersonaDistributionItem {
  persona_label: string;
  option: string;
  count: number;
  percentage: number;
}

// Generate insight text from persona distribution
function generateInsight(distribution: PersonaDistributionItem[]): string | null {
  if (!distribution.length) return null;
  // Find the persona-option combo with highest percentage
  const top = distribution.reduce((best, cur) =>
    cur.percentage > best.percentage ? cur : best
  );
  if (top.percentage < 30) return null;
  return `${top.persona_label} 중 ${top.percentage}%가 ${top.option}을(를) 선택했어요`;
}

// GET /api/questions/[id]/aggregate - Aggregated results with full context
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id: questionId } = await context.params;
    const supabase = await createClient();

    // Fetch question info
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('*')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    // Fetch all responses for this question
    const { data: responses, error: responsesError } = await supabase
      .from('question_responses')
      .select('selected_option, persona_label')
      .eq('question_id', questionId)
      .order('created_at', { ascending: true });

    if (responsesError) {
      return NextResponse.json(
        { error: 'Failed to fetch aggregate data' },
        { status: 500 }
      );
    }

    const rows = (responses || []) as ResponseRow[];
    const total = rows.length;

    // Aggregate by option
    const byOptionCount: Record<string, number> = {};
    const options: string[] = Array.isArray(question.options) ? question.options as string[] : [];
    for (const row of rows) {
      byOptionCount[row.selected_option] = (byOptionCount[row.selected_option] || 0) + 1;
    }

    // Build results array (all options, even zero-count ones)
    const allOptions = options.length > 0 ? options : Object.keys(byOptionCount);
    const results: OptionResult[] = allOptions.map((opt) => {
      const count = byOptionCount[opt] || 0;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      return { option: opt, count, percentage };
    });

    // Aggregate by persona -> option distribution
    const byPersonaOption: Record<string, Record<string, number>> = {};
    for (const row of rows) {
      if (row.persona_label) {
        if (!byPersonaOption[row.persona_label]) {
          byPersonaOption[row.persona_label] = {};
        }
        byPersonaOption[row.persona_label][row.selected_option] =
          (byPersonaOption[row.persona_label][row.selected_option] || 0) + 1;
      }
    }

    const personaDistribution: PersonaDistributionItem[] = [];
    for (const [personaLabel, optionCounts] of Object.entries(byPersonaOption)) {
      const personaTotal = Object.values(optionCounts).reduce((a, b) => a + b, 0);
      // Find the top option for this persona
      const topOption = Object.entries(optionCounts).reduce((best, [opt, cnt]) =>
        cnt > best[1] ? [opt, cnt] : best
      , ['', 0] as [string, number]);
      if (topOption[0]) {
        const percentage = personaTotal > 0
          ? Math.round((topOption[1] / personaTotal) * 100)
          : 0;
        personaDistribution.push({
          persona_label: personaLabel,
          option: topOption[0],
          count: topOption[1],
          percentage,
        });
      }
    }

    // Minority option: lowest percentage, non-zero
    const nonZeroResults = results.filter((r) => r.count > 0);
    const minorityResult =
      nonZeroResults.length > 1
        ? nonZeroResults.reduce((min, cur) => cur.percentage < min.percentage ? cur : min)
        : null;

    // Insight
    const insight = generateInsight(personaDistribution);

    // Fetch prev/next question IDs (active questions ordered by created_at)
    const { data: allQuestions } = await supabase
      .from('questions')
      .select('id, created_at')
      .eq('status', 'active')
      .order('created_at', { ascending: true });

    let prevQuestionId: string | null = null;
    let nextQuestionId: string | null = null;

    if (allQuestions && allQuestions.length > 0) {
      const idx = allQuestions.findIndex((q: { id: string }) => q.id === questionId);
      if (idx > 0) prevQuestionId = allQuestions[idx - 1].id;
      if (idx < allQuestions.length - 1) nextQuestionId = allQuestions[idx + 1].id;
    }

    return NextResponse.json({
      data: {
        id: question.id,
        title: question.title,
        status: question.status,
        deadline: question.deadline,
        participant_count: question.participant_count,
        options: allOptions,
        results,
        persona_distribution: personaDistribution,
        minority_option: minorityResult?.option ?? null,
        minority_percentage: minorityResult?.percentage ?? null,
        insight,
        prev_question_id: prevQuestionId,
        next_question_id: nextQuestionId,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
