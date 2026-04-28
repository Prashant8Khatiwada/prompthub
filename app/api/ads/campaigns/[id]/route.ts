import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const placementSchema = z.object({
  prompt_id: z.string().uuid().nullable().optional(),
  position: z.enum(['below_video', 'above_gate', 'below_gate']).default('below_video'),
  is_global: z.boolean().default(false),
})

const campaignUpdateSchema = z.object({
  name: z.string().min(1).max(150).optional(),
  client_id: z.string().uuid().optional().nullable(),
  banner_url: z.string().url().optional(),
  banner_alt: z.string().max(200).optional().nullable().or(z.literal('')),
  target_url: z.string().url().optional(),
  utm_source: z.string().optional(),
  utm_medium: z.string().optional(),
  utm_campaign: z.string().optional().nullable().or(z.literal('')),
  client_webhook_url: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['active', 'paused', 'ended', 'scheduled']).optional(),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
  placements: z.array(placementSchema).optional(),
})

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('ad_campaigns')
    .select('*, client:ad_clients(id, name), ad_placements(*)')
    .eq('id', id)
    .eq('creator_id', user.id)
    .single()

  if (error || !data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = campaignUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { placements, ...campaignData } = parsed.data

  const { data: campaign, error } = await adminClient
    .from('ad_campaigns')
    .update({ ...campaignData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('creator_id', user.id)
    .select()
    .single()

  if (error || !campaign) return NextResponse.json({ error: error?.message ?? 'Not found' }, { status: 400 })

  // Replace placements if provided
  if (placements !== undefined) {
    await adminClient.from('ad_placements').delete().eq('campaign_id', id)
    if (placements.length > 0) {
      await adminClient.from('ad_placements').insert(
        placements.map((p) => ({ ...p, campaign_id: id }))
      )
    }
  }

  return NextResponse.json(campaign)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('ad_campaigns')
    .delete()
    .eq('id', id)
    .eq('creator_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ success: true })
}
