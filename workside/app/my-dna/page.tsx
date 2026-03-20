import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { User, DNAResult } from '@/types/database';
import MyDNAClient from './MyDNAClient';

export default async function MyDNAPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/signup');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  const { data: dnaResults } = await supabase
    .from('dna_results')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const { data: participationHistory } = await supabase
    .from('participation_history')
    .select('*')
    .eq('user_id', user.id);

  const { data: suggestions } = await supabase
    .from('suggestions')
    .select('*')
    .eq('user_id', user.id);

  return (
    <MyDNAClient
      profile={profile as User}
      dnaResults={(dnaResults as DNAResult[]) || []}
      participationCount={participationHistory?.length || 0}
      suggestionsCount={suggestions?.length || 0}
      approvedSuggestionsCount={suggestions?.filter(s => s.status === 'approved').length || 0}
    />
  );
}
