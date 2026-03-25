// @TASK P1-R1-T1 - Reservations API route
// @SPEC docs/planning/prelaunch/reservations
// @TEST __tests__/api/reservations/reservations.test.ts

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

// -- Validation schemas --

const reservationCreateSchema = z.object({
  email: z.email(),
  industry: z.string().min(1),
  experience_years: z.string().min(1),
  ref: z.string().optional(),
});

// -- Helpers --

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

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

    const { email, industry, experience_years, ref } = parsed.data;
    const supabase = await createClient();

    // Resolve invited_by_id from ref (invite_code)
    let invited_by_id: string | null = null;
    if (ref) {
      const { data: referrer } = await supabase
        .from('reservations')
        .select('id')
        .eq('invite_code', ref)
        .single();
      if (referrer) {
        invited_by_id = referrer.id;
      }
    }

    const invite_code = generateInviteCode();

    const { data, error } = await supabase
      .from('reservations')
      .insert({
        email,
        industry,
        experience_years,
        invite_code,
        invited_by_id,
      })
      .select()
      .single();

    if (error) {
      // PostgreSQL unique constraint violation
      if (error.code === '23505') {
        return NextResponse.json(
          { error: '이미 예약하신 이메일입니다' },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: '예약 처리 중 오류가 발생했습니다' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        id: data.id,
        email: data.email,
        queue_position: data.queue_position,
        invite_code: data.invite_code,
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { error: '잘못된 요청입니다' },
      { status: 400 }
    );
  }
}

// -- GET /api/reservations?email={email} --

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'email 파라미터가 필요합니다' },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from('reservations')
    .select()
    .eq('email', email)
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: '예약 정보를 찾을 수 없습니다' },
      { status: 404 }
    );
  }

  return NextResponse.json(data, { status: 200 });
}
