import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const position = searchParams.get('position')
  const creatorId = searchParams.get('creator_id')

  if (!position) return NextResponse.json({ error: 'position required' }, { status: 400 })

  const now = new Date().toISOString()

  let query = adminClient
    .from('ad_placements')
    .select(`
      id,
      position,
      is_global,
      creator_id,
      campaign:ad_campaigns(*)
    `)
    .eq('position', position)

  if (creatorId) {
    query = query.or(`is_global.eq.true,creator_id.eq.${creatorId}`)
  } else {
    query = query.eq('is_global', true)
  }

  const { data: placements, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const active = (placements ?? [])
    .map((p: any) => ({
      ...p,
      campaign: Array.isArray(p.campaign) ? p.campaign[0] : p.campaign
    }))
    .filter((p: any) => {
      const cam = p.campaign
      if (!cam || cam.status !== 'active') return false
      if (cam.starts_at && cam.starts_at > now) return false
      if (cam.ends_at && cam.ends_at < now) return false
      return true
    })

  return NextResponse.json(active)
}
