// Run with: npx ts-node scripts/seed.ts
// Seeds Milan's creator account + 3 sample prompts
import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log('🌱 Starting seed process...')

  // 1. Create or get auth user
  let userId: string
  const email = 'milan@creatopedia.tech'
  
  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const user = existingUsers.users.find(u => u.email === email)

  if (user) {
    console.log('✅ User already exists:', user.id)
    userId = user.id
  } else {
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password: 'milan123!',
      email_confirm: true,
    })
    if (authError) { console.error('❌ Auth error:', authError.message); return }
    userId = authData.user.id
    console.log('✅ Created new auth user:', userId)
  }

  // 2. Upsert creator record
  const { error: creatorError } = await supabase.from('creators').upsert({
    id: userId,
    email,
    name: 'Milan Ray',
    handle: '@milanray.design',
    subdomain: 'milan',
    brand_color: '#6366f1',
    bio: 'AI content creator & prompt engineer. Turning ideas into visuals.',
  })
  if (creatorError) { console.error('❌ Creator error:', creatorError.message); return }
  console.log('✅ Upserted creator record')

  // 3. Fetch a category to link to
  const { data: categoryData } = await supabase.from('categories').select('id').limit(1).single()
  const catId = categoryData?.id

  if (!catId) {
    console.warn('⚠️ No categories found. Please run seed-categories.ts first!')
  }

  // 4. Insert sample prompts
  const prompts = [
    {
      creator_id: userId,
      category_id: catId,
      title: 'Cinematic Photo Enhance',
      description: 'Transform any photo into a cinematic masterpiece',
      content: 'Transform this image into a cinematic photograph with dramatic lighting, film grain, anamorphic lens flare, shallow depth of field, golden hour tones, and a 2.39:1 aspect ratio. Style: modern Hollywood blockbuster.',
      ai_tool: 'Midjourney',
      output_type: 'image',
      gate_type: 'open',
      slug: 'photo-enhance',
      status: 'published',
      featured: true
    },
    {
      creator_id: userId,
      category_id: catId,
      title: 'Brand Logo Generator',
      description: 'Generate a premium logo for any brand',
      content: 'Create a minimalist, premium logo for [BRAND NAME] in the [INDUSTRY] space. Style: clean vector, single color, works at 16px and 512px, no text gradients, geometric shapes only. Output: white background SVG style.',
      ai_tool: 'ChatGPT',
      output_type: 'image',
      gate_type: 'email',
      slug: 'brand-logo',
      status: 'published'
    },
    {
      creator_id: userId,
      category_id: catId,
      title: 'Viral Reel Script',
      description: 'Write a viral short-form video script',
      content: 'Write a 30-second viral Instagram Reel script for a [TOPIC] video. Hook (0-3s): bold statement or question. Problem (3-10s): relatable pain point. Solution (10-25s): 3 quick tips. CTA (25-30s): comment trigger word. Tone: conversational, energetic, no fluff.',
      ai_tool: 'Claude',
      output_type: 'text',
      gate_type: 'email',
      slug: 'viral-reel-script',
      status: 'published'
    },
  ]

  const { error: promptsError } = await supabase.from('prompts').upsert(prompts, { onConflict: 'creator_id,slug' })
  if (promptsError) { console.error('❌ Prompts error:', promptsError.message); return }

  console.log('\n✨ Seed complete! Login: milan@creatopedia.tech / milan123!')
}

seed()
