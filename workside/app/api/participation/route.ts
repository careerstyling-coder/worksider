// @TASK P3-R3-T1 - Participation History API
// @SPEC docs/planning/02-trd.md#participation-history

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const VALID_ACTION_TYPES = ['diagnosis', 'question', 'suggestion', 'share', 'shout_out'] as const;

const createParticipationSchema = z.object({
  user_id: z.string().min(1),
  action_type: z.enum(VALID_ACTION_TYPES),
  target_id: z.string().min(1),
});

// GET /api/participation - Get own participation history (auth required)
export async function GET(request: Request) {
  try {
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
      .from('participation_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch participation history' },
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

// POST /api/participation - Record participation history entry
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createParticipationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: user_id (uuid), action_type, and target_id (uuid) are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('participation_history')
      .insert({
        user_id: parsed.data.user_id,
        action_type: parsed.data.action_type,
        target_id: parsed.data.target_id,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to record participation' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
