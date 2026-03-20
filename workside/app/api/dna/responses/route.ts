// @TASK P2-R1-T2 - DNA Responses save & list API
// @SPEC docs/planning/02-trd.md#dna-responses

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const createResponseSchema = z.object({
  session_id: z.string().uuid(),
  question_id: z.string().min(1),
  value: z.number().int().min(1).max(7),
});

// POST /api/dna/responses - Save a DNA response
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createResponseSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: session_id must be UUID, question_id required, value must be integer 1-7' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('dna_responses')
      .insert({
        session_id: parsed.data.session_id,
        question_id: parsed.data.question_id,
        value: parsed.data.value,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to save response' },
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

// GET /api/dna/responses - List responses by session_id
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('dna_responses')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

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
