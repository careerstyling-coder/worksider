// @TASK P1-R1-T3 - Current user info (nullable)
// @SPEC docs/planning/02-trd.md#Auth-Guards

import { createClient } from '@/lib/supabase/server';
import type { User } from '@/types/database';

/**
 * Server component helper: returns the current user's profile, or null.
 * Does NOT redirect — safe for optional auth contexts (e.g. headers, navbars).
 */
export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  return data;
}
