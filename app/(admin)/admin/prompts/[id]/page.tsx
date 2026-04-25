import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import PromptForm from '@/components/admin/PromptForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPromptPage({ params }: Props) {
  const { id } = await params
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()

  const { data: prompt } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .eq('creator_id', user!.id)
    .single()

  if (!prompt) notFound()

  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Edit Prompt</h1>
        <p className="text-zinc-500 text-sm mt-1 truncate">/{prompt.slug}</p>
      </div>
      <PromptForm defaultValues={prompt} promptId={id} />
    </div>
  )
}
