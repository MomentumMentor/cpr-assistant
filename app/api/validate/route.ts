import { NextRequest, NextResponse } from 'next/server';
import { getOpenAI, MODEL, MAX_TOKENS } from '@/lib/openai';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      section,
      content,
      pathway,
      attemptCount,
      deadline,
      mode,
      existingContext,
      existingPurpose,
    } = body;

    const violations: string[] = [];
    const suggestions: string[] = [];
    let valid = true;

    const systemPrompt = `You are a strict CPR (Context-Purpose-Results) framework validator.
Communication mode: ${mode === 'friendly' ? 'plain language, casual tone' : 'professional, consultant-level language'}.
Be precise and direct in your feedback.`;

    if (section === 'context') {
      const wordCount = content.trim().split(/\s+/).length;

      if (wordCount < 1 || wordCount > 5) {
        violations.push('Context must be 1-5 words only');
        valid = false;
      }

      const bannedWords = ['success', 'excellence', 'transform', 'optimize'];
      const lowerContent = content.toLowerCase();
      const hasBanned = bannedWords.some(word => lowerContent.includes(word));

      if (hasBanned) {
        violations.push('Context contains vague or overused terms. Be more specific and powerful.');
        valid = false;
      }

      const userPrompt = `Validate this Context: "${content}"

Rules:
- Must be a mindset/attitude (state-based, not action-based)
- Must be compelling and powerful
- Cannot be generic platitudes
${pathway === 'cpr' && existingPurpose ? `- Must logically support this Purpose: "${existingPurpose}"` : ''}

Is this Context valid? Provide specific feedback.`;

      const completion = await getOpenAI().chat.completions.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const aiResponse = completion.choices[0].message.content || '';

      if (aiResponse.toLowerCase().includes('not valid') || aiResponse.toLowerCase().includes('invalid')) {
        violations.push(aiResponse);
        valid = false;
      } else if (aiResponse.toLowerCase().includes('concern') || aiResponse.toLowerCase().includes('improve')) {
        suggestions.push(aiResponse);
      }
    }

    if (section === 'purpose') {
      const hasToBy = content.toLowerCase().includes('to ') && content.toLowerCase().includes('by ');
      const hasSoThat = content.toLowerCase().includes('so that');

      if (!hasToBy || !hasSoThat) {
        violations.push('Purpose must follow structure: "To [goal] by [how] so that [impact]"');
        valid = false;
      }

      const vagueVerbs = ['improve', 'enhance', 'support', 'optimize', 'leverage'];
      const hasVague = vagueVerbs.some(verb => content.toLowerCase().includes(verb));

      if (hasVague) {
        violations.push('Purpose contains vague verbs. Be specific about what you will accomplish.');
        valid = false;
      }

      const userPrompt = `Validate this Purpose: "${content}"

Rules:
- Must be single sentence (run-on allowed)
- Must follow "To [goal] by [how] so that [impact]" structure
- Must include tangible goal and clear impact
- Must specify who benefits
${pathway === 'cpr' && existingContext ? `- Must flow from this Context: "${existingContext}"` : ''}

Is this Purpose valid? Provide specific feedback.`;

      const completion = await getOpenAI().chat.completions.create({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      });

      const aiResponse = completion.choices[0].message.content || '';

      if (aiResponse.toLowerCase().includes('not valid') || aiResponse.toLowerCase().includes('invalid')) {
        violations.push(aiResponse);
        valid = false;
      } else if (aiResponse.toLowerCase().includes('concern') || aiResponse.toLowerCase().includes('improve')) {
        suggestions.push(aiResponse);
      }
    }

    if (section === 'results') {
      const results = Array.isArray(content) ? content : [content];

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        const pastTenseWords = ['achieved', 'completed', 'delivered', 'implemented', 'created', 'launched'];
        const hasPastTense = pastTenseWords.some(word => result.content.toLowerCase().includes(word));

        if (!hasPastTense && !result.content.match(/\w+ed\s/)) {
          violations.push(`Result ${i + 1}: Must be written in past tense`);
          valid = false;
        }

        if (result.completion_date && deadline) {
          const resultDate = new Date(result.completion_date);
          const deadlineDate = new Date(deadline);
          if (resultDate > deadlineDate) {
            violations.push(`Result ${i + 1}: Completion date cannot be after deadline`);
            valid = false;
          }
        }

        const userPrompt = `Validate this Result: "${result.content}"

Rules:
- Must be SMART (Specific, Measurable, Attainable, Relevant, Time-bound)
- Must be written in past tense
- Cannot have vague success criteria
- No undefined acronyms

Is this Result valid? Provide specific feedback.`;

        const completion = await getOpenAI().chat.completions.create({
          model: MODEL,
          max_tokens: MAX_TOKENS,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        });

        const aiResponse = completion.choices[0].message.content || '';

        if (aiResponse.toLowerCase().includes('not valid') || aiResponse.toLowerCase().includes('invalid')) {
          violations.push(`Result ${i + 1}: ${aiResponse}`);
          valid = false;
        } else if (aiResponse.toLowerCase().includes('concern') || aiResponse.toLowerCase().includes('improve')) {
          suggestions.push(`Result ${i + 1}: ${aiResponse}`);
        }
      }
    }

    let exampleOption;
    if (!valid && attemptCount >= 3) {
      const examplePrompt = `Provide ONE example of a valid ${section} that would meet all requirements.
Context for example: ${JSON.stringify({ mode, pathway, existingContext, existingPurpose })}
Return ONLY the example, no explanation.`;

      const exampleCompletion = await getOpenAI().chat.completions.create({
        model: MODEL,
        max_tokens: 200,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: examplePrompt },
        ],
      });

      exampleOption = exampleCompletion.choices[0].message.content?.trim();
    }

    const feedback = valid
      ? `This ${section} meets all requirements. Ready to lock in!`
      : `Please address the following issues before proceeding.`;

    return NextResponse.json({
      valid,
      feedback,
      violations,
      suggestions,
      exampleOption,
    });
  } catch (error: any) {
    console.error('Validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed', message: error.message },
      { status: 500 }
    );
  }
}
