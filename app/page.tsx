import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import type { Metadata } from 'next'
import type { Prompt, Creator, Category } from '@/types'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'PromptHub | The Premier AI Prompt Discovery Platform',
  description: 'The discovery hub for viral AI prompts. High-performing prompts for Midjourney, Runway, Claude, and more.',
}

interface PromptWithDetails extends Prompt {
  creators: Pick<Creator, 'name' | 'handle' | 'subdomain' | 'avatar_url'>
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

  // 2. Fetch Featured Prompts
  const { data: featuredPrompts } = await supabase
    .from('prompts')
    .select(`
      *,
      creators (name, handle, subdomain, avatar_url),
      categories (name, icon)
    `)
    .eq('status', 'published')
    .eq('featured', true)
    .order('created_at', { ascending: false })
    .limit(4) as { data: PromptWithDetails[] | null }

  // 3. Fetch Top Creators (Simulated by fetching some creators)
  const { data: topCreators } = await supabase
    .from('creators')
    .select('name, handle, subdomain, avatar_url, bio')
    .limit(3) as { data: Partial<Creator>[] | null }

  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-500/30 font-sans">
      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-xl flex items-center justify-center font-extrabold text-white shadow-xl shadow-indigo-500/20">
              P
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Prompt<span className="text-indigo-400">Hub</span></span>
          </div>
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-zinc-400 uppercase tracking-widest">
            <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
            <a href="#creators" className="hover:text-white transition-colors">Creators</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>
          <Link
            href="/browse"
            className="rounded-full bg-white px-8 py-3 text-sm font-black text-black hover:bg-zinc-200 transition-all active:scale-95 shadow-xl shadow-white/5 uppercase tracking-widest"
          >
            Explore
          </Link>
        </div>
      </nav>

