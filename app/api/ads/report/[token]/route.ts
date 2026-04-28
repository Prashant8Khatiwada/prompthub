import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

interface Params { params: Promise<{ token: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const { token } = await params

  // Fetch campaign by report_token
  const { data: campaign } = await adminClient
    .from('ad_campaigns')
    .select('id, name, status, starts_at, ends_at, client:ad_clients(name)')
    .eq('report_token', token)
    .single()

  if (!campaign) {
    return NextResponse.json({ error: 'Report not found or expired' }, { status: 404 })
  }

  const campaignId = campaign.id
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // Fetch impressions + clicks in parallel
  const [{ data: impressions }, { data: clicks }] = await Promise.all([
    adminClient
      .from('ad_impressions')
      .select('id, created_at, prompt_id, device, country')
      .eq('campaign_id', campaignId)
      .gte('created_at', thirtyDaysAgo.toISOString()),
    adminClient
      .from('ad_clicks')
      .select('id, created_at, prompt_id, device, country')
      .eq('campaign_id', campaignId)
      .gte('created_at', thirtyDaysAgo.toISOString()),
  ])

  const imps = impressions ?? []
  const clks = clicks ?? []
  const total_impressions = imps.length
  const total_clicks = clks.length
  const ctr = total_impressions > 0 ? (total_clicks / total_impressions) * 100 : 0

  // Daily breakdown (last 30 days)
  const dailyMap: Record<string, { impressions: number; clicks: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().split('T')[0]] = { impressions: 0, clicks: 0 }
  }
  imps.forEach((r) => {
    const d = new Date(r.created_at).toISOString().split('T')[0]
    if (dailyMap[d]) dailyMap[d].impressions++
  })
  clks.forEach((r) => {
    const d = new Date(r.created_at).toISOString().split('T')[0]
    if (dailyMap[d]) dailyMap[d].clicks++
  })
  const daily_breakdown = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }))

  // Per-prompt breakdown
  const promptIds = [...new Set([...imps.map((r) => r.prompt_id), ...clks.map((r) => r.prompt_id)].filter(Boolean))] as string[]
  let promptTitles: Record<string, { title: string; slug: string }> = {}
  if (promptIds.length > 0) {
    const { data: promptRows } = await adminClient
      .from('prompts').select('id, title, slug').in('id', promptIds)
    ;(promptRows ?? []).forEach((p) => { promptTitles[p.id] = { title: p.title, slug: p.slug } })
  }
  const perPromptMap: Record<string, { impressions: number; clicks: number }> = {}
  imps.forEach((r) => { if (r.prompt_id) { perPromptMap[r.prompt_id] = perPromptMap[r.prompt_id] ?? { impressions: 0, clicks: 0 }; perPromptMap[r.prompt_id].impressions++ } })
  clks.forEach((r) => { if (r.prompt_id) { perPromptMap[r.prompt_id] = perPromptMap[r.prompt_id] ?? { impressions: 0, clicks: 0 }; perPromptMap[r.prompt_id].clicks++ } })
  const per_prompt_breakdown = Object.entries(perPromptMap).map(([pid, v]) => ({
    prompt_id: pid,
    title: promptTitles[pid]?.title ?? 'Unknown',
    slug: promptTitles[pid]?.slug ?? '',
    impressions: v.impressions,
    clicks: v.clicks,
    ctr: v.impressions > 0 ? parseFloat(((v.clicks / v.impressions) * 100).toFixed(2)) : 0,
  })).sort((a, b) => b.clicks - a.clicks)

  // Device breakdown
  const deviceMap: Record<string, number> = {}
  imps.forEach((r) => { const d = r.device ?? 'unknown'; deviceMap[d] = (deviceMap[d] ?? 0) + 1 })
  const device_breakdown = Object.entries(deviceMap).map(([device, count]) => ({
    device,
    count,
    percentage: total_impressions > 0 ? parseFloat(((count / total_impressions) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.count - a.count)

  // Country breakdown
  const countryMap: Record<string, number> = {}
  imps.forEach((r) => { const c = r.country ?? 'Unknown'; countryMap[c] = (countryMap[c] ?? 0) + 1 })
  const country_breakdown = Object.entries(countryMap).map(([country, count]) => ({
    country,
    count,
    percentage: total_impressions > 0 ? parseFloat(((count / total_impressions) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.count - a.count).slice(0, 10)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const clientData = campaign.client as any
  return NextResponse.json({
    total_impressions,
    total_clicks,
    ctr: parseFloat(ctr.toFixed(2)),
    campaign_name: campaign.name,
    campaign_status: campaign.status,
    client_name: clientData?.name ?? null,
    starts_at: campaign.starts_at,
    ends_at: campaign.ends_at,
    daily_breakdown,
    per_prompt_breakdown,
    device_breakdown,
    country_breakdown,
  })
}
