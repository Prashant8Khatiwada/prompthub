import { SupabaseClient } from '@supabase/supabase-js'

export async function getAggregatedStats(supabase: SupabaseClient, userId: string) {
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  // 1. Fetch prompts for this creator
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, title, slug')
    .eq('creator_id', userId)

  const promptIds = prompts?.map(p => p.id) || []

  // 2. Fetch pages for these prompts
  const { data: pages } = await supabase
    .from('pages')
    .select('id, prompt_id')
    .in('prompt_id', promptIds)

  const pageIds = pages?.map(pg => pg.id) || []

  // 3. Fetch views (last 30 days)
  const { data: views } = await supabase
    .from('views')
    .select('created_at, page_id')
    .in('page_id', pageIds)
    .gte('created_at', thirtyDaysAgo.toISOString())

  // 4. Fetch events (copies)
  const { data: events } = await supabase
    .from('events')
    .select('page_id, type')
    .in('page_id', pageIds)
    .eq('type', 'copy')

  // 5. Fetch email captures
  const { data: recentCaptures } = await supabase
    .from('email_captures')
    .select('id, email, captured_at, prompt_id')
    .in('prompt_id', promptIds)
    .order('captured_at', { ascending: false })
    .limit(10)

  // Daily Views (Group by date)
  const dailyViewsMap: Record<string, number> = {}
  views?.forEach(v => {
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
    const promptPageIds = pages?.filter(pg => pg.prompt_id === p.id).map(pg => pg.id) || []
    const copies = events?.filter(e => promptPageIds.includes(e.page_id)).length || 0
    const captures = recentCaptures?.filter(ec => ec.prompt_id === p.id).length || 0
    
    return {
      title: p.title,
      copies,
      email_captures: captures
    }
  }) || []

  // Top Lists
  // Since we have all views and events in memory for 30 days, we'll use those for rankings
  const topByViews = prompts?.map(p => {
    const pPageIds = pages?.filter(pg => pg.prompt_id === p.id).map(pg => pg.id) || []
    const count = views?.filter(v => pPageIds.includes(v.page_id)).length || 0
    return {
      id: p.id,
      title: p.title,
      slug: p.slug,
      view_count: count
    }
  }).sort((a, b) => b.view_count - a.view_count).slice(0, 5) || []

  const topByConversion = topByViews.map(p => {
    const captures = recentCaptures?.filter(ec => ec.prompt_id === p.id).length || 0
    const rate = p.view_count > 0 ? (captures / p.view_count) * 100 : 0
    return {
      ...p,
      conversion_rate: rate.toFixed(1) + '%'
    }
  }).sort((a, b) => parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate)).slice(0, 5)

  return {
    dailyViews,
    promptStats,
    topByViews,
    topByConversion,
    recentCaptures: recentCaptures?.map(c => ({
      ...c,
      prompts: prompts?.find(p => p.id === c.prompt_id)
    })) || []
  }
}
