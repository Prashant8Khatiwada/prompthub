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
    // 1. Get encrypted token from DB
    const { data: tokenData, error: dbError } = await adminClient
      .from('creator_instagram_tokens')
      .select('*')
      .eq('creator_id', user.id)
      .single()

    if (dbError || !tokenData) {
      return NextResponse.json({ connected: false }, { status: 404 })
    }

    // 2. Decrypt token
    const token = decrypt(tokenData.encrypted_token, tokenData.iv)

    // 3. Fetch media from Instagram using the specific Business ID
    const igId = tokenData.instagram_user_id
    const igUrl = new URL(`https://graph.facebook.com/v22.0/${igId}/media`)
    igUrl.searchParams.set('fields', 'id,media_type,media_url,thumbnail_url,caption,permalink,timestamp,like_count,comments_count')
    igUrl.searchParams.set('access_token', token)
    igUrl.searchParams.set('limit', '12')
    if (after) igUrl.searchParams.set('after', after)

    const igRes = await fetch(igUrl.toString())
    const igData = await igRes.json()

    if (igData.error) {
      throw new Error(igData.error.message)
    }

    return NextResponse.json({
      posts: igData.data,
      paging: igData.paging,
    })
  } catch (error: any) {
    console.error('Fetch Instagram Posts Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
