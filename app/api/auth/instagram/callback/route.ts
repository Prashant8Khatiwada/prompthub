import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { encrypt } from '@/lib/crypto'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')

  if (errorParam) {
    return NextResponse.redirect(new URL(`/admin/settings?error=${encodeURIComponent(errorParam)}`, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/admin/settings?error=no_code', request.url))
  }

  // Instagram Login for Business uses its own Client ID + Secret
  const clientId = process.env.INSTAGRAM_CLIENT_ID        // 1844374976242880
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET // Instagram App Secret
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI  // https://zip.fotosfolio.com/api/auth/instagram/callback

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(new URL('/admin/settings?error=instagram_not_configured', request.url))
  }

  try {
    // Step 1: Exchange code for short-lived token
    // Instagram Login uses a POST to api.instagram.com, NOT a GET to graph.facebook.com
    const tokenRes = await fetch('https://api.instagram.com/oauth/access_token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code,
      }),
    })

    const tokenData = await tokenRes.json()
    if (tokenData.error_type || tokenData.error_message) {
      throw new Error(tokenData.error_message || 'Token exchange failed')
    }

    const shortLivedToken = tokenData.access_token
    const instagramUserId = String(tokenData.user_id)

    // Step 2: Exchange short-lived token for a long-lived token (60 days)
    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&access_token=${shortLivedToken}`
    )
    const longLivedData = await longLivedRes.json()
    if (longLivedData.error) throw new Error(longLivedData.error.message)

    const longLivedToken = longLivedData.access_token
    const expiresAt = new Date(Date.now() + (longLivedData.expires_in || 5184000) * 1000)

    // Step 3: Fetch Instagram username directly — no Facebook Pages lookup needed
    const userRes = await fetch(
      `https://graph.instagram.com/me?fields=id,username&access_token=${longLivedToken}`
    )
    const userData = await userRes.json()
    if (userData.error) throw new Error(userData.error.message)

    const username = userData.username

    // Step 4: Get authenticated PromptHub user from session cookie
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=session_expired', request.url))
    }

    // Step 5: Encrypt and store the long-lived token in the database
    const { encrypted, iv } = encrypt(longLivedToken)

    const { error: dbError } = await adminClient
      .from('creator_instagram_tokens')
      .upsert({
        creator_id: user.id,
        encrypted_token: encrypted,
        iv,
        instagram_user_id: instagramUserId,
        username,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (dbError) throw dbError

    return NextResponse.redirect(new URL('/admin/settings?instagram=connected', request.url))
  } catch (error: any) {
    console.error('Instagram Business Auth Error:', error)
    return NextResponse.redirect(
      new URL(`/admin/settings?error=${encodeURIComponent(error.message)}`, request.url)
    )
  }
}
