import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { encrypt } from '@/lib/crypto'

// Behind a reverse proxy the internal request.url is http://127.0.0.1:3000/...
// Use x-forwarded-* headers to reconstruct the real public base URL.
function getBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }
  // Fallback: use configured base domain
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'zip.fotosfolio.com'
  return `https://${baseDomain}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const baseUrl = getBaseUrl(request)

  if (errorParam) {
    return NextResponse.redirect(`${baseUrl}/admin/settings?error=${encodeURIComponent(errorParam)}`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/admin/settings?error=no_code`)
  }

  const clientId = process.env.INSTAGRAM_CLIENT_ID
  const clientSecret = process.env.INSTAGRAM_CLIENT_SECRET
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.redirect(`${baseUrl}/admin/settings?error=instagram_not_configured`)
  }

  try {
    // Step 1: Exchange code for short-lived token
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

    // Step 2: Exchange for long-lived token (60 days)
    const longLivedRes = await fetch(
      `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&access_token=${shortLivedToken}`
    )
    const longLivedData = await longLivedRes.json()
    if (longLivedData.error) throw new Error(longLivedData.error.message)

    const longLivedToken = longLivedData.access_token
    const expiresAt = new Date(Date.now() + (longLivedData.expires_in || 5184000) * 1000)

    // Step 3: Fetch Instagram username
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
      return NextResponse.redirect(`${baseUrl}/login?error=session_expired`)
    }

    // Step 5: Encrypt and store the long-lived token in the database
    const encryption = encrypt(longLivedToken)
    if (!encryption) {
      throw new Error('TOKEN_ENCRYPTION_KEY is not set on the server')
    }
    const { encrypted, iv } = encryption

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

    return NextResponse.redirect(`${baseUrl}/admin/settings?instagram=connected`)
  } catch (error: any) {
    console.error('Instagram Business Auth Error:', error)
    return NextResponse.redirect(
      `${baseUrl}/admin/settings?error=${encodeURIComponent(error.message)}`
    )
  }
}
