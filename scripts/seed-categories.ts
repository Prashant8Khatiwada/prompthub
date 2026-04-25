const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const categories = [
  { name: 'Education', slug: 'education', icon: '📚', description: 'AI prompts for learning, studying, and academic research.', featured: true },
  { name: 'Marketing', slug: 'marketing', icon: '📈', description: 'Viral copy, ad strategies, and brand building prompts.', featured: true },
  { name: 'Creative Arts', slug: 'creative-arts', icon: '🎨', description: 'Midjourney, DALL-E, and artistic generation guides.', featured: true },
  { name: 'Programming', slug: 'programming', icon: '💻', description: 'Code generation, debugging, and architecture prompts.', featured: true },
  { name: 'Business', slug: 'business', icon: '💼', description: 'Email automation, strategy, and operations.', featured: true },
  { name: 'Entertainment', slug: 'entertainment', icon: '🎬', description: 'Script writing, video ideas, and storytelling.', featured: true },
]

async function seed() {
  console.log('🚀 Seeding professional categories...')
  
  for (const cat of categories) {
    const { error } = await supabase
      .from('categories')
      .upsert(cat, { onConflict: 'slug' })
    
    if (error) {
      console.error(`❌ Error seeding ${cat.name}:`, error.message)
    } else {
      console.log(`✅ Seeded: ${cat.name}`)
    }
  }

  console.log('\n✨ Seeding complete! Refresh your admin panel.')
}

seed()
