import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log("Checking campaigns.hot_threshold...");
  const { data: cData, error: cErr } = await supabase.from('campaigns').select('hot_threshold, warm_threshold, terms_and_conditions, terms_and_conditions_hausa').limit(1);
  if (cErr) {
    console.error("Error campaigns:", cErr.message);
  } else {
    console.log("Campaigns new columns exist!", cData);
  }

  console.log("Checking campaign_packages...");
  const { data: pData, error: pErr } = await supabase.from('campaign_packages').select('*').limit(1);
  if (pErr) {
    console.error("Error campaign_packages:", pErr.message);
  } else {
    console.log("campaign_packages exists!", pData);
  }

  console.log("Checking campaign_questions.question_text_hausa...");
  const { data: qData, error: qErr } = await supabase.from('campaign_questions').select('question_text_hausa, options_hausa, options_scores').limit(1);
  if (qErr) {
    console.error("Error campaign_questions:", qErr.message);
  } else {
    console.log("Campaign questions new columns exist!", qData);
  }
}

checkSchema();
