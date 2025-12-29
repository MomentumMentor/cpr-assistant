import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: sessions } = await supabase
      .from('cpr_sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: false });

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Get Sessions Error:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: newSession, error } = await supabase
      .from('cpr_sessions')
      .insert({
        user_id: session.user.id,
        status: 'in_progress',
      })
      .select()
      .single();

    if (error) throw error;

    await supabase.from('cpr_messages').insert({
      session_id: newSession.id,
      role: 'assistant',
      content: 'Welcome. I am the CPR Assistant. When I refer to CPR, I mean the **Context, Purpose, Results** framework — not cardiopulmonary resuscitation. Confusing these terms could be a deadly mistake!\n\nImportant: This tool uses AI and may produce errors or hallucinations. It is a training aid only—not a replacement for your judgment, experience, or intellect.\n\nTo begin, what name would you like me to call you?',
    });

    return NextResponse.json({ session: newSession });
  } catch (error) {
    console.error('Create Session Error:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
