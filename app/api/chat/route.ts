import { OpenAI } from 'openai';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { CPR_INSTRUCTIONS } from '@/lib/cpr-instructions';
import { CPR_KNOWLEDGE } from '@/lib/cpr-knowledge';

export async function POST(request: Request) {
  try {
    const { sessionId, message } = await request.json();
    const supabase = createRouteHandlerClient({ cookies });

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: cprSession } = await supabase
      .from('cpr_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', session.user.id)
      .maybeSingle();

    if (!cprSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const { data: messages } = await supabase
      .from('cpr_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    const systemPrompt = `${CPR_INSTRUCTIONS}

${CPR_KNOWLEDGE}

Current Session Context:
- User Name: ${cprSession.user_name || 'User'}
- Communication Mode: ${cprSession.communication_mode || 'Not set'}
- Pathway: ${cprSession.pathway || 'Not set'}
- Deadline: ${cprSession.deadline || 'Not set'}
- Session ID: ${sessionId}`;

    const chatMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system' as const, content: systemPrompt },
      ...(messages || []).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user' as const, content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 2000,
    });

    const assistantResponse = completion.choices[0].message.content || 'No response generated.';

    await supabase.from('cpr_messages').insert([
      {
        session_id: sessionId,
        role: 'user',
        content: message,
      },
      {
        session_id: sessionId,
        role: 'assistant',
        content: assistantResponse,
      },
    ]);

    await supabase
      .from('cpr_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return NextResponse.json({
      response: assistantResponse,
      sessionId,
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
