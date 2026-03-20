// @TASK P1-R1-T2 - Email availability check API
// @SPEC docs/planning/02-trd.md#Auth-API

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const emailCheckSchema = z.object({
  email: z.string().email('유효한 이메일을 입력해주세요'),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = emailCheckSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: '유효한 이메일을 입력해주세요' },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('email', parsed.data.email)
      .maybeSingle();

    // data가 null이면 해당 이메일이 없음 = 사용 가능
    if (error) {
      // RLS 등으로 조회 불가 시 사용 가능으로 처리 (가입 시 실제 검증됨)
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
