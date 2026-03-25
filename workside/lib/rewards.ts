// @TASK P1-R3-T2 - Rewards Business Logic
// @SPEC docs/planning/prelaunch/rewards
// @TEST __tests__/lib/rewards.test.ts

import { createClient } from '@/lib/supabase/server';
import { getSuccessfulInvites } from '@/lib/invite-tracking';

const UNLOCK_THRESHOLD = 5;

/**
 * Reward record type returned from Supabase.
 */
export interface Reward {
  id: string;
  reservation_id: string;
  type: string;
  status: string;
  unlocked_at: string | null;
  created_at: string;
}

/**
 * Create initial rewards (early_adopter_badge + priority_access) for a reservation.
 * Skips creation if rewards already exist (idempotent).
 */
export async function createInitialRewards(reservationId: string): Promise<Reward[]> {
  const supabase = await createClient();

  // Check for existing rewards
  const { data: existing, error: fetchError } = await supabase
    .from('rewards')
    .select('*')
    .eq('reservation_id', reservationId);

  if (fetchError) {
    throw new Error('Failed to check existing rewards');
  }

  // Idempotent: skip if rewards already exist
  if (existing && existing.length > 0) {
    return existing as Reward[];
  }

  // Create 2 initial rewards
  const { data, error } = await supabase
    .from('rewards')
    .insert([
      { reservation_id: reservationId, type: 'early_adopter_badge', status: 'pending' },
      { reservation_id: reservationId, type: 'priority_access', status: 'pending' },
    ])
    .select();

  if (error || !data) {
    throw new Error('Failed to create initial rewards');
  }

  return data as Reward[];
}

/**
 * Get all rewards for a reservation.
 */
export async function getRewardsByReservation(reservationId: string): Promise<Reward[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('rewards')
    .select('*')
    .eq('reservation_id', reservationId);

  if (error) {
    throw new Error('Failed to fetch rewards');
  }

  return (data || []) as Reward[];
}

/**
 * Check invite count and unlock rewards if threshold (5) is met.
 * Uses invite-tracking module to get successful invite count.
 *
 * - If invites >= 5 and rewards are pending, unlocks them all.
 * - If already unlocked, returns current state without modification.
 * - If invites < 5, returns { unlocked: false, rewards }.
 */
export async function checkAndUnlockRewards(
  reservationId: string
): Promise<{ unlocked: boolean; rewards: Reward[] }> {
  const inviteCount = await getSuccessfulInvites(reservationId);
  const rewards = await getRewardsByReservation(reservationId);

  if (inviteCount < UNLOCK_THRESHOLD) {
    return { unlocked: false, rewards };
  }

  // Check if any rewards need unlocking
  const pendingRewards = rewards.filter((r) => r.status !== 'unlocked');

  if (pendingRewards.length === 0) {
    // All already unlocked
    return { unlocked: true, rewards };
  }

  // Unlock all pending rewards
  const supabase = await createClient();
  const now = new Date().toISOString();

  await supabase
    .from('rewards')
    .update({ status: 'unlocked', unlocked_at: now })
    .eq('reservation_id', reservationId)
    .eq('status', 'pending');

  // Re-fetch to get updated state
  const updatedRewards = await getRewardsByReservation(reservationId);

  return { unlocked: true, rewards: updatedRewards };
}

/**
 * Update the status of a specific reward by reservation_id and type.
 */
export async function updateRewardStatus(
  reservationId: string,
  type: string,
  status: string
): Promise<Reward> {
  const supabase = await createClient();

  const updateData: Record<string, unknown> = { status };
  if (status === 'unlocked') {
    updateData.unlocked_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('rewards')
    .update(updateData)
    .eq('reservation_id', reservationId)
    .eq('type', type)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Reward not found');
  }

  return data as Reward;
}
