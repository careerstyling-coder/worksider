// @TASK P3-R2-T2 - Suggestions list & create API
// @SPEC docs/planning/02-trd.md#suggestions

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const VALID_STATUSES = ['pending', 'approved', 'rejected'] as const;

const createSuggestionSchema = z.object({
  title: z.string().min(1),
  background: z.string().optional(),
});

// GET /api/suggestions - List suggestions with optional status filter & pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    // Validate status if provided
    if (status && !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: pending, approved, rejected' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    let query = supabase
      .from('suggestions')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch suggestions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, count, page, limit });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/suggestions - Create a new suggestion (auth required)
export async function POST(request: Request) {
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

    const body = await request.json();
    const parsed = createSuggestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: title is required' },
        { status: 400 }
      );
    }

    const insertData: Record<string, string> = {
      user_id: user.id,
      title: parsed.data.title,
    };
    if (parsed.data.background) {
      insertData.background = parsed.data.background;
    }

    const { data, error } = await supabase
      .from('suggestions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create suggestion' },
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
