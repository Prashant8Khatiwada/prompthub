import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const host = request.headers.get('host')
  const protocol = host?.includes('localhost') || host?.includes('127.0.0.1') ? 'http' : 'https'
  
  const clientId = process.env.INSTAGRAM_APP_ID
  // Dynamically detect redirect URI, falling back to env if needed
  const redirectUri = host ? `${protocol}://${host}/api/auth/instagram/callback` : process.env.INSTAGRAM_REDIRECT_URI

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
