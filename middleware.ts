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
  const isMainDomain = hostWithoutPort === baseDomain

  // 1. Bypass for static assets and API
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/static') ||
    path.includes('.')
  ) {
    return NextResponse.next()
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
  const subdomain = hostWithoutPort.replace(`.${baseDomain}`, '')
  let response: NextResponse

  if (isMainDomain) {
    // Path-based or Main Domain
    response = NextResponse.next()
  } else if (subdomain && subdomain !== hostWithoutPort) {
    // Subdomain Rewrite (Internal)
    const rewriteUrl = new URL(`/${subdomain}${path}`, request.url)
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
