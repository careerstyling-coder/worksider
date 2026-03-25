// @TASK P1-R3-T2 - Rewards API (refactored to use lib/rewards.ts)
// @SPEC docs/planning/prelaunch/rewards
// @TEST __tests__/api/rewards/rewards.test.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  createInitialRewards,
  getRewardsByReservation,
  checkAndUnlockRewards,
  updateRewardStatus,
} from '@/lib/rewards';

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

const checkUnlockSchema = z.object({
  reservation_id: z.string().min(1),
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

    const rewards = await getRewardsByReservation(reservationId);
    return NextResponse.json({ rewards });
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

    const rewards = await createInitialRewards(parsed.data.reservation_id);
    return NextResponse.json({ rewards }, { status: 201 });
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

    const reward = await updateRewardStatus(
      parsed.data.reservation_id,
      parsed.data.type,
      parsed.data.status
    );
    return NextResponse.json({ reward });
  } catch {
    return NextResponse.json(
      { error: 'Reward not found' },
      { status: 404 }
    );
  }
}

// PUT /api/rewards - Check and unlock rewards based on invite count
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const parsed = checkUnlockSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: reservation_id is required' },
        { status: 400 }
      );
    }

    const result = await checkAndUnlockRewards(parsed.data.reservation_id);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
