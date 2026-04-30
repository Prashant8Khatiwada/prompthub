'use client'

import { useEffect, useRef } from 'react'

interface Props {
  html: string | null
  fallbackThumbnail?: string | null
  url: string
}

export default function VideoEmbed({ html, fallbackThumbnail, url }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!html || !ref.current) return

    // Force center any blockquotes
    const bq = ref.current.querySelector('blockquote')
    if (bq) {
      bq.style.margin = '0 auto'
      bq.style.maxWidth = '540px'
      bq.style.width = '100%'
    }

    // If the HTML is an Instagram blockquote (like from oEmbed or user paste),
    // we MUST manually load the script because dangerouslySetInnerHTML ignores <script> tags.
    if (html.includes('instagram-media')) {
      const processInstgrm = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).instgrm) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (window as any).instgrm.Embeds.process()
        }
      }

      if (!document.getElementById('instagram-embed-script')) {
        const script = document.createElement('script')
        script.id = 'instagram-embed-script'
        script.src = 'https://www.instagram.com/embed.js'
        script.async = true
        script.onload = processInstgrm
        document.body.appendChild(script)
      } else {
        setTimeout(processInstgrm, 100)
      }
    }
  }, [html])

  // 1. If we have actual HTML (e.g. valid oEmbed), render it directly
  if (html) {
    return (
      <div
        ref={ref}
        className="w-full overflow-hidden flex justify-center"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    )
  }

  // 2. If it's an Instagram URL but oEmbed failed, use a direct iframe embed
  const isInstagram = url?.includes('instagram.com')
  if (isInstagram && url) {
    // Ensure URL ends with /embed
    const cleanUrl = url.split('?')[0].replace(/\/$/, '')
    const embedUrl = `${cleanUrl}/embed/captioned`

    return (
      <div className="w-full max-w-2xl mx-auto flex justify-center">
        <iframe
          src={embedUrl}
          className="w-full max-w-[400px] min-h-[600px] rounded-xl border border-zinc-800 shadow-2xl bg-zinc-950"
          frameBorder="0"
          scrolling="no"
          allowTransparency={true}
          allow="encrypted-media; picture-in-picture"
        />
      </div>
    )
  }

  // 3. Absolute fallback: Just show the thumbnail
  if (fallbackThumbnail) {
    return (
      <div className="w-full max-w-2xl mx-auto flex justify-center">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl overflow-hidden relative aspect-video w-full max-w-[540px] bg-zinc-900 border border-zinc-800 group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fallbackThumbnail} alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          <p className="absolute bottom-3 right-3 text-xs text-white/60 bg-black/40 px-2 py-1 rounded-full">Watch Video</p>
        </a>
      </div>
    )
  }

  return null
}
