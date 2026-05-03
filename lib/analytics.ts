import { SupabaseClient } from '@supabase/supabase-js'
import { unstable_cache } from 'next/cache'

export interface AnalyticsStats {
  dailyViews: { date: string; views: number }[]
  promptStats: { title: string; copies: number; email_captures: number }[]
  topByViews: { id: string; title: string; slug: string; view_count: number }[]
  topByConversion: { id: string; title: string; slug: string; view_count: number; conversion_rate: string }[]
  topCampaigns: { id: string; name: string; status: string; impressions: number; clicks: number }[]
  recentCaptures: any[]
}

export async function getAggregatedStats(supabase: SupabaseClient, userId: string): Promise<AnalyticsStats> {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // 1. Fetch prompts for this creator
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, title, slug')
    .eq('creator_id', userId)

  const promptIds = prompts?.map(p => p.id) || []

  // 2. Fetch pages for these prompts (Legacy mapping)
  const { data: pages } = await supabase
    .from('pages')
    .select('id, prompt_id')
    .in('prompt_id', promptIds)

  const pageIds = pages?.map(pg => pg.id) || []

  // 3. Fetch from NEW analytics_events table
  const { data: newEvents } = await supabase
    .from('analytics_events')
    .select('event_type, created_at, prompt_id, campaign_id')
    .eq('creator_id', userId)
    .gte('created_at', thirtyDaysAgo.toISOString())

  // 4. Fetch from LEGACY views table
  const { data: legacyViews } = await supabase
    .from('views')
    .select('created_at, page_id')
    .in('page_id', pageIds)
    .gte('created_at', thirtyDaysAgo.toISOString())

  // 5. Fetch from LEGACY events table (copies)
  const { data: legacyEvents } = await supabase
    .from('events')
    .select('page_id, type')
    .in('page_id', pageIds)
    .in('type', ['copy', 'prompt_copy'])

  // 6. Fetch email captures
  const { data: recentCaptures } = await supabase
    .from('email_captures')
    .select('id, email, captured_at, prompt_id')
    .in('prompt_id', promptIds)
    .order('captured_at', { ascending: false })
    .limit(10)

  // ─── COMBINE DATA ───────────────────────────────────────────

  // Map legacy page_id back to prompt_id for uniform processing
  const pageToPrompt: Record<string, string> = {}
  pages?.forEach(pg => { pageToPrompt[pg.id] = pg.prompt_id })

  // Unified Views
  const unifiedViews: { created_at: string; prompt_id: string }[] = [
    ...(newEvents?.filter(e => e.event_type === 'prompt_view').map(e => ({ created_at: e.created_at, prompt_id: e.prompt_id! })) || []),
    ...(legacyViews?.map(v => ({ created_at: v.created_at, prompt_id: pageToPrompt[v.page_id] })) || [])
  ]

  // Unified Copies
  const unifiedCopies: { prompt_id: string }[] = [
    ...(newEvents?.filter(e => e.event_type === 'prompt_copy' || e.event_type === 'copy').map(e => ({ prompt_id: e.prompt_id! })) || []),
    ...(legacyEvents?.map(e => ({ prompt_id: pageToPrompt[e.page_id] })) || [])
  ]

  // Daily Views (Group by date)
  const dailyViewsMap: Record<string, number> = {}
  unifiedViews.forEach(v => {
    if (!v.created_at) return
    const date = new Date(v.created_at).toISOString().split('T')[0]
    dailyViewsMap[date] = (dailyViewsMap[date] || 0) + 1
  })

  const dailyViews = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().split('T')[0]
    dailyViews.push({
      date: dateStr,
      views: dailyViewsMap[dateStr] || 0
    })
  }

  // Engagement per Prompt
  const promptStats = prompts?.map(p => {
    const pCopies = unifiedCopies.filter(e => e.prompt_id === p.id).length
    const pCaptures = recentCaptures?.filter(ec => ec.prompt_id === p.id).length || 0
    
    return {
      title: p.title,
      copies: pCopies,
      email_captures: pCaptures
    }
  }) || []

  // Top Lists
  const topByViews = (prompts?.map(p => {
    const count = unifiedViews.filter(v => v.prompt_id === p.id).length
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      view_count: count
    }
  }) || []).sort((a, b) => b.view_count - a.view_count).slice(0, 5)

  const topByConversion = topByViews.map(p => {
    const captures = recentCaptures?.filter(ec => ec.prompt_id === p.id).length || 0
    const rate = p.view_count > 0 ? (captures / p.view_count) * 100 : 0
    return {
      ...p,
      conversion_rate: rate.toFixed(1) + '%'
    }
  }).sort((a, b) => parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate)).slice(0, 5)

  // Fetch creator's campaigns + stats
  const { data: topCampaignsData } = await supabase
    .from('ad_campaigns')
    .select('id, name, status')
    .eq('creator_id', userId)

  const topCampaigns = (topCampaignsData || []).map(c => {
    const impressions = newEvents?.filter(e => e.event_type === 'ad_impression' && e.campaign_id === c.id).length || 0
    const clicks = newEvents?.filter(e => e.event_type === 'ad_click' && e.campaign_id === c.id).length || 0
    return {
      id: c.id,
      name: c.name,
      status: c.status,
      impressions,
      clicks
    }
  }).sort((a, b) => b.clicks - a.clicks).slice(0, 5)

  return {
    dailyViews,
    promptStats,
    topByViews,
    topByConversion,
    topCampaigns,
    recentCaptures: (recentCaptures || []).map(c => ({
      ...c,
      prompts: prompts?.find(p => p.id === c.prompt_id)
    }))
  }
}

/**
 * CLIENT-SIDE TRACKING FUNCTIONS
 */

export const trackCopy = (promptId: string) => {
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt_id: promptId,
      page_id: promptId, // Compatibility with old 'events' table
      type: 'copy',      // Use 'copy' for old system, backend will map to 'prompt_copy' for new
      session_id: sessionStorage.getItem('ph_sid'),
    }),
  }).catch(() => {})
}

export const trackEmailSubmit = (promptId: string) => {
  fetch('/api/analytics/event', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt_id: promptId,
      page_id: promptId,
      type: 'email_capture',
      session_id: sessionStorage.getItem('ph_sid'),
    }),
  }).catch(() => {})
}
