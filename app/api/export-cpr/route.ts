import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const format = searchParams.get('format') as 'image' | 'docx';

    if (!sessionId || !format) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

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

    const { data: session, error: sessionError } = await supabase
      .from('cpr_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'CPR not found' }, { status: 404 });
    }

    if (format === 'docx') {
      return await exportAsDocx(session);
    } else {
      return await exportAsImage(session);
    }
  } catch (error) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}

async function exportAsDocx(session: any) {
  const Document = (await import('docx')).Document;
  const Paragraph = (await import('docx')).Paragraph;
  const TextRun = (await import('docx')).TextRun;
  const Packer = (await import('docx')).Packer;
  const AlignmentType = (await import('docx')).AlignmentType;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            text: 'CONTEXT-PURPOSE-RESULTS',
            heading: 'Heading1',
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'CONTEXT: ', bold: true, size: 28 }),
              new TextRun({ text: session.context || 'Not specified', size: 28 }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'PURPOSE: ', bold: true, size: 28 }),
              new TextRun({ text: session.purpose || 'Not specified', size: 28 }),
            ],
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [new TextRun({ text: 'RESULTS:', bold: true, size: 28 })],
            spacing: { after: 100 },
          }),
          ...((session.results as string[]) || []).map(
            (result: string, index: number) =>
              new Paragraph({
                children: [
                  new TextRun({ text: `${index + 1}. `, bold: true, size: 24 }),
                  new TextRun({ text: result, size: 24 }),
                ],
                spacing: { after: 100 },
              })
          ),
          new Paragraph({
            text: '',
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({ text: 'Created: ', bold: true, size: 20 }),
              new TextRun({ text: new Date(session.created_at).toLocaleDateString(), size: 20 }),
            ],
          }),
          ...(session.committed_at
            ? [
                new Paragraph({
                  children: [
                    new TextRun({ text: 'Committed: ', bold: true, size: 20 }),
                    new TextRun({ text: new Date(session.committed_at).toLocaleDateString(), size: 20 }),
                  ],
                }),
              ]
            : []),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="cpr-${session.id}.docx"`,
    },
  });
}

async function exportAsImage(session: any) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            background: linear-gradient(135deg, #1a2942 0%, #1e3a5f 50%, #152238 100%);
            min-height: 100vh;
            margin: 0;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            background: rgba(255, 255, 255, 0.95);
            padding: 60px;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          }
          h1 {
            text-align: center;
            color: #1a2942;
            font-size: 36px;
            margin-bottom: 40px;
            border-bottom: 3px solid #fbbf24;
            padding-bottom: 20px;
          }
          .section {
            margin-bottom: 30px;
          }
          .label {
            font-weight: bold;
            color: #1a2942;
            font-size: 20px;
            margin-bottom: 10px;
          }
          .content {
            color: #374151;
            font-size: 16px;
            line-height: 1.6;
            padding-left: 10px;
          }
          .results {
            list-style: none;
            padding: 0;
          }
          .results li {
            padding: 12px;
            margin-bottom: 10px;
            background: #f3f4f6;
            border-left: 4px solid #fbbf24;
            border-radius: 4px;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            color: #6b7280;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>CONTEXT-PURPOSE-RESULTS</h1>

          <div class="section">
            <div class="label">CONTEXT:</div>
            <div class="content">${session.context || 'Not specified'}</div>
          </div>

          <div class="section">
            <div class="label">PURPOSE:</div>
            <div class="content">${session.purpose || 'Not specified'}</div>
          </div>

          <div class="section">
            <div class="label">RESULTS:</div>
            <ul class="results">
              ${
                ((session.results as string[]) || [])
                  .map((result: string, index: number) => `<li>${index + 1}. ${result}</li>`)
                  .join('') || '<li>No results specified</li>'
              }
            </ul>
          </div>

          <div class="footer">
            <div>Created: ${new Date(session.created_at).toLocaleDateString()}</div>
            ${session.committed_at ? `<div>Committed: ${new Date(session.committed_at).toLocaleDateString()}</div>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;

  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1200, height: 1600 });
  await page.setContent(html);
  const screenshot = await page.screenshot({ type: 'png', fullPage: true });
  await browser.close();

  return new NextResponse(screenshot, {
    headers: {
      'Content-Type': 'image/png',
      'Content-Disposition': `attachment; filename="cpr-${session.id}.png"`,
    },
  });
}
