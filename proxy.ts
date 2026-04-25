import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function proxy(req: NextRequest) {
  const host = req.headers.get('host') ?? ''
  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN ?? 'prompthub.app'
  
  // Strip port for comparison
  const hostWithoutPort = host.split(':')[0]
  const baseWithoutPort = baseDomain.split(':')[0]
  
  const isMainDomain =
    hostWithoutPort === 'www.' + baseWithoutPort ||
    hostWithoutPort === baseWithoutPort ||
    hostWithoutPort === 'localhost' ||
    host === 'localhost:3000'

  // Handle subdomain traffic
  if (!isMainDomain && hostWithoutPort !== 'localhost') {
    const subdomain = hostWithoutPort.split('.')[0]
    const url = req.nextUrl.clone()
    // Rewrite to /[subdomain]/[slug]
    url.pathname = `/${subdomain}${url.pathname}`
    const res = NextResponse.rewrite(url)
    res.headers.set('x-creator-subdomain', subdomain)
    return res
  }

  // Protect /admin routes with Supabase Auth session check
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const response = NextResponse.next({ request: req })
    
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
