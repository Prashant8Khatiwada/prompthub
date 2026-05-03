import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { creatorSettingsSchema } from '@/lib/validations'
import { revalidateTag } from 'next/cache'
import { Creator } from '@/types'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase.from('creators').select('*').eq('id', user.id).single<Creator>()
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = creatorSettingsSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { data, error } = await supabase.from('creators')
    .update(parsed.data).eq('id', user.id).select().single<Creator>()
  
  if (error || !data) return NextResponse.json({ error: error?.message || 'Failed to update' }, { status: 400 })
  
  // Invalidate cache
  revalidateTag(`creator-${data.subdomain}`, 'max')

  return NextResponse.json(data)
}
