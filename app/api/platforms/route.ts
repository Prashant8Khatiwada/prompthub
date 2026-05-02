import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const [categoriesRes, creatorsRes, promptsRes] = await Promise.all([
    supabase.from('categories').select('*').order('name'),
    supabase.from('creators').select('*'),
    supabase.from('prompts').select('*').eq('status', 'published')
  ])

  // Fix null avatar_url directly in API
  const creators = (creatorsRes.data || []).map((c: any) => ({
    ...c,
    avatar_url: c.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'
  }))

  return NextResponse.json({
    categories: categoriesRes.data || [],
    creators,
    prompts: promptsRes.data || []
  })
}
