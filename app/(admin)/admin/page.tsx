import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import StatsCard from '@/components/admin/StatsCard'

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

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">Track your prompt performance and growth.</p>
        </div>
        <button className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold px-6 py-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
          Create New Prompt
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard label="Total Prompts" value={totalPrompts ?? 0} change={0} />
        <StatsCard label="Email Captures" value={totalCaptures ?? 0} change={0} />
        <StatsCard label="Total Views" value={0} change={0} />
        <StatsCard label="Copy Events" value={0} change={0} />
      </div>

      {/* Dashboard Grid Stub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-80 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
             <span className="text-2xl">📈</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg">Performance Chart</p>
            <p className="text-zinc-500 text-sm">Visualize your growth over time. (Coming in Phase 5)</p>
          </div>
        </div>
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-80 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-zinc-800 flex items-center justify-center">
             <span className="text-2xl">🔥</span>
          </div>
          <div>
            <p className="text-white font-bold text-lg">Top Prompts</p>
            <p className="text-zinc-500 text-sm">Your best performing assets. (Coming in Phase 5)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
