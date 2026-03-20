// @TASK P2-R1-T1 - DNA Session single & update API
// @SPEC docs/planning/02-trd.md#dna-sessions

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { completeDiagnosis } from '@/lib/dna/complete-diagnosis';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateSessionSchema = z.object({
  status: z.enum(['in_progress', 'completed']),
});

// GET /api/dna/sessions/[id] - Get a single session
export async function GET(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('dna_sessions')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
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

// PATCH /api/dna/sessions/[id] - Update session status
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const parsed = updateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: status must be "in_progress" or "completed"' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // If completing, run the full diagnosis pipeline (score + persona + result)
    if (parsed.data.status === 'completed') {
      try {
        const result = await completeDiagnosis(id, supabase);

        // Fetch the updated session to return
        const { data: session } = await supabase
          .from('dna_sessions')
          .select('*')
          .eq('id', id)
          .single();

        return NextResponse.json({
          data: session,
          result: {
            scores: result.scores,
            persona: result.persona,
            shareToken: result.shareToken,
          },
        });
      } catch (err) {
        return NextResponse.json(
          { error: err instanceof Error ? err.message : 'Failed to complete diagnosis' },
          { status: 500 }
        );
      }
    }

    // For non-completion updates, just update the status
    const { data, error } = await supabase
      .from('dna_sessions')
      .update({ status: parsed.data.status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update session' },
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
