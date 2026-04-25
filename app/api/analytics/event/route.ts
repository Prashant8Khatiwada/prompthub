import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const body = await req.json()
  // Fire-and-forget: don't block the response
  adminClient.from('events').insert(body)
  return NextResponse.json({ ok: true })
}
