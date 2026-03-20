import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const revalidate = 60; // 60초 캐시

export async function GET() {
  try {
    const supabase = await createClient();

    // 총 사용자 수
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // 고유 산업군 수
    const { data: industries } = await supabase
      .from('users')
      .select('industry')
      .not('industry', 'is', null);

    const uniqueIndustries = new Set(industries?.map(u => u.industry).filter(Boolean)).size;

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalPersonas: 6,
      totalIndustries: uniqueIndustries || 0,
    });
  } catch {
    return NextResponse.json({
      totalUsers: 0,
      totalPersonas: 6,
      totalIndustries: 0,
    });
  }
}
