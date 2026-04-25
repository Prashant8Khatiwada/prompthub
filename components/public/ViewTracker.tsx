'use client'

import { useEffect } from 'react'

interface Props {
  pageId: string
}

export default function ViewTracker({ pageId }: Props) {
  useEffect(() => {
    const sessionId = sessionStorage.getItem('ph_sid') ?? crypto.randomUUID()
    sessionStorage.setItem('ph_sid', sessionId)

    fetch('/api/analytics/view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page_id: pageId,
        session_id: sessionId,
        referrer: document.referrer,
        device: /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop',
      }),
    })
  }, [pageId])

  return null
}
