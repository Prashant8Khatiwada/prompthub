const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function runQuery() {
  const milanId = 'b81f114b-4f9f-4cfa-a944-e874bcd15c96';
  console.log(`Querying prompts for Milan (ID: ${milanId})...`);
  const { data, error } = await supabase
    .from('prompts')
    .select('id, title, slug, status')
    .eq('creator_id', milanId);

  if (error) {
    console.error("Error:", error);
  } else {
    console.log(`Found ${data.length} prompts:`);
    data.forEach(p => {
      console.log(`- ID: ${p.id}, Title: ${p.title}, Slug: ${p.slug}, Status: ${p.status}`);
    });
  }
}

runQuery();
