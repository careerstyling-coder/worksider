import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/admin/users - List all users with stats (admin only)
export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Auth + admin check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();
    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const industry = searchParams.get('industry') || '';

    // Fetch users
    let query = supabase
      .from('users')
      .select('id, nickname, email, industry, company_size, created_at')
      .order('created_at', { ascending: false });

    if (industry) {
      query = query.eq('industry', industry);
    }
    if (search) {
      query = query.or(`nickname.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const { data: users, error } = await query.limit(100);

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Total user count
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    // Industry distribution
    const { data: allUsers } = await supabase
      .from('users')
      .select('industry');

    const industryCounts: Record<string, number> = {};
    if (allUsers) {
      for (const u of allUsers) {
        const ind = u.industry || 'Other';
        industryCounts[ind] = (industryCounts[ind] || 0) + 1;
      }
    }
    const industryData = Object.entries(industryCounts).map(([name, value]) => ({ name, value }));

    // Company size distribution
    const { data: allUsersSizes } = await supabase
      .from('users')
      .select('company_size');

    const sizeCounts: Record<string, number> = {};
    if (allUsersSizes) {
      for (const u of allUsersSizes) {
        const size = u.company_size || 'Unknown';
        sizeCounts[size] = (sizeCounts[size] || 0) + 1;
      }
    }
    const sizeData = Object.entries(sizeCounts).map(([name, value]) => ({ name, value }));

    return NextResponse.json({
      data: {
        users: users ?? [],
        totalUsers: totalUsers ?? 0,
        industryData,
        sizeData,
      },
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
