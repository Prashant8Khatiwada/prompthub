import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import StatsCard from '@/components/admin/StatsCard'
import { getAggregatedStats } from '@/lib/analytics'

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
  const stats = await getAggregatedStats(supabase, user.id)
  
  const totalViews = stats.topByViews.reduce((acc: number, p: { view_count: number }) => acc + (p.view_count || 0), 0)
  const totalCopies = stats.promptStats.reduce((acc: number, p: { copies: number }) => acc + (p.copies || 0), 0)

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Overview</h1>
          <p className="text-zinc-500 text-sm mt-1">Track your prompt performance and growth.</p>
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

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Link href="/admin/analytics" className="lg:col-span-2 group">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-80 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-500/50 transition-all cursor-pointer">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 group-hover:bg-indigo-600/20 flex items-center justify-center transition-colors">
               <span className="text-2xl">📈</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Detailed Analytics</p>
              <p className="text-zinc-500 text-sm">Visualize your growth and engagement over time.</p>
            </div>
          </div>
        </Link>
        <Link href="/admin/prompts" className="group">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 h-80 flex flex-col items-center justify-center text-center space-y-4 hover:border-indigo-500/50 transition-all cursor-pointer h-full">
            <div className="w-16 h-16 rounded-2xl bg-zinc-800 group-hover:bg-indigo-600/20 flex items-center justify-center transition-colors">
               <span className="text-2xl">🔥</span>
            </div>
            <div>
              <p className="text-white font-bold text-lg">Manage Prompts</p>
              <p className="text-zinc-500 text-sm">Review, edit, and publish your AI assets.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
