// @TASK P1-R1-T3 - Admin role guard
// @SPEC docs/planning/02-trd.md#Auth-Guards

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Server component helper: ensures the user is authenticated AND has admin role.
 * Redirects to /signup if not authenticated, or / if not admin.
 * Returns the authenticated Supabase User.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signup');
    return; // unreachable, but helps TypeScript
  }

  const { data: profile } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'admin') {
    redirect('/');
    return;
  }

  return user;
}
