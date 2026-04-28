import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import AdCampaignForm from '@/components/admin/ads/AdCampaignForm'

interface Params { searchParams: Promise<{ client_id?: string }> }

export default async function NewAdCampaignPage({ searchParams }: Params) {
  const { client_id } = await searchParams
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch clients for dropdown
  const { data: clients } = await supabase
    .from('ad_clients')
    .select('id, name')
    .eq('creator_id', user!.id)
    .order('name')

  // Fetch prompts for placement selection
  const { data: prompts } = await supabase
    .from('prompts')
    .select('id, title, slug')
    .eq('creator_id', user!.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">New Ad Campaign</h1>
        <p className="text-zinc-500 text-sm mt-1">Configure your ad creative and display rules.</p>
      </div>
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8">
        <AdCampaignForm clients={clients ?? []} prompts={prompts ?? []} initialClientId={client_id} />
      </div>
    </div>
  )
}
