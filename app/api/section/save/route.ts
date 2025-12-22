import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, section, content, locked } = body;

    const { data: session } = await supabase
      .from('cpr_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (section === 'context') {
      const { data: existing } = await supabase
        .from('contexts')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('contexts')
          .update({
            content,
            locked_at: locked ? new Date().toISOString() : existing.locked_at,
            attempt_count: existing.attempt_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
      } else {
        const { data, error } = await supabase
          .from('contexts')
          .insert({
            session_id: sessionId,
            content,
            locked_at: locked ? new Date().toISOString() : null,
            attempt_count: 1,
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }
    }

    if (section === 'purpose') {
      const { data: existing } = await supabase
        .from('purposes')
        .select('*')
        .eq('session_id', sessionId)
        .maybeSingle();

      if (existing) {
        const { data, error } = await supabase
          .from('purposes')
          .update({
            content,
            locked_at: locked ? new Date().toISOString() : existing.locked_at,
            attempt_count: existing.attempt_count + 1,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id)
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
      } else {
        const { data, error } = await supabase
          .from('purposes')
          .insert({
            session_id: sessionId,
            content,
            locked_at: locked ? new Date().toISOString() : null,
            attempt_count: 1,
          })
          .select()
          .single();

        if (error) throw error;
        return NextResponse.json({ success: true, data });
      }
    }

    if (section === 'results') {
      const results = Array.isArray(content) ? content : [content];

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result.id) {
          await supabase
            .from('results')
            .update({
              content: result.content,
              completion_date: result.completion_date,
              control_level: result.control_level,
              locked_at: locked ? new Date().toISOString() : result.locked_at,
              sequence_order: i,
              updated_at: new Date().toISOString(),
            })
            .eq('id', result.id);
        } else {
          await supabase
            .from('results')
            .insert({
              session_id: sessionId,
              content: result.content,
              completion_date: result.completion_date,
              control_level: result.control_level,
              locked_at: locked ? new Date().toISOString() : null,
              sequence_order: i,
              attempt_count: 1,
            });
        }
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid section' }, { status: 400 });
  } catch (error: any) {
    console.error('Save error:', error);
    return NextResponse.json(
      { error: 'Failed to save', message: error.message },
      { status: 500 }
    );
  }
}
