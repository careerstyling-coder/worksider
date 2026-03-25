// @TASK P1-R2-T1 - Invite Tracking API
// @SPEC docs/planning/prelaunch/invite-tracking

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

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

    const supabase = await createClient();
    const { invite_code } = parsed.data;

    // Look up inviter from reservations by invite_code
    const { data: inviter, error: inviterError } = await supabase
      .from('reservations')
      .select('id, invite_code')
      .eq('invite_code', invite_code)
      .single();

    if (inviterError || !inviter) {
      return NextResponse.json(
        { error: 'Invalid invite code' },
        { status: 404 }
      );
    }

    // Create tracking record
    const { data: tracking, error: trackingError } = await supabase
      .from('invite_tracking')
      .insert({
        inviter_id: inviter.id,
        invite_code,
        link_clicked: true,
        clicked_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (trackingError) {
      return NextResponse.json(
        { error: 'Failed to create tracking record' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { id: tracking.id, inviter_id: tracking.inviter_id, invite_code: tracking.invite_code },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const supabase = await createClient();
    const { invite_code, invitee_id } = parsed.data;

    // Find the tracking record by invite_code
    const { data: existing, error: findError } = await supabase
      .from('invite_tracking')
      .select('id, invite_code, link_clicked')
      .eq('invite_code', invite_code)
      .order('created_at', { ascending: false })
      .single();

    if (findError || !existing) {
      return NextResponse.json(
        { error: 'Tracking record not found' },
        { status: 404 }
      );
    }

    // Update with conversion data
    const { data: updated, error: updateError } = await supabase
      .from('invite_tracking')
      .update({
        converted: true,
        converted_at: new Date().toISOString(),
        invitee_id,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to update tracking record' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated, { status: 200 });
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const supabase = await createClient();

    const { data: records, error } = await supabase
      .from('invite_tracking')
      .select('*')
      .eq('inviter_id', inviter_id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch tracking records' },
        { status: 500 }
      );
    }

    const successful_invites = (records || []).filter(
      (r: { converted: boolean }) => r.converted === true
    ).length;

    return NextResponse.json(
      { records: records || [], successful_invites },
      { status: 200 }
    );
  } catch {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
