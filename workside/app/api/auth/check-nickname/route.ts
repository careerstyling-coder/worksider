// @TASK P1-R1-T2 - Nickname availability check API
// @SPEC docs/planning/02-trd.md#Auth-API

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const nicknameCheckSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다')
    .max(20, '닉네임은 20자 이하여야 합니다'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = nicknameCheckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '닉네임은 2~20자여야 합니다' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('nickname', parsed.data.nickname)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ available: true });
    }

    return NextResponse.json({ available: data === null });
  } catch {
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
