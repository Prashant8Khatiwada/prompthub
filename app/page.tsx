import Link from 'next/link'

// ─── Static mock data for demo sections ───────────────────────────────────────

const CATEGORIES = [
  { label: 'Video Generation', icon: '🎬', count: 12, color: 'from-violet-500/20 to-indigo-500/20', border: 'border-violet-500/20' },
  { label: 'Image Creation', icon: '🖼️', count: 28, color: 'from-blue-500/20 to-cyan-500/20', border: 'border-blue-500/20' },
  { label: 'Brand & Logo', icon: '✨', count: 9, color: 'from-amber-500/20 to-orange-500/20', border: 'border-amber-500/20' },
  { label: 'Education', icon: '📚', count: 6, color: 'from-emerald-500/20 to-green-500/20', border: 'border-emerald-500/20' },
  { label: 'Scriptwriting', icon: '📝', count: 14, color: 'from-pink-500/20 to-rose-500/20', border: 'border-pink-500/20' },
  { label: 'Photo Editing', icon: '🎨', count: 11, color: 'from-indigo-500/20 to-purple-500/20', border: 'border-indigo-500/20' },
]

const FEATURED_PROMPTS = [
  {
    title: 'Cinematic Neon City Reel',
    category: 'Video Generation',
    tool: 'Runway',
    toolColor: '#7c3aed',
    hasReel: true,
    thumbnail: null,
    icon: '🎬',
    views: '12.4k',
    slug: 'cinematic-neon-city-reel',
  },
  {
    title: 'Viral Product Photography',
    category: 'Image Creation',
    tool: 'Midjourney',
    toolColor: '#1b6ef3',
    hasReel: true,
    thumbnail: null,
    icon: '🖼️',
    views: '8.1k',
    slug: 'viral-product-photography',
  },
  {
    title: 'Logo Animation Pack',
    category: 'Brand & Logo',
    tool: 'Pika',
    toolColor: '#ec4899',
    hasReel: true,
    thumbnail: null,
    icon: '✨',
    views: '5.7k',
    slug: 'logo-animation-pack',
  },
  {
    title: 'Educational AI Explainer',
    category: 'Education',
    tool: 'ChatGPT',
    toolColor: '#10a37f',
    hasReel: false,
    thumbnail: null,
    icon: '📚',
    views: '3.2k',
    slug: 'educational-ai-explainer',
  },
]

