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
  // 1. Create auth user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: 'milan@prompthub.app',
    password: 'milan123!',
    email_confirm: true,
  })
  if (authError) { console.error('Auth error:', authError); return }
  
  const userId = authData.user.id

  // 2. Insert creator record
  const { error: creatorError } = await supabase.from('creators').insert({
    id: userId,
    email: 'milan@prompthub.app',
    name: 'Milan Ray',
    handle: '@milanray.design',
    subdomain: 'milan',
    brand_color: '#6366f1',
    bio: 'AI content creator & prompt engineer. Turning ideas into visuals.',
    instagram_url: 'https://instagram.com/milanray.design',
    tiktok_url: 'https://tiktok.com/@milanray.design',
  })
  if (creatorError) { console.error('Creator error:', creatorError); return }

  // 3. Insert sample prompts
  const prompts = [
    {
      creator_id: userId,
      title: 'Cinematic Photo Enhance',
      description: 'Transform any photo into a cinematic masterpiece',
      content: 'Transform this image into a cinematic photograph with dramatic lighting, film grain, anamorphic lens flare, shallow depth of field, golden hour tones, and a 2.39:1 aspect ratio. Style: modern Hollywood blockbuster.',
      ai_tool: 'Midjourney',
      output_type: 'image',
      gate_type: 'open',
      slug: 'photo-enhance',
      status: 'published',
    },
    {
      creator_id: userId,
      title: 'Brand Logo Generator',
      description: 'Generate a premium logo for any brand',
      content: 'Create a minimalist, premium logo for [BRAND NAME] in the [INDUSTRY] space. Style: clean vector, single color, works at 16px and 512px, no text gradients, geometric shapes only. Output: white background SVG style.',
      ai_tool: 'ChatGPT',
      output_type: 'image',
      gate_type: 'email',
      slug: 'brand-logo',
      status: 'published',
    },
    {
      creator_id: userId,
      title: 'Viral Reel Script',
      description: 'Write a viral short-form video script',
      content: 'Write a 30-second viral Instagram Reel script for a [TOPIC] video. Hook (0-3s): bold statement or question. Problem (3-10s): relatable pain point. Solution (10-25s): 3 quick tips. CTA (25-30s): comment trigger word. Tone: conversational, energetic, no fluff.',
      ai_tool: 'Claude',
      output_type: 'text',
      gate_type: 'email',
      slug: 'viral-reel-script',
      status: 'published',
    },
  ]

  const { error: promptsError } = await supabase.from('prompts').insert(prompts)
  if (promptsError) { console.error('Prompts error:', promptsError); return }

  console.log('✅ Seed complete! Creator: milan@prompthub.app / milan123!')
}

seed()
