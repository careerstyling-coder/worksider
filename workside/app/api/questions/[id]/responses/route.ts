// @TASK P3-R2-T1 - Question Responses API (submit & list own)
// @SPEC docs/planning/02-trd.md#question-responses

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const submitResponseSchema = z.object({
  selected_option: z.string().min(1),
  persona_label: z.string().optional(),
});

type RouteContext = { params: Promise<{ id: string }> };

// POST /api/questions/[id]/responses - Submit a response
export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: questionId } = await context.params;
    const supabase = await createClient();

    // Parse & validate body
    const body = await request.json();
    const parsed = submitResponseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: selected_option is required' },
        { status: 400 }
      );
    }

    // Check question exists and is active
    const { data: question, error: questionError } = await supabase
      .from('questions')
      .select('id, status')
      .eq('id', questionId)
      .single();

    if (questionError || !question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }

    if (question.status !== 'active') {
      return NextResponse.json(
        { error: 'Question is not active' },
        { status: 400 }
      );
    }

    // Get current user (optional - anonymous responses allowed)
    const { data: { user } } = await supabase.auth.getUser();

    const insertData: Record<string, unknown> = {
      question_id: questionId,
      selected_option: parsed.data.selected_option,
    };

    if (user) {
      insertData.user_id = user.id;
    }

    if (parsed.data.persona_label) {
      insertData.persona_label = parsed.data.persona_label;
    }

    const { data, error } = await supabase
      .from('question_responses')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to submit response' },
        { status: 500 }
      );
    }

    // Increment participant_count (best effort, don't fail if this errors)
    await supabase
      .from('questions')
      .update({ participant_count: (question as Record<string, unknown>).participant_count as number + 1 || 1 })
      .eq('id', questionId);

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET /api/questions/[id]/responses - Get own responses
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id: questionId } = await context.params;
    const supabase = await createClient();

    // Auth required to view own responses
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('question_responses')
      .select('*')
      .eq('question_id', questionId)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch responses' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
