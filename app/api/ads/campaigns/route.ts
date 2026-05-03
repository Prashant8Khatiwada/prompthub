import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const placementSchema = z.object({
  prompt_id: z.string().uuid().nullable().optional(),
  category_id: z.string().uuid().nullable().optional(),
  position: z.enum(['above_prompt', 'below_prompt', 'popup', 'creator_page']).default('above_prompt'),
  is_global: z.boolean().default(false),
})

const campaignSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(150),
  client_id: z.string().uuid().optional().nullable(),
  banner_url: z.string().url('Banner URL required'),
  banner_alt: z.string().max(200).optional().nullable().or(z.literal('')),
  target_url: z.string().url('Destination URL required'),
  utm_source: z.string().default('prompthub'),
  utm_medium: z.string().default('banner'),
  utm_campaign: z.string().optional().nullable().or(z.literal('')),
  client_webhook_url: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['active', 'paused', 'ended', 'scheduled']).default('active'),
  starts_at: z.string().datetime().optional().nullable(),
  ends_at: z.string().datetime().optional().nullable(),
  placements: z.array(placementSchema).default([]),
})

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: campaigns, error } = await supabase
    .from('ad_campaigns')
    .select('*, client:ad_clients(id, name)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Fetch impression + click counts in parallel
  const ids = (campaigns ?? []).map((c) => c.id)
  const [{ data: imps }, { data: clicks }] = await Promise.all([
    supabase.from('ad_impressions').select('campaign_id').in('campaign_id', ids),
    supabase.from('ad_clicks').select('campaign_id').in('campaign_id', ids),
  ])

  const impMap: Record<string, number> = {}
  const clickMap: Record<string, number> = {}
    ; (imps ?? []).forEach((r) => { impMap[r.campaign_id] = (impMap[r.campaign_id] ?? 0) + 1 })
    ; (clicks ?? []).forEach((r) => { clickMap[r.campaign_id] = (clickMap[r.campaign_id] ?? 0) + 1 })

  const enriched = (campaigns ?? []).map((c) => ({
    ...c,
    impressions_count: impMap[c.id] ?? 0,
    clicks_count: clickMap[c.id] ?? 0,
  }))

  return NextResponse.json(enriched)
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = campaignSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { placements, ...campaignData } = parsed.data

  const crypto = await import('crypto')
  const report_token = crypto.randomUUID()

  const { data: campaign, error } = await adminClient
    .from('ad_campaigns')
    .insert({ ...campaignData, creator_id: user.id, report_token })
    .select()
    .single()

  if (error || !campaign) return NextResponse.json({ error: error?.message ?? 'Failed' }, { status: 400 })

  // Insert placements
  let insertedPlacements = []
  if (placements.length > 0) {
    const { data: pData, error: placementError } = await adminClient.from('ad_placements').insert(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      placements.map((p: any) => ({ ...p, campaign_id: campaign.id }))
    ).select()
    
    if (placementError) {
      console.error('Placement error:', placementError.message)
    } else {
      insertedPlacements = pData ?? []
    }
  }

  return NextResponse.json({ ...campaign, placements: insertedPlacements }, { status: 201 })
}
