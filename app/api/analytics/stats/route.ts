import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Fetch recent captures
  const { data: recentCaptures } = await supabase
    .from('email_captures')
    .select('id, email, captured_at, prompts(title, slug)')
    .order('captured_at', { ascending: false })
    .limit(10)

  // Fetch basic prompt stats (views and events)
  // For MVP, we'll fetch all prompts and then aggregate if needed,
  // or use separate count queries for now.
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, title, slug')
    .eq('creator_id', user.id)

  // Stub data for charts until we have real aggregation logic/RPCs
  const dailyViews = [
    { date: '2024-04-01', views: 45 },
    { date: '2024-04-02', views: 52 },
    { date: '2024-04-03', views: 38 },
    { date: '2024-04-04', views: 65 },
    { date: '2024-04-05', views: 48 },
    { date: '2024-04-06', views: 59 },
    { date: '2024-04-07', views: 72 },
  ]

  const promptStats = prompts?.map(p => ({
    title: p.title,
    copies: Math.floor(Math.random() * 100),
    email_captures: Math.floor(Math.random() * 50),
  })) || []

  const topByViews = prompts?.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    view_count: Math.floor(Math.random() * 1000),
  })).sort((a, b) => b.view_count - a.view_count).slice(0, 5) || []

  const topByConversion = prompts?.map(p => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    conversion_rate: (Math.random() * 15).toFixed(1) + '%',
  })).sort((a, b) => parseFloat(b.conversion_rate) - parseFloat(a.conversion_rate)).slice(0, 5) || []

  return NextResponse.json({
    dailyViews,
    promptStats,
    topByViews,
    topByConversion,
    recentCaptures
  })
}
