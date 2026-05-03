import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import StatsCard from '@/components/admin/StatsCard'
import { getAggregatedStats, AnalyticsStats } from '@/lib/analytics'

import DailyViewsChart from '@/components/admin/DailyViewsChart'

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // Fetch real counts from Supabase
  const [{ count: totalPrompts }, { count: totalCaptures }] = await Promise.all([
    supabase.from('prompts').select('*', { count: 'exact', head: true }).eq('creator_id', user.id),
    supabase.from('email_captures').select('*', { count: 'exact', head: true }),
  ])

  // Get aggregated stats for views and copies
  const stats: AnalyticsStats = await getAggregatedStats(supabase, user.id)
  
  const totalViews = stats.topByViews.reduce((acc, p) => acc + p.view_count, 0)
  const totalCopies = stats.promptStats.reduce((acc, p) => acc + p.copies, 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">Real-time performance metrics for your creative assets.</p>
        </div>
        <Link 
          href="/admin/prompts/new"
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20 text-center"
        >
          Create New Prompt
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Prompts" value={totalPrompts ?? 0} change={0} />
        <StatsCard label="Email Captures" value={totalCaptures ?? 0} change={0} />
        <StatsCard label="Total Views" value={totalViews} change={0} />
        <StatsCard label="Copy Events" value={totalCopies} change={0} />
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Analytics Visualization Card */}
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-[32px] p-8 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-white font-bold text-lg">Traffic Overview</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Views across your prompts in the last 7 days.</p>
            </div>
            <Link href="/admin/analytics" className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
              View Analytics →
            </Link>
          </div>
          <div className="h-48">
            <DailyViewsChart data={stats.dailyViews} />
          </div>
        </div>

        {/* Quick Actions / Activity Card */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8">
          <h3 className="text-white font-bold text-lg mb-6">Recent Captures</h3>
          <div className="space-y-6">
            {stats.recentCaptures.length > 0 ? (
              stats.recentCaptures.map((capture, idx) => (
                <div key={capture.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-400">
                      {capture.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white truncate max-w-[120px]">{capture.email}</span>
                      <span className="text-[10px] text-zinc-500">{capture.prompts?.title || 'Unknown Prompt'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-zinc-600 font-medium">
                    {new Date(capture.captured_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="text-zinc-600 text-sm italic">No captures yet</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
         {/* Top Prompts */}
         <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white font-bold text-lg">Top Performing Prompts</h3>
              <Link href="/admin/prompts" className="text-xs font-bold text-zinc-500 hover:text-zinc-300">
                Manage All
              </Link>
            </div>
            <div className="space-y-5">
              {stats.topByViews.map((p, idx) => (
                <div key={p.id} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50 group hover:border-indigo-500/30 transition-all">
                  <div className="flex items-center gap-4">
                    <span className="text-xs font-black text-zinc-700 italic group-hover:text-indigo-500/50">0{idx + 1}</span>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-white">{p.title}</span>
                      <span className="text-[10px] text-zinc-500">/{p.slug}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-white">{p.view_count.toLocaleString()}</p>
                    <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Views</p>
                  </div>
                </div>
              ))}
            </div>
         </div>

         {/* Campaigns Glance */}
         <div className="bg-zinc-900 border border-zinc-800 rounded-[32px] p-8">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-white font-bold text-lg">Active Campaigns</h3>
              <Link href="/admin/ads/campaigns" className="text-xs font-bold text-zinc-500 hover:text-zinc-300">
                View Ads
              </Link>
            </div>
            <div className="space-y-5">
              {stats.topCampaigns.length > 0 ? (
                stats.topCampaigns.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-4 bg-zinc-950/50 rounded-2xl border border-zinc-800/50">
                    <div className="flex items-center gap-4">
                      <div className={`w-2 h-2 rounded-full ${c.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-600'}`} />
                      <span className="text-sm font-bold text-white truncate max-w-[150px]">{c.name}</span>
                    </div>
                    <div className="flex gap-6">
                      <div className="text-right">
                        <p className="text-xs font-black text-white">{c.clicks.toLocaleString()}</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Clicks</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-zinc-400">{(c.clicks / (c.impressions || 1) * 100).toFixed(1)}%</p>
                        <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">CTR</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-10 opacity-50">
                  <span className="text-3xl mb-2">📢</span>
                  <p className="text-xs text-zinc-500 font-bold">No active campaigns</p>
                </div>
              )}
            </div>
         </div>
      </div>
    </div>
  )
}
