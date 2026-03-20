import { createClient } from '@/lib/supabase/server';

export async function getSession() {
  const supabase = await createClient();
  return supabase.auth.getUser();
}
