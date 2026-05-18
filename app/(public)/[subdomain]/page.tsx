import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { fetchInstagramUser, fetchInstagramFeed } from '@/lib/instagram'
import UserProfilePageClient from '@/components/public/UserProfilePageClient'
import { adminClient } from '@/lib/supabase/admin'
import { AdCampaign } from '@/types'
import { AdPlacementData } from '@/components/public/AdBanner'
import { headers } from 'next/headers'
import CreatopediaLanding from '@/components/public/CreatopediaLanding'
import { getBaseDomain } from '@/lib/constants'

// ISR: cache at edge for 60s, revalidate in background.
// force-dynamic / revalidate=0 caused cold DB+Instagram hits on every request,
// which can exceed TikTok's in-app browser timeout and show a blank/error page.
export const revalidate = 60

interface Params {
  params: Promise<{ subdomain: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subdomain } = await params
  const supabase = adminClient // Use admin client to ensure we can always fetch metadata regardless of RLS

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || ''
  const hostWithoutPort = host.split(':')[0]
  const baseDomain = getBaseDomain(hostWithoutPort)

  // Find creator by subdomain OR handle
  const { data: creator } = await supabase
    .from('creators')
    .select('id, name, handle, bio, avatar_url, subdomain')
    .or(`subdomain.eq.${subdomain},handle.eq.${subdomain}`)
    .single()

  if (!creator) {
    const isLocalSubdomain = hostWithoutPort.endsWith('.localhost')
    const isSubdomainHost = (hostWithoutPort !== baseDomain && hostWithoutPort.endsWith(`.${baseDomain}`)) || isLocalSubdomain

    if (isSubdomainHost) {
      return {
        title: 'Creatopedia | Where Creators Lead, World Follows',
        description: 'Join early access for Creatopedia. One platform for every creator niche. Videos, PDFs, tutorials, and paid content curated directly for audiences.',
      }
    }
    return { title: 'Creator Not Found' }
  }

  // Fetch Instagram data for avatar fallback
  const igUser = await fetchInstagramUser(creator.id)
  const avatarUrl = creator.avatar_url || igUser?.profile_picture_url

  // Primary URL - Prefer SUBDOMAIN format for maximum compatibility with social platforms as per Independent Subdomain Architecture
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
          type: 'image/jpeg', // Standard for profile pics
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
  const { subdomain } = await params
  const supabase = await createClient()

  // 1. Find creator by subdomain OR handle
  const { data: creator } = await supabase
    .from('creators')
    .select('*')
    .or(`subdomain.eq.${subdomain},handle.eq.${subdomain}`)
    .single()

  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || ''
  const hostWithoutPort = host.split(':')[0]
  const baseDomain = getBaseDomain(hostWithoutPort)

  const isLocalSubdomain = hostWithoutPort.endsWith('.localhost')
  const isSubdomainHost = (hostWithoutPort !== baseDomain && hostWithoutPort.endsWith(`.${baseDomain}`)) || isLocalSubdomain

  if (!creator) {
    if (isSubdomainHost) {
      return <CreatopediaLanding />
    }
    notFound()
  }

  // 2. Fetch all published prompts for this creator
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*, categories(name)')
    .eq('creator_id', creator.id)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  // 3. Fetch all categories that have published prompts from this creator
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

  // 4. Fetch Instagram data
  const [igUser, igFeed] = await Promise.all([
    fetchInstagramUser(creator.id),
    fetchInstagramFeed(creator.id),
  ])

  // 5. Fetch ad placements
  const now = new Date().toISOString()
  const { data: rawPlacements } = await adminClient
    .from('ad_placements')
    .select('id, position, is_global, creator_id, campaign:ad_campaigns(*)')
    .eq('creator_id', creator.id)
    .or(`position.eq.creator_page,position.eq.discovery_header_banner,position.like.discovery_slot_%`)

  const placements: AdPlacementData[] = (rawPlacements ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .map((p: any) => {
      // Supabase join might return an array or object
      const campaign = Array.isArray(p.campaign) ? p.campaign[0] : p.campaign
      return {
        ...p,
        campaign: campaign as AdCampaign
      }
    })
    .filter((p) => {
      const cam = p.campaign
      if (!cam || cam.status !== 'active') return false
      if (cam.starts_at && cam.starts_at > now) return false
      if (cam.ends_at && cam.ends_at < now) return false
      return true
    })

  const isSubdomain = hostWithoutPort.startsWith(`${creator.subdomain}.`) || hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1'

  // Generate JSON-LD Structured Data for Trust
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
        prompts={prompts ?? []}
        adPlacements={placements}
        isSubdomain={isSubdomain}
      />
    </main>
  )
}
