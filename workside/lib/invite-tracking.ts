// @TASK P1-R2-T2 - Invite Tracking Business Logic
// @SPEC docs/planning/prelaunch/invite-tracking
// @TEST __tests__/lib/invite-tracking.test.ts

import { createClient } from '@/lib/supabase/server';

/**
 * Invite tracking record type returned from Supabase.
 */
export interface InviteTracking {
  id: string;
  inviter_id: string;
  invitee_id?: string;
  invite_code: string;
  link_clicked: boolean;
  clicked_at?: string;
  converted: boolean;
  converted_at?: string;
  created_at: string;
}

/**
 * Stats summary for an inviter.
 */
export interface InviterStats {
  total_clicks: number;
  successful_invites: number;
  records: InviteTracking[];
}

/**
 * Track a link click for an invite code.
 * Looks up the inviter from reservations, then creates a tracking record.
 *
 * @throws Error if invite_code is invalid (no matching reservation)
 * @throws Error if tracking record creation fails
 */
export async function trackLinkClick(inviteCode: string): Promise<InviteTracking> {
  const supabase = await createClient();

  // Look up inviter from reservations by invite_code
  const { data: inviter, error: inviterError } = await supabase
    .from('reservations')
    .select('id, invite_code')
    .eq('invite_code', inviteCode)
    .single();

  if (inviterError || !inviter) {
    throw new Error('Invalid invite code');
  }

  // Create tracking record
  const { data: tracking, error: trackingError } = await supabase
    .from('invite_tracking')
    .insert({
      inviter_id: inviter.id,
      invite_code: inviteCode,
      link_clicked: true,
      clicked_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (trackingError || !tracking) {
    throw new Error('Failed to create tracking record');
  }

  return tracking as InviteTracking;
}

/**
 * Record a conversion for an invite code.
 * Finds the latest tracking record with link_clicked=true and updates it.
 * If no prior record exists (direct reservation without clicking), creates a new one.
 *
 * @throws Error if reservation lookup fails (when creating new record)
 * @throws Error if update/insert fails
 */
export async function recordConversion(inviteCode: string, inviteeId: string): Promise<void> {
  const supabase = await createClient();

  // Find the latest tracking record for this invite_code
  const { data: existing, error: findError } = await supabase
    .from('invite_tracking')
    .select('id, invite_code, link_clicked')
    .eq('invite_code', inviteCode)
    .order('created_at', { ascending: false })
    .single();

  if (findError || !existing) {
    // No prior click tracking -- direct reservation case
    // Look up inviter from reservations
    const { data: inviter, error: inviterError } = await supabase
      .from('reservations')
      .select('id, invite_code')
      .eq('invite_code', inviteCode)
      .single();

    if (inviterError || !inviter) {
      throw new Error('Invalid invite code');
    }

    // Create new tracking record with conversion
    const { error: insertError } = await supabase
      .from('invite_tracking')
      .insert({
        inviter_id: inviter.id,
        invite_code: inviteCode,
        link_clicked: false,
        converted: true,
        converted_at: new Date().toISOString(),
        invitee_id: inviteeId,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error('Failed to create tracking record');
    }

    return;
  }

  // Update existing record with conversion data
  const { error: updateError } = await supabase
    .from('invite_tracking')
    .update({
      converted: true,
      converted_at: new Date().toISOString(),
      invitee_id: inviteeId,
    })
    .eq('id', existing.id)
    .select()
    .single();

  if (updateError) {
    throw new Error('Failed to update tracking record');
  }
}

/**
 * Get the count of successful (converted) invites for an inviter.
 */
export async function getSuccessfulInvites(inviterId: string): Promise<number> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('invite_tracking')
    .select('id')
    .eq('inviter_id', inviterId)
    .eq('converted', true);

  if (error) {
    throw new Error('Failed to fetch successful invites');
  }

  return (data || []).length;
}

/**
 * Get comprehensive tracking stats for an inviter.
 */
export async function getInviterStats(inviterId: string): Promise<InviterStats> {
  const supabase = await createClient();

  const { data: records, error } = await supabase
    .from('invite_tracking')
    .select('*')
    .eq('inviter_id', inviterId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch inviter stats');
  }

  const allRecords = (records || []) as InviteTracking[];
  const totalClicks = allRecords.filter((r) => r.link_clicked).length;
  const successfulInvites = allRecords.filter((r) => r.converted).length;

  return {
    total_clicks: totalClicks,
    successful_invites: successfulInvites,
    records: allRecords,
  };
}
