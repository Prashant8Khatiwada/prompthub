import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { fetchInstagramUser, fetchInstagramFeed } from '@/lib/instagram'
import UserProfilePageClient from '@/components/public/UserProfilePageClient'
import { adminClient } from '@/lib/supabase/admin'
import { AdPlacementData } from '@/components/public/AdBanner'
import { headers } from 'next/headers'
import CreatopediaLanding from '@/components/public/CreatopediaLanding'
import { getBaseDomain } from '@/lib/constants'
import { transformCdnUrls } from '@/lib/cdn'

// Prompt details page imports
import { fetchInstagramOEmbed } from '@/lib/oembed'
import ViewTracker from '@/components/public/ViewTracker'
import AdBanner from '@/components/public/AdBanner'
import { fetchInstagramMedia } from '@/lib/instagram'
import EnhancedPublicPromptUI from '@/components/public/EnhancedPublicPromptUI'
import { getCachedPrompt, getCachedRelatedPrompts, RelatedPromptType } from '@/lib/data/public-prompts'
import { Prompt } from '@/types'
// ISR: cache at edge for 60s, revalidate in background.
// force-dynamic / revalidate=0 caused cold DB+Instagram hits on every request,
// which can exceed TikTok's in-app browser timeout and show a blank/error page.
export const revalidate = 60

interface Params {
  params: Promise<{ subdomain: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subdomain: pathParam } = await params
  const supabase = adminClient // Use admin client to ensure we can always fetch metadata regardless of RLS

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || ''
  const hostWithoutPort = host.split(':')[0]
  const baseDomain = getBaseDomain(hostWithoutPort)

  const isLocalSubdomain = hostWithoutPort.endsWith('.localhost')
  const isSubdomainHost = (hostWithoutPort !== baseDomain && hostWithoutPort.endsWith(`.${baseDomain}`)) || isLocalSubdomain

  let actualCreatorSubdomain = pathParam
  let promptSlug: string | null = null

  if (isSubdomainHost) {
    actualCreatorSubdomain = isLocalSubdomain
      ? hostWithoutPort.replace('.localhost', '')
      : hostWithoutPort.replace(`.${baseDomain}`, '')

    if (pathParam && pathParam !== actualCreatorSubdomain) {
      promptSlug = pathParam
    }
  }

  // Find creator by actual subdomain OR handle
  const { data: creator } = await supabase
    .from('creators')
    .select('id, name, handle, bio, avatar_url, subdomain')
    .or(`subdomain.eq.${actualCreatorSubdomain},handle.eq.${actualCreatorSubdomain}`)
    .single()

  if (!creator) {
    if (isSubdomainHost && !promptSlug) {
      return {
        title: 'Creatopedia | Where Creators Lead, World Follows',
        description: 'Join early access for Creatopedia. One platform for every creator niche. Videos, PDFs, tutorials, and paid content curated directly for audiences.',
      }
    }
    return { title: 'Not Found' }
  }

  // ─── MODE A: PROMPT METADATA ───
  if (promptSlug) {
    const { data: prompt } = await supabase
      .from('prompts')
      .select('title,description,thumbnail_url,share_image_url,ai_tool')
      .eq('slug', promptSlug)
      .eq('status', 'published')
      .single()

    if (!prompt) return { title: 'Not Found' }

    const title = `${prompt.title} | ${creator.name}`
    const description = prompt.description ?? `Check out this ${prompt.ai_tool} prompt by ${creator.name}.`
    const shareUrl = `https://${creator.subdomain}.${baseDomain}/${promptSlug}`

    let ogImageUrl = prompt.share_image_url || prompt.thumbnail_url
    if (!ogImageUrl) {
      ogImageUrl = `https://${creator.subdomain}.${baseDomain}/${promptSlug}/opengraph-image`
    } else if (!ogImageUrl.startsWith('http')) {
      ogImageUrl = `https://${baseDomain}${ogImageUrl.startsWith('/') ? '' : '/'}${ogImageUrl}`
    }

    return {
      title,
      description,
      alternates: { canonical: shareUrl },
      openGraph: {
        title,
        description,
        url: shareUrl,
        siteName: 'Creatopedia',
        locale: 'en_US',
        type: 'article',
        authors: [creator.name],
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title, type: 'image/png' }],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
        creator: creator.handle || `@${creator.subdomain}`,
      },
    }
  }

  // ─── MODE B: CREATOR PROFILE METADATA ───
  const igUser = await fetchInstagramUser(creator.id)
  const avatarUrl = creator.avatar_url || igUser?.profile_picture_url
  const shareUrl = `https://${creator.subdomain}.${baseDomain}`

  return {
    title: `${creator.name} – Creatopedia`,
    description: creator.bio ?? `Browse AI prompts by ${creator.name} on Creatopedia.`,
    alternates: {
      canonical: shareUrl,
    },
    openGraph: {
      title: `${creator.name} on Creatopedia`,
      description: creator.bio ?? `Browse AI prompts by ${creator.name}.`,
      images: avatarUrl ? [
        {
          url: avatarUrl,
          width: 400,
          height: 400,
          alt: creator.name,
          type: 'image/jpeg',
        }
      ] : [],
      type: 'profile',
      url: shareUrl,
    },
    twitter: {
      card: 'summary',
      title: `${creator.name} on Creatopedia`,
      description: creator.bio ?? `Browse AI prompts by ${creator.name}.`,
      images: avatarUrl ? [avatarUrl] : [],
    },
  }
}

