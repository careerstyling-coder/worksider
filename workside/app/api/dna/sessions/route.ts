// @TASK P2-R1-T1 - DNA Sessions list & create API
// @SPEC docs/planning/02-trd.md#dna-sessions

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const createSessionSchema = z.object({
  version: z.enum(['semi', 'full']),
  user_id: z.string().uuid().optional(),
});

// POST /api/dna/sessions - Create a new DNA session
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: version must be "semi" or "full"' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const insertData: Record<string, string> = {
      version: parsed.data.version,
    };
    if (parsed.data.user_id) {
      insertData.user_id = parsed.data.user_id;
    }

    const { data, error } = await supabase
      .from('dna_sessions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create session' },
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

// GET /api/dna/sessions - List sessions by user_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'user_id query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('dna_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch sessions' },
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
