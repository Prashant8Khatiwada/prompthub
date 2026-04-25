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
    // Load Instagram embed script after mount
    if (html && ref.current) {
      const script = document.createElement('script')
      script.src = 'https://www.instagram.com/embed.js'
      script.async = true
      document.body.appendChild(script)
      return () => { document.body.removeChild(script) }
    }
  }, [html])

  if (!html && !fallbackThumbnail) return null

  if (!html && fallbackThumbnail) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 pt-6">
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl overflow-hidden relative aspect-video bg-zinc-900 border border-zinc-800 group"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fallbackThumbnail} alt="Video thumbnail" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/40">
              <svg className="w-7 h-7 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            </div>
          </div>
          <p className="absolute bottom-3 right-3 text-xs text-white/60 bg-black/40 px-2 py-1 rounded-full">Watch on Instagram</p>
        </a>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 pt-6">
      <div
        ref={ref}
        className="rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900"
        dangerouslySetInnerHTML={{ __html: html! }}
      />
    </div>
  )
}
