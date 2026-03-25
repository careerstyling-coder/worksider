// @TASK P1-R3-T1 - Rewards API
// @SPEC docs/planning/prelaunch/rewards
// @TEST __tests__/api/rewards/rewards.test.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const VALID_REWARD_TYPES = ['early_adopter_badge', 'priority_access'] as const;
const VALID_STATUSES = ['pending', 'unlocked', 'redeemed'] as const;

const createRewardsSchema = z.object({
  reservation_id: z.string().min(1),
});

const patchRewardSchema = z.object({
  reservation_id: z.string().min(1),
  type: z.enum(VALID_REWARD_TYPES),
  status: z.enum(VALID_STATUSES),
});

// GET /api/rewards?reservation_id={id}
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const reservationId = searchParams.get('reservation_id');

    if (!reservationId) {
      return NextResponse.json(
        { error: 'reservation_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('rewards')
      .select('id, type, status, unlocked_at')
      .eq('reservation_id', reservationId);

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch rewards' },
        { status: 500 }
      );
    }

    return NextResponse.json({ rewards: data });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/rewards
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = createRewardsSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: reservation_id is required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('rewards')
      .insert([
        { reservation_id: parsed.data.reservation_id, type: 'early_adopter_badge', status: 'pending' },
        { reservation_id: parsed.data.reservation_id, type: 'priority_access', status: 'pending' },
      ])
      .select();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create rewards' },
        { status: 500 }
      );
    }

    return NextResponse.json({ rewards: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PATCH /api/rewards
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = patchRewardSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: reservation_id, type, and status are required' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    const updateData: Record<string, unknown> = { status: parsed.data.status };
    if (parsed.data.status === 'unlocked') {
      updateData.unlocked_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('rewards')
      .update(updateData)
      .eq('reservation_id', parsed.data.reservation_id)
      .eq('type', parsed.data.type)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'Reward not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ reward: data });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
