import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AdClientsTable from '@/components/admin/ads/AdClientsTable'

export default async function AdClientsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: clients } = await supabase
    .from('ad_clients')
    .select('*, ad_campaigns(id, status)')
    .eq('creator_id', user!.id)
    .order('created_at', { ascending: false })

  const enriched = (clients ?? []).map((c) => ({
    ...c,
    active_campaigns: (c.ad_campaigns ?? []).filter((cam: { status: string }) => cam.status === 'active').length,
    ad_campaigns: undefined,
  }))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Ad Clients</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {enriched.length} client{enriched.length !== 1 ? 's' : ''} · {enriched.filter(c => c.status === 'active').length} active
          </p>
        </div>
        <Link
          href="/admin/ads/clients/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Client
        </Link>
      </div>

      <AdClientsTable clients={enriched} />
    </div>
  )
}
