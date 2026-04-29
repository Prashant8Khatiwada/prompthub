import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

console.log('>>> Middleware file loaded at root level')

export async function middleware(request: NextRequest) {
  const url = request.nextUrl
  const path = url.pathname
  const host = request.headers.get('host') || ''
  
  // Clean port from host if present
  const hostWithoutPort = host.split(':')[0]
  
  // Use the production base domain
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'zip.fotosfolio.com'
  const isMainDomain = hostWithoutPort === baseDomain

  console.log(`[Middleware] Host: ${hostWithoutPort}, BaseDomain: ${baseDomain}, MainDomain: ${isMainDomain}, Path: ${path}`)

  // Bypass for static assets and API
  if (
    path.startsWith('/_next') || 
    path.startsWith('/api') || 
    path.startsWith('/static') ||
    path.includes('.')
  ) {
    return NextResponse.next()
  }

  // 1. If it's the main domain (zip.fotosfolio.com)
  if (isMainDomain) {
    // If accessing root, rewrite to home
    if (path === '/') {
      console.log('[Middleware] Rewriting main domain root to /home')
      return NextResponse.rewrite(new URL('/home', request.url))
    }
    // For other paths on main domain, just continue
    return NextResponse.next()
  }

  // 2. If it's a subdomain (e.g., creator.zip.fotosfolio.com)
  // We assume everything else is a creator subdomain
  const subdomain = hostWithoutPort.replace(`.${baseDomain}`, '')
  
  if (subdomain && subdomain !== hostWithoutPort) {
    console.log(`[Middleware] Subdomain detected: ${subdomain}, Rewriting to /[subdomain]${path}`)
    return NextResponse.rewrite(new URL(`/${subdomain}${path}`, request.url))
  }

  return NextResponse.next()
}

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
