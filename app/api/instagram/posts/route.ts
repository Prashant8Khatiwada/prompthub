import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { decrypt } from '@/lib/crypto'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const after = searchParams.get('after')

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    console.log(`[API] Fetching Instagram posts for admin user: ${user.id}`)
    
    // 1. Get encrypted token from DB
    const { data: tokenData, error: dbError } = await adminClient
      .from('creator_instagram_tokens')
      .select('*')
      .eq('creator_id', user.id)
      .single()

    if (dbError || !tokenData) {
      console.log(`[API] No Instagram connection found for ${user.id}`)
      return NextResponse.json({ connected: false }, { status: 404 })
    }

    // 2. Decrypt token
    const token = decrypt(tokenData.encrypted_token, tokenData.iv)

    // 3. Fetch media from Instagram
    const igId = tokenData.instagram_user_id
    const fields = 'id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count,comments_count'
    
    console.log(`[API] Requesting Business API for ID: ${igId}`)
    const igRes = await fetch(`https://graph.facebook.com/v19.0/${igId}/media?fields=${fields}&limit=12&access_token=${token}${after ? `&after=${after}` : ''}`)
    
    let igData = await igRes.json()

    if (igData.error) {
      console.error(`[API] Business API Error:`, igData.error)
      
      // Fallback to graph.instagram.com/me
      console.log(`[API] Retrying with Basic API fallback...`)
      const fallbackRes = await fetch(`https://graph.instagram.com/me/media?fields=${fields}&limit=12&access_token=${token}${after ? `&after=${after}` : ''}`)
      igData = await fallbackRes.json()
      
      if (igData.error) {
        throw new Error(igData.error.message)
      }
    }

    return NextResponse.json({
      posts: igData.data,
      paging: igData.paging,
    })
  } catch (error: any) {
    console.error('[API] Fetch Instagram Posts Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
