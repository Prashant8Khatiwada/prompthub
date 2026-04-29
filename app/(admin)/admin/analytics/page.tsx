'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import AnalyticsChart from '@/components/admin/AnalyticsChart'

export default function AnalyticsPage() {
  const [range, setRange] = useState('7d')
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    fetch(`/api/analytics/overview?range=${range}`)
      .then(res => res.json())
      .then(json => {
        if (isMounted) {
          setData(json)
          setLoading(false)
        }
      })
    return () => { isMounted = false }
  }, [range])

  function handleRangeChange(r: string) {
    setLoading(true)
    setRange(r)
  }

  if (!data && loading) {
    return <div className="p-10 text-center text-zinc-500">Loading analytics...</div>
  }

  const stats = data || {}

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-white tracking-tight">Analytics Overview</h1>
          <p className="text-zinc-500 text-sm">Track your prompt performance and audience growth.</p>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-1 flex gap-1">
          {['7d', '14d', '30d'].map((r) => (
            <button
              key={r}
              onClick={() => handleRangeChange(r)}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                range === r ? 'bg-indigo-500 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {r.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {loading && <div className="opacity-50 pointer-events-none transition-opacity">Updating...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Views" value={stats.summary?.total_views || 0} change={stats.summary?.views_change_pct || 0} />
        <SummaryCard title="Unique Visitors" value={stats.summary?.unique_visitors || 0} change={stats.summary?.visitors_change_pct || 0} />
        <SummaryCard title="Conversions" value={stats.summary?.total_conversions || 0} change={stats.summary?.conversions_change_pct || 0} />
        <SummaryCard title="Revenue" value={`$${(stats.summary?.total_revenue || 0).toFixed(2)}`} change={stats.summary?.revenue_change_pct || 0} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-white">Daily Views</h2>
          </div>
          <AnalyticsChart type="line" data={stats.daily_views?.map((d: any) => ({ date: d.date, views: d.views })) || []} />
        </section>

        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-white">Conversion Funnel</h2>
          </div>
          <div className="space-y-6 mt-4">
            <FunnelStep label="Total Views" value={stats.funnel?.views || 0} max={stats.funnel?.views || 1} color="bg-indigo-500" />
            <FunnelStep label="Gate Attempts" value={stats.funnel?.gate_attempts || 0} max={stats.funnel?.views || 1} color="bg-emerald-500" />
            <FunnelStep label="Successful Unlocks" value={stats.funnel?.successful_unlocks || 0} max={stats.funnel?.views || 1} color="bg-amber-500" />
            <FunnelStep label="Copies" value={stats.funnel?.copies || 0} max={stats.funnel?.views || 1} color="bg-purple-500" />
          </div>
        </section>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="px-8 py-6 border-b border-zinc-800">
          <h2 className="text-lg font-bold text-white">Traffic Sources</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-zinc-900/50">
                <th className="text-left px-8 py-4 text-xs font-semibold text-zinc-500 uppercase">Referrer</th>
                <th className="text-right px-8 py-4 text-xs font-semibold text-zinc-500 uppercase">Sessions</th>
                <th className="text-right px-8 py-4 text-xs font-semibold text-zinc-500 uppercase">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {(stats.traffic_sources || []).map((t: any, i: number) => (
                <tr key={i} className="hover:bg-zinc-800/30">
                  <td className="px-8 py-4 text-white">{t.source}</td>
                  <td className="px-8 py-4 text-right text-zinc-400 font-mono">{t.sessions.toLocaleString()}</td>
                  <td className="px-8 py-4 text-right font-mono text-zinc-400">{t.pct.toFixed(1)}%</td>
                </tr>
              ))}
              {(!stats.traffic_sources || stats.traffic_sources.length === 0) && (
                <tr><td colSpan={3} className="px-8 py-10 text-center text-zinc-500">No traffic sources recorded yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TopPromptsTable data={stats.top_prompts || []} />
        <TopCampaignsTable data={stats.top_campaigns || []} />
      </div>
    </div>
  )
}

function SummaryCard({ title, value, change }: { title: string, value: string | number, change: number }) {
  const isPositive = change >= 0
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-xl">
      <div className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-2">{title}</div>
      <div className="text-3xl font-bold text-white mb-2">{value.toLocaleString()}</div>
      <div className={`text-xs font-bold flex items-center gap-1 ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
        {isPositive ? '↗' : '↘'} {Math.abs(change).toFixed(1)}% <span className="text-zinc-600 font-normal">vs previous</span>
      </div>
    </div>
  )
}

function FunnelStep({ label, value, max, color }: { label: string, value: number, max: number, color: string }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div>
      <div className="flex justify-between text-sm font-semibold mb-2">
        <span className="text-zinc-300">{label}</span>
        <span className="text-white">{value.toLocaleString()} <span className="text-zinc-600 ml-1">({pct.toFixed(1)}%)</span></span>
      </div>
      <div className="h-3 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-1000`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function TopPromptsTable({ data }: { data: any[] }) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
      <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Top Prompts</h2>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Prompt</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Views</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Conv.</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {data.map((p) => (
              <tr key={p.id} className="hover:bg-zinc-800/30">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white truncate max-w-[150px]">{p.title}</div>
                  <div className="text-xs text-zinc-500">{p.gate_type}</div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-zinc-400">{p.views.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-indigo-400 font-bold">{p.conv_rate.toFixed(1)}%</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/analytics/prompts/${p.id}`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                    View ↗
                  </Link>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-zinc-500">No data.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function TopCampaignsTable({ data }: { data: any[] }) {
  return (
    <section className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-xl flex flex-col">
      <div className="px-8 py-6 border-b border-zinc-800 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Top Campaigns</h2>
      </div>
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-zinc-900/50">
              <th className="text-left px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Campaign</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">Imps</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-500 uppercase">CTR</th>
              <th className="text-right px-6 py-4 text-xs font-semibold text-zinc-500 uppercase"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {data.map((c) => (
              <tr key={c.id} className="hover:bg-zinc-800/30">
                <td className="px-6 py-4">
                  <div className="font-semibold text-white truncate max-w-[150px]">{c.name}</div>
                  <div className="text-xs text-zinc-500 uppercase">{c.status}</div>
                </td>
                <td className="px-6 py-4 text-right font-mono text-zinc-400">{c.impressions.toLocaleString()}</td>
                <td className="px-6 py-4 text-right font-mono text-indigo-400 font-bold">{c.ctr.toFixed(1)}%</td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/admin/analytics/campaigns/${c.id}`} className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
                    View ↗
                  </Link>
                </td>
              </tr>
            ))}
            {data.length === 0 && <tr><td colSpan={4} className="px-6 py-10 text-center text-zinc-500">No campaigns.</td></tr>}
          </tbody>
        </table>
      </div>
    </section>
  )
}
