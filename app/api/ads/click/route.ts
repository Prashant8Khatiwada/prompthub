import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { trackEvent } from '@/lib/analytics/track'

function buildUtmUrl(base: string, params: Record<string, string | null | undefined>) {
  const url = new URL(base)
  Object.entries(params).forEach(([k, v]) => {
    if (v) url.searchParams.set(k, v)
  })
  return url.toString()
}

async function fireWebhook(webhookUrl: string, payload: Record<string, unknown>) {
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch { /* ignore webhook failures */ }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const placementId = searchParams.get('placement_id')
  const campaignId = searchParams.get('campaign_id')
  const promptId = searchParams.get('prompt_id')

  if (!placementId || !campaignId) {
    return NextResponse.json({ error: 'placement_id and campaign_id required' }, { status: 400 })
  }

  // Fetch campaign data
  const { data: campaign } = await adminClient
    .from('ad_campaigns')
    .select('target_url, utm_source, utm_medium, utm_campaign, client_webhook_url')
    .eq('id', campaignId)
    .single()

  if (!campaign) return NextResponse.json({ error: 'Campaign not found' }, { status: 404 })

  const ua = req.headers.get('user-agent') ?? ''
  const device = /mobile|android|iphone|ipad/i.test(ua) ? 'mobile' : 'desktop'

  // Log click async (no await)
  adminClient.from('ad_clicks').insert({
    campaign_id: campaignId,
    placement_id: placementId,
    prompt_id: promptId ?? null,
    device,
  }).then(() => {/* no-op */})

  const sessionId = searchParams.get('session_id') ?? 'unknown'
  trackEvent({
    event_type: 'ad_click',
    campaign_id: campaignId,
    placement_id: placementId ?? undefined,
    prompt_id: promptId ?? undefined,
    session_id: sessionId,
    request: req,
  })

  // Fire webhook async (no await)
  if (campaign.client_webhook_url) {
    fireWebhook(campaign.client_webhook_url, {
      event: 'click',
      campaign_id: campaignId,
      placement_id: placementId,
      prompt_id: promptId,
      timestamp: new Date().toISOString(),
    })
  }

  // Build redirect URL with UTM params
  const redirectUrl = buildUtmUrl(campaign.target_url, {
    utm_source: campaign.utm_source,
    utm_medium: campaign.utm_medium,
    utm_campaign: campaign.utm_campaign,
    utm_content: promptId ?? undefined,
  })

  return NextResponse.redirect(redirectUrl, 302)
}
