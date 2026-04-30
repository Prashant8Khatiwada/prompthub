import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import PromptTable from '@/components/admin/PromptTable'
import PromptsHeader from '@/components/admin/PromptsHeader'

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
      <PromptsHeader published={published} drafts={drafts} />

      {/* Table */}
      <PromptTable prompts={prompts ?? []} />
    </div>
  )
}
