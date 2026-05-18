import type { Metadata } from 'next'
import { fetchInstagramUser, fetchInstagramFeed } from '@/lib/instagram'
import UserProfilePageClient from '@/components/public/UserProfilePageClient'
import { adminClient } from '@/lib/supabase/admin'
import { AdCampaign } from '@/types'
import { AdPlacementData } from '@/components/public/AdBanner'
import { headers } from 'next/headers'
import CreatopediaLanding from '@/components/public/CreatopediaLanding'
import { getBaseDomain } from '@/lib/constants'

export const revalidate = 60

// Dynamic metadata generation for root path '/'
export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || ''
  const hostWithoutPort = host.split(':')[0]
  const baseDomain = getBaseDomain(hostWithoutPort)

  const isLocalSubdomain = hostWithoutPort.endsWith('.localhost')
  const isSubdomainHost = (hostWithoutPort !== baseDomain && hostWithoutPort.endsWith(`.${baseDomain}`)) || isLocalSubdomain

  if (isSubdomainHost) {
    // Extract subdomain
    const subdomain = isLocalSubdomain
      ? hostWithoutPort.replace('.localhost', '')
      : hostWithoutPort.replace(`.${baseDomain}`, '')

    if (subdomain && subdomain !== 'www' && subdomain !== 'admin' && subdomain !== 'api') {
      const { data: creator } = await adminClient
        .from('creators')
        .select('id, name, handle, bio, avatar_url, subdomain')
        .eq('subdomain', subdomain)
        .single()

      if (creator) {
        const igUser = await fetchInstagramUser(creator.id)
        const avatarUrl = creator.avatar_url || igUser?.profile_picture_url
        const shareUrl = `https://${creator.subdomain}.${baseDomain}`

        return {
          title: `${creator.name} – Creatopedia`,
          description: creator.bio ?? `Browse AI prompts by ${creator.name} on Creatopedia.`,
          alternates: { canonical: shareUrl },
          openGraph: {
            title: `${creator.name} on Creatopedia`,
            description: creator.bio ?? `Browse AI prompts by ${creator.name}.`,
            images: avatarUrl ? [{ url: avatarUrl, width: 400, height: 400, alt: creator.name, type: 'image/jpeg' }] : [],
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
    }
  }

  // Default homepage metadata
  return {
    title: 'Creatopedia | Where Creators Lead, World Follows',
    description: 'Join early access for Creatopedia. One platform for every creator niche. Videos, PDFs, tutorials, and paid content curated directly for audiences.',
  }
}

export default async function LandingPage() {
  const headerList = await headers()
  const host = headerList.get('x-forwarded-host') || headerList.get('host') || ''
  const hostWithoutPort = host.split(':')[0]
  const baseDomain = getBaseDomain(hostWithoutPort)

  const isLocalSubdomain = hostWithoutPort.endsWith('.localhost')
  const isSubdomainHost = (hostWithoutPort !== baseDomain && hostWithoutPort.endsWith(`.${baseDomain}`)) || isLocalSubdomain

  if (isSubdomainHost) {
    const subdomain = isLocalSubdomain
      ? hostWithoutPort.replace('.localhost', '')
      : hostWithoutPort.replace(`.${baseDomain}`, '')

    if (subdomain && subdomain !== 'www' && subdomain !== 'admin' && subdomain !== 'api') {
      // FIX: Use adminClient to bypass RLS for public anonymous reads in production
      const supabase = adminClient
      const { data: creator } = await supabase
        .from('creators')
        .select('*')
        .eq('subdomain', subdomain)
        .single()

      if (creator) {
        // Fetch all published prompts for this creator
        const { data: prompts } = await supabase
          .from('prompts')
          .select('*, categories(name)')
          .eq('creator_id', creator.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        // Fetch all categories that have published prompts from this creator
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

        // Fetch Instagram data
        const [igUser, igFeed] = await Promise.all([
          fetchInstagramUser(creator.id),
          fetchInstagramFeed(creator.id),
        ])

        // Fetch ad placements
        const now = new Date().toISOString()
        const { data: rawPlacements } = await adminClient
          .from('ad_placements')
          .select('id, position, is_global, creator_id, campaign:ad_campaigns(*)')
          .eq('creator_id', creator.id)
          .or(`position.eq.creator_page,position.eq.discovery_header_banner,position.like.discovery_slot_%`)

        const placements: AdPlacementData[] = (rawPlacements ?? [])
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          .map((p: any) => {
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

        const isSubdomain = true

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
    }
  }

  return <CreatopediaLanding />
}
