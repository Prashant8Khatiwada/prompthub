import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { trackEvent } from '@/lib/analytics/track'

export async function POST(req: NextRequest) {
  const body = await req.json()
  
  // Fire-and-forget: don't block the response (old behavior)
  adminClient.from('events').insert(body)
  
  // New unified tracking
  if (body.prompt_id && body.session_id) {
    // 1. Fetch creator_id for this prompt (required for analytics filtering)
    const { data: prompt } = await adminClient
      .from('prompts')
      .select('creator_id')
      .eq('id', body.prompt_id)
      .single()

    trackEvent({
      event_type: (body.type === 'copy' || body.type === 'prompt_copy') ? 'prompt_copy' : body.type,
      prompt_id: body.prompt_id,
      creator_id: prompt?.creator_id,
      session_id: body.session_id,
      request: req,
    })
  }
  
  return NextResponse.json({ ok: true })
}
