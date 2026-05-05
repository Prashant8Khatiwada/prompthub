import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import ControlCenter from '@/components/admin/ControlCenter'
import { fetchInstagramUser, fetchInstagramFeed } from '@/lib/instagram'

export default async function SettingsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  // 1. Fetch or Silently Initialize Creator Profile
  let { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!creator) {
    // Silent auto-init for the primary admin
    const base = user.email!.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
    const { data: newCreator, error: initError } = await adminClient.from('creators').insert({
      id: user.id,
      email: user.email!,
      name: base.charAt(0).toUpperCase() + base.slice(1),
      handle: `@${base}`,
      subdomain: base,
      brand_color: '#6366f1'
    }).select().single()

    if (initError) {
      console.error('Creator init error:', initError)
      return (
        <div className="p-12 bg-red-500/10 border border-red-500/20 rounded-3xl text-center">
          <h2 className="text-red-500 font-bold text-xl mb-2">Database Connection Error</h2>
          <p className="text-zinc-400">Please ensure you have run the SQL migration to create the <code>creators</code> table.</p>
          <p className="text-zinc-500 text-sm mt-4">Error: {initError.message}</p>
        </div>
      )
    }
    creator = newCreator
  }

  // 2. Fetch Instagram Data for Preview
  const igUser = await fetchInstagramUser(user.id)
  const igFeed = await fetchInstagramFeed(user.id)

  return (
    <div className="space-y-10 max-w-5xl">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-white tracking-tight">Platform Controls</h1>
        <p className="text-zinc-500 text-sm">Configure your hub, manage integrations, and organize categories.</p>
      </div>

      <ControlCenter
        creator={creator!}
        userEmail={user.email!}
        igUser={igUser}
        igFeed={igFeed}
      />
    </div>
  )
}
