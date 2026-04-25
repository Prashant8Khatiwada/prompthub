import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ error: 'Missing prompt ID' }, { status: 400 })

  // Find or create page record
  const { data: page } = await adminClient
    .from('pages')
    .select('id')
    .eq('prompt_id', id)
    .maybeSingle()

  if (page) {
    return NextResponse.json({ pageId: page.id })
  }

  const { data: newPage, error } = await adminClient
    .from('pages')
    .insert({ prompt_id: id })
    .select('id')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ pageId: newPage.id })
}
