import { NextRequest } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const today = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

  await adminClient.rpc('aggregate_daily_stats', { target_date: today })
  await adminClient.rpc('aggregate_daily_stats', { target_date: yesterday })

  return Response.json({ ok: true, ran_at: new Date().toISOString() })
}
