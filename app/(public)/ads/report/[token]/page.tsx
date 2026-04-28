import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

interface Params { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { token } = await params
  const supabase = await createClient()
  
  const { data: campaign } = await supabase
    .from('ad_campaigns')
    .select('name')
    .eq('report_token', token)
    .single()

  if (!campaign) return { title: 'Report Not Found' }
  return {
    title: `${campaign.name} | Campaign Report`,
    robots: { index: false, follow: false },
  }
}

export default async function AdReportPage({ params }: Params) {
  const { token } = await params
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

  const res = await fetch(`${baseUrl}/api/ads/report/${token}`, {
    next: { revalidate: 3600 } // Revalidate every hour
  })

  if (!res.ok) notFound()
  const stats = await res.json()

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
        {/* Header */}
        <header className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-indigo-600 rounded flex items-center justify-center font-bold text-[10px]">P</div>
            <span className="text-sm font-bold tracking-tight text-zinc-400">PromptHub Report</span>
          </div>
          <h1 className="text-4xl font-black tracking-tight leading-tight">{stats.campaign_name}</h1>
          <div className="flex flex-wrap gap-4 text-sm font-semibold text-zinc-500">
            {stats.client_name && <span>{stats.client_name}</span>}
            <span>•</span>
            <span>{new Date(stats.starts_at || Date.now()).toLocaleDateString()} — {stats.ends_at ? new Date(stats.ends_at).toLocaleDateString() : 'Ongoing'}</span>
            <span>•</span>
            <span className={stats.campaign_status === 'active' ? 'text-emerald-400' : ''}>{stats.campaign_status.toUpperCase()}</span>
          </div>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Impressions</p>
            <p className="text-3xl font-bold font-mono">{stats.total_impressions.toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Clicks</p>
            <p className="text-3xl font-bold font-mono text-indigo-400">{stats.total_clicks.toLocaleString()}</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">CTR</p>
            <p className="text-3xl font-bold font-mono">{stats.ctr.toFixed(2)}%</p>
          </div>
          <div className="p-6 rounded-2xl bg-zinc-900 border border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">Active Since</p>
            <p className="text-xl font-bold mt-2">{stats.starts_at ? new Date(stats.starts_at).toLocaleDateString() : '—'}</p>
          </div>
        </div>

        {/* Charts & Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-lg font-bold mb-6">Daily Performance (Last 30 Days)</h2>
              <div className="h-64 flex items-end justify-between gap-1">
                {/* Simplified bar chart representation without Recharts for public view */}
                {stats.daily_breakdown.map((d: any, i: number) => {
                  const maxImps = Math.max(...stats.daily_breakdown.map((x: any) => x.impressions), 1)
                  const height = `${(d.impressions / maxImps) * 100}%`
                  const clickHeight = `${(d.clicks / maxImps) * 100}%`
                  return (
                    <div key={i} className="relative flex-1 group" style={{ height: '100%' }}>
                      <div className="absolute bottom-0 w-full bg-zinc-800 rounded-t-sm transition-all group-hover:bg-zinc-700" style={{ height }} />
                      <div className="absolute bottom-0 w-full bg-indigo-500 rounded-t-sm transition-all" style={{ height: clickHeight }} />
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-zinc-800 px-2 py-1 rounded text-[10px] whitespace-nowrap z-10 pointer-events-none">
                        {d.date}: {d.impressions} imps, {d.clicks} clicks
                      </div>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center gap-4 mt-6 text-xs font-semibold text-zinc-400">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-zinc-800"></div> Impressions</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-indigo-500"></div> Clicks</div>
              </div>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
              <div className="px-8 py-6 border-b border-zinc-800">
                <h2 className="text-lg font-bold">Top Performing Placements</h2>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-zinc-900/50 border-b border-zinc-800">
                  <tr>
                    <th className="text-left px-8 py-4 text-xs font-semibold text-zinc-500 uppercase">Page</th>
                    <th className="text-right px-4 py-4 text-xs font-semibold text-zinc-500 uppercase">Imps</th>
                    <th className="text-right px-4 py-4 text-xs font-semibold text-zinc-500 uppercase">Clicks</th>
                    <th className="text-right px-8 py-4 text-xs font-semibold text-zinc-500 uppercase">CTR</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {stats.per_prompt_breakdown.map((p: any) => (
                    <tr key={p.prompt_id}>
                      <td className="px-8 py-4 font-semibold max-w-[200px] truncate">{p.title}</td>
                      <td className="px-4 py-4 text-right font-mono text-zinc-400">{p.impressions.toLocaleString()}</td>
                      <td className="px-4 py-4 text-right font-mono text-zinc-400">{p.clicks.toLocaleString()}</td>
                      <td className="px-8 py-4 text-right font-mono text-indigo-400 font-bold">{p.ctr.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {stats.per_prompt_breakdown.length === 0 && (
                    <tr><td colSpan={4} className="px-8 py-10 text-center text-zinc-500">No placements recorded yet.</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          </div>

          <div className="space-y-8">
            <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-lg font-bold mb-6">Device Breakdown</h2>
              <div className="space-y-4">
                {stats.device_breakdown.map((d: any) => (
                  <div key={d.device}>
                    <div className="flex justify-between text-sm font-semibold mb-2 capitalize">
                      <span>{d.device}</span>
                      <span className="text-zinc-500">{d.percentage}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${d.percentage}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
              <h2 className="text-lg font-bold mb-6">Top Regions</h2>
              <div className="space-y-4">
                {stats.country_breakdown.map((c: any, i: number) => (
                  <div key={c.country} className="flex justify-between text-sm font-semibold">
                    <span className="text-zinc-400"><span className="text-zinc-600 mr-2">{i + 1}.</span>{c.country}</span>
                    <span className="text-zinc-500">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <footer className="pt-12 pb-8 border-t border-zinc-900 text-center text-sm font-semibold text-zinc-500">
          <p>Powered by PromptHub · Data updates every hour</p>
        </footer>
      </div>
    </div>
  )
}
