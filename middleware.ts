import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * PromptHub Middleware
 * Handles subdomain routing and TikTok compatibility fixes.
 */
export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const path = url.pathname
  const host = request.headers.get('host') || ''
  const userAgent = request.headers.get('user-agent') || ''
  
  // Clean port from host if present (e.g., localhost:3000 -> localhost)
  const hostWithoutPort = host.split(':')[0]

  // Detect TikTok browser or crawler
  const isTikTok = 
    userAgent.includes('TikTok') || 
    userAgent.includes('musical_ly') || 
    userAgent.includes('TikTokBot') || 
    userAgent.includes('ByteSpider')

  // Use the production base domain
  const envBaseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'creatopedia.tech'
  const baseDomain = envBaseDomain.replace(/^https?:\/\//, '')
  const isLocalhost = hostWithoutPort === 'localhost' || hostWithoutPort === '127.0.0.1'
  // On localhost, we treat the main localhost host as the main domain so it triggers local redirects
  const isMainDomain = hostWithoutPort === baseDomain || isLocalhost

  // 1. Bypass for static assets and API
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/static') ||
    path.includes('.')
  ) {
    return NextResponse.next()
  }

  // 2. Redirect path-based subdomain URLs on main domain to subdomain hosts (except for TikTok browser compatibility)
  if (isMainDomain && !isTikTok) {
    const segments = path.split('/').filter(Boolean)
    if (segments.length > 0) {
      const firstSegment = segments[0]
      const reservedPaths = ['ads', 'browse', 'category', 'experience', 'platforms', 'reach-us', 'login', 'privacy-policy', 'terms']
      if (!reservedPaths.includes(firstSegment)) {
        const subdomain = firstSegment
        const redirectUrl = new URL(request.url)
        if (isLocalhost) {
          const port = host.split(':')[1]
          redirectUrl.host = `${subdomain}.localhost${port ? `:${port}` : ''}`
        } else {
          redirectUrl.host = `${subdomain}.${baseDomain}`
        }
        
        if (segments.length === 1) {
          redirectUrl.pathname = '/'
        } else {
          // Redirect to the clean format: {subdomain}.creatopedia.tech/{slug}
          // If the old URL had /creatopedia.tech/ prefix in path, strip it
          let remainingSegments = segments.slice(1)
          if (remainingSegments[0] === 'creatopedia.tech') {
            remainingSegments = remainingSegments.slice(1)
          }
          redirectUrl.pathname = `/${remainingSegments.join('/')}`
        }
        
        console.log(`[Redirect] Redirecting main domain path to subdomain: ${redirectUrl.toString()}`)
        return NextResponse.redirect(redirectUrl)
      }
    }
  }

  // 2. TikTok Compatibility Fix: 
  // TikTok's in-app browser often blocks subdomain-based links (e.g. milan.creatopedia.tech)
  // because it flags them as potential phishing or has issues with SSL on subdomains.
  // Fix: Redirect TikTok users from subdomain.domain.tech/slug to domain.tech/subdomain/slug
  if (isTikTok && !isMainDomain) {
    const subdomain = hostWithoutPort.replace(`.${baseDomain}`, '')
    if (subdomain && subdomain !== hostWithoutPort) {
      console.log(`[TikTok Fix] Redirecting to path-based URL for ${subdomain}`)
      const redirectUrl = new URL(request.url)
      redirectUrl.host = baseDomain
      redirectUrl.pathname = `/${subdomain}${path}`
      
      const response = NextResponse.redirect(redirectUrl)
      
      // Add a special header to help debug
      response.headers.set('x-tktk-fix', 'true')
      return response
    }
  }

  // 3. Unified Routing & Header Management
  let subdomain = hostWithoutPort.replace(`.${baseDomain}`, '')
  if (hostWithoutPort.endsWith('.localhost')) {
    subdomain = hostWithoutPort.replace('.localhost', '')
  }
  if (isLocalhost && !hostWithoutPort.includes('.')) {
    subdomain = 'milan'
  }
  let response: NextResponse

  if (isMainDomain) {
    // Path-based or Main Domain
    response = NextResponse.next()
  } else if (subdomain && subdomain !== hostWithoutPort) {
    // Subdomain Rewrite (Internal)
    // Strip /creatopedia.tech prefix if present, to support {subdomain}.creatopedia.tech/creatopedia.tech/{slug}
    let cleanPath = path
    if (path.startsWith('/creatopedia.tech/')) {
      cleanPath = path.substring('/creatopedia.tech'.length)
    } else if (path === '/creatopedia.tech') {
      cleanPath = '/'
    }
    const rewriteUrl = new URL(`/${subdomain}${cleanPath}`, request.url)
    response = NextResponse.rewrite(rewriteUrl)
  } else {
    response = NextResponse.next()
  }

  // 4. Apply Security Headers (Consolidated from next.config.ts)
  // We handle these dynamically to ensure TikTok never gets blocked by strict policies.
  if (isTikTok) {
    // TikTok compatibility: Loosened policy to prevent blocks in restrictive WebView
    response.headers.set('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *;")
    // NOTE: X-Frame-Options is intentionally omitted here for TikTok compatibility.
  } else {
    // Standard security: Strict policy for normal browsers
    response.headers.set('Content-Security-Policy', "frame-ancestors 'self' https://*.tiktok.com https://*.facebook.com https://*.instagram.com;")
    // NOTE: X-Frame-Options is also omitted here to avoid conflicts in social browsers,
    // as frame-ancestors provides the necessary protection.
  }

  return response
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
