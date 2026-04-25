import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { PromptCategory } from '@/types'

interface Params {
  params: Promise<{ slug: string }>
}

const CATEGORY_MAP: Record<string, PromptCategory> = {
  'video-generation': 'Video Generation',
  'image-creation': 'Image Creation',
  'brand-logo': 'Brand & Logo',
  'education': 'Education',
  'scriptwriting': 'Scriptwriting',
  'photo-editing': 'Photo Editing',
}

export default async function CategoryPage({ params }: Params) {
  const { slug } = await params
  const categoryName = CATEGORY_MAP[slug]
  if (!categoryName) notFound()

  const supabase = await createClient()

  // Fetch prompts for this category
  const { data: prompts } = await supabase
    .from('prompts')
    .select('*, creators(subdomain, name)')
    .eq('category', categoryName)
    .eq('status', 'published')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-zinc-950 text-white pb-24">
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-indigo-500/30">
              P
            </div>
            <span className="text-lg font-bold tracking-tight">Prompt<span className="text-indigo-400">Hub</span></span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <Link href="/#categories" className="hover:text-white transition-colors">All Categories</Link>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-5 py-2 text-sm font-semibold text-white transition-all active:scale-95"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-32">
        <header className="mb-12">
          <Link href="/" className="text-indigo-400 text-sm font-medium hover:underline mb-4 inline-block">← Back to Home</Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white">{categoryName} Prompts</h1>
          <p className="text-zinc-500 mt-2">Discover the best {categoryName.toLowerCase()} prompts and the reels they created.</p>
        </header>

        {prompts && prompts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {prompts.map((p: any) => (
              <div
                key={p.id}
                className="group rounded-3xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 transition-all duration-200 hover:-translate-y-1 overflow-hidden"
              >
                {/* Thumbnail */}
                <div className="aspect-video relative bg-zinc-800 flex items-center justify-center overflow-hidden">
                  {p.thumbnail_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-4xl opacity-50">🎬</div>
                  )}
                  {p.video_url && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-5 space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">by @{p.creators?.name || 'admin'}</p>
                    <p className="text-sm font-bold text-white leading-snug truncate">{p.title}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-400">
                      {p.ai_tool}
                    </span>
                  </div>
                  <Link 
                    href={`/${p.creators?.subdomain || 'milan'}/${p.slug}`}
                    className="block w-full text-center rounded-xl py-2.5 text-sm font-bold text-white bg-zinc-800 hover:bg-indigo-600 border border-zinc-700 hover:border-indigo-500 transition-all"
                  >
                    View Prompt →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-zinc-900/50 rounded-3xl border border-dashed border-zinc-800">
            <p className="text-zinc-500">No prompts found in this category yet.</p>
            <Link href="/" className="text-indigo-400 mt-4 inline-block font-medium">Explore other categories</Link>
          </div>
        )}
      </main>
    </div>
  )
}
