import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!

const supabase = createClient(supabaseUrl, supabaseKey)

async function run() {
  const { data, error } = await supabase
    .from('prompts')
    .select('id, title, slug, content')
    .eq('slug', 'product-photoshot')
    .single()

  if (error) {
    console.error('Error fetching prompt:', error)
  } else {
    console.log('Database Content for product-photoshot:')
    console.log(data.content)
  }
}

run()
