import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { PromptAnalyticsResponse } from '@/lib/analytics/types'

interface PromptStatsRow {
  date: string
  views: number
  unique_views: number
  copies: number
  email_captures: number
  email_unlocks: number
  payment_unlocks: number
  revenue: number
}

interface JoinedCampaign {
  name: string
}

interface Params { params: Promise<{ id: string }> }

export async function GET(req: NextRequest, { params }: Params) {
  const { id: promptId } = await params

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 1. Verify ownership and fetch prompt metadata
  const { data: prompt, error: promptError } = await supabase
    .from('prompts')
    .select('id, title, slug, ai_tool, gate_type')
    .eq('id', promptId)
    .eq('creator_id', user.id)
    .single()

  if (promptError || !prompt) {
    return NextResponse.json({ error: 'Prompt not found or unauthorized' }, { status: 404 })
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

  // 2. Fetch daily stats
  const todayStart = new Date()
  todayStart.setUTCHours(0, 0, 0, 0)
  const todayStartStr = todayStart.toISOString()

  const [{ data: currentStats }, { data: prevStats }, { data: todayEvents }] = await Promise.all([
    supabase
      .from('prompt_stats_daily')
      .select('*')
      .eq('prompt_id', promptId)
      .gte('date', currentStartStr)
      .lt('date', todayStartStr),
    supabase
      .from('prompt_stats_daily')
      .select('*')
      .eq('prompt_id', promptId)
      .gte('date', prevStartStr)
      .lt('date', currentStartStr),
    supabase
      .from('analytics_events')
      .select('event_type, session_id, value')
      .eq('prompt_id', promptId)
      .gte('created_at', todayStartStr)
  ])

  const todayRaw = (todayEvents || []).reduce((acc, row) => {
    if (row.event_type === 'prompt_view') acc.views++
    if (row.event_type === 'prompt_copy') acc.copies++
    if (row.event_type === 'email_capture') acc.email_captures++
    if (row.event_type === 'email_unlock' || row.event_type === 'payment_unlock') acc.unlocks++
    if (row.value) acc.revenue += Number(row.value)
    if (row.event_type === 'prompt_view') acc.unique_sessions.add(row.session_id)
    return acc
  }, { views: 0, copies: 0, email_captures: 0, unlocks: 0, revenue: 0, unique_sessions: new Set<string>() } as { views: number, copies: number, email_captures: number, unlocks: number, revenue: number, unique_sessions: Set<string> })

  const todayStatsRow: PromptStatsRow = {
    date: todayStartStr,
    views: todayRaw.views,
    unique_views: todayRaw.unique_sessions.size,
    copies: todayRaw.copies,
    email_captures: todayRaw.email_captures,
    email_unlocks: todayRaw.unlocks,
    payment_unlocks: 0,
    revenue: todayRaw.revenue
  }

  const combinedStats: PromptStatsRow[] = [...((currentStats) || []), todayStatsRow]

  const aggregateStats = (data: PromptStatsRow[]) => data.reduce((acc, row) => ({
    views: acc.views + (row.views || 0),
    unique_views: acc.unique_views + (row.unique_views || 0),
    copies: acc.copies + (row.copies || 0),
    email_captures: acc.email_captures + (row.email_captures || 0),
    unlocks: acc.unlocks + (row.email_unlocks || 0) + (row.payment_unlocks || 0),
    revenue: acc.revenue + Number(row.revenue || 0)
  }), { views: 0, unique_views: 0, copies: 0, email_captures: 0, unlocks: 0, revenue: 0 })

  const curr = aggregateStats(combinedStats)
  const prev = aggregateStats((prevStats) || [])

  const calcChange = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100

  const summary = {
    views: curr.views, views_change_pct: calcChange(curr.views, prev.views),
    unique_views: curr.unique_views, unique_views_change_pct: calcChange(curr.unique_views, prev.unique_views),
    copies: curr.copies, copies_change_pct: calcChange(curr.copies, prev.copies),
    email_captures: curr.email_captures, email_captures_change_pct: calcChange(curr.email_captures, prev.email_captures),
    unlocks: curr.unlocks, unlocks_change_pct: calcChange(curr.unlocks, prev.unlocks),
    revenue: curr.revenue, revenue_change_pct: calcChange(curr.revenue, prev.revenue)
  }

  // 3. Daily timeseries chart data
  const dailyMap: Record<string, { views: number, conversions: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().split('T')[0]] = { views: 0, conversions: 0 }
  }
  (combinedStats).forEach(row => {
    const d = row.date.split('T')[0]
    if (dailyMap[d]) {
      dailyMap[d].views += row.views || 0
      dailyMap[d].conversions += (row.email_captures || 0) + (row.email_unlocks || 0) + (row.payment_unlocks || 0)
    }
  })
  const daily = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }))

  const funnel = {
    views: curr.views,
    engaged: curr.copies + curr.email_captures + curr.unlocks, // Rough proxy for engagement
    email_submissions: curr.email_captures,
    prompt_unlocks: curr.unlocks,
    copies: curr.copies
  }

  // 4. Traffic sources & Device breakdown (from raw events)
  const { data: rawEvents } = await supabase
    .from('analytics_events')
    .select('referrer, device_type, session_id')
    .eq('prompt_id', promptId)
    .eq('event_type', 'prompt_view')
    .gte('created_at', currentStartStr)

  const sourceMap: Record<string, Set<string>> = {}
  const deviceMap: Record<string, number> = {}
  let totalValidSessions = 0

    ; (rawEvents || []).forEach(row => {
      totalValidSessions++

      // Referrer
      try {
        const urlStr = row.referrer || ''
        const isInternal = urlStr.includes('creatopedia.tech') || urlStr.startsWith('/')
        const src = isInternal ? 'Internal' : (urlStr ? new URL(urlStr).hostname : 'Direct')
        if (!sourceMap[src]) sourceMap[src] = new Set()
        sourceMap[src].add(row.session_id)
      } catch {
        const src = 'Unknown'
        if (!sourceMap[src]) sourceMap[src] = new Set()
        sourceMap[src].add(row.session_id)
      }

      // Device
      const device = row.device_type || 'unknown'
      deviceMap[device] = (deviceMap[device] || 0) + 1
    })

  const traffic_sources = Object.entries(sourceMap).map(([source, sessionsSet]) => ({
    source,
    sessions: sessionsSet.size,
    pct: totalValidSessions > 0 ? (sessionsSet.size / totalValidSessions) * 100 : 0
  })).sort((a, b) => b.sessions - a.sessions).slice(0, 10)

  const device_breakdown = Object.entries(deviceMap).map(([device, count]) => ({
    device,
    count,
    pct: totalValidSessions > 0 ? (count / totalValidSessions) * 100 : 0
  })).sort((a, b) => b.count - a.count)

  // 5. Ads on this page
  const { data: adsData } = await supabase
    .from('campaign_prompt_stats_daily')
    .select('campaign_id, impressions, clicks, ad_campaigns(name)')
    .eq('prompt_id', promptId)
    .gte('date', currentStartStr)

  const adMap: Record<string, { campaign_id: string, campaign_name: string, impressions: number, clicks: number }> = {}
    ; (adsData || []).forEach(row => {
      const campaignObj = (Array.isArray(row.ad_campaigns) ? row.ad_campaigns[0] : row.ad_campaigns) as unknown as JoinedCampaign | null
      if (!adMap[row.campaign_id]) {
        adMap[row.campaign_id] = {
          campaign_id: row.campaign_id,
          campaign_name: campaignObj?.name || 'Unknown',
          impressions: 0,
          clicks: 0
        }
      }
      adMap[row.campaign_id].impressions += row.impressions || 0
      adMap[row.campaign_id].clicks += row.clicks || 0
    })

  const ads = Object.values(adMap).map((a) => ({
    ...a,
    ctr: a.impressions > 0 ? (a.clicks / a.impressions) * 100 : 0
  })).sort((a, b) => b.impressions - a.impressions)

  // 6. Recent Email Captures
  const { data: capturesData } = await supabase
    .from('email_captures')
    .select('email, captured_at')
    .eq('prompt_id', promptId)
    .order('captured_at', { ascending: false })
    .limit(50)

  const email_captures = (capturesData || []).map(c => ({
    email: c.email,
    captured_at: c.captured_at,
    source: 'Gate Form' // Can be enhanced later if we track source per capture
  }))

  return NextResponse.json({
    prompt,
    summary,
    daily,
    funnel,
    traffic_sources,
    device_breakdown,
    ads,
    email_captures
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
    }
  })
}
