'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import type { AdCampaign } from '@/types'

const STATUS_STYLES: Record<string, string> = {
  active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  paused: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  ended: 'bg-zinc-700/50 text-zinc-500 border-zinc-600/30',
  scheduled: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
}

const STATUS_TABS = ['all', 'active', 'paused', 'ended', 'scheduled'] as const
type StatusTab = typeof STATUS_TABS[number]

function getCtrColor(ctr: number) {
  if (ctr > 5) return 'text-emerald-400'
  if (ctr >= 2) return 'text-amber-400'
  return 'text-red-400'
}

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })
}

interface Props {
  campaigns: AdCampaign[]
  clients: { id: string; name: string }[]
}

export default function AdCampaignsTable({ campaigns: initial, clients }: Props) {
  const router = useRouter()
  const [campaigns, setCampaigns] = useState(initial)
  const [, startTransition] = useTransition()
  const [activeTab, setActiveTab] = useState<StatusTab>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  const filtered = campaigns.filter(c => {
    if (activeTab !== 'all' && c.status !== activeTab) return false
    if (clientFilter !== 'all' && c.client_id !== clientFilter) return false
    return true
  })

  async function handleTogglePause(c: AdCampaign) {
    setTogglingId(c.id)
    const newStatus = c.status === 'active' ? 'paused' : 'active'
    const res = await fetch(`/api/ads/campaigns/${c.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    if (res.ok) {
      setCampaigns(prev => prev.map(x => x.id === c.id ? { ...x, status: newStatus } : x))
      startTransition(() => router.refresh())
    }
    setTogglingId(null)
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete campaign "${name}"? This cannot be undone.`)) return
    setDeletingId(id)
    const res = await fetch(`/api/ads/campaigns/${id}`, { method: 'DELETE' })
    if (res.ok) {
      setCampaigns(prev => prev.filter(c => c.id !== id))
    }
    setDeletingId(null)
  }

  function copyReportLink(token: string) {
    const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'prompthub.app'
    navigator.clipboard.writeText(`https://${baseDomain}/ads/report/${token}`)
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
        <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center text-3xl mb-4">📣</div>
        <p className="text-white font-bold text-lg mb-2">No campaigns yet</p>
        <p className="text-zinc-500 text-sm mb-6">Create your first ad campaign to start monetizing your pages.</p>
        <Link href="/admin/ads/campaigns/new" className="rounded-full bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-bold text-white transition-all">
          + New Campaign
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        {/* Tab pills */}
        <div className="flex gap-1 bg-zinc-900 border border-zinc-800 rounded-xl p-1 flex-wrap">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600 text-white'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Client filter */}
        {clients.length > 0 && (
          <select
            value={clientFilter}
            onChange={e => setClientFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
          >
            <option value="all">All clients</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        )}

        <p className="text-xs text-zinc-500 sm:ml-auto">{filtered.length} campaign{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-800 bg-zinc-900/50">
              <th className="text-left px-5 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Campaign</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden md:table-cell">Client</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Impr.</th>
              <th className="text-right px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">Clicks</th>
              <th className="text-right px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden lg:table-cell">CTR</th>
              <th className="text-left px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider hidden xl:table-cell">Dates</th>
              <th className="px-4 py-4 text-xs font-semibold text-zinc-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filtered.map((c) => {
              const imps = c.impressions_count ?? 0
              const clks = c.clicks_count ?? 0
              const ctr = imps > 0 ? (clks / imps) * 100 : 0

              return (
                <tr key={c.id} className={`hover:bg-zinc-900/40 transition-colors ${deletingId === c.id ? 'opacity-40' : ''}`}>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white truncate max-w-[180px]">{c.name}</p>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="text-xs text-zinc-400">{c.client?.name ?? '—'}</span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_STYLES[c.status]}`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    <span className="text-xs font-mono text-zinc-300">{imps.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    <span className="text-xs font-mono text-zinc-300">{clks.toLocaleString()}</span>
                  </td>
                  <td className="px-4 py-4 text-right hidden lg:table-cell">
                    <span className={`text-xs font-bold font-mono ${getCtrColor(ctr)}`}>
                      {ctr.toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden xl:table-cell">
                    <span className="text-xs text-zinc-500">
                      {formatDate(c.starts_at)} — {formatDate(c.ends_at)}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link
                        href={`/admin/ads/campaigns/${c.id}`}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all"
                      >
                        Edit
                      </Link>
                      <Link
                        href={`/ads/report/${c.report_token}`}
                        target="_blank"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all"
                      >
                        Report
                      </Link>
                      <button
                        onClick={() => copyReportLink(c.report_token)}
                        title="Copy report link"
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 border border-transparent hover:border-zinc-700 transition-all"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => handleTogglePause(c)}
                        disabled={togglingId === c.id || (c.status !== 'active' && c.status !== 'paused')}
                        className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all disabled:opacity-50 ${
                          c.status === 'active'
                            ? 'text-amber-400 border-amber-500/30 hover:bg-amber-600/10'
                            : 'text-emerald-400 border-emerald-500/30 hover:bg-emerald-600/10'
                        }`}
                      >
                        {togglingId === c.id ? '…' : c.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        disabled={deletingId === c.id}
                        className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-red-500 hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="px-8 py-12 text-center text-zinc-500 text-sm">
            No campaigns match this filter.
          </div>
        )}
      </div>
    </div>
  )
}
