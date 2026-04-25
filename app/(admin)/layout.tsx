import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) redirect('/login')

  const { data: creator } = await supabase
    .from('creators')
    .select('name,avatar_url,handle')
    .eq('id', user.id)
    .single()

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      <Sidebar creator={creator || { name: 'Creator', handle: 'handle', avatar_url: null }} />
      <main className="flex-1 overflow-y-auto p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  )
}
