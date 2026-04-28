import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const promptId = searchParams.get('prompt_id')

  if (!promptId) return NextResponse.json({ error: 'prompt_id required' }, { status: 400 })

  const now = new Date().toISOString()

  // Find active placements: global OR specific to this prompt
  const { data: placements, error } = await adminClient
    .from('ad_placements')
    .select(`
      id,
      position,
      is_global,
      prompt_id,
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
    .or(`prompt_id.eq.${promptId},is_global.eq.true`)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Filter: campaign must be active + within date range
  const active = (placements ?? []).filter((p) => {
    const cam = p.campaign as { status: string; starts_at: string | null; ends_at: string | null } | null
    if (!cam || cam.status !== 'active') return false
    if (cam.starts_at && cam.starts_at > now) return false
    if (cam.ends_at && cam.ends_at < now) return false
    return true
  })

  return NextResponse.json(active)
}
