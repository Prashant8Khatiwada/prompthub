import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: token, error } = await adminClient
    .from('creator_instagram_tokens')
    .select('username, expires_at')
    .eq('creator_id', user.id)
    .single()

  return NextResponse.json({
    connected: !!token,
    username: token?.username,
    expires_at: token?.expires_at,
  })
}
