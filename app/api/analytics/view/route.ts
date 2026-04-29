import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { trackEvent } from '@/lib/analytics/track'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // Fire-and-forget: don't block the response
  adminClient.from('views').insert(body) // keep old
  
  // Write to new unified table
  if (body.prompt_id && body.session_id) {
    trackEvent({
      event_type: 'prompt_view',
      creator_id: body.creator_id ?? undefined,
      prompt_id: body.prompt_id,
      session_id: body.session_id,
      request: req,
    })
  }
  
  return NextResponse.json({ ok: true })
}
