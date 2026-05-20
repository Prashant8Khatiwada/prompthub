import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase
    .from('prompts')
    .select('id, title, slug, thumbnail_url, share_image_url')
    .eq('status', 'published')
    .limit(5)

  if (error) {
    console.error('Error fetching prompts:', error)
  } else {
    console.log('Database Records:')
    console.log(JSON.stringify(data, null, 2))
  }
}

run()
