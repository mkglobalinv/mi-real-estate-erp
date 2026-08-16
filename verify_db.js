const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
  console.log("Verifying campaigns columns...");
  const { data: cData, error: cErr } = await supabase
    .from('campaigns')
    .select('hot_threshold, warm_threshold, terms_and_conditions, terms_and_conditions_hausa, cancellation_rules, cancellation_rules_hausa')
    .limit(1);
    
  if (cErr) {
    console.error("❌ Error on campaigns:", cErr.message);
  } else {
    console.log("✅ campaigns columns exist!");
  }

  console.log("Verifying campaign_packages...");
  const { data: pData, error: pErr } = await supabase
    .from('campaign_packages')
    .select('*')
    .limit(1);
    
  if (pErr) {
    console.error("❌ Error on campaign_packages:", pErr.message);
  } else {
    console.log("✅ campaign_packages exists!");
  }

  console.log("Verifying campaign_questions columns...");
  const { data: qData, error: qErr } = await supabase
    .from('campaign_questions')
    .select('question_text_hausa, options_hausa, options_scores')
    .limit(1);
    
  if (qErr) {
    console.error("❌ Error on campaign_questions:", qErr.message);
  } else {
    console.log("✅ campaign_questions columns exist!");
  }
}

verify();
