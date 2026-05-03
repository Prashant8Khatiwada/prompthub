import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function seed() {
  console.log('🌱 Seeding Fotosfolio ad for Milan...')

  // 1. Find Milan
  // We'll search by subdomain 'milan' which is what the user uses in the URL
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .or('subdomain.eq.milan,handle.eq.@milanray.design')
    .single()

  if (!creator) {
    console.error('❌ Milan not found in database. Please ensure you have a creator with subdomain "milan".')
    return
  }

  console.log('✅ Found creator:', creator.name, `(${creator.id})`)

  // 2. Create Ad Client
  let { data: client } = await supabase
    .from('ad_clients')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('name', 'Fotosfolio')
    .single()

  if (!client) {
    const { data: newClient, error: clientErr } = await supabase
      .from('ad_clients')
      .insert({
        creator_id: creator.id,
        name: 'Fotosfolio',
        company: 'Fotosfolio Inc.',
        website: 'https://fotosfolio.com',
        status: 'active'
      })
      .select()
      .single()
    
    if (clientErr) {
        console.error('❌ Client creation failed:', clientErr.message)
        return
    }
    client = newClient
    console.log('✅ Ad Client created')
  } else {
    console.log('ℹ️ Ad Client already exists')
  }

  // 3. Create Campaign
  let { data: campaign } = await supabase
    .from('ad_campaigns')
    .select('*')
    .eq('creator_id', creator.id)
    .eq('name', 'Fotosfolio Exclusive')
    .single()

  if (!campaign) {
    const { data: newCamp, error: campErr } = await supabase
      .from('ad_campaigns')
      .insert({
        creator_id: creator.id,
        client_id: client!.id,
        name: 'Fotosfolio Exclusive',
        banner_url: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=1200&h=300',
        banner_alt: 'Professional Photography Portfolio',
        target_url: 'https://fotosfolio.com',
        status: 'active',
        report_token: Math.random().toString(36).substring(2, 15)
      })
      .select()
      .single()
    
    if (campErr) {
        console.error('❌ Campaign creation failed:', campErr.message)
        return
    }
    campaign = newCamp
    console.log('✅ Ad Campaign created')
  } else {
    console.log('ℹ️ Ad Campaign already exists')
  }

  // 4. Create Placement
  // We'll delete old ones to be sure
  await supabase.from('ad_placements').delete().eq('campaign_id', campaign!.id)

  const { data: placement, error: placErr } = await supabase
    .from('ad_placements')
    .insert({
      campaign_id: campaign!.id,
      creator_id: creator.id, // This requires the migration!
      position: 'creator_page',
      is_global: false
    })
    .select()
    .single()

  if (placErr) {
    console.error('❌ Placement creation failed:', placErr.message)
    console.log('\n⚠️  IMPORTANT: You must run the SQL in "supabase/migrations/20240503_update_ad_system.sql" in your Supabase SQL Editor first!')
  } else {
    console.log('✅ Ad Placement created on creator_page')
    console.log('\n✨ DONE! The Fotosfolio ad is now linked to Milan.')
    console.log('🔗 View it here: http://localhost:3000/milan')
  }
}

seed()
