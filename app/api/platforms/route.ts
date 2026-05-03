import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { Creator } from '@/types'

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
  const creators = await Promise.all(
    rawCreators.map(async (c: any) => {
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

  return NextResponse.json({
    categories: categoriesRes.data || [],
    creators,
    prompts: promptsRes.data || []
  })
}
