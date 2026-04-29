import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { trackEvent } from '@/lib/analytics/track'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // Fire-and-forget: don't block the response (old behavior)
  adminClient.from('events').insert(body)
  
  // New unified tracking
  if (body.prompt_id && body.session_id) {
    trackEvent({
      event_type: body.type === 'copy' ? 'prompt_copy' : body.type,
      prompt_id: body.prompt_id,
      session_id: body.session_id,
      request: req,
    })
  }
  
  return NextResponse.json({ ok: true })
}
