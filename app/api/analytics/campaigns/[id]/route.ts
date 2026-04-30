import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { CampaignAnalyticsResponse } from '@/lib/analytics/types'

interface CampaignStatsRow {
  date: string
  impressions: number
  unique_impressions: number
  clicks: number
  unique_clicks: number
}

interface JoinedPrompt {
  title: string
  slug: string
}

interface JoinedClient {
  name: string
}

interface Params { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id: campaignId } = await params

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Verify ownership and fetch campaign metadata
  const { data: campaign, error: campaignError } = await supabase
    .from('ad_campaigns')
    .select('id, name, status, starts_at, ends_at, client:ad_clients(name), report_token')
    .eq('id', campaignId)
    .eq('creator_id', user.id)
    .single()

  if (campaignError || !campaign) {
    return NextResponse.json({ error: 'Campaign not found or unauthorized' }, { status: 404 })
  }

  const { searchParams } = new URL(req.url)
  const rangeParam = searchParams.get('range') || '7d'
  const days = rangeParam === '30d' ? 30 : rangeParam === '14d' ? 14 : 7

  const today = new Date()
  const currentPeriodStart = new Date(today)
  currentPeriodStart.setDate(today.getDate() - days)

  const previousPeriodStart = new Date(currentPeriodStart)
  previousPeriodStart.setDate(currentPeriodStart.getDate() - days)

  const currentStartStr = currentPeriodStart.toISOString()
  const prevStartStr = previousPeriodStart.toISOString()
  const todayStr = today.toISOString()

  // 1b. Fetch all prompt IDs associated with this campaign
  const { data: placements } = await supabase
    .from('ad_placements')
    .select('prompt_id, is_global, category_id')
    .eq('campaign_id', campaignId)

  let promptIdsToQuery: string[] = []
  const directIds = (placements || []).map(p => p.prompt_id).filter(Boolean) as string[]
  
  if (placements?.some(p => p.is_global)) {
    // If global, fetch all published prompts for this creator
    const { data: allPrompts } = await supabase.from('prompts').select('id').eq('creator_id', user.id).eq('status', 'published')
    promptIdsToQuery = (allPrompts || []).map(p => p.id)
  } else if (placements?.some(p => p.category_id)) {
    // If category-based, fetch all prompts in those categories
    const catIds = placements.map(p => p.category_id).filter(Boolean)
    const { data: catPrompts } = await supabase.from('prompts').select('id').in('category_id', catIds).eq('status', 'published')
    promptIdsToQuery = Array.from(new Set([...directIds, ...(catPrompts || []).map(p => p.id)]))
  } else {
    promptIdsToQuery = directIds
  }

  const campaignPromptIds = promptIdsToQuery

  // 2. Fetch daily stats
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const todayStartStr = todayStart.toISOString()

  const [{ data: currentStats }, { data: prevStats }, { data: todayEvents }] = await Promise.all([
    supabase
      .from('campaign_stats_daily')
      .select('*')
      .eq('campaign_id', campaignId)
      .gte('date', currentStartStr)
      .lt('date', todayStartStr),
    supabase
      .from('campaign_stats_daily')
      .select('*')
      .eq('campaign_id', campaignId)
      .gte('date', prevStartStr)
      .lt('date', currentStartStr),
    supabase
      .from('analytics_events')
      .select('event_type, session_id')
      .eq('campaign_id', campaignId)
      .gte('created_at', todayStartStr)
  ])

  const todayRaw = (todayEvents || []).reduce((acc, row) => {
    if (row.event_type === 'ad_impression') {
      acc.impressions++
      acc.unique_imps.add(row.session_id)
    }
    if (row.event_type === 'ad_click') {
      acc.clicks++
      acc.unique_clicks.add(row.session_id)
    }
    return acc
  }, { impressions: 0, clicks: 0, unique_imps: new Set<string>(), unique_clicks: new Set<string>() } as { impressions: number, clicks: number, unique_imps: Set<string>, unique_clicks: Set<string> })

  const todayStatsRow: CampaignStatsRow = {
    date: todayStartStr,
    impressions: todayRaw.impressions,
    unique_impressions: todayRaw.unique_imps.size,
    clicks: todayRaw.clicks,
    unique_clicks: todayRaw.unique_clicks.size
  }

  const combinedStats: CampaignStatsRow[] = [...((currentStats) || []), todayStatsRow]

  const aggregateStats = (data: CampaignStatsRow[]) => data.reduce((acc, row) => ({
    impressions: acc.impressions + (row.impressions || 0),
    unique_impressions: acc.unique_impressions + (row.unique_impressions || 0),
    clicks: acc.clicks + (row.clicks || 0),
    unique_clicks: acc.unique_clicks + (row.unique_clicks || 0)
  }), { impressions: 0, unique_impressions: 0, clicks: 0, unique_clicks: 0 })

  const curr = aggregateStats(combinedStats)
  const prev = aggregateStats((prevStats) || [])

  const calcChange = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100

  // 2b. Fetch Prompt Views for context (Total traffic of the pages)
  const [{ data: promptViewsData }, { data: liveViewsData }] = await Promise.all([
    supabase
      .from('prompt_stats_daily')
      .select('prompt_id, views')
      .in('prompt_id', campaignPromptIds)
      .gte('date', currentStartStr),
    supabase
      .from('analytics_events')
      .select('prompt_id')
      .eq('event_type', 'prompt_view')
      .in('prompt_id', campaignPromptIds)
      .gte('created_at', todayStartStr)
  ])
  
  // Aggregate views per prompt for breakdown
  const promptViewsMap: Record<string, number> = {}
  ;(promptViewsData || []).forEach(row => {
    promptViewsMap[row.prompt_id] = (promptViewsMap[row.prompt_id] || 0) + (row.views || 0)
  })
  ;(liveViewsData || []).forEach(row => {
    if (row.prompt_id) {
      promptViewsMap[row.prompt_id] = (promptViewsMap[row.prompt_id] || 0) + 1
    }
  })

  const totalPromptViews = Object.values(promptViewsMap).reduce((sum, v) => sum + v, 0)

  const summary = {
    impressions: curr.impressions, impressions_change_pct: calcChange(curr.impressions, prev.impressions),
    unique_impressions: curr.unique_impressions, unique_impressions_change_pct: calcChange(curr.unique_impressions, prev.unique_impressions),
    clicks: curr.clicks, clicks_change_pct: calcChange(curr.clicks, prev.clicks),
    unique_clicks: curr.unique_clicks, unique_clicks_change_pct: calcChange(curr.unique_clicks, prev.unique_clicks),
    ctr: curr.impressions > 0 ? (curr.clicks / curr.impressions) * 100 : 0,
    ctr_change_pct: calcChange(curr.impressions > 0 ? (curr.clicks / curr.impressions) * 100 : 0, prev.impressions > 0 ? (prev.clicks / prev.impressions) * 100 : 0),
    frequency: curr.unique_impressions > 0 ? curr.impressions / curr.unique_impressions : 0,
    frequency_change_pct: calcChange(curr.unique_impressions > 0 ? curr.impressions / curr.unique_impressions : 0, prev.unique_impressions > 0 ? prev.impressions / prev.unique_impressions : 0),
    total_prompt_views: totalPromptViews // Contextual views
  }

  // 3. Daily performance chart data
  const dailyMap: Record<string, { impressions: number, clicks: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().split('T')[0]] = { impressions: 0, clicks: 0 }
  }
  (combinedStats).forEach(row => {
    const d = row.date.split('T')[0]
    if (dailyMap[d]) {
      dailyMap[d].impressions += row.impressions || 0
      dailyMap[d].clicks += row.clicks || 0
    }
  })
  const daily = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }))

  // 4. Placement breakdown
  const { data: placementData } = await supabase
    .from('campaign_prompt_stats_daily')
    .select('prompt_id, impressions, clicks, prompts(title, slug)')
    .eq('campaign_id', campaignId)
    .gte('date', currentStartStr)

  const placementMap: Record<string, { prompt_id: string, prompt_title: string, prompt_slug: string, impressions: number, clicks: number, views: number }> = {}
    ; (placementData || []).forEach(row => {
      const pId = row.prompt_id || 'unknown'
      const promptObj = (Array.isArray(row.prompts) ? row.prompts[0] : row.prompts) as unknown as JoinedPrompt | null

      if (!placementMap[pId]) {
        placementMap[pId] = {
          prompt_id: pId,
          prompt_title: promptObj?.title || 'Global Placement (All Prompts)',
          prompt_slug: promptObj?.slug || '',
          impressions: 0,
          clicks: 0,
          views: 0
        }
      }
      placementMap[pId].impressions += row.impressions || 0
      placementMap[pId].clicks += row.clicks || 0
    })

  // Add contextual views to each placement
  Object.keys(placementMap).forEach(pId => {
    if (promptViewsMap[pId]) {
      placementMap[pId].views = promptViewsMap[pId]
    }
  })

  const placement_breakdown = Object.values(placementMap).map((p) => ({
    ...p,
    ctr: p.impressions > 0 ? (p.clicks / p.impressions) * 100 : 0
  })).sort((a, b) => b.clicks - a.clicks)

  // 5. Raw events for Device, Country, Hourly Heatmap, Timeline
  const { data: rawEvents } = await supabase
    .from('analytics_events')
    .select('event_type, created_at, device_type, country, prompt_id')
    .eq('campaign_id', campaignId)
    .gte('created_at', currentStartStr)

  const deviceMap: Record<string, number> = {}
  const countryMap: Record<string, number> = {}
  const hourlyMap: Record<string, number> = {}
  let totalImpressionsRaw = 0

  const clicksList: { timestamp: string, prompt_id: string | null, device: string, country: string }[] = []

    ; (rawEvents || []).forEach(row => {
      const isImp = row.event_type === 'ad_impression'
      const isClick = row.event_type === 'ad_click'

      if (isImp) {
        totalImpressionsRaw++
        // Device
        const device = row.device_type || 'unknown'
        deviceMap[device] = (deviceMap[device] || 0) + 1

        // Country
        const country = row.country || 'Unknown'
        countryMap[country] = (countryMap[country] || 0) + 1
      }

      if (isClick) {
        // Heatmap
        const dateObj = new Date(row.created_at)
        const dayOfWeek = dateObj.getUTCDay() // 0-6
        const hourOfDay = dateObj.getUTCHours() // 0-23
        const key = `${dayOfWeek}-${hourOfDay}`
        hourlyMap[key] = (hourlyMap[key] || 0) + 1

        // Timeline
        clicksList.push({
          timestamp: row.created_at,
          prompt_id: row.prompt_id,
          device: row.device_type || 'unknown',
          country: row.country || 'Unknown'
        })
      }
    })

  const device_breakdown = Object.entries(deviceMap).map(([device, count]) => ({
    device,
    count,
    pct: totalImpressionsRaw > 0 ? (count / totalImpressionsRaw) * 100 : 0
  })).sort((a, b) => b.count - a.count)

  const country_breakdown = Object.entries(countryMap).map(([country, count]) => ({
    country,
    count,
    pct: totalImpressionsRaw > 0 ? (count / totalImpressionsRaw) * 100 : 0
  })).sort((a, b) => b.count - a.count).slice(0, 10)

  // Prepare heatmap 7x24 array
  const hourly_heatmap = []
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const key = `${day}-${hour}`
      hourly_heatmap.push({
        day,
        hour,
        clicks: hourlyMap[key] || 0
      })
    }
  }

  // Enhance timeline with prompt titles
  clicksList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  const click_timeline = clicksList.slice(0, 50).map(c => {
    const pInfo = placementMap[c.prompt_id || 'unknown']
    return {
      timestamp: c.timestamp,
      prompt_title: pInfo ? pInfo.prompt_title : 'Global Placement',
      device: c.device,
      country: c.country
    }
  })

  return NextResponse.json({
    campaign: {
      ...campaign,
      client_name: (campaign.client as unknown as JoinedClient)?.name || 'Direct'
    },
    summary,
    daily,
    placement_breakdown,
    device_breakdown,
    country_breakdown,
    hourly_heatmap,
    click_timeline
  })
}
