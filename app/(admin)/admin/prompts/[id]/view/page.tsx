import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import EnhancedPublicPromptUI from '@/components/public/EnhancedPublicPromptUI'
import { fetchInstagramMedia, fetchInstagramUser, fetchInstagramFeed } from '@/lib/instagram'
import { fetchInstagramOEmbed } from '@/lib/oembed'

interface Params {
  params: Promise<{ id: string }>
}

export default async function AdminPromptViewPage({ params }: Params) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Fetch Creator
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .eq('id', user.id)
    .single()
  if (!creator) redirect('/admin/onboarding')

  // 3. Fetch Prompt (even if draft)
  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .eq('creator_id', user.id)
    .single()
  if (!prompt) notFound()

  // 4. Fetch Rich Data (similar to public page)
  const [oEmbedHtml, igMedia, igUser, igFeed, { data: related }] = await Promise.all([
    prompt.video_url ? fetchInstagramOEmbed(prompt.video_url) : Promise.resolve(null),
    prompt.video_url ? fetchInstagramMedia(prompt.video_url, creator.id) : Promise.resolve(null),
    fetchInstagramUser(creator.id),
    fetchInstagramFeed(creator.id),
    supabase
      .from('prompts')
      .select('id,title,slug,ai_tool,output_type,thumbnail_url')
      .eq('creator_id', creator.id)
      .eq('status', 'published')
      .neq('id', prompt.id)
      .limit(3)
  ])

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Admin Control Bar */}
      <div className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex items-center justify-between shadow-xl">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/prompts" 
            className="text-zinc-500 hover:text-white transition-colors text-sm font-semibold flex items-center gap-2"
          >
            ← Back
          </Link>
          <div className="h-4 w-px bg-zinc-800" />
          <h1 className="text-sm font-bold text-white truncate max-w-[200px]">
            Previewing: {prompt.title}
          </h1>
          {prompt.status === 'draft' && (
            <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-500 text-[10px] font-bold uppercase tracking-wider border border-zinc-700">
              Draft Mode
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-3">
          <Link
            href={`/admin/analytics/prompts/${prompt.id}`}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-all flex items-center gap-2"
          >
            📈 View Analytics
          </Link>
          <Link
            href={`/admin/prompts/${prompt.id}`}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
          >
            Edit Prompt
          </Link>
        </div>
      </div>

      {/* Actual Iframe Section (Preview) */}
      <div className="p-4 md:p-8">
        <div className="max-w-screen-xl mx-auto border border-zinc-800 rounded-[40px] overflow-hidden bg-zinc-900 shadow-2xl relative">
          {/* Label for "What it looks like on landing page" */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-full text-[10px] text-white/50 font-bold uppercase tracking-[0.2em]">
            Public Page Preview
          </div>

          <div className="opacity-90">
             {/* We remove pointer-events-none so admin can test the copy/unlock flow */}
            <EnhancedPublicPromptUI
              creator={creator}
              prompt={prompt}
              igUser={igUser}
              igMedia={igMedia}
              igFeed={igFeed}
              relatedData={related ?? []}
              oEmbedHtml={oEmbedHtml}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
