import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { Prompt, Creator, Category } from '@/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'PromptHub | Premium AI Prompts for Content Creators',
  description: 'The discovery hub for viral AI prompts. Copy high-performing prompts for Midjourney, Runway, Claude, and more.',
  openGraph: {
    title: 'PromptHub | AI Prompt Discovery Hub',
    description: 'Copy high-performing AI prompts used by top content creators.',
    type: 'website',
    url: 'https://prompthub.app',
  }
}

const AI_TOOL_COLORS: Record<string, string> = {
  Midjourney: '#1b6ef3',
  ChatGPT: '#10a37f',
  Claude: '#c96442',
  Gemini: '#4285f4',
  Runway: '#7c3aed',
  Pika: '#ec4899',
  Kling: '#f59e0b',
  Veo: '#06b6d4',
  Other: '#6366f1',
}

interface PromptWithDetails extends Prompt {
  creators: Pick<Creator, 'name' | 'handle' | 'subdomain'>
  categories: Pick<Category, 'name' | 'icon'>
}

export default async function LandingPage() {
  const supabase = await createClient()

  // 1. Fetch Featured Categories
  const { data: featuredCategories } = await supabase
    .from('categories')
    .select('*')
    .eq('featured', true)
    .order('name') as { data: Category[] | null }

  // 2. Fetch Featured Prompts with Joins
  const { data: featuredPrompts } = await supabase
    .from('prompts')
    .select(`
      *,
      creators (name, handle, subdomain),
      categories (name, icon)
    `)
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(8) as { data: PromptWithDetails[] | null }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30">
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center font-extrabold text-white shadow-xl shadow-indigo-500/20">
              P
            </div>
            <span className="text-xl font-bold tracking-tight">Prompt<span className="text-indigo-400">Hub</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-medium text-zinc-400">
            <a href="#categories" className="hover:text-white transition-colors">Categories</a>
            <a href="#prompts" className="hover:text-white transition-colors">Featured</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30">
          <div className="absolute top-0 -left-20 w-96 h-96 bg-indigo-600 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-violet-600 rounded-full blur-[120px] animate-pulse delay-700" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-widest animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            Admin Curated Hub
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tight leading-[0.9] text-white">
            The Hub for <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 bg-300% animate-gradient">Viral</span> AI Prompts.
          </h1>
          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Copy high-performing prompts used by top creators. 
            <span className="text-white"> Built for the AI generation.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <a href="#prompts" className="w-full sm:w-auto rounded-full bg-indigo-600 px-10 py-5 text-base font-bold text-white hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/40 active:scale-95">
              Start Discovering
            </a>
          </div>
        </div>
      </section>

      {/* ── FEATURED CATEGORIES ─────────────────────────────── */}
      <section id="categories" className="py-24 px-6 border-y border-white/5 bg-zinc-900/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
            <div>
              <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] mb-3">Browse Topics</p>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Prompts by category</h2>
            </div>
          </div>
          
          {featuredCategories && featuredCategories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {featuredCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group p-6 rounded-[2.5rem] bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border border-indigo-500/20 hover:-translate-y-2 transition-all duration-300 text-center block shadow-lg hover:shadow-indigo-500/10"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon || '📁'}</div>
                  <p className="text-sm font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors">{cat.name}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-center py-10">No categories featured on the landing page yet.</p>
          )}
        </div>
      </section>

      {/* ── FEATURED PROMPTS GRID ──────────────────────────── */}
      <section id="prompts" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
            <div>
              <p className="text-indigo-400 font-bold text-xs uppercase tracking-[0.2em] mb-3">Editor&apos;s Choice</p>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">Featured Prompts</h2>
            </div>
          </div>

          {featuredPrompts && featuredPrompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredPrompts.map((p) => {
                const toolColor = AI_TOOL_COLORS[p.ai_tool] || '#6366f1'
                return (
                  <div key={p.id} className="group rounded-[2rem] border border-zinc-800 bg-zinc-900/40 hover:border-zinc-600 transition-all duration-300 hover:-translate-y-2 overflow-hidden shadow-2xl">
                    <div className="aspect-[4/3] relative bg-zinc-800 flex items-center justify-center overflow-hidden">
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="text-6xl opacity-20">{p.categories?.icon || '🎬'}</div>
                      )}
                      {(p.video_url || p.embed_html) && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md rounded-full px-3 py-1.5 border border-white/10">
                          <div className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-white font-black uppercase tracking-widest">Reel</span>
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{p.categories?.name}</span>
                        <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">by {p.creators?.subdomain}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white leading-tight h-12 line-clamp-2">{p.title}</h3>
                      <div className="flex items-center justify-between pt-2">
                        <span className="text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest border" style={{ borderColor: `${toolColor}44`, color: toolColor, background: `${toolColor}11` }}>
                          {p.ai_tool}
                        </span>
                      </div>
                      <Link href={`/${p.creators?.subdomain}/${p.slug}`} className="block w-full text-center rounded-2xl py-4 text-xs font-black uppercase tracking-widest text-white bg-zinc-800 hover:bg-white hover:text-black transition-all duration-300">
                        View Breakdown →
                      </Link>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20 bg-zinc-900/20 rounded-[3rem] border border-dashed border-zinc-800">
              <p className="text-zinc-500 font-medium">No prompts featured on the landing page yet.</p>
              <Link href="/admin/prompts" className="text-indigo-400 mt-4 inline-block font-bold hover:underline underline-offset-4">Manage your prompts →</Link>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-12 px-6 border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center font-bold text-zinc-400 border border-zinc-800">
              P
            </div>
            <span className="text-sm font-bold text-zinc-400">© 2024 PromptHub. Admin Curated AI Assets.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
