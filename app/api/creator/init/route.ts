import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { email } = await req.json()

  // Generate a default handle and subdomain from email
  const base = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase()
  
  const { data, error } = await supabase.from('creators').insert({
    id: user.id,
    email: email,
    name: base.charAt(0).toUpperCase() + base.slice(1),
    handle: `@${base}`,
    subdomain: base,
    brand_color: '#6366f1'
  }).select().single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json(data)
}
