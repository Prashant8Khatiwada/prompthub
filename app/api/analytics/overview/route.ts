import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function GET(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

  // 1. Fetch Creator Stats (Summary & Funnel)
  const [{ data: currentStats }, { data: prevStats }] = await Promise.all([
    supabase
      .from('creator_stats_daily')
      .select('*')
      .eq('creator_id', user.id)
      .gte('date', currentStartStr)
      .lte('date', todayStr),
    supabase
      .from('creator_stats_daily')
      .select('*')
      .eq('creator_id', user.id)
      .gte('date', prevStartStr)
      .lt('date', currentStartStr)
  ])

  const aggregateStats = (data: any[]) => data.reduce((acc, row) => ({
    total_views: acc.total_views + (row.total_views || 0),
    unique_visitors: acc.unique_visitors + (row.unique_visitors || 0),
    total_copies: acc.total_copies + (row.total_copies || 0),
    email_captures: acc.email_captures + (row.email_captures || 0),
    total_unlocks: acc.total_unlocks + (row.total_unlocks || 0),
    revenue: acc.revenue + Number(row.revenue || 0)
  }), { total_views: 0, unique_visitors: 0, total_copies: 0, email_captures: 0, total_unlocks: 0, revenue: 0 })

  const curr = aggregateStats(currentStats || [])
  const prev = aggregateStats(prevStats || [])

  const calcChange = (c: number, p: number) => p === 0 ? (c > 0 ? 100 : 0) : ((c - p) / p) * 100

  const summary = {
    total_views: curr.total_views, views_change_pct: calcChange(curr.total_views, prev.total_views),
    unique_visitors: curr.unique_visitors, visitors_change_pct: calcChange(curr.unique_visitors, prev.unique_visitors),
    total_conversions: curr.email_captures + curr.total_unlocks, conversions_change_pct: calcChange(curr.email_captures + curr.total_unlocks, prev.email_captures + prev.total_unlocks),
    total_revenue: curr.revenue, revenue_change_pct: calcChange(curr.revenue, prev.revenue),
  }

  const funnel = {
    views: curr.total_views,
    gate_attempts: curr.email_captures,
    successful_unlocks: curr.total_unlocks,
    copies: curr.total_copies,
  }

  // 2. Daily Views Chart (fill missing days)
  const dailyMap: Record<string, { views: number, conversions: number }> = {}
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    dailyMap[d.toISOString().split('T')[0]] = { views: 0, conversions: 0 }
  }
  (currentStats || []).forEach(row => {
    const d = row.date.split('T')[0]
    if (dailyMap[d]) {
      dailyMap[d].views += row.total_views || 0
      dailyMap[d].conversions += (row.email_captures || 0) + (row.total_unlocks || 0)
    }
  })
  const daily_views = Object.entries(dailyMap).map(([date, v]) => ({ date, ...v }))

  // 3. Top Prompts
  const { data: promptStatsData } = await supabase
    .from('prompt_stats_daily')
    .select('prompt_id, views, unique_views, copies, email_captures, email_unlocks, payment_unlocks, revenue, conversion_rate, prompts(title, slug, gate_type)')
    .eq('creator_id', user.id)
    .gte('date', currentStartStr)

  const promptMap: Record<string, any> = {}
  ;(promptStatsData || []).forEach(row => {
    const promptObj = Array.isArray(row.prompts) ? row.prompts[0] : row.prompts
    if (!promptMap[row.prompt_id]) {
      promptMap[row.prompt_id] = {
        id: row.prompt_id,
        title: (promptObj as any)?.title || 'Unknown',
        slug: (promptObj as any)?.slug || '',
        gate_type: (promptObj as any)?.gate_type || 'open',
        views: 0, unique_views: 0, copies: 0,
        conversions: 0, revenue: 0
      }
    }
    const p = promptMap[row.prompt_id]
    p.views += row.views || 0
    p.unique_views += row.unique_views || 0
    p.copies += row.copies || 0
    p.conversions += (row.email_captures || 0) + (row.email_unlocks || 0) + (row.payment_unlocks || 0)
    p.revenue += Number(row.revenue || 0)
  })

  const top_prompts = Object.values(promptMap).map((p: any) => ({
    ...p,
    conv_rate: p.views > 0 ? (p.conversions / p.views) * 100 : 0
  })).sort((a: any, b: any) => b.views - a.views).slice(0, 10)

  // 4. Top Campaigns
  const { data: campaignStatsData } = await supabase
    .from('campaign_stats_daily')
    .select('campaign_id, impressions, unique_impressions, clicks, unique_clicks, ad_campaigns(name, status)')
    .eq('creator_id', user.id)
    .gte('date', currentStartStr)

  const campaignMap: Record<string, any> = {}
  ;(campaignStatsData || []).forEach(row => {
    const campaignObj = Array.isArray(row.ad_campaigns) ? row.ad_campaigns[0] : row.ad_campaigns
    if (!campaignMap[row.campaign_id]) {
      campaignMap[row.campaign_id] = {
        id: row.campaign_id,
        name: (campaignObj as any)?.name || 'Unknown',
        status: (campaignObj as any)?.status || 'unknown',
        impressions: 0, unique_impressions: 0,
        clicks: 0, unique_clicks: 0
      }
    }
    const c = campaignMap[row.campaign_id]
    c.impressions += row.impressions || 0
    c.unique_impressions += row.unique_impressions || 0
    c.clicks += row.clicks || 0
    c.unique_clicks += row.unique_clicks || 0
  })

  const top_campaigns = Object.values(campaignMap).map((c: any) => ({
    ...c,
    ctr: c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0,
    frequency: c.unique_impressions > 0 ? c.impressions / c.unique_impressions : 0
  })).sort((a: any, b: any) => b.clicks - a.clicks).slice(0, 10)

  // 5. Traffic Sources (from analytics_events raw table)
  const { data: trafficData } = await supabase
    .from('analytics_events')
    .select('referrer, session_id')
    .eq('creator_id', user.id)
    .eq('event_type', 'prompt_view')
    .gte('created_at', currentStartStr)

  const sourceMap: Record<string, Set<string>> = {}
  let totalValidSessions = 0
  ;(trafficData || []).forEach(row => {
    try {
      const urlStr = row.referrer || ''
      const isInternal = urlStr.includes('prompthub.app') || urlStr.startsWith('/')
      const src = isInternal ? 'Internal' : (urlStr ? new URL(urlStr).hostname : 'Direct')
      if (!sourceMap[src]) sourceMap[src] = new Set()
      sourceMap[src].add(row.session_id)
      totalValidSessions++
    } catch {
      const src = 'Unknown'
      if (!sourceMap[src]) sourceMap[src] = new Set()
      sourceMap[src].add(row.session_id)
      totalValidSessions++
    }
  })

  const traffic_sources = Object.entries(sourceMap).map(([source, sessionsSet]) => ({
    source,
    sessions: sessionsSet.size,
    pct: totalValidSessions > 0 ? (sessionsSet.size / totalValidSessions) * 100 : 0
  })).sort((a, b) => b.sessions - a.sessions).slice(0, 10)

  return NextResponse.json({
    range: rangeParam,
    summary,
    daily_views,
    funnel,
    traffic_sources,
    top_prompts,
    top_campaigns
  })
}