const AI_TOOLS = ['Midjourney', 'ChatGPT', 'Claude', 'Runway', 'Gemini', 'Pika', 'Kling', 'Veo']

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

      {/* ── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-indigo-500/30">
              P
            </div>
            <span className="text-lg font-bold tracking-tight">Prompt<span className="text-indigo-400">Hub</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#prompts" className="hover:text-white transition-colors">Browse Prompts</a>
            <a href="#categories" className="hover:text-white transition-colors">Categories</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          </div>
          <Link
            href="/login"
            className="rounded-full bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 px-5 py-2 text-sm font-semibold text-white transition-all active:scale-95"
          >
            Admin Login
          </Link>
        </div>
      </nav>

      {/* ── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-40 pb-24 px-6 text-center">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-violet-600/8 blur-[100px] rounded-full" />
          <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-blue-600/8 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            AI Prompts &amp; Reels
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-none mb-8">
            <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
              The prompts behind
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              every great reel.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Discover the exact AI prompts, tools, and techniques behind viral content.
            Watch the reel, grab the prompt, create your own.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-24">
            <a
              href="#prompts"
              className="w-full sm:w-auto rounded-full bg-indigo-600 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Browse Prompts →
            </a>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto rounded-full border border-zinc-700 px-10 py-4 text-lg font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-all active:scale-95"
            >
              How It Works
            </a>
          </div>

          {/* ── HERO: Prompt card mockup (3 stacked) ── */}
          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-2 bg-gradient-to-b from-indigo-500/10 to-transparent blur-2xl rounded-3xl -z-10" />
            {/* Card 3 (bottom) */}
            <div className="absolute bottom-0 left-4 right-4 h-48 rounded-3xl border border-zinc-800 bg-zinc-900/60 -z-10 translate-y-4 scale-[0.96] opacity-40" />
            {/* Card 2 (middle) */}
            <div className="absolute bottom-0 left-2 right-2 h-48 rounded-3xl border border-zinc-800 bg-zinc-900/70 -z-10 translate-y-2 scale-[0.98] opacity-70" />
            {/* Card 1 (top / main) */}
            <div className="rounded-3xl border border-zinc-700 bg-zinc-900/90 backdrop-blur overflow-hidden shadow-2xl">
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/70" />
                <div className="flex-1 mx-3 h-5 bg-zinc-800 rounded-md flex items-center justify-center">
                  <span className="text-[10px] text-zinc-500 font-mono">prompthub.app/milan/cinematic-neon-city-reel</span>
                </div>
              </div>
              <div className="p-5 flex gap-4">
                {/* Mini reel thumbnail */}
                <div className="w-28 flex-shrink-0 aspect-[9/16] rounded-2xl bg-gradient-to-br from-indigo-800 to-black border border-zinc-700 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-white/15 backdrop-blur border border-white/25 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </div>
                {/* Prompt content */}
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <p className="text-base font-bold text-white leading-snug">Cinematic Neon City Reel</p>
                    <p className="text-xs text-zinc-500 mt-1">by @milan.ai &middot; Video Generation</p>
                  </div>
                  <div className="rounded-xl bg-zinc-800/60 border border-zinc-700/50 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-zinc-400">Prompt</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ background: '#7c3aed22', color: '#7c3aed' }}>Runway</span>
                    </div>
                    <p className="text-xs text-zinc-300 font-mono leading-relaxed line-clamp-3">
                      Cinematic anime cityscape, neon rain reflections, slow motion water ripples on asphalt, volumetric fog, anamorphic lens flare, 8K, --ar 9:16
                    </p>
                  </div>
                  <button className="w-full rounded-lg py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-500 transition-colors">
                    Copy Prompt
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SUPPORTED TOOLS ────────────────────────────────── */}
      <div className="py-10 border-y border-zinc-900">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-6">Prompts for every AI tool</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 px-6">
          {AI_TOOLS.map(tool => (
            <span key={tool} className="text-sm font-bold text-zinc-600 hover:text-zinc-400 transition-colors cursor-default">{tool}</span>
          ))}
        </div>
      </div>

      {/* ── CATEGORIES ─────────────────────────────────────── */}
      <section id="categories" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-2">Browse by Category</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Find prompts by topic</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat, i) => (
              <a
                key={i}
                href="#prompts"
                className={`group p-5 rounded-2xl bg-gradient-to-br ${cat.color} border ${cat.border} hover:-translate-y-1 transition-all duration-200 text-center block`}
              >
                <div className="text-3xl mb-3">{cat.icon}</div>
                <p className="text-sm font-bold text-white leading-snug group-hover:text-indigo-300 transition-colors">{cat.label}</p>
                <p className="text-xs text-zinc-500 mt-1">{cat.count} prompts</p>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PROMPTS ───────────────────────────────── */}
      <section id="prompts" className="py-24 px-6 bg-gradient-to-b from-transparent to-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div>
              <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-2">Latest Prompts</p>
              <h2 className="text-3xl md:text-4xl font-bold text-white">Ready to copy &amp; use</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {FEATURED_PROMPTS.map((p, i) => (
              <div
                key={i}
                className="group rounded-3xl border border-zinc-800 bg-zinc-900/60 hover:border-zinc-600 transition-all duration-200 hover:-translate-y-1 overflow-hidden cursor-pointer"
              >
                {/* Thumbnail / reel area */}
                <div className="aspect-video relative bg-zinc-800 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center text-5xl">
                    {p.icon}
                  </div>
                  {p.hasReel && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur border border-white/30 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                      </div>
                    </div>
                  )}
                  {p.hasReel && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur rounded-full px-2 py-1">
                      <svg className="w-3 h-3 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="text-[10px] text-white font-semibold">Reel</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-zinc-500 mb-1">{p.category}</p>
                    <p className="text-sm font-bold text-white leading-snug">{p.title}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${p.toolColor}22`, color: p.toolColor }}>
                      {p.tool}
                    </span>
                    <span className="text-xs text-zinc-500">👁 {p.views}</span>
                  </div>
                  <button className="w-full rounded-xl py-2.5 text-sm font-bold text-white bg-zinc-800 hover:bg-indigo-600 border border-zinc-700 hover:border-indigo-500 transition-all">
                    View Prompt →
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button className="rounded-full border border-zinc-700 px-8 py-3.5 text-sm font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-all">
              Load More Prompts
            </button>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">How It Works</p>
            <h2 className="text-3xl md:text-5xl font-bold text-white">Watch the reel. Get the prompt.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: '01', icon: '📱', title: 'See a reel you love', desc: 'Spot an AI-generated video on Instagram or TikTok — any category, any style.' },
              { step: '02', icon: '🔗', title: 'Follow the link', desc: 'The creator drops a PromptHub link in the caption. Tap it to see the full breakdown.' },
              { step: '03', icon: '📋', title: 'Copy the prompt', desc: 'Watch the embedded reel, read the exact prompts used, and copy them in one click.' },
            ].map((s, i) => (
              <div key={i} className="group p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all text-center">
                <div className="text-4xl mb-3">{s.icon}</div>
                <span className="block text-4xl font-extrabold bg-gradient-to-b from-indigo-400 to-indigo-700 bg-clip-text text-transparent mb-4">{s.step}</span>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full -z-10" />
          <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
            Start creating<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              with better prompts.
            </span>
          </h2>
          <p className="text-zinc-400 text-lg mb-12 max-w-xl mx-auto">
            Browse all prompts, watch the reels they created, and copy what works.
          </p>
          <a
            href="#prompts"
            className="inline-block rounded-full bg-indigo-600 px-12 py-5 text-xl font-bold text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 hover:-translate-y-1 transition-all active:scale-95"
          >
            Browse All Prompts
          </a>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center font-extrabold text-white text-xs">P</div>
            <span className="text-base font-bold">Prompt<span className="text-indigo-400">Hub</span></span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-600">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
            <a href="https://github.com/Prashant8Khatiwada/prompthub" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
          </div>
          <p className="text-sm text-zinc-700">&copy; {new Date().getFullYear()} PromptHub</p>
        </div>
      </footer>
    </div>
  )
}
