import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4 text-white">Todos</h1>
      <ul className="space-y-2">
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {todos?.map((todo: any) => (
          <li key={todo.id} className="bg-zinc-900 p-4 rounded-lg border border-zinc-800 text-zinc-300">
            {todo.name}
          </li>
        ))}
        {(!todos || todos.length === 0) && (
          <li className="text-zinc-500 italic">No todos found. Check your Supabase table.</li>
        )}
      </ul>
    </div>
  )
}
