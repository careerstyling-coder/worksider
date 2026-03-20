// @TASK P3-R1-T1 - Questions list & create API
// @SPEC docs/planning/02-trd.md#questions

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const createQuestionSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: z.enum(['simple', 'survey']).default('simple'),
  status: z.enum(['draft', 'active', 'closed']).default('draft'),
  is_featured: z.boolean().default(false),
  options: z.array(z.unknown()).min(1),
  suggestion_id: z.string().uuid().optional(),
  deadline: z.string().datetime().optional(),
});

// GET /api/questions - List questions with filters & pagination
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const isFeatured = searchParams.get('is_featured');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    const supabase = await createClient();

    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' });

    if (status) {
      query = query.eq('status', status);
    }

    if (isFeatured !== null && isFeatured !== undefined && isFeatured !== '') {
      query = query.eq('is_featured', isFeatured === 'true');
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      );
    }

    return NextResponse.json({ data, count });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a question (admin only)
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Auth check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Admin check
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      );
    }

    // Parse & validate body
    const body = await request.json();
    const parsed = createQuestionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const insertData = {
      ...parsed.data,
      created_by: user.id,
    };

    const { data, error } = await supabase
      .from('questions')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create question' },
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
