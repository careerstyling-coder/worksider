// @TASK P1-R1-T2 - Reservations business logic module
// @SPEC docs/planning/prelaunch/reservations
// @TEST __tests__/lib/reservations.test.ts

import { createClient } from '@/lib/supabase/server';

// -- Types --

export interface ReservationInput {
  email: string;
  industry: string;
  experience_years: string;
  ref?: string;
}

export interface Reservation {
  id: string;
  email: string;
  industry: string;
  experience_years: string;
  queue_position: number;
  invite_code: string;
  invited_by_id: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

// -- Constants --

const INVITE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 8;
const MAX_CODE_RETRIES = 10;

// -- Business Logic Functions --

/**
 * Check if email already has a reservation.
 * @returns true if duplicate, false if available
 */
export async function checkDuplicateEmail(email: string): Promise<boolean> {
  const supabase = await createClient();

  const { data } = await supabase
    .from('reservations')
    .select('id')
    .eq('email', email)
    .single();

  return data !== null;
}

/**
 * Generate a unique 8-character invite code.
 * Retries up to MAX_CODE_RETRIES times if code already exists.
 */
export async function generateInviteCode(): Promise<string> {
  const supabase = await createClient();

  for (let attempt = 0; attempt < MAX_CODE_RETRIES; attempt++) {
    const code = generateRandomCode();

    const { data } = await supabase
      .from('reservations')
      .select('id')
      .eq('invite_code', code)
      .single();

    // No existing record with this code → it's unique
    if (data === null) {
      return code;
    }
  }

  throw new Error('초대 코드 생성에 실패했습니다. 다시 시도해주세요.');
}

/**
 * Resolve an inviter's ID from their invite_code.
 * @returns inviter UUID or null if not found / ref is undefined
 */
export async function resolveInviter(ref?: string): Promise<string | null> {
  if (!ref) return null;

  const supabase = await createClient();

  const { data } = await supabase
    .from('reservations')
    .select('id')
    .eq('invite_code', ref)
    .single();

  return data?.id ?? null;
}

/**
 * Create a complete reservation combining all business logic:
 * 1. Check duplicate email
 * 2. Generate unique invite code
 * 3. Resolve inviter from ref
 * 4. Insert reservation row
 *
 * queue_position is auto-assigned by PostgreSQL serial column.
 */
export async function createReservation(input: ReservationInput): Promise<Reservation> {
  // Layer 2: Domain validation - duplicate email check
  const isDuplicate = await checkDuplicateEmail(input.email);
  if (isDuplicate) {
    throw new Error('이미 예약하신 이메일입니다');
  }

  // Generate unique invite code
  const invite_code = await generateInviteCode();

  // Resolve inviter from ref code
  const invited_by_id = await resolveInviter(input.ref);

  // Insert reservation
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      email: input.email,
      industry: input.industry,
      experience_years: input.experience_years,
      invite_code,
      invited_by_id,
    })
    .select()
    .single();

  if (error || !data) {
    // PostgreSQL unique constraint violation (race condition fallback)
    if (error?.code === '23505') {
      throw new Error('이미 예약하신 이메일입니다');
    }
    throw new Error('예약 처리 중 오류가 발생했습니다');
  }

  return data as Reservation;
}

// -- Internal Helpers --

function generateRandomCode(): string {
  let code = '';
  for (let i = 0; i < INVITE_CODE_LENGTH; i++) {
    code += INVITE_CODE_CHARS.charAt(
      Math.floor(Math.random() * INVITE_CODE_CHARS.length)
    );
  }
  return code;
}
