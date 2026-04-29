import { NextRequest, NextResponse } from 'next/server'
import { emailCaptureSchema } from '@/lib/validations'
import { adminClient } from '@/lib/supabase/admin'
import { trackEvent } from '@/lib/analytics/track'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = emailCaptureSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { email, prompt_id } = parsed.data

  // Fetch prompt content
  const { data: prompt } = await adminClient
    .from('prompts')
    .select('content')
    .eq('id', prompt_id)
    .single()

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
  }

  // Insert email capture (fire-and-forget — don't block the response)
  adminClient.from('email_captures').insert({ email, prompt_id })

  // Track analytics
  const sessionId = req.headers.get('x-session-id') ?? 'unknown'
  trackEvent({
    event_type: 'email_capture',
    prompt_id,
    session_id: sessionId,
    request: req,
  })
  trackEvent({
    event_type: 'email_unlock',
    prompt_id,
    session_id: sessionId,
    request: req,
  })

  return NextResponse.json({ content: prompt.content })
}
