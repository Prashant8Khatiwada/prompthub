import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data } = await supabase.from('prompts').select('slug, thumbnail_url, status').limit(5)
  console.log(data)
  const { data: creator } = await supabase.from('creators').select('subdomain').limit(1)
  console.log(creator)
}
run()
