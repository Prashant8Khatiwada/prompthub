import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { fetchInstagramOEmbed } from '@/lib/oembed'
import { adminClient } from '@/lib/supabase/admin'
import VideoEmbed from '@/components/public/VideoEmbed'
import PromptGate from '@/components/public/PromptGate'
import RelatedPrompts from '@/components/public/RelatedPrompts'
import ViewTracker from '@/components/public/ViewTracker'
import AdBanner from '@/components/public/AdBanner'
import { fetchInstagramMedia, fetchInstagramUser, fetchInstagramFeed } from '@/lib/instagram'
import InstagramPost from '@/components/public/InstagramPost'
import InstagramProfile from '@/components/public/InstagramProfile'
import InstagramFeed from '@/components/public/InstagramFeed'

export const dynamic = 'force-dynamic'
export const revalidate = 0

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

  // 5b. Fetch Rich Instagram Data for native rendering
  const igMedia = prompt.video_url
    ? await fetchInstagramMedia(prompt.video_url)
    : null

  // 5c. Fetch User and Feed Data
  const igUser = await fetchInstagramUser()
  const igFeed = await fetchInstagramFeed(12)

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

  // 6. Fetch active ad placements for this prompt
  // Fetch placements directly via adminClient (instead of internal fetch to avoid baseUrl issues)
  const now = new Date().toISOString()
  const filters = [
    `prompt_id.eq.${prompt.id}`,
    `is_global.eq.true`
  ]
  if (prompt.category_id) {
    filters.push(`category_id.eq.${prompt.category_id}`)
  }

  const { data: rawPlacements, error: placementError } = await adminClient
    .from('ad_placements')
    .select(`
      id,
      position,
      is_global,
      prompt_id,
      category_id,
      campaign:ad_campaigns(*)
    `)
    .or(filters.join(','))

  const placements = (rawPlacements ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => ({
      ...p,
      campaign: Array.isArray(p.campaign) ? p.campaign[0] : p.campaign
    }))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((p: any) => {
      const cam = p.campaign
      if (!cam || cam.status !== 'active') return false
      if (cam.starts_at && cam.starts_at > now) return false
      if (cam.ends_at && cam.ends_at < now) return false
      return true
    })

  return (
    <main
      style={{ '--brand': creator.brand_color } as React.CSSProperties}
      className="min-h-screen bg-white text-zinc-900 pb-16"
    >
      {/* Track page view */}
      {pageId && <ViewTracker pageId={pageId} promptId={prompt.id} creatorId={creator.id} />}

      {/* Sticky creator header */}
      {/* <CreatorBar creator={creator} /> */}

      {/* Instagram Profile Header */}
      {igUser && <InstagramProfile user={igUser} creator={creator} />}

      {/* Media Section (Post or Embed) */}
      <div className="w-full mt-8">
        {igMedia ? (
          <div className="max-w-2xl mx-auto px-4">
            <InstagramPost media={igMedia} />
          </div>
        ) : (prompt.embed_html || prompt.video_url) ? (
          <div className="max-w-2xl mx-auto px-4">
            <VideoEmbed
              html={prompt.embed_html || oEmbedHtml}
              fallbackThumbnail={prompt.thumbnail_url}
              url={prompt.video_url}
            />
          </div>
        ) : null}
      </div>

      <section className="max-w-2xl mx-auto px-4 pt-8">
        {/* Title & tags */}
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 mb-4 leading-tight">
          {prompt.title}
        </h1>
        <div className="flex flex-wrap gap-2 mb-6">
          <span
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
            style={{ background: `${toolColor}11`, color: toolColor, border: `1px solid ${toolColor}33` }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: toolColor }} />
            {prompt.ai_tool}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 text-zinc-600 border border-zinc-200 shadow-sm">
            {prompt.output_type}
          </span>
        </div>
        {prompt.description && (
          <p className="text-zinc-600 text-base leading-relaxed mb-8">{prompt.description}</p>
        )}

        {/* Ad: Above Gate */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {placements.some((p: any) => p.position === 'above_gate') && (
          <div className="mb-6">
            <AdBanner placements={placements} position="above_gate" promptId={prompt.id} creatorId={creator.id} />
          </div>
        )}

        {/* Gate */}
        <PromptGate prompt={prompt} />

        {/* Ad: Below Gate */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {placements.some((p: any) => p.position === 'below_gate') && (
          <div className="mt-6">
            <AdBanner placements={placements} position="below_gate" promptId={prompt.id} creatorId={creator.id} />
          </div>
        )}
      </section>

      {/* Render Feed Grid with "Show More" functionality */}
      {igFeed.length > 0 && (
        <div className="w-full mt-8">
          <InstagramFeed feed={igFeed} excludeId={igMedia?.id} />
        </div>
      )}


      {/* Ad: Below Video */}

      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      {placements.some((p: any) => p.position === 'below_video') && (
        <div className="max-w-2xl mx-auto px-4 mt-8">
          <AdBanner placements={placements} position="below_video" promptId={prompt.id} creatorId={creator.id} />
        </div>
      )}

      {/* Prompt content */}


      {/* Related prompts */}
      {related && related.length > 0 && (
        <RelatedPrompts prompts={related} subdomain={subdomain} />
      )}
    </main>
  )
}
