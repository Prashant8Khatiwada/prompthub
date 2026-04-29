'use client'

import { useEffect } from 'react'

interface Props {
  pageId: string
  promptId?: string
  creatorId?: string
}

export default function ViewTracker({ pageId, promptId, creatorId }: Props) {
  useEffect(() => {
    console.log('[ViewTracker] useEffect triggered', { pageId, promptId, creatorId })
    const sessionId = sessionStorage.getItem('ph_sid') ?? crypto.randomUUID()
    sessionStorage.setItem('ph_sid', sessionId)

    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_id: pageId,
        prompt_id: promptId,
        creator_id: creatorId,
        session_id: sessionId,
        referrer: document.referrer,
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      }),
    }).then(res => {
      console.log('[ViewTracker] fetch response status:', res.status)
    }).catch(err => {
      console.error('[ViewTracker] fetch failed:', err)
    })
  }, [pageId, promptId, creatorId])

  return null
}
