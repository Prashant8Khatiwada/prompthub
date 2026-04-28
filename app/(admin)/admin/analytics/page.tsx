import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { getAggregatedStats } from '@/lib/analytics'
import AnalyticsChart from '@/components/admin/AnalyticsChart'

async function getStats() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  return getAggregatedStats(supabase, user.id)
}

export default async function AnalyticsPage() {
  const stats = await getStats()

  if (!stats) return null

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-zinc-500 text-sm">Track your prompt performance and audience growth.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Line chart: daily views */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-white">Daily Views</h2>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Last 7 Days</span>
          </div>
          <AnalyticsChart type="line" data={stats.dailyViews} />
        </section>

        {/* Bar chart: engagement */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-white">Engagement</h2>
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Per Prompt</span>
          </div>
          <AnalyticsChart type="bar" data={stats.promptStats} />
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <TopTable title="Top by Views" data={stats.topByViews} metric="view_count" label="Views" />
        <TopTable title="Top by Conversion" data={stats.topByConversion} metric="conversion_rate" label="Conv." />
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Ads Performance</h2>
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Top Campaigns</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="text-left px-8 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Campaign</th>
                <th className="text-right px-8 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Imps</th>
                <th className="text-right px-8 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Clicks</th>
                <th className="text-right px-8 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">CTR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {stats.topCampaigns?.length > 0 ? stats.topCampaigns.map((c: any) => {
                const ctr = c.impressions > 0 ? (c.clicks / c.impressions) * 100 : 0
                return (
                  <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                    <td className="px-8 py-4 text-white font-medium">
                      {c.name}
                      <span className="ml-2 text-xs text-zinc-500 border border-zinc-700 px-1.5 py-0.5 rounded uppercase">{c.status}</span>
                    </td>
                    <td className="px-8 py-4 text-right text-zinc-400 font-mono">{c.impressions.toLocaleString()}</td>
                    <td className="px-8 py-4 text-right text-zinc-400 font-mono">{c.clicks.toLocaleString()}</td>
                    <td className={`px-8 py-4 text-right font-mono font-bold ${ctr > 5 ? 'text-emerald-400' : ctr >= 2 ? 'text-amber-400' : 'text-red-400'}`}>
                      {ctr.toFixed(2)}%
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan={4} className="px-8 py-10 text-center text-zinc-500">
                    No active campaigns. Create one in Ads &gt; Campaigns.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-8 py-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Recent Email Captures</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="text-left px-8 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email</th>
                <th className="text-left px-8 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Prompt</th>
                <th className="text-right px-8 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Captured</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {stats.recentCaptures.length > 0 ? stats.recentCaptures.map((c: any) => (
                <tr key={c.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-8 py-4 text-white font-medium">{c.email}</td>
                  <td className="px-8 py-4 text-zinc-400">
                    {c.prompts?.title || 'Unknown Prompt'}
                  </td>
                  <td className="px-8 py-4 text-right text-zinc-500">
                    {new Date(c.captured_at).toLocaleDateString()}
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={3} className="px-8 py-10 text-center text-zinc-500">
                    No email captures yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */ }
function TopTable({ title, data, metric, label }: { title: string, data: any[], metric: string, label: string }) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
      <div className="px-8 py-6 border-b border-zinc-800">
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>
      <table className="w-full text-sm">
        <tbody className="divide-y divide-zinc-800">
          {data.map((p, i) => (
            <tr key={p.id} className="hover:bg-zinc-800/30 transition-colors">
              <td className="px-8 py-4 w-10 text-zinc-600 font-bold">{i + 1}</td>
              <td className="px-2 py-4">
                <div className="font-semibold text-white truncate max-w-[150px] sm:max-w-[250px]">{p.title}</div>
                <div className="text-xs text-zinc-500">/{p.slug}</div>
              </td>
              <td className="px-8 py-4 text-right font-mono text-indigo-400 font-bold whitespace-nowrap">
                {p[metric]} <span className="text-[10px] text-zinc-600 uppercase ml-1">{label}</span>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={3} className="px-8 py-10 text-center text-zinc-500">
                No data yet.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </section>
  )
}
