import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import AdCampaignsTable from '@/components/admin/ads/AdCampaignsTable'
import type { AdCampaign } from '@/types'

export default async function AdCampaignsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch campaigns
  const { data: campaigns } = await supabase
    .from('ad_campaigns')
    .select('*, client:ad_clients(id, name), ad_placements(*)')
    .eq('creator_id', user!.id)
    .order('created_at', { ascending: false })

  // Fetch clients for filter
  const { data: clients } = await supabase
    .from('ad_clients')
    .select('id, name')
    .eq('creator_id', user!.id)
    .order('name')

  // Fetch prompts and categories for the modal form
  const [{ data: prompts }, { data: categories }] = await Promise.all([
    supabase.from('prompts').select('id, title, slug').eq('creator_id', user!.id).eq('status', 'published'),
    supabase.from('categories').select('id, name').order('name')
  ])
  const ids = (campaigns ?? []).map((c) => c.id)
  const [{ data: imps }, { data: clicks }] = await Promise.all([
    supabase.from('ad_impressions').select('campaign_id').in('campaign_id', ids),
    supabase.from('ad_clicks').select('campaign_id').in('campaign_id', ids),
  ])

  const impMap: Record<string, number> = {}
  const clickMap: Record<string, number> = {}
  ;(imps ?? []).forEach((r) => { impMap[r.campaign_id] = (impMap[r.campaign_id] ?? 0) + 1 })
  ;(clicks ?? []).forEach((r) => { clickMap[r.campaign_id] = (clickMap[r.campaign_id] ?? 0) + 1 })

  const enriched = (campaigns ?? []).map((c) => ({
    ...c,
    impressions_count: impMap[c.id] ?? 0,
    clicks_count: clickMap[c.id] ?? 0,
  }))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Ad Campaigns</h1>
          <p className="text-zinc-500 text-sm mt-1">Manage and track your advertising placements.</p>
        </div>
      </div>

      <AdCampaignsTable 
        campaigns={enriched as AdCampaign[]} 
        clients={clients ?? []} 
        prompts={prompts ?? []}
        categories={categories ?? []}
      />
    </div>
  )
}
