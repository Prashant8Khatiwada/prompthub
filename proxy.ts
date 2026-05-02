import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

console.log('>>> Proxy file loaded at root level')

export async function proxy(request: NextRequest) {
  const url = request.nextUrl
  const path = url.pathname
  const host = request.headers.get('host') || ''

  // Clean port from host if present
  const hostWithoutPort = host.split(':')[0]

  // Use the production base domain
  const envBaseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'creatopedia.tech'
  const baseDomain = envBaseDomain.replace(/^https?:\/\//, '')
  const isMainDomain = hostWithoutPort === baseDomain

  console.log(`[Proxy] Host: ${hostWithoutPort}, BaseDomain: ${baseDomain}, MainDomain: ${isMainDomain}, Path: ${path}`)

  // Bypass for static assets and API
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/static') ||
    path.includes('.')
  ) {
    return NextResponse.next()
  }

  // 1. If it's the main domain (zip.fotosfolio.com), let Next.js handle all routes normally
  if (isMainDomain) {
    return NextResponse.next()
  }

  // 2. If it's a subdomain (e.g., creator.zip.fotosfolio.com)
  // We assume everything else is a creator subdomain
  const subdomain = hostWithoutPort.replace(`.${baseDomain}`, '')

  console.log(`[Proxy] Extracted Subdomain: ${subdomain}, HostWithoutPort: ${hostWithoutPort}, BaseDomain: ${baseDomain}`)

  if (subdomain && subdomain !== hostWithoutPort) {
    console.log(`[Proxy] Subdomain detected: ${subdomain}, Rewriting to /[subdomain]${path}`)
    return NextResponse.rewrite(new URL(`/${subdomain}${path}`, request.url))
  }

  return NextResponse.next()
}

export { proxy as middleware }

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
