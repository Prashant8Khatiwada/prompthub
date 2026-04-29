import { adminClient } from '@/lib/supabase/admin'

export type AnalyticsEventType =
  | 'prompt_view'
  | 'prompt_copy'
  | 'email_capture'
  | 'email_unlock'
  | 'payment_unlock'
  | 'pdf_view'
  | 'pdf_download'
  | 'ad_impression'
  | 'ad_click'

export function trackEvent({
  event_type, creator_id, prompt_id, campaign_id,
  placement_id, session_id, value, request,
}: {
  event_type: AnalyticsEventType
  creator_id?: string
  prompt_id?: string
  campaign_id?: string
  placement_id?: string
  session_id: string
  value?: number
  request?: Request | { headers: { get(name: string): string | null } }
}) {
  const ua = request?.headers.get('user-agent') ?? ''
  const country = request?.headers.get('x-vercel-ip-country') ?? null
  const city = request?.headers.get('x-vercel-ip-city') ?? null
  const referrer = request?.headers.get('referer') ?? null
  const device_type = /mobile/i.test(ua) ? 'mobile' : /tablet/i.test(ua) ? 'tablet' : 'desktop'
  const is_valid = !/bot|crawler|spider|headless|phantom|selenium/i.test(ua) && !!session_id

  // Fire and forget — never await this
  adminClient.from('analytics_events').insert({
    event_type,
    creator_id: creator_id ?? null,
    prompt_id: prompt_id ?? null,
    campaign_id: campaign_id ?? null,
    placement_id: placement_id ?? null,
    session_id,
    referrer,
    device_type,
    country,
    city,
    value: value ?? null,
    is_valid,
  }).then()
}
