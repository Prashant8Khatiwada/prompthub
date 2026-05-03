import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [categoriesRes, creatorsRes, promptsRes] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('creators').select('*'),
    supabase.from('prompts').select('*').eq('status', 'published')
  ])

  // Fix null avatar_url directly in API
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawCreators = creatorsRes.data || []

  // Fetch igFeed per creator to get live Instagram thumbnails
  const igFeedByCreator: Record<string, Record<string, string>> = {}
  await Promise.all(
    rawCreators.map(async (c: { id: string; avatar_url?: string | null }) => {
      try {
        const { fetchInstagramFeed } = await import('@/lib/instagram')
        const feed = await fetchInstagramFeed(c.id)
        const map: Record<string, string> = {}
        for (const m of feed) {
          if (m.permalink) {
            const displayUrl = m.media_type === 'VIDEO' ? (m.thumbnail_url || m.media_url) : m.media_url
            if (displayUrl) map[m.permalink] = displayUrl
          }
        }
        igFeedByCreator[c.id] = map
      } catch {
        igFeedByCreator[c.id] = {}
      }
    })
  )

  const creators = await Promise.all(
    rawCreators.map(async (c: { id: string, avatar_url?: string | null }) => {
      if (c.avatar_url) {
        return c
      }
      try {
        const { fetchInstagramUser } = await import('@/lib/instagram')
        const igUser = await fetchInstagramUser(c.id)
        if (igUser?.profile_picture_url) {
          return { ...c, avatar_url: igUser.profile_picture_url }
        }
      } catch (e) {
        console.error('Failed to fetch fallback instagram picture', e)
      }
      return {
        ...c,
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
      }
    })
  )

  // Attach ig_thumbnail_url to each prompt
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const prompts = (promptsRes.data || []).map((p: any) => {
    const feedMap = igFeedByCreator[p.creator_id] || {}
    const igThumb = p.video_url ? feedMap[p.video_url] : null
    return { ...p, ig_thumbnail_url: igThumb || null }
  })

  return NextResponse.json({
    categories: categoriesRes.data || [],
    creators,
    prompts
  }, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
    }
  })
}
