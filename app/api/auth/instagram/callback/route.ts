import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminClient } from '@/lib/supabase/admin'
import { encrypt } from '@/lib/crypto'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (!code) {
    return NextResponse.redirect(new URL('/admin/settings?error=no_code', request.url))
  }

  const host = request.headers.get('host')
  const protocol = host?.includes('localhost') || host?.includes('127.0.0.1') ? 'http' : 'https'
  
  const clientId = process.env.INSTAGRAM_APP_ID
  const clientSecret = process.env.INSTAGRAM_APP_SECRET
  const redirectUri = host ? `${protocol}://${host}/api/auth/instagram/callback` : process.env.INSTAGRAM_REDIRECT_URI

  try {
    // 1. Exchange code for User Access Token via Graph API
    const tokenRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&client_secret=${clientSecret}&code=${code}`
    )

    const tokenData = await tokenRes.json()
    if (tokenData.error) throw new Error(tokenData.error.message)

    const shortLivedToken = tokenData.access_token

    // 2. Exchange for Long-Lived Token (60 days)
    const refreshRes = await fetch(
      `https://graph.facebook.com/v19.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${clientId}&client_secret=${clientSecret}&fb_exchange_token=${shortLivedToken}`
    )
    const refreshData = await refreshRes.json()
    if (refreshData.error) throw new Error(refreshData.error.message)

    const longLivedToken = refreshData.access_token
    const expiresAt = new Date(Date.now() + (refreshData.expires_in || 5184000) * 1000)

    // 3. Find the Instagram Business Account linked to the user's Pages
    // First, get the Pages
    const pagesRes = await fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=instagram_business_account{id,username,profile_picture_url},name&access_token=${longLivedToken}`)
    const pagesData = await pagesRes.json()
    
    if (pagesData.error) throw new Error(pagesData.error.message)
    
    // Find a page that has a linked Instagram Business Account
    const pageWithIG = pagesData.data?.find((p: any) => p.instagram_business_account)
    
    if (!pageWithIG) {
      throw new Error('No Instagram Business/Creator account found. Please ensure your Instagram account is a Professional (Business or Creator) account. If using Facebook Login, it must also be linked to a Facebook Page.')
    }

    const igAccount = pageWithIG.instagram_business_account
    const instagramBusinessId = igAccount.id
    const username = igAccount.username

    // 4. Encrypt and store in DB
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login?error=session_expired', request.url))
    }

    const { encrypted, iv } = encrypt(longLivedToken)

    const { error: dbError } = await adminClient
      .from('creator_instagram_tokens')
      .upsert({
        creator_id: user.id,
        encrypted_token: encrypted,
        iv: iv,
        instagram_user_id: String(instagramBusinessId),
        username: username,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (dbError) throw dbError

    return NextResponse.redirect(new URL('/admin/settings?instagram=connected', request.url))
  } catch (error: any) {
    console.error('Instagram Business Auth Error:', error)
    return NextResponse.redirect(new URL(`/admin/settings?error=${encodeURIComponent(error.message)}`, request.url))
  }
}
