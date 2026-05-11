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

  // Detect TikTok browser
  const isTikTok = userAgent.includes('TikTok') || userAgent.includes('musical_ly')

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

  // 3. Main Domain Handling
  if (isMainDomain) {
    // If it's the main domain, let Next.js handle all routes normally
    return NextResponse.next()
  }

  // 4. Subdomain Routing (for non-TikTok users or standard flow)
  // Extract subdomain (e.g., creator.creatopedia.tech -> creator)
  const subdomain = hostWithoutPort.replace(`.${baseDomain}`, '')

  if (subdomain && subdomain !== hostWithoutPort) {
    // Rewrite internally to /[subdomain]/[path]
    const rewriteUrl = new URL(`/${subdomain}${path}`, request.url)
    const response = NextResponse.rewrite(rewriteUrl)
    
    // Add TikTok-specific compatibility headers if it IS TikTok (but we didn't redirect for some reason)
    if (isTikTok) {
      // Loosen CSP and Frame options for TikTok's restrictive WebView
      response.headers.set('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; frame-ancestors *;")
      response.headers.set('X-Frame-Options', 'ALLOWALL')
    }
    
    return response
  }

  return NextResponse.next()
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
