// @TASK P3-R2-T2 - Suggestion detail (admin status update) API
// @SPEC docs/planning/02-trd.md#suggestions

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

const updateSuggestionSchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']),
});

// PATCH /api/suggestions/[id] - Update suggestion status (admin only, enforced by RLS)
export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = updateSuggestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: status must be "pending", "approved", or "rejected"' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('suggestions')
      .update({ status: parsed.data.status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to update suggestion' },
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
