'use client'

let posthog: typeof import('posthog-js').default | null = null

async function getPostHog() {
  if (typeof window === 'undefined') return null
  if (posthog) return posthog
  const ph = await import('posthog-js')
  posthog = ph.default
  if (!posthog.__loaded) {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? '', {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://app.posthog.com',
      capture_pageview: false,
    })
  }
  return posthog
}

export async function trackCopy(promptId: string, slug: string) {
  const ph = await getPostHog()
  ph?.capture('copy', { prompt_id: promptId, slug })
}

export async function trackEmailSubmit(promptId: string) {
  const ph = await getPostHog()
  ph?.capture('email_submit', { prompt_id: promptId })
}

export async function trackView(pageId: string) {
  const ph = await getPostHog()
  ph?.capture('page_view', { page_id: pageId })
}
