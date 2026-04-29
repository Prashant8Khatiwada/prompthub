import { NextRequest, NextResponse } from 'next/server'
import { trackEvent } from '@/lib/analytics/track'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log('[analytics/view] received body:', JSON.stringify(body))
    
    if (body.prompt_id && body.session_id) {
      console.log('[analytics/view] calling trackEvent for prompt_view')
      trackEvent({
        event_type: 'prompt_view',
        creator_id: body.creator_id ?? undefined,
        prompt_id: body.prompt_id,
        session_id: body.session_id,
        request: req,
      })
    } else {
      console.log('[analytics/view] SKIPPED — missing prompt_id or session_id', { prompt_id: body.prompt_id, session_id: body.session_id })
    }
  } catch (err) {
    console.error('[analytics/view] error:', err)
  }
  
  return NextResponse.json({ ok: true })
}
