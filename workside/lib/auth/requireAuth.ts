// @TASK P1-R1-T3 - Server component auth guard
// @SPEC docs/planning/02-trd.md#Auth-Guards

import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

/**
 * Server component helper: ensures the user is authenticated.
 * Redirects to /signup if not authenticated.
 * Returns the authenticated Supabase User.
 */
export async function requireAuth() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signup');
  }

  return user;
}
