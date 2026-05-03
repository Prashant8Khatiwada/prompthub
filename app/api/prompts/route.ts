import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { promptSchema } from '@/lib/validations'
import { revalidateTag } from 'next/cache'
import { Prompt } from '@/types'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data as Prompt[])
}

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const parsed = promptSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('prompts')
    .insert({ ...parsed.data, creator_id: user.id })
    .select()
    .single<Prompt>()

  if (error || !data) return NextResponse.json({ error: error?.message || 'Failed to create' }, { status: 400 })
  
  // Invalidate cache list
  revalidateTag(`prompts-list-${user.id}`, 'max')

  // If published, create page record for analytics
  if (parsed.data.status === 'published') {
    await supabase.from('pages').insert({ prompt_id: data.id })
  }

  return NextResponse.json(data, { status: 201 })
}
