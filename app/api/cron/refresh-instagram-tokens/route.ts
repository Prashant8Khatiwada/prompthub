import { NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { decrypt, encrypt } from '@/lib/crypto'

export async function GET(request: Request) {
  // 1. Verify cron secret (if set)
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 2. Fetch tokens expiring in the next 10 days
    const tenDaysFromNow = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()

    const { data: tokens, error } = await adminClient
      .from('creator_instagram_tokens')
      .select('*')
      .lt('expires_at', tenDaysFromNow)

    if (error) throw error

    const results = {
      processed: 0,
      refreshed: 0,
      errors: 0,
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json({ message: 'No tokens need refreshing', results })
    }

    // 3. Refresh each token
    for (const tokenData of tokens) {
      results.processed++
      try {
        const currentToken = decrypt(tokenData.encrypted_token, tokenData.iv)

        const res = await fetch(
          `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
        )
        const data = await res.json()

        if (data.error) throw new Error(data.error.message)

        const newToken = data.access_token
        const newExpiresAt = new Date(Date.now() + data.expires_in * 1000).toISOString()

        const encryptedData = encrypt(newToken)

        await adminClient
          .from('creator_instagram_tokens')
          .update({
            encrypted_token: encryptedData?.encrypted || '',
            iv: encryptedData?.iv || '',
            expires_at: newExpiresAt,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tokenData.id)

        results.refreshed++
      } catch (err) {
        console.error(`Failed to refresh token for creator ${tokenData.creator_id}:`, err)
        results.errors++
      }
    }

    return NextResponse.json({ message: 'Cron job completed', results })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('Instagram Refresh Cron Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
