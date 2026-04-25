import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { promptSchema } from '@/lib/validations'

interface Params { params: Promise<{ id: string }> }

async function getPromptAndVerifyOwner(id: string) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { supabase, user: null, prompt: null, unauthorized: true }

  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single()

  if (!prompt || prompt.creator_id !== user.id) {
    return { supabase, user, prompt: null, unauthorized: true }
  }

  return { supabase, user, prompt, unauthorized: false }
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params
  const { supabase, unauthorized } = await getPromptAndVerifyOwner(id)
  if (unauthorized) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { data } = await supabase.from('prompts').select('*').eq('id', id).single()
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params
  const { supabase, user, unauthorized } = await getPromptAndVerifyOwner(id)
  if (unauthorized || !user) return NextResponse.json({ error: 'Not found' }, { status: 404 })

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
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

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
  const { supabase, unauthorized } = await getPromptAndVerifyOwner(id)
  if (unauthorized) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  const { error } = await supabase.from('prompts').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ ok: true })
}
