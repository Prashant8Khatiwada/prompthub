import { NextResponse } from 'next/server'

export async function GET() {
  const clientId = process.env.INSTAGRAM_APP_ID
  const redirectUri = process.env.INSTAGRAM_REDIRECT_URI

  if (!clientId || !redirectUri) {
    return NextResponse.json({ error: 'Instagram credentials not configured on server' }, { status: 500 })
  }

  // Use the standard Facebook OAuth flow for Instagram Business
  const scopes = [
    'instagram_business_basic',
    'instagram_basic',
    'instagram_manage_insights',
    'pages_show_list',
    'pages_read_engagement'
  ].join(',')

  const url = `https://www.facebook.com/v22.0/dialog/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&response_type=code`

  return NextResponse.redirect(url)
}
