import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { fetchInstagramUser, fetchInstagramFeed } from '@/lib/instagram'
import UserProfilePageClient from '@/components/public/UserProfilePageClient'
import { adminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'
export const revalidate = 0

interface Params {
  params: Promise<{ subdomain: string }>
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { subdomain } = await params
  const supabase = await createClient()

  // Find creator by subdomain OR handle
  const { data: creator } = await supabase
    .from('creators')
    .select('name, handle, bio, avatar_url, subdomain')
    .or(`subdomain.eq.${subdomain},handle.eq.${subdomain}`)
    .single()

  if (!creator) return { title: 'Creator Not Found' }

  const rawBaseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'prompthub.app'
  const baseDomain = rawBaseDomain.replace(/^https?:\/\//, '')

  return {
    title: `${creator.name} – PromptHub`,
    description: creator.bio ?? `Browse AI prompts by ${creator.name} on PromptHub.`,
    openGraph: {
      title: `${creator.name} on PromptHub`,
      description: creator.bio ?? `Browse AI prompts by ${creator.name}.`,
      images: creator.avatar_url ? [{ url: creator.avatar_url }] : [],
      type: 'profile',
      url: `https://${baseDomain}/${creator.handle || creator.subdomain}`,
    },
    twitter: {
      card: 'summary',
      title: `${creator.name} on PromptHub`,
      description: creator.bio ?? `Browse AI prompts by ${creator.name}.`,
      images: creator.avatar_url ? [creator.avatar_url] : [],
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

  if (!creator) notFound()

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
    .select('id, position, is_global, campaign:ad_campaigns(*)')
    .eq('position', 'creator_page')
    .or(`is_global.eq.true,creator_id.eq.${creator.id}`) // Assuming placements might be specific to creator

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
    <main className="min-h-screen bg-[#0a0a0a]">
      <UserProfilePageClient
        creator={creator}
        igUser={igUser}
        igFeed={igFeed}
        categories={categories ?? []}
        prompts={prompts ?? []}
        adPlacements={placements}
      />
    </main>
  )
}
