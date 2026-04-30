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
import PublicProfileTabs from '@/components/public/PublicProfileTabs'
import InstagramView from '@/components/public/InstagramView'

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
  const rawBaseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'prompthub.app'
  const baseDomain = rawBaseDomain.replace(/^https?:\/\//, '')

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

import EnhancedPublicPromptUI from '@/components/public/EnhancedPublicPromptUI'

export default async function PublicPromptPage({ params }: Params) {
  const { subdomain, slug } = await params
  const supabase = await createClient()

  // 1. Fetch creator by subdomain
  const { data: creator } = await supabase
    .from('creators').select('*').eq('subdomain', subdomain).single()
  if (!creator) notFound()

  // 2. Fetch published prompt
  const { data: prompt, error: promptError } = await supabase
    .from('prompts').select('*')
    .eq('creator_id', creator.id)
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (promptError || !prompt) {
    console.error('PROMPT FETCH ERROR:', { subdomain, slug, error: promptError })
    notFound()
  }

  console.log('PROMPT FETCHED:', { id: prompt.id, title: prompt.title, gate_type: prompt.gate_type })

  // 3. Fetch related prompts (up to 3, excluding current)
  const { data: related } = await supabase
    .from('prompts')
    .select('id,title,slug,ai_tool,output_type,thumbnail_url')
    .eq('creator_id', creator.id)
    .eq('status', 'published')
    .neq('id', prompt.id)
    .limit(3)

  const isRawHtml = !!prompt.embed_html || prompt.video_url?.trim().startsWith('<')
  const oEmbedHtml = prompt.embed_html || (prompt.video_url?.trim().startsWith('<') 
    ? prompt.video_url 
    : (prompt.video_url ? await fetchInstagramOEmbed(prompt.video_url) : null))

  console.log({ oEmbedHtml, videoUrl: prompt.video_url, isRawHtml })

  // 5b. Fetch Rich Instagram Data for native rendering
  const igMedia = (prompt.video_url && !isRawHtml)
    ? await fetchInstagramMedia(prompt.video_url, creator.id)
    : null

  // 5c. Fetch User and Feed Data
  const igUser = await fetchInstagramUser(creator.id)
  const igFeed = await fetchInstagramFeed(creator.id)

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
  const now = new Date().toISOString()
  const filters = [
    `prompt_id.eq.${prompt.id}`,
    `is_global.eq.true`
  ]
  if (prompt.category_id) {
    filters.push(`category_id.eq.${prompt.category_id}`)
  }

  const { data: rawPlacements } = await adminClient
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

  console.log('PLACEMENTS LOADED:', placements.length)

  return (
    <main
      style={{ '--brand': creator.brand_color } as React.CSSProperties}
      className="min-h-screen bg-zinc-950 text-white"
    >
      <ViewTracker pageId={prompt.id} promptId={prompt.id} creatorId={creator.id} />

      <EnhancedPublicPromptUI
        creator={creator}
        prompt={prompt}
        igUser={igUser}
        igMedia={igMedia}
        igFeed={igFeed}
        relatedData={related ?? []}
        adAbovePrompt={
          placements.some((p: any) => p.position === 'above_prompt') && (
            <AdBanner placements={placements} position="above_prompt" promptId={prompt.id} creatorId={creator.id} />
          )
        }
        adBelowPrompt={
          placements.some((p: any) => p.position === 'below_prompt') && (
            <AdBanner placements={placements} position="below_prompt" promptId={prompt.id} creatorId={creator.id} />
          )
        }
        adPopupPlacements={placements.filter((p: any) => p.position === 'popup')}
        oEmbedHtml={oEmbedHtml}
      />
    </main>
  )
}