export default async function UserProfilePage({ params }: Params) {
  const { subdomain: pathParam } = await params
  const supabase = adminClient

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || ''
  const hostWithoutPort = host.split(':')[0]
  const baseDomain = getBaseDomain(hostWithoutPort)

  const isLocalSubdomain = hostWithoutPort.endsWith('.localhost')
  const isSubdomainHost = (hostWithoutPort !== baseDomain && hostWithoutPort.endsWith(`.${baseDomain}`)) || isLocalSubdomain

  let actualCreatorSubdomain = pathParam
  let promptSlug: string | null = null

  // If we are on a creator subdomain (e.g. milan.creatopedia.tech/hairstyle)
  // Then the actual creator is 'milan' (from host) and the pathParam ('hairstyle') is the prompt slug!
  if (isSubdomainHost) {
    actualCreatorSubdomain = isLocalSubdomain
      ? hostWithoutPort.replace('.localhost', '')
      : hostWithoutPort.replace(`.${baseDomain}`, '')

    // Only treat pathParam as a slug if it is NOT the same as the creator subdomain
    // (e.g. milan.creatopedia.tech/milan shouldn't treat 'milan' as a prompt)
    if (pathParam && pathParam !== actualCreatorSubdomain) {
      promptSlug = pathParam
    }
  }

  // 1. Find creator by actual subdomain OR handle
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .or(`subdomain.eq.${actualCreatorSubdomain},handle.eq.${actualCreatorSubdomain}`)
    .single()

  if (!creator) {
    if (isSubdomainHost && !promptSlug) {
      return <CreatopediaLanding />
    }
    notFound()
  }

  // ─── MODE A: RENDER PROMPT DETAIL PAGE (If promptSlug is present) ───
  if (promptSlug) {
    // Query Supabase directly to bypass unstable_cache issues in production
    const { data: prompt } = await supabase
      .from('prompts')
      .select('*')
      .eq('creator_id', creator.id)
      .eq('slug', promptSlug)
      .eq('status', 'published')
      .single()

    if (!prompt) notFound()

    const transformedPrompt = transformCdnUrls(prompt) as Prompt

    // Query related prompts directly
    const { data: rawRelated } = await supabase
      .from('prompts')
      .select('id,title,slug,ai_tool,output_type,thumbnail_url')
      .eq('creator_id', creator.id)
      .eq('status', 'published')
      .neq('id', prompt.id)
      .limit(3)
    const related = transformCdnUrls(rawRelated || []) as RelatedPromptType[]

    const isRawHtml = !!transformedPrompt.embed_html || transformedPrompt.video_url?.trim().startsWith('<')
    const oEmbedHtml = transformedPrompt.embed_html || (transformedPrompt.video_url?.trim().startsWith('<')
      ? transformedPrompt.video_url
      : (transformedPrompt.video_url ? await fetchInstagramOEmbed(transformedPrompt.video_url) : null))

    const igMedia = (transformedPrompt.video_url && !isRawHtml)
      ? await fetchInstagramMedia(transformedPrompt.video_url, creator.id)
      : null

    const igUser = await fetchInstagramUser(creator.id)
    const igFeed = await fetchInstagramFeed(creator.id)

    const now = new Date().toISOString()
    const filters = [`prompt_id.eq.${transformedPrompt.id}`, `is_global.eq.true`]
    if (transformedPrompt.category_id) {
      filters.push(`category_id.eq.${transformedPrompt.category_id}`)
    }

    const { data: rawPlacements } = await adminClient
      .from('ad_placements')
      .select('id, position, is_global, prompt_id, category_id, creator_id, campaign:ad_campaigns(*)')
      .eq('creator_id', creator.id)
      .or(filters.join(','))

    const placements: AdPlacementData[] = (rawPlacements ?? [])
      .map((p) => ({
        ...p,
        campaign: Array.isArray(p.campaign) ? p.campaign[0] : p.campaign
      }))
      .filter((p) => {
        const cam = p.campaign
        if (!cam || cam.status !== 'active') return false
        if (cam.starts_at && cam.starts_at > now) return false
        if (cam.ends_at && cam.ends_at < now) return false
        return true
      }) as AdPlacementData[]

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: transformedPrompt.title,
      description: transformedPrompt.description,
      image: transformedPrompt.thumbnail_url || transformedPrompt.share_image_url || `https://${creator.subdomain}.${baseDomain}/${transformedPrompt.slug}/opengraph-image`,
      author: {
        '@type': 'Person',
        name: creator.name,
        url: `https://${creator.subdomain}.${baseDomain}`
      },
      publisher: {
        '@type': 'Organization',
        name: 'Creatopedia',
        url: `https://${baseDomain}`
      }
    }

    return (
      <main
        style={{ '--brand': creator.brand_color } as React.CSSProperties}
        className="min-h-screen bg-zinc-950 text-white"
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ViewTracker key={`tracker-${transformedPrompt.id}`} pageId={transformedPrompt.id} promptId={transformedPrompt.id} creatorId={creator.id} />

        <EnhancedPublicPromptUI
          key={transformedPrompt.id}
          creator={creator}
          prompt={transformedPrompt}
          igUser={igUser}
          igMedia={igMedia}
          igFeed={igFeed}
          relatedData={related ?? []}
          adHero={
            placements.some((p: AdPlacementData) => p.position === 'above_media') && (
              <AdBanner placements={placements} position="above_media" promptId={transformedPrompt.id} creatorId={creator.id} />
            )
          }
          adAbovePrompt={
            placements.some((p: AdPlacementData) => p.position === 'above_prompt') && (
              <AdBanner placements={placements} position="above_prompt" promptId={transformedPrompt.id} creatorId={creator.id} />
            )
          }
          adBelowPrompt={
            placements.some((p: AdPlacementData) => p.position === 'below_prompt') && (
              <AdBanner placements={placements} position="below_prompt" promptId={transformedPrompt.id} creatorId={creator.id} />
            )
          }
          adPopupPlacements={placements.filter((p: AdPlacementData) => p.position === 'popup')}
          oEmbedHtml={oEmbedHtml}
        />
      </main>
    )
  }

  // ─── MODE B: RENDER CREATOR PROFILE PAGE (If no promptSlug) ───
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*, categories(name)')
    .eq('creator_id', creator.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  const transformedPrompts = transformCdnUrls(prompts || [])

  const categoryIds = [
    ...new Set((prompts ?? []).map((p) => p.category_id).filter(Boolean)),
  ]

  const { data: categories } = categoryIds.length > 0
    ? await supabase
      .from('categories')
      .select('*')
      .in('id', categoryIds)
      .order('name')
    : { data: [] }

  const [igUser, igFeed] = await Promise.all([
    fetchInstagramUser(creator.id),
    fetchInstagramFeed(creator.id),
  ])

  const now = new Date().toISOString()
  const { data: rawPlacements } = await adminClient
    .from('ad_placements')
    .select('id, position, is_global, creator_id, campaign:ad_campaigns(*)')
    .eq('creator_id', creator.id)
    .or(`position.eq.creator_page,position.eq.discovery_header_banner,position.like.discovery_slot_%`)

  const placements: AdPlacementData[] = (rawPlacements ?? [])
    .map((p) => ({
      ...p,
      campaign: Array.isArray(p.campaign) ? p.campaign[0] : p.campaign
    }))
    .filter((p) => {
      const cam = p.campaign
      if (!cam || cam.status !== 'active') return false
      if (cam.starts_at && cam.starts_at > now) return false
      if (cam.ends_at && cam.ends_at < now) return false
      return true
    }) as AdPlacementData[]

  const isSubdomain = hostWithoutPort.startsWith(`${creator.subdomain}.`) || hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1'

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    mainEntity: {
      '@type': 'Person',
      name: creator.name,
      alternateName: creator.handle || creator.subdomain,
      description: creator.bio,
      image: creator.avatar_url || igUser?.profile_picture_url || '',
      url: `https://${creator.subdomain}.${baseDomain}`,
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0a]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <UserProfilePageClient
        creator={creator}
        igUser={igUser}
        igFeed={igFeed}
        categories={categories ?? []}
        prompts={transformedPrompts}
        adPlacements={placements}
        isSubdomain={isSubdomain}
      />
    </main>
  )
}
