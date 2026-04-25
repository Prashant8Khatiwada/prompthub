import { cookies } from 'next/headers'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import PromptTable from '@/components/admin/PromptTable'

export default async function AdminPromptsPage() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: prompts } = await supabase
    .from('prompts')
    .select('*, categories(name)')
    .eq('creator_id', user!.id)
    .order('created_at', { ascending: false })

  const published = prompts?.filter(p => p.status === 'published').length ?? 0
  const drafts = prompts?.filter(p => p.status === 'draft').length ?? 0

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Prompts</h1>
          <p className="text-zinc-500 text-sm mt-1">
            {published} published &middot; {drafts} draft
          </p>
        </div>
        <Link
          href="/admin/prompts/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-5 py-3 text-sm font-bold text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
          </svg>
          New Prompt
        </Link>
      </div>

      {/* Table */}
      <PromptTable prompts={prompts ?? []} />
    </div>
  )
}
