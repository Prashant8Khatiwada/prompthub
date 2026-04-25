import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { fetchInstagramOEmbed } from '@/lib/oembed'
import { adminClient } from '@/lib/supabase/admin'
import CreatorBar from '@/components/public/CreatorBar'
import VideoEmbed from '@/components/public/VideoEmbed'
import PromptGate from '@/components/public/PromptGate'
import RelatedPrompts from '@/components/public/RelatedPrompts'
import ViewTracker from '@/components/public/ViewTracker'

export const revalidate = 60

interface Params {
  params: Promise<{ subdomain: string; slug: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subdomain, slug } = await params
  const supabase = await createClient()

  const { data: creator } = await supabase
    .from('creators').select('name,handle,brand_color').eq('subdomain', subdomain).single()
  if (!creator) return { title: 'Not Found' }

  const { data: prompt } = await supabase
    .from('prompts')
    .select('title,description,thumbnail_url,ai_tool')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (!prompt) return { title: 'Not Found' }

  const title = `${prompt.title} by ${creator.name}`
  const description = prompt.description ?? `${prompt.ai_tool} prompt by ${creator.name}`
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'prompthub.app'

  return {
    title,
    description,
    openGraph: {
      title: `${prompt.title} | PromptHub`,
      description,
      images: prompt.thumbnail_url ? [{ url: prompt.thumbnail_url }] : [],
      type: 'website',
      url: `https://${subdomain}.${baseDomain}/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${prompt.title} | PromptHub`,
      description,
      images: prompt.thumbnail_url ? [prompt.thumbnail_url] : [],
    },
  }
}

export default async function PublicPromptPage({ params }: Params) {
  const { subdomain, slug } = await params
  const supabase = await createClient()

  // 1. Fetch creator by subdomain
  const { data: creator } = await supabase
    .from('creators').select('*').eq('subdomain', subdomain).single()
  if (!creator) notFound()

  // 2. Fetch published prompt
  const { data: prompt } = await supabase
    .from('prompts').select('*')
    .eq('creator_id', creator.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()
  if (!prompt) notFound()

  // 3. Fetch related prompts (up to 3, excluding current)
  const { data: related } = await supabase
    .from('prompts')
    .select('id,title,slug,ai_tool,output_type,thumbnail_url')
    .eq('creator_id', creator.id)
    .eq('status', 'published')
    .neq('id', prompt.id)
    .limit(3)

  // 4. Fetch or create page record for analytics
  let pageId: string | null = null
  const { data: page } = await adminClient
    .from('pages').select('id').eq('prompt_id', prompt.id).maybeSingle()
  if (page) {
    pageId = page.id
  } else {
    const { data: newPage } = await adminClient
      .from('pages').insert({ prompt_id: prompt.id }).select('id').single()
    pageId = newPage?.id ?? null
  }

  // 5. Fetch Instagram oEmbed HTML (if video_url present)
  const oEmbedHtml = prompt.video_url
    ? await fetchInstagramOEmbed(prompt.video_url)
    : null

  const AI_TOOL_COLORS: Record<string, string> = {
    Midjourney: '#1b6ef3',
    ChatGPT: '#10a37f',
    Claude: '#c96442',
    Gemini: '#4285f4',
    Runway: '#7c3aed',
    Pika: '#ec4899',
    Kling: '#f59e0b',
    Veo: '#06b6d4',
    Other: '#6366f1',
  }

  const toolColor = AI_TOOL_COLORS[prompt.ai_tool] ?? '#6366f1'

  return (
    <main
      style={{ '--brand': creator.brand_color } as React.CSSProperties}
      className="min-h-screen bg-zinc-950 text-zinc-50 pb-16"
    >
      {/* Track page view */}
      {pageId && <ViewTracker pageId={pageId} />}

      {/* Sticky creator header */}
      <CreatorBar creator={creator} />

      {/* Video embed */}
      {(prompt.embed_html || prompt.video_url) && (
        <VideoEmbed
          html={prompt.embed_html || oEmbedHtml}
          fallbackThumbnail={prompt.thumbnail_url}
          url={prompt.video_url}
        />
      )}

      {/* Prompt content */}
      <section className="max-w-2xl mx-auto px-4 pt-8">
        {/* Title & tags */}
        <h1 className="text-2xl font-bold tracking-tight text-white mb-3 leading-snug">
          {prompt.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: `${toolColor}22`, color: toolColor, border: `1px solid ${toolColor}44` }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: toolColor }} />
            {prompt.ai_tool}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700">
            {prompt.output_type}
          </span>
        </div>
        {prompt.description && (
          <p className="text-zinc-400 text-sm leading-relaxed mb-6">{prompt.description}</p>
        )}

        {/* Gate */}
        <PromptGate prompt={prompt} />
      </section>

      {/* Related prompts */}
      {related && related.length > 0 && (
        <RelatedPrompts prompts={related} subdomain={subdomain} />
      )}
    </main>
  )
}
