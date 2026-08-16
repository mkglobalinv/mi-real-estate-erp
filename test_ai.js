const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("Missing OPENAI_API_KEY");
    return;
  }
  
  const SYSTEM_PROMPT = `You are a configuration assistant for M.I. Real Estate and General Enterprises Ltd's Landing Page Agent / Campaign Builder.

Convert the Admin's natural-language description into a structured DRAFT campaign configuration. Follow these rules exactly and output ONLY a JSON object:

1. Output ONLY the JSON fields defined by the schema. Do not invent or output real estate prices, plot sizes, discounts, payment plan amounts, or availability figures — these are business-specific facts only the Admin knows and must supply.
2. If the Admin's description implies a question that would need specific numeric options (exact plot sizes, exact prices, specific payment plan lengths), create that question as free-text type "Text" instead of inventing option values. Do not fabricate a list of plot sizes or prices as Radio/Dropdown options.
3. Do not redesign, drop, or reorder qualification questions the Admin explicitly described. Only include questions the description actually implies — do not add extra ones.
4. For a conditional follow-up ("if they choose installment, ask about the plan"), set parentQuestionKey and showIfOption on the follow-up question, referencing the exact option text of its parent question, and give every question referenced this way a stable questionKey.
5. Populate assumptionsForAdminReview with a plain-language list of every placeholder, assumption, or business detail the Admin must confirm or fill in before publishing (pricing, plot sizes, discounts, availability, the WhatsApp number, the official application form). Always include this list if anything needs Admin attention.
6. This output is a DRAFT ONLY. It is never published automatically. An Admin must review it, optionally edit it, and explicitly approve it before it becomes a live campaign — nothing you output here goes live on its own.
7. Never propose changes to any other campaign, and never propose anything related to loan/application approval, customer records, payments, or allocations — this tool only configures a single new marketing campaign's landing page.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: 'Create a campaign for our new luxury villas in Abuja.' }
        ],
        response_format: { type: 'json_object' }
      })
    });
    
    const data = await response.json();
    if (data.error) {
      console.error("OpenAI Error:", data.error);
      return;
    }
    const responseContent = data.choices[0]?.message?.content;
    console.log("Success! Received response:");
    console.log(responseContent);
  } catch(e) {
    console.error("Error connecting to OpenAI API:");
    console.error(e.message);
  }
}

test();
