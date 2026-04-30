'use client'

import { useEffect, useRef, useState } from 'react'
import { AdPlacementPosition } from '@/types'

export interface AdPlacementData {
  id: string
  position: AdPlacementPosition
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
  position: AdPlacementPosition
  promptId?: string
  creatorId?: string
}

export default function AdBanner({ placements, position, promptId, creatorId }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasImpressed, setHasImpressed] = useState(false)
  
  // Viewport time tracking
  const startTimeRef = useRef<number | null>(null)
  const totalViewTimeRef = useRef<number>(0)

  // Find placement for this exact position
  const placement = placements.find(p => p.position === position)

  useEffect(() => {
    if (!placement) return

    const sessionKey = `imp_${placement.id}`
    
    const sendDuration = () => {
      if (startTimeRef.current !== null) {
        const duration = (Date.now() - startTimeRef.current) / 1000
        totalViewTimeRef.current += duration
        startTimeRef.current = null

        if (duration > 0.5) { // Only track if at least half a second
          fetch('/api/analytics/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              prompt_id: promptId,
              campaign_id: placement.campaign.id,
              type: 'ad_view_duration',
              value: parseFloat(duration.toFixed(2)),
              session_id: sessionStorage.getItem('ph_sid'),
              creator_id: creatorId ?? placement.campaign.creator_id ?? null,
            }),
          }).catch(() => {})
        }
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        
        if (entry.isIntersecting) {
          // Start timer
          startTimeRef.current = Date.now()

          // Original Impression logic (one-time per session)
          if (!hasImpressed && !sessionStorage.getItem(sessionKey)) {
            const sessionId = sessionStorage.getItem('ph_sid') || null
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
            }).catch(() => {})

            sessionStorage.setItem(sessionKey, '1')
            setHasImpressed(true)
          }
        } else {
          // Left viewport, stop timer and send
          sendDuration()
        }
      },
      { threshold: 0.5 } // 50% visible
    )

    if (containerRef.current) observer.observe(containerRef.current)

    // Also send if the user leaves the page while looking at the ad
    const handleUnload = () => sendDuration()
    window.addEventListener('beforeunload', handleUnload)

    return () => {
      observer.disconnect()
      window.removeEventListener('beforeunload', handleUnload)
      sendDuration()
    }
  }, [placement, hasImpressed, promptId, creatorId])

  if (!placement) return null

  // Build click URL reading sessionStorage at click time, not render time
  const baseClickUrl = `/api/ads/click?placement_id=${placement.id}&campaign_id=${placement.campaign.id}&prompt_id=${promptId}`

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    const sessionId = sessionStorage.getItem('ph_sid') || ''
    const url = `${baseClickUrl}&session_id=${encodeURIComponent(sessionId)}`
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
