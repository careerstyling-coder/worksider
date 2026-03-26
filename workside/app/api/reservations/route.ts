// @TASK P1-R1-T1, P1-R1-T2 - Reservations API route (refactored to use lib)
// @SPEC docs/planning/prelaunch/reservations
// @TEST __tests__/api/reservations/reservations.test.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { createReservation } from '@/lib/reservations';

// -- Validation schemas --

const reservationCreateSchema = z.object({
  email: z.email(),
  industry: z.string().min(1),
  experience_years: z.string().min(1),
  ref: z.string().optional(),
});

// -- POST /api/reservations --

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = reservationCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '유효하지 않은 입력입니다', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const reservation = await createReservation(parsed.data);

    return NextResponse.json(
      {
        id: reservation.id,
        email: reservation.email,
        queue_position: reservation.queue_position,
        invite_code: reservation.invite_code,
      },
      { status: 201 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : '';

    if (message === '이미 예약하신 이메일입니다') {
      return NextResponse.json({ error: message }, { status: 409 });
    }

    if (message === '예약 처리 중 오류가 발생했습니다') {
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json(
      { error: '잘못된 요청입니다', debug: message },
      { status: 400 }
    );
  }
}

// -- GET /api/reservations?email={email} or ?invite_code={code} --

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');
  const invite_code = searchParams.get('invite_code');

  if (!email && !invite_code) {
    return NextResponse.json(
      { error: 'email 또는 invite_code 파라미터가 필요합니다' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const query = supabase.from('reservations').select();

  const { data, error } = invite_code
    ? await query.eq('invite_code', invite_code).single()
    : await query.eq('email', email!).single();

  if (error || !data) {
    return NextResponse.json(
      { error: '예약 정보를 찾을 수 없습니다' },
      { status: 404 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
