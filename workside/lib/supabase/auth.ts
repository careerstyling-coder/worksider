// @TASK P1-R1-T2 - Auth helper functions (signUp, signIn, signOut, getSession)
// @SPEC docs/planning/02-trd.md#Auth-API

import { createClient } from '@/lib/supabase/client';

// --- Browser-side auth helpers (client components) ---

export async function signUp(
  email: string,
  password: string,
  nickname: string,
  metadata?: { industry?: string; company_size?: string }
) {
  const supabase = createClient();
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { nickname, ...metadata },
    },
  });
}

export async function signIn(email: string, password: string) {
  const supabase = createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  const supabase = createClient();
  return supabase.auth.signOut();
}

// --- Server-side auth helpers (import separately) ---
// getSession is in lib/supabase/auth-server.ts to avoid client/server boundary issues