      {/* ── HERO SECTION ───────────────────────────────────── */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full -z-10 opacity-30">
          <div className="absolute top-20 -left-20 w-[500px] h-[500px] bg-indigo-600 rounded-full blur-[140px] animate-pulse" />
          <div className="absolute bottom-20 -right-20 w-[500px] h-[500px] bg-violet-600 rounded-full blur-[140px] animate-pulse delay-1000" />
        </div>

        <div className="max-w-5xl mx-auto text-center space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            The Future of Content Creation
          </div>
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] text-white">
            Unlock <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-indigo-400 bg-300% animate-gradient">Viral</span> <br/>AI Magic.
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
            Access the exclusive prompt library used by the world&apos;s top 1% of content creators. 
            <span className="text-white"> Built for the AI generation.</span>
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
            <Link href="/browse" className="w-full sm:w-auto rounded-full bg-indigo-600 px-12 py-6 text-sm font-black uppercase tracking-widest text-white hover:bg-indigo-500 transition-all shadow-2xl shadow-indigo-500/40 active:scale-95">
              Browse Library
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto rounded-full bg-zinc-900 border border-zinc-800 px-12 py-6 text-sm font-black uppercase tracking-widest text-white hover:bg-zinc-800 transition-all active:scale-95">
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* ── STATS SECTION ─────────────────────────────────── */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: 'Prompts', val: '12k+' },
              { label: 'Creators', val: '450+' },
              { label: 'Total Downloads', val: '2.5M' },
              { label: 'Success Rate', val: '98%' },
            ].map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="text-3xl md:text-5xl font-black text-white tracking-tighter">{s.val}</div>
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TOP CATEGORIES ─────────────────────────────────── */}
      <section id="categories" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
             <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">Discovery</p>
             <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Trending Topics</h2>
          </div>
          
          {featuredCategories && featuredCategories.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {featuredCategories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="group p-8 rounded-[3rem] bg-zinc-900/40 border border-zinc-800 hover:border-indigo-500/50 hover:bg-indigo-500/5 transition-all duration-500 text-center block shadow-xl"
                >
                  <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-500">{cat.icon || '📁'}</div>
                  <p className="text-sm font-black text-white uppercase tracking-widest group-hover:text-indigo-400 transition-colors">{cat.name}</p>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-zinc-600 text-center py-10">Select featured categories in admin to show them here.</p>
          )}
        </div>
      </section>

      {/* ── EDITOR'S CHOICE (FEATURED PROMPTS) ───────────────── */}
      <section id="prompts" className="py-32 px-6 bg-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-10">
            <div className="space-y-4 text-center md:text-left">
              <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">Curation</p>
              <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Editor&apos;s Choice</h2>
            </div>
            <Link href="/browse" className="text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors border-b border-zinc-800 pb-1">
              View Entire Library →
            </Link>
          </div>

          {featuredPrompts && featuredPrompts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {featuredPrompts.map((p) => (
                <div key={p.id} className="group rounded-[2.5rem] border border-zinc-800 bg-zinc-950 hover:border-zinc-600 transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-2xl">
                   <div className="aspect-[4/3] relative bg-zinc-900 overflow-hidden">
                      {p.thumbnail_url ? (
                        <img src={p.thumbnail_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-6xl opacity-10 font-black uppercase tracking-tighter bg-indigo-500/5">
                           {p.categories?.name}
                        </div>
                      )}
                      {(p.video_url || p.embed_html) && (
                        <div className="absolute top-6 right-6 flex items-center gap-2 bg-black/80 backdrop-blur-xl rounded-full px-4 py-2 border border-white/10">
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                          <span className="text-[10px] text-white font-black uppercase tracking-[0.2em]">High Impact</span>
                        </div>
                      )}
                   </div>
                   <div className="p-8 space-y-6">
                      <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">{p.categories?.name}</span>
                         <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">{p.ai_tool}</span>
                      </div>
                      <h3 className="text-xl font-bold text-white leading-tight h-14 line-clamp-2">{p.title}</h3>
                      <div className="flex items-center gap-3 pt-2">
                         <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 overflow-hidden">
                            {p.creators?.avatar_url && <img src={p.creators.avatar_url} alt={p.creators.name} className="w-full h-full object-cover" />}
                         </div>
                         <span className="text-xs font-bold text-zinc-500">@{p.creators?.handle}</span>
                      </div>
                      <Link href={`/${p.creators?.subdomain}/${p.slug}`} className="block w-full text-center rounded-2xl py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white bg-zinc-900 hover:bg-white hover:text-black transition-all duration-500">
                        View Prompt Breakdown
                      </Link>
                   </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-zinc-900/10 rounded-[4rem] border-2 border-dashed border-zinc-800/50">
              <p className="text-zinc-600 font-bold uppercase tracking-widest">No featured prompts curated yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── TOP CREATORS SPOTLIGHT ─────────────────────────── */}
      <section id="creators" className="py-32 px-6">
         <div className="max-w-7xl mx-auto">
            <div className="text-center mb-24 space-y-4">
               <p className="text-indigo-400 font-black text-[10px] uppercase tracking-[0.3em]">The Artists</p>
               <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Creator Spotlight</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
               {topCreators?.map((c, i) => (
                  <div key={i} className="p-10 rounded-[3.5rem] bg-zinc-900/30 border border-zinc-800 hover:bg-zinc-900/50 transition-all duration-500 space-y-6 text-center">
                     <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 mx-auto border-4 border-zinc-950 overflow-hidden shadow-2xl">
                        {c.avatar_url && <img src={c.avatar_url} alt={c.name} className="w-full h-full object-cover" />}
                     </div>
                     <div>
                        <h3 className="text-2xl font-black text-white">{c.name}</h3>
                        <p className="text-indigo-400 font-bold text-xs uppercase tracking-widest mt-1">@{c.handle}</p>
                     </div>
                     <p className="text-sm text-zinc-500 leading-relaxed line-clamp-3">{c.bio || "Leading AI content creator pushing the boundaries of digital art and cinematic generation."}</p>
                     <Link href={`/browse`} className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-white border-b border-indigo-500 pb-1">
                        View All Prompts
                     </Link>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* ── ABOUT / VALUE PROPOSITION ─────────────────────── */}
      <section id="about" className="py-40 px-6 bg-indigo-600">
         <div className="max-w-4xl mx-auto text-center space-y-12">
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter leading-tight italic">
               &quot;The difference between a viral reel and a flop is the prompt.&quot;
            </h2>
            <p className="text-xl md:text-2xl text-indigo-100 font-medium leading-relaxed">
               PromptHub was built to democratize high-end content creation. We verify every prompt against real-world performance metrics so you can create with confidence.
            </p>
            <div className="pt-8">
               <Link href="/browse" className="rounded-full bg-white px-16 py-7 text-sm font-black uppercase tracking-[0.3em] text-indigo-600 hover:bg-zinc-100 transition-all shadow-2xl shadow-black/20">
                  Join the Hub
               </Link>
            </div>
         </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="py-24 px-6 border-t border-white/5 bg-zinc-950">
        <div className="max-w-7xl mx-auto">
           <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
              <div className="space-y-6">
                 <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 bg-zinc-900 rounded-lg flex items-center justify-center font-bold text-zinc-400 border border-zinc-800">P</div>
                    <span className="text-sm font-bold text-white">PromptHub</span>
                 </div>
                 <p className="text-xs text-zinc-500 leading-relaxed uppercase font-bold tracking-widest">The discovery hub for high-performing AI prompts. Curated by creators, for creators.</p>
              </div>
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Explore</h4>
                 <ul className="space-y-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <li><Link href="/browse" className="hover:text-white transition-colors">Library</Link></li>
                    <li><a href="#categories" className="hover:text-white transition-colors">Topics</a></li>
                    <li><a href="#creators" className="hover:text-white transition-colors">Creators</a></li>
                 </ul>
              </div>
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Social</h4>
                 <ul className="space-y-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <li><a href="#" className="hover:text-white transition-colors">Twitter (X)</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                    <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                 </ul>
              </div>
              <div className="space-y-6">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Internal</h4>
                 <ul className="space-y-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    <li><Link href="/login" className="hover:text-white transition-colors">Creator Portal</Link></li>
                 </ul>
              </div>
           </div>
           <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8">
             <span className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.4em]">© 2024 PromptHub Platform. All Rights Reserved.</span>
             <div className="flex gap-10 text-[10px] font-black text-zinc-600 uppercase tracking-[0.2em]">
                <a href="#" className="hover:text-white transition-colors">Terms</a>
                <Link href="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
             </div>
           </div>
        </div>
      </footer>
    </div>
  )
}
