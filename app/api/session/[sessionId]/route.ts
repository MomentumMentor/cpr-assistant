import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { data: session, error: sessionError } = await supabase
      .from('cpr_sessions')
      .select('*')
      .eq('id', params.sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { data: context } = await supabase
      .from('contexts')
      .select('*')
      .eq('session_id', params.sessionId)
      .maybeSingle();

    const { data: purpose } = await supabase
      .from('purposes')
      .select('*')
      .eq('session_id', params.sessionId)
      .maybeSingle();

    const { data: results } = await supabase
      .from('results')
      .select('*')
      .eq('session_id', params.sessionId)
      .order('sequence_order', { ascending: true });

    return NextResponse.json({
      session,
      context,
      purpose,
      results: results || [],
    });
  } catch (error: any) {
    console.error('Session load error:', error);
    return NextResponse.json(
      { error: 'Failed to load session', message: error.message },
      { status: 500 }
    );
  }
}
