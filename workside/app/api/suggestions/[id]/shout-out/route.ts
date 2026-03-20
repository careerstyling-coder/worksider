// @TASK P3-R2-T2 - Shout Out add/remove API
// @SPEC docs/planning/02-trd.md#shout-outs

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

type RouteContext = {
  params: Promise<{ id: string }>;
};

// POST /api/suggestions/[id]/shout-out - Add a shout out
export async function POST(request: Request, context: RouteContext) {
  try {
    const { id: suggestionId } = await context.params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from('shout_outs')
      .insert({
        suggestion_id: suggestionId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      // Unique constraint violation = duplicate shout out
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Already shouted out' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: 'Failed to add shout out' },
        { status: 500 }
      );
    }

    // Increment shout_out_count on the suggestion
    await supabase.rpc('increment_shout_out_count', {
      suggestion_id: suggestionId,
    });

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/suggestions/[id]/shout-out - Remove own shout out
export async function DELETE(request: Request, context: RouteContext) {
  try {
    const { id: suggestionId } = await context.params;
    const supabase = await createClient();

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { error } = await supabase
      .from('shout_outs')
      .delete()
      .eq('suggestion_id', suggestionId)
      .eq('user_id', user.id);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to remove shout out' },
        { status: 500 }
      );
    }

    // Decrement shout_out_count on the suggestion
    await supabase.rpc('decrement_shout_out_count', {
      suggestion_id: suggestionId,
    });

    return NextResponse.json({ message: 'Shout out removed' });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
