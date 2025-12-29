import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.set({ name, value: '', ...options });
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    let extractedText = '';

    if (file.name.endsWith('.txt')) {
      extractedText = buffer.toString('utf-8');
    } else if (file.name.endsWith('.docx')) {
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (file.name.endsWith('.pdf')) {
      const pdf = await import('pdf-parse');
      const data = await pdf.default(buffer);
      extractedText = data.text;
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    const parsedCPR = parseCPRContent(extractedText);

    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${Date.now()}.${fileExt}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('cpr-uploads')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
    }

    const fileUrl = uploadData?.path
      ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/cpr-uploads/${uploadData.path}`
      : null;

    const parsingStatus = parsedCPR.context && parsedCPR.purpose && parsedCPR.results.length > 0
      ? 'success'
      : 'manual_review';

    const { data: newSession, error: sessionError } = await supabase
      .from('cpr_sessions')
      .insert({
        user_id: user.id,
        user_name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        uploaded_file_url: fileUrl,
        uploaded_file_name: file.name,
        parsing_status: parsingStatus,
      })
      .select()
      .single();

    if (sessionError) throw sessionError;

    const initialMessage = parsingStatus === 'success'
      ? `I've loaded your CPR from "${file.name}".\n\n**CONTEXT**: ${parsedCPR.context}\n**PURPOSE**: ${parsedCPR.purpose}\n**RESULTS**:\n${parsedCPR.results.map((r, i) => `${i + 1}. ${r}`).join('\n')}\n\nWhat would you like to do?\n1. Review and improve it\n2. Run SKYNET analysis\n3. Update specific sections`
      : `I've uploaded your document "${file.name}", but I need your help to identify the Context, Purpose, and Results. Let's work through this together.\n\nHere's what I found in your document:\n\n${extractedText.substring(0, 500)}...\n\nCan you tell me what your Context is (1-5 words describing your mindset)?`;

    await supabase.from('cpr_messages').insert({
      session_id: newSession.id,
      role: 'assistant',
      content: initialMessage
    });

    return NextResponse.json({
      session: newSession,
      parsed: parsingStatus === 'success',
      parsedData: parsedCPR
    });

  } catch (error) {
    console.error('Upload CPR Error:', error);
    return NextResponse.json(
      { error: 'Failed to upload CPR' },
      { status: 500 }
    );
  }
}

function parseCPRContent(text: string): {
  context: string | null;
  purpose: string | null;
  results: string[];
} {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  let context: string | null = null;
  let purpose: string | null = null;
  let results: string[] = [];

  const contextMatch = text.match(/(?:CONTEXT|Context):\s*([^\n]+)/i);
  if (contextMatch) {
    context = contextMatch[1].trim();
  } else {
    const firstLine = lines[0];
    if (firstLine && firstLine.split(' ').length <= 5) {
      context = firstLine;
    }
  }

  const purposeMatch = text.match(/(?:PURPOSE|Purpose):\s*([^\n]+(?:\n(?!\n)[^\n]+)*)/i);
  if (purposeMatch) {
    purpose = purposeMatch[1].trim();
  } else {
    const toByMatch = text.match(/To\s+[^.]+\s+by\s+[^.]+\s+so\s+that\s+[^.]+\./i);
    if (toByMatch) {
      purpose = toByMatch[0];
    }
  }

  const resultsMatch = text.match(/(?:RESULTS?|Results?):\s*([\s\S]+?)(?:\n\n|$)/i);
  if (resultsMatch) {
    const resultsText = resultsMatch[1];
    const resultLines = resultsText.split('\n')
      .map(l => l.trim())
      .filter(l => l.match(/^[-•*\d+.]/));
    results = resultLines.map(r => r.replace(/^[-•*\d+.]\s*/, '').trim());
  } else {
    results = lines.filter(line =>
      line.match(/\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}-\d{2}-\d{2}|(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s+\d{4}/i)
    );
  }

  return { context, purpose, results };
}
