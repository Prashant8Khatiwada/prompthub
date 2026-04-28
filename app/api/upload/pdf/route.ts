import { NextRequest, NextResponse } from 'next/server'
import { adminClient } from '@/lib/supabase/admin'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'

const MAX_SIZE = 20 * 1024 * 1024 // 20MB

export async function POST(req: NextRequest) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Invalid file type. Only PDF allowed.' }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large. Max 20MB.' }, { status: 400 })
  }

  const crypto = await import('crypto')
  const uuid = crypto.randomUUID()
  const path = `pdfs/${user.id}/${uuid}.pdf`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await adminClient.storage
    .from('media')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const { data: { publicUrl } } = adminClient.storage.from('media').getPublicUrl(path)
  return NextResponse.json({ url: publicUrl })
}
