import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/utils/supabase/server';

// AI Builder — Phase 10. This route only ever produces a DRAFT row in
// campaign_ai_drafts. It never writes to campaigns/campaign_questions
// directly; that only happens when an Admin explicitly approves the draft
// (see /api/admin/campaigns/ai-draft/[id]/approve). It never touches
// applications/customers/payments/allocations at all.
const SYSTEM_PROMPT = `You are a configuration assistant for M.I. Real Estate and General Enterprises Ltd's Landing Page Agent / Campaign Builder.

Convert the Admin's natural-language description into a structured DRAFT campaign configuration. Follow these rules exactly:

1. Output ONLY the fields defined by the schema. Do not invent or output real estate prices, plot sizes, discounts, payment plan amounts, or availability figures — these are business-specific facts only the Admin knows and must supply.
2. If the Admin's description implies a question that would need specific numeric options (exact plot sizes, exact prices, specific payment plan lengths), create that question as free-text type "Text" instead of inventing option values. Do not fabricate a list of plot sizes or prices as Radio/Dropdown options.
3. Do not redesign, drop, or reorder qualification questions the Admin explicitly described. Only include questions the description actually implies — do not add extra ones.
4. For a conditional follow-up ("if they choose installment, ask about the plan"), set parentQuestionKey and showIfOption on the follow-up question, referencing the exact option text of its parent question, and give every question referenced this way a stable questionKey.
5. Populate assumptionsForAdminReview with a plain-language list of every placeholder, assumption, or business detail the Admin must confirm or fill in before publishing (pricing, plot sizes, discounts, availability, the WhatsApp number, the official application form). Always include this list if anything needs Admin attention.
6. This output is a DRAFT ONLY. It is never published automatically. An Admin must review it, optionally edit it, and explicitly approve it before it becomes a live campaign — nothing you output here goes live on its own.
7. Never propose changes to any other campaign, and never propose anything related to loan/application approval, customer records, payments, or allocations — this tool only configures a single new marketing campaign's landing page.`;

const DRAFT_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string', description: 'Campaign name' },
    suggestedSlug: { type: 'string', description: 'URL-safe slug suggestion, lowercase with hyphens' },
    description: { type: 'string', description: 'Landing page description / property information copy' },
    greetingEnabled: { type: 'boolean' },
    preApplicationEnabled: { type: 'boolean' },
    preApplicationPrompt: { type: ['string', 'null'] },
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          questionKey: { type: ['string', 'null'] },
          type: { type: 'string', enum: ['Text', 'Text Area', 'Number', 'Phone', 'Radio', 'Dropdown'] },
          questionText: { type: 'string' },
          options: { type: ['array', 'null'], items: { type: 'string' } },
          isRequired: { type: 'boolean' },
          parentQuestionKey: { type: ['string', 'null'] },
          showIfOption: { type: ['string', 'null'] }
        },
        required: ['questionKey', 'type', 'questionText', 'options', 'isRequired', 'parentQuestionKey', 'showIfOption'],
        additionalProperties: false
      }
    },
    assumptionsForAdminReview: { type: 'array', items: { type: 'string' } }
  },
  required: ['name', 'suggestedSlug', 'description', 'greetingEnabled', 'preApplicationEnabled', 'preApplicationPrompt', 'questions', 'assumptionsForAdminReview'],
  additionalProperties: false
};

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['Social Media Director', 'Super Admin'].includes(profile.role)) {
      return NextResponse.json({ error: 'Forbidden: Campaign management access required' }, { status: 403 });
    }

    const body = await request.json();
    const prompt: string = body.prompt;
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: 'A campaign description prompt is required' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'AI Builder is not configured (missing ANTHROPIC_API_KEY)' }, { status: 500 });
    }

    const anthropic = new Anthropic({ apiKey });

    const response = await anthropic.messages.create({
      model: 'claude-opus-5',
      max_tokens: 4096,
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: DRAFT_SCHEMA }
      },
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }]
    });

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({ error: 'The AI declined to generate this campaign. Try rephrasing the description.' }, { status: 422 });
    }

    const textBlock = response.content.find((b): b is Anthropic.TextBlock => b.type === 'text');
    if (!textBlock) {
      return NextResponse.json({ error: 'AI did not return a usable draft' }, { status: 502 });
    }

    let generatedConfig: unknown;
    try {
      generatedConfig = JSON.parse(textBlock.text);
    } catch {
      return NextResponse.json({ error: 'AI returned malformed configuration' }, { status: 502 });
    }

    const { data: draft, error: draftError } = await supabase
      .from('campaign_ai_drafts')
      .insert({
        prompt_text: prompt,
        generated_config: generatedConfig,
        status: 'Pending Review',
        created_by: user.id
      })
      .select()
      .single();

    if (draftError) {
      return NextResponse.json({ error: draftError.message }, { status: 500 });
    }

    return NextResponse.json(draft, { status: 201 });
  } catch (err: unknown) {
    console.error('AI draft generation error:', err);
    const message = err instanceof Error ? err.message : 'Unexpected error generating campaign draft';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
