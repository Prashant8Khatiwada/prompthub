import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST() {
  const supabase = await createClient()
  
  // 1. Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // 2. Trigger the aggregation function via adminClient (service role)
  // We run for today and yesterday to be safe
  try {
    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    await adminClient.rpc('aggregate_daily_stats', { target_date: yesterday })
    await adminClient.rpc('aggregate_daily_stats', { target_date: today })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[analytics/sync] error:', err)
    return NextResponse.json({ error: 'Failed to sync' }, { status: 500 })
  }
}
