import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { promptSchema } from '@/lib/validations'
import { revalidateTag } from 'next/cache'
import { Prompt } from '@/types'
import { SupabaseClient, User } from '@supabase/supabase-js'

interface Params { params: Promise<{ id: string }> }

async function getPromptAndVerifyOwner(id: string): Promise<{ 
  supabase: SupabaseClient, 
  user: User | null, 
  prompt: Prompt | null, 
  unauthorized: boolean 
}> {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, prompt: null, unauthorized: true }

  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single<Prompt>()

  if (!prompt || prompt.creator_id !== user.id) {
    return { supabase, user, prompt: null, unauthorized: true }
  }

  return { supabase, user, prompt, unauthorized: false }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { prompt, unauthorized } = await getPromptAndVerifyOwner(id)
  if (unauthorized || !prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  return NextResponse.json(prompt)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { supabase, user, prompt, unauthorized } = await getPromptAndVerifyOwner(id)
  if (unauthorized || !user || !prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const body = await req.json()
  const parsed = promptSchema.partial().safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('prompts')
    .update(parsed.data)
    .eq('id', id)
    .select()
    .single<Prompt>()

  if (error || !data) return NextResponse.json({ error: error?.message || 'Failed to update' }, { status: 400 })
  
  // Invalidate cache
  revalidateTag(`prompt-${user.id}-${data.slug}`, 'max')
  revalidateTag(`prompts-list-${user.id}`, 'max')
  // Also invalidate the old slug if it changed
  if (prompt.slug !== data.slug) {
    revalidateTag(`prompt-${user.id}-${prompt.slug}`, 'max')
  }

  // If newly published, ensure page record exists
  if (parsed.data.status === 'published') {
    const { data: existing } = await supabase.from('pages').select('id').eq('prompt_id', id).maybeSingle()
    if (!existing) {
      await supabase.from('pages').insert({ prompt_id: id })
    }
  }

  return NextResponse.json(data)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { supabase, prompt, unauthorized } = await getPromptAndVerifyOwner(id)
  if (unauthorized || !prompt) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('prompts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  
  // Invalidate cache
  revalidateTag(`prompt-${prompt.creator_id}-${prompt.slug}`, 'max')
  revalidateTag(`prompts-list-${prompt.creator_id}`, 'max')

  return NextResponse.json({ ok: true })
}
