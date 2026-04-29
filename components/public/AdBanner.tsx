'use client'

import { useEffect, useRef, useState } from 'react'

export interface AdPlacementData {
  id: string
  position: 'below_video' | 'above_gate' | 'below_gate'
  is_global: boolean
  prompt_id: string | null
  campaign: {
    id: string
    name: string
    banner_url: string
    banner_alt: string | null
    target_url: string
    utm_source: string
    utm_medium: string
    utm_campaign: string
    status: string
    creator_id?: string
  }
}

interface Props {
  placements: AdPlacementData[]
  position: 'below_video' | 'above_gate' | 'below_gate'
  promptId: string
  creatorId?: string
}

export default function AdBanner({ placements, position, promptId, creatorId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasImpressed, setHasImpressed] = useState(false)

  // Find placement for this exact position
  const placement = placements.find(p => p.position === position)

  useEffect(() => {
    if (!placement || hasImpressed) return

    const sessionKey = `imp_${placement.id}`
    if (sessionStorage.getItem(sessionKey)) {
      setHasImpressed(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          const sessionId = sessionStorage.getItem('ph_sid') || null
          console.log('[AdBanner] sending impression for campaign:', placement.campaign.id)
          // Send impression
          fetch('/api/ads/impression', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaign_id: placement.campaign.id,
              placement_id: placement.id,
              prompt_id: promptId,
              session_id: sessionId,
              creator_id: creatorId ?? placement.campaign.creator_id ?? null,
            }),
          }).catch((err) => console.error('[AdBanner] impression failed:', err))

          sessionStorage.setItem(sessionKey, '1')
          setHasImpressed(true)
          observer.disconnect()
        }
      },
      { threshold: 0.5 } // 50% visible
    )

    if (containerRef.current) observer.observe(containerRef.current)

    return () => observer.disconnect()
  }, [placement, hasImpressed, promptId, creatorId])

  if (!placement) return null

  // Build click URL reading sessionStorage at click time, not render time
  const baseClickUrl = `/api/ads/click?placement_id=${placement.id}&campaign_id=${placement.campaign.id}&prompt_id=${promptId}`

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    console.log('[AdBanner] link clicked, preparing redirect...')
    e.preventDefault()
    const sessionId = sessionStorage.getItem('ph_sid') || ''
    const url = `${baseClickUrl}&session_id=${encodeURIComponent(sessionId)}`
    console.log('[AdBanner] opening tracking URL:', url)
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div ref={containerRef} className="relative w-full overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 transition-transform hover:scale-[1.01]">
      <a href={baseClickUrl} onClick={handleClick} target="_blank" rel="noopener noreferrer" className="block w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src={placement.campaign.banner_url} 
          alt={placement.campaign.banner_alt || 'Advertisement'} 
          className="w-full h-auto object-cover"
        />
      </a>
      <span className="absolute top-1 right-1.5 px-1.5 py-0.5 rounded-md bg-zinc-950/60 backdrop-blur-md text-[10px] font-medium text-zinc-400 select-none pointer-events-none">
        Sponsored
      </span>
    </div>
  )
}
