import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { fetchInstagramOEmbed } from '@/lib/oembed'
import { adminClient } from '@/lib/supabase/admin'
import ViewTracker from '@/components/public/ViewTracker'
import AdBanner from '@/components/public/AdBanner'
import { fetchInstagramMedia, fetchInstagramUser, fetchInstagramFeed } from '@/lib/instagram'
import { AdPlacementPosition } from '@/types'
import { AdPlacementData } from '@/components/public/AdBanner'

export const revalidate = 3600 // 1 hour

interface Params {
  params: Promise<{ subdomain: string; slug: string }>
}

interface AdPlacement extends Omit<AdPlacementData, 'position'> {
  position: AdPlacementPosition
  category_id?: string | null
  campaign: AdPlacementData['campaign'] & {
    starts_at?: string | null
    ends_at?: string | null
  }
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
  const rawBaseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'creatopedia.tech'
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

import { getCachedCreator, getCachedPrompt, getCachedRelatedPrompts } from '@/lib/data/public-prompts'

export default async function PublicPromptPage({ params }: Params) {
  const { subdomain, slug } = await params

  // 1. Fetch creator by subdomain (Cached)
  const creator = await getCachedCreator(subdomain)
  if (!creator) notFound()

  // 2. Fetch published prompt (Cached)
  const prompt = await getCachedPrompt(creator.id, slug)
  if (!prompt) notFound()

  console.log('PROMPT FETCHED (Possibly Cached):', { id: prompt.id, title: prompt.title })

  // 3. Fetch related prompts (Cached)
  const related = await getCachedRelatedPrompts(creator.id, prompt.id)

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
      creator_id,
      campaign:ad_campaigns(*)
    `)
    .or(filters.join(','))

  const placements: AdPlacement[] = (rawPlacements ?? [])
    .map((p) => {
      const raw = p
      return {
        ...raw,
        campaign: Array.isArray(raw.campaign) ? raw.campaign[0] : raw.campaign
      } as AdPlacement
    })
    .filter((p) => {
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
          placements.some((p: AdPlacement) => p.position === 'above_prompt') && (
            <AdBanner placements={placements} position="above_prompt" promptId={prompt.id} creatorId={creator.id} />
          )
        }
        adBelowPrompt={
          placements.some((p: AdPlacement) => p.position === 'below_prompt') && (
            <AdBanner placements={placements} position="below_prompt" promptId={prompt.id} creatorId={creator.id} />
          )
        }
        adPopupPlacements={placements.filter((p: AdPlacement) => p.position === 'popup')}
        oEmbedHtml={oEmbedHtml}
      />
    </main>
  )
}

