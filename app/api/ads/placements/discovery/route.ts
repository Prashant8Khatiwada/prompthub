import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const slotSchema = z.object({
  index: z.number().min(-1),
  campaign_id: z.string().uuid(),
})

const bodySchema = z.object({
  slots: z.array(slotSchema),
})

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const creatorId = searchParams.get('creator_id')

  if (!creatorId) return NextResponse.json({ error: 'creator_id required' }, { status: 400 })

  const { data: placements, error } = await adminClient
    .from('ad_placements')
    .select('*, campaign:ad_campaigns(*)')
    .eq('creator_id', creatorId)
    .or('position.like.discovery_slot_%,position.eq.discovery_header_banner')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json(placements)
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await req.json()
    const parsed = bodySchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // 1. Delete all existing discovery slots for this creator
    const { error: deleteError } = await adminClient
      .from('ad_placements')
      .delete()
      .eq('creator_id', user.id)
      .or('position.like.discovery_slot_%,position.eq.discovery_header_banner')

    if (deleteError) throw new Error(deleteError.message)

    // 2. Insert new slots
    if (parsed.data.slots.length > 0) {
      const inserts = parsed.data.slots.map(s => ({
        creator_id: user.id,
        campaign_id: s.campaign_id,
        position: s.index === -1 ? 'discovery_header_banner' : `discovery_slot_${s.index}`,
        is_global: false
      }))

      const { error: insertError } = await adminClient
        .from('ad_placements')
        .insert(inserts)

      if (insertError) throw new Error(insertError.message)
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
