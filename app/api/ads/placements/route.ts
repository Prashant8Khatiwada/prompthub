import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const promptId = searchParams.get('prompt_id')

  if (!promptId) return NextResponse.json({ error: 'prompt_id required' }, { status: 400 })

  const now = new Date().toISOString()

  // Fetch the prompt's category first
  const { data: prompt } = await adminClient
    .from('prompts')
    .select('category_id')
    .eq('id', promptId)
    .single()

  const categoryId = prompt?.category_id

  // Find active placements: global OR specific to this prompt OR specific to this category
  const query = adminClient
    .from('ad_placements')
    .select(`
      id,
      position,
      is_global,
      prompt_id,
      category_id,
      campaign:ad_campaigns(
        id,
        name,
        banner_url,
        banner_alt,
        target_url,
        utm_source,
        utm_medium,
        utm_campaign,
        status,
        starts_at,
        ends_at
      )
    `)

  const filter = categoryId
    ? `prompt_id.eq.${promptId},is_global.eq.true,category_id.eq.${categoryId}`
    : `prompt_id.eq.${promptId},is_global.eq.true`

  const { data: placements, error } = await query.or(filter)
  console.log('DEBUG: Fetched placements:', JSON.stringify(placements, null, 2))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filter: campaign must be active + within date range
  const active = (placements ?? []).filter((p) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const cam = p.campaign as any
    if (!cam || cam.status !== 'active') return false
    if (cam.starts_at && cam.starts_at > now) return false
    if (cam.ends_at && cam.ends_at < now) return false
    return true
  })

  return NextResponse.json(active)
}
