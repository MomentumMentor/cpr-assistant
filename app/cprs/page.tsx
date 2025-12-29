import { createClient } from '@/lib/supabase/server';
import { CprListView } from '@/components/cprs/cpr-list-view';

interface PageProps {
  searchParams: Promise<{
    filter?: string;
  }>;
}

export default async function CprsPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const params = await searchParams;
  const filter = params.filter || 'all';

  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('cpr_sessions')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false });

  if (filter === 'in_progress') {
    query = query.is('committed_at', null);
  } else if (filter === 'committed') {
    query = query.not('committed_at', 'is', null);
  }

  const { data: sessions } = await query;

  return <CprListView sessions={sessions || []} filter={filter} />;
}
