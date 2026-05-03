import { redirect } from 'next/navigation'

export default function NewPromptPage() {
  redirect('/admin/prompts?new=true')
}
