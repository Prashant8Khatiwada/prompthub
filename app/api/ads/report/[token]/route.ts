import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { AdReportResponse } from '@/lib/analytics/types'

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

  // Public report always shows last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const startStr = thirtyDaysAgo.toISOString()

  // 1. Fetch daily stats
  const { data: stats } = await adminClient
    .from('campaign_stats_daily')
    .select('*')
    .eq('campaign_id', campaignId)
    .gte('date', startStr)

  let total_impressions = 0
  let total_clicks = 0
  let total_unique_impressions = 0
  let total_unique_clicks = 0
  let total_view_time = 0

  // Daily breakdown (last 30 days)
  const dailyMap: Record<string, { impressions: number; clicks: number; view_time: number }> = {}
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().split('T')[0]] = { impressions: 0, clicks: 0, view_time: 0 }
  }

  ; (stats || []).forEach((row) => {
    total_impressions += row.impressions || 0
    total_clicks += row.clicks || 0
    total_unique_impressions += row.unique_impressions || 0
    total_unique_clicks += row.unique_clicks || 0
    total_view_time += Number(row.total_view_time || 0)
    const d = row.date.split('T')[0]
    if (dailyMap[d]) {
      dailyMap[d].impressions += row.impressions || 0
      dailyMap[d].clicks += row.clicks || 0
      dailyMap[d].view_time += Number(row.total_view_time || 0)
    }
  })

  const ctr = total_impressions > 0 ? (total_clicks / total_impressions) * 100 : 0
  const frequency = total_unique_impressions > 0 ? total_impressions / total_unique_impressions : 0
  const daily_breakdown = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }))

  // 1c. Fetch prompt views context (Real-time Views)
  const { data: placements } = await adminClient
    .from('ad_placements')
    .select('prompt_id, is_global, category_id')
    .eq('campaign_id', campaignId)

  let promptIdsToQuery: string[] = []
  const directIds = (placements || []).map(p => p.prompt_id).filter(Boolean) as string[]

  if (placements?.some(p => p.is_global)) {
    const { data: allPrompts } = await adminClient.from('prompts').select('id').eq('status', 'published')
    promptIdsToQuery = (allPrompts || []).map(p => p.id)
  } else if (placements?.some(p => p.category_id)) {
    const catIds = placements.map(p => p.category_id).filter(Boolean)
    const { data: catPrompts } = await adminClient.from('prompts').select('id').in('category_id', catIds).eq('status', 'published')
    promptIdsToQuery = Array.from(new Set([...directIds, ...(catPrompts || []).map(p => p.id)]))
  } else {
    promptIdsToQuery = directIds
  }

  const [{ data: historicalPromptStats }, { data: livePromptEvents }] = await Promise.all([
    adminClient.from('prompt_stats_daily').select('prompt_id, views').in('prompt_id', promptIdsToQuery).gte('date', startStr),
    adminClient.from('analytics_events').select('prompt_id').eq('event_type', 'prompt_view').in('prompt_id', promptIdsToQuery).gte('created_at', startStr)
  ])

  const promptViewsMap: Record<string, number> = {}
  historicalPromptStats?.forEach(s => {
    promptViewsMap[s.prompt_id] = (promptViewsMap[s.prompt_id] || 0) + (s.views || 0)
  })
  livePromptEvents?.forEach(e => {
    promptViewsMap[e.prompt_id] = (promptViewsMap[e.prompt_id] || 0) + 1
  })

  const totalPromptViews = Object.values(promptViewsMap).reduce((a, b) => a + b, 0)

  // 2. Fetch prompt breakdown from rollups
  const { data: promptStats } = await adminClient
    .from('campaign_prompt_stats_daily')
    .select('prompt_id, impressions, clicks, total_view_time, prompts(title, slug)')
    .eq('campaign_id', campaignId)
    .gte('date', startStr)

  const promptMap: Record<string, AdReportResponse['per_prompt_breakdown'][0]> = {}
  ;(promptStats || []).forEach(row => {
    const pId = row.prompt_id || 'unknown'
    const promptObj = Array.isArray(row.prompts) ? row.prompts[0] : row.prompts

    if (!promptMap[pId]) {
      promptMap[pId] = {
        prompt_id: pId,
        title: promptObj?.title || 'Global Placement',
        slug: promptObj?.slug || '',
        impressions: 0,
        clicks: 0,
        view_time: 0,
        ctr: 0,
        avg_duration: 0,
        views: 0
      }
    }
      promptMap[pId].impressions += row.impressions || 0
      promptMap[pId].clicks += row.clicks || 0
      promptMap[pId].view_time += Number(row.total_view_time || 0)
    })

  const per_prompt_breakdown = Object.values(promptMap).map((v) => ({
    ...v,
    ctr: v.impressions > 0 ? parseFloat(((v.clicks / v.impressions) * 100).toFixed(2)) : 0,
    avg_duration: v.impressions > 0 ? parseFloat((v.view_time / v.impressions).toFixed(2)) : 0,
    views: promptViewsMap[v.prompt_id] || 0
  })).sort((a, b) => b.clicks - a.clicks)

  // 3. Device & Country breakdown from analytics_events
  const { data: rawEvents } = await adminClient
    .from('analytics_events')
    .select('device_type, country')
    .eq('campaign_id', campaignId)
    .eq('event_type', 'ad_impression')
    .gte('created_at', startStr)

  const deviceMap: Record<string, number> = {}
  const countryMap: Record<string, number> = {}
  let totalRawImps = 0

    ; (rawEvents || []).forEach(row => {
      totalRawImps++
      const device = row.device_type || 'unknown'
      deviceMap[device] = (deviceMap[device] || 0) + 1

      const country = row.country || 'Unknown'
      countryMap[country] = (countryMap[country] || 0) + 1
    })

  const device_breakdown = Object.entries(deviceMap).map(([device, count]) => ({
    device,
    count,
    percentage: totalRawImps > 0 ? parseFloat(((count / totalRawImps) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.count - a.count)

  const country_breakdown = Object.entries(countryMap).map(([country, count]) => ({
    country,
    count,
    percentage: totalRawImps > 0 ? parseFloat(((count / totalRawImps) * 100).toFixed(1)) : 0,
  })).sort((a, b) => b.count - a.count).slice(0, 10)

  const rawClient = campaign.client as unknown as { name: string } | { name: string }[] | null
  const clientData = Array.isArray(rawClient) ? rawClient[0] : rawClient

  const response: AdReportResponse = {
    total_impressions,
    total_clicks,
    total_unique_impressions,
    total_unique_clicks,
    frequency: parseFloat(frequency.toFixed(2)),
    total_prompt_views: totalPromptViews,
    total_view_time: parseFloat(total_view_time.toFixed(2)),
    avg_view_duration: total_impressions > 0 ? parseFloat((total_view_time / total_impressions).toFixed(2)) : 0,
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
  }

  return NextResponse.json(response)
}
