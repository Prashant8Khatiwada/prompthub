import { ImageResponse } from 'next/og'
import { createClient } from '@/lib/supabase/server'

export const runtime = 'nodejs'

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

interface Props {
  params: Promise<{ subdomain: string; slug: string }>
}

export default async function Image({ params }: Props) {
  const { subdomain, slug } = await params
  const supabase = await createClient()

  // Fetch creator
  const { data: creator } = await supabase
    .from('creators')
    .select('name, handle, brand_color, avatar_url')
    .eq('subdomain', subdomain)
    .single()

  // Fetch prompt
  const { data: prompt } = await supabase
    .from('prompts')
    .select('title, description, thumbnail_url, ai_tool')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  const brandColor = creator?.brand_color ?? '#6366f1'
  const title = prompt?.title ?? 'Untitled Prompt'
  const description = prompt?.description ?? (prompt?.ai_tool ? `A ${prompt.ai_tool} prompt` : 'AI Prompt')
  const creatorName = creator?.name ?? subdomain
  const aiTool = prompt?.ai_tool ?? 'AI'

  // Only use uploaded thumbnails (Supabase storage) for OG image.
  // Instagram CDN URLs are blocked by most social crawlers, so we skip them.
  const isUploadedThumbnail =
    !!prompt?.thumbnail_url &&
    (prompt.thumbnail_url.includes('supabase.co') || prompt.thumbnail_url.includes('supabase.in'))

  // Fetch the thumbnail as base64 so bots can embed it directly
  let thumbnailData: string | null = null
  if (isUploadedThumbnail && prompt?.thumbnail_url) {
    try {
      const res = await fetch(prompt.thumbnail_url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; PromptHubBot/1.0)',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        },
        signal: AbortSignal.timeout(5000),
      })
      if (res.ok) {
        const buf = await res.arrayBuffer()
        const mime = res.headers.get('content-type') ?? 'image/jpeg'
        thumbnailData = `data:${mime};base64,${Buffer.from(buf).toString('base64')}`
      }
    } catch {
      // Silently fall back to no image
    }
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          background: '#0a0a0a',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(135deg, ${brandColor}22 0%, #0a0a0a 50%, ${brandColor}11 100%)`,
            display: 'flex',
          }}
        />

        {/* Left glow */}
        <div
          style={{
            position: 'absolute',
            top: '-100px',
            left: '-100px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: `${brandColor}33`,
            filter: 'blur(80px)',
            display: 'flex',
          }}
        />

        {/* Content row */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            height: '100%',
            padding: '60px',
            gap: '48px',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Left: text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              justifyContent: 'space-between',
            }}
          >
            {/* Top: branding */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  background: brandColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <span style={{ color: 'white', fontSize: '16px', fontWeight: 700 }}>P</span>
              </div>
              <span style={{ color: '#888', fontSize: '16px', letterSpacing: '0.05em' }}>
                PromptHub
              </span>
            </div>

            {/* Middle: title + description */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* AI tool badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  width: 'fit-content',
                }}
              >
                <div
                  style={{
                    background: `${brandColor}33`,
                    border: `1px solid ${brandColor}66`,
                    borderRadius: '20px',
                    padding: '4px 14px',
                    color: brandColor,
                    fontSize: '13px',
                    fontWeight: 600,
                    letterSpacing: '0.05em',
                    display: 'flex',
                  }}
                >
                  {aiTool.toUpperCase()}
                </div>
              </div>

              <div
                style={{
                  color: '#ffffff',
                  fontSize: title.length > 40 ? '36px' : '44px',
                  fontWeight: 800,
                  lineHeight: 1.15,
                  letterSpacing: '-0.02em',
                  display: 'flex',
                }}
              >
                {title.length > 60 ? title.slice(0, 57) + '...' : title}
              </div>

              {description && (
                <div
                  style={{
                    color: '#aaaaaa',
                    fontSize: '18px',
                    lineHeight: 1.5,
                    display: 'flex',
                  }}
                >
                  {description.length > 100 ? description.slice(0, 97) + '...' : description}
                </div>
              )}
            </div>

            {/* Bottom: creator */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: brandColor,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 700,
                }}
              >
                {creatorName[0]?.toUpperCase()}
              </div>
              <span style={{ color: '#cccccc', fontSize: '15px' }}>{creatorName}</span>
              {creator?.handle && (
                <span style={{ color: '#555', fontSize: '14px' }}>· {creator.handle}</span>
              )}
            </div>
          </div>

          {/* Right: thumbnail */}
          {thumbnailData && (
            <div
              style={{
                width: '380px',
                height: '380px',
                borderRadius: '20px',
                overflow: 'hidden',
                border: `2px solid ${brandColor}44`,
                flexShrink: 0,
                alignSelf: 'center',
                display: 'flex',
                boxShadow: `0 0 60px ${brandColor}44`,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnailData}
                alt={title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </div>
          )}

          {/* Placeholder when no image */}
          {!thumbnailData && (
            <div
              style={{
                width: '380px',
                height: '380px',
                borderRadius: '20px',
                background: `${brandColor}22`,
                border: `2px solid ${brandColor}33`,
                flexShrink: 0,
                alignSelf: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '80px', color: brandColor }}>✦</span>
            </div>
          )}
        </div>

        {/* Bottom border accent */}
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent, ${brandColor}, transparent)`,
            display: 'flex',
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  )
}
