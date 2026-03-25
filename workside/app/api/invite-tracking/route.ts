// @TASK P1-R2-T2 - Invite Tracking API (refactored to use lib)
// @SPEC docs/planning/prelaunch/invite-tracking

import { NextResponse } from 'next/server';
import { z } from 'zod';
import {
  trackLinkClick,
  recordConversion,
  getInviterStats,
} from '@/lib/invite-tracking';

// --- Validation Schemas ---

const postSchema = z.object({
  invite_code: z.string().min(1, 'invite_code is required'),
});

const patchSchema = z.object({
  invite_code: z.string().min(1, 'invite_code is required'),
  invitee_id: z.string().uuid('invitee_id must be a valid UUID'),
});

// --- POST /api/invite-tracking ---
// Record invite link click
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = postSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: invite_code is required' },
        { status: 400 }
      );
    }

    const { invite_code } = parsed.data;

    const tracking = await trackLinkClick(invite_code);

    return NextResponse.json(
      { id: tracking.id, inviter_id: tracking.inviter_id, invite_code: tracking.invite_code },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';

    if (message === 'Invalid invite code') {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// --- PATCH /api/invite-tracking ---
// Record conversion (when invitee completes reservation)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const parsed = patchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid request: invite_code and invitee_id are required' },
        { status: 400 }
      );
    }

    const { invite_code, invitee_id } = parsed.data;

    await recordConversion(invite_code, invitee_id);

    return NextResponse.json({ converted: true }, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error';

    if (message === 'Tracking record not found' || message === 'Invalid invite code') {
      return NextResponse.json({ error: message }, { status: 404 });
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

// --- GET /api/invite-tracking?inviter_id={id} ---
// Get tracking records for a specific inviter
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const inviter_id = searchParams.get('inviter_id');

    if (!inviter_id) {
      return NextResponse.json(
        { error: 'inviter_id query parameter is required' },
        { status: 400 }
      );
    }

    const stats = await getInviterStats(inviter_id);

    return NextResponse.json(
      { records: stats.records, successful_invites: stats.successful_invites },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
