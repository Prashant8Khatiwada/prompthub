import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const clientId = process.env.INSTAGRAM_APP_ID

  // Priority 1: x-forwarded-host is set by the reverse proxy (Nginx/Traefik)
  //             with the real public domain (e.g. zip.fotosfolio.com)
  // Priority 2: INSTAGRAM_REDIRECT_URI env var (hardcoded production URL)
  // Never use raw `host` header — behind a proxy it resolves to localhost:3000
  const forwardedHost = request.headers.get('x-forwarded-host')
  const forwardedProto = request.headers.get('x-forwarded-proto') || 'https'
  const redirectUri = forwardedHost
    ? `${forwardedProto}://${forwardedHost}/api/auth/instagram/callback`
    : process.env.INSTAGRAM_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Instagram credentials not configured on server' }, { status: 500 })
  }

  // Optimal Facebook OAuth flow for Instagram Business (v19.0)
  const scopes = [
    'instagram_business_basic',
    'instagram_basic',
    'instagram_manage_insights',
    'instagram_business_manage_messages',
    'pages_show_list',
    'pages_read_engagement'
  ].join(',')

  const url = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`

  return NextResponse.redirect(url)
}
