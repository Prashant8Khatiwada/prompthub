import PromptForm from '@/components/admin/PromptForm'

export default function NewPromptPage() {
  return (
    <div className="max-w-2xl animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">New Prompt</h1>
        <p className="text-zinc-500 text-sm mt-1">Fill in the details below to create a new prompt page.</p>
      </div>
      <PromptForm />
    </div>
  )
}
