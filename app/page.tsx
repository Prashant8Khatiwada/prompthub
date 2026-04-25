import Link from 'next/link'

const AI_TOOLS = ['Midjourney', 'ChatGPT', 'Claude', 'Runway', 'Gemini', 'Pika', 'Kling', 'Veo']
const GATE_TYPES = [
  { label: 'Free', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-500/20' },
  { label: 'Email Gate', color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-500/20' },
  { label: 'Paid', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-500/20' },
]

const MOCK_PROMPTS = [
  { title: 'Cinematic Photo Enhance', tool: 'Midjourney', type: 'Image', gate: 'Free', views: '12.4k', copies: '3.2k' },
  { title: 'Brand Logo Generator', tool: 'ChatGPT', type: 'Image', gate: 'Email Gate', views: '8.1k', copies: '2.1k' },
  { title: 'Viral Reel Script', tool: 'Claude', type: 'Text', gate: 'Paid', views: '5.7k', copies: '1.8k' },
]

const FEATURES = [
  {
    icon: '⚡',
    title: 'Instant Delivery',
    desc: 'Viewers comment a keyword, get a DM, land on your branded page — all in seconds.',
    gradient: 'from-yellow-500/20 to-orange-500/20',
    border: 'border-yellow-500/10',
  },
  {
    icon: '🎨',
    title: 'Full Brand Control',
    desc: 'Custom subdomain, brand colors, avatar, bio. Your page, your rules.',
    gradient: 'from-indigo-500/20 to-purple-500/20',
    border: 'border-indigo-500/10',
  },
  {
    icon: '🔒',
    title: 'Smart Gating',
    desc: 'Open, email capture, or paid unlock. Grow your list while sharing your best work.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    border: 'border-blue-500/10',
  },
  {
    icon: '📊',
    title: 'Real-Time Analytics',
    desc: 'Track views, copies, and conversions. Know exactly what content performs.',
    gradient: 'from-green-500/20 to-emerald-500/20',
    border: 'border-green-500/10',
  },
  {
    icon: '🔗',
    title: 'Social Integration',
    desc: 'Embed Instagram reels on your page. Connect TikTok, Instagram natively.',
    gradient: 'from-pink-500/20 to-rose-500/20',
    border: 'border-pink-500/10',
  },
  {
    icon: '🚀',
    title: 'SEO Optimized',
    desc: 'Full Open Graph tags, fast SSR pages. Get discovered organically.',
    gradient: 'from-violet-500/20 to-indigo-500/20',
    border: 'border-violet-500/10',
  },
]

const STEPS = [
  { num: '01', title: 'Set Up Your Profile', desc: 'Create your account, pick your subdomain, upload your avatar and set your brand color. Takes 2 minutes.' },
  { num: '02', title: 'Upload Your Prompts', desc: 'Paste your best-performing prompts, select the AI tool and gate type, and hit publish.' },
  { num: '03', title: 'Share the Link', desc: 'Drop your PromptHub link in your bio, TikTok comments, or Instagram DMs.' },
  { num: '04', title: 'Watch It Grow', desc: 'Track views, email captures, and copies in real-time. Iterate on what works.' },
]

const PRICING = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    desc: 'Perfect for getting started',
    features: ['3 published prompts', 'Open gate only', 'Basic analytics', 'PromptHub subdomain'],
    cta: 'Get Started Free',
    highlighted: false,
  },
  {
    name: 'Creator',
    price: '$12',
    period: 'per month',
    desc: 'For serious AI content creators',
    features: ['Unlimited prompts', 'Email gate', 'Full analytics dashboard', 'Custom brand colors', 'Instagram embed', 'Priority support'],
    cta: 'Start Creating',
    highlighted: true,
  },
  {
    name: 'Pro',
    price: '$29',
    period: 'per month',
    desc: 'For creators who monetize',
    features: ['Everything in Creator', 'Payment gating', 'Email list export', 'Custom domain', 'API access', 'White-label option'],
    cta: 'Go Pro',
    highlighted: false,
  },
]

const TESTIMONIALS = [
  { name: 'Zara K.', handle: '@zaracreates', text: "PromptHub changed how I share content. My email list went from 200 to 4,000 in 6 weeks just from gated prompts.", avatar: 'Z', color: '#6366f1' },
  { name: 'Raj M.', handle: '@rajmidjourney', text: "Finally a platform built for AI creators. My Midjourney prompts page looks premium and converts like crazy.", avatar: 'R', color: '#10b981' },
  { name: 'Sofia L.', handle: '@sofiaprompts', text: "The analytics alone are worth it. I can see exactly which prompts drive the most engagement and double down.", avatar: 'S', color: '#f59e0b' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white overflow-x-hidden">

      {/* ─── NAVBAR ─────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center font-extrabold text-white text-sm shadow-lg shadow-indigo-500/30">
              P
            </div>
            <span className="text-lg font-bold tracking-tight">Prompt<span className="text-indigo-400">Hub</span></span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-zinc-400 hover:text-white transition-colors px-3 py-2">Log in</Link>
            <Link href="/login" className="rounded-full bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-95 shadow-lg shadow-indigo-500/20">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ───────────────────────────────────────────── */}
      <section className="relative pt-40 pb-24 px-6 text-center">
        {/* ambient glow */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-indigo-600/15 blur-[150px] rounded-full" />
          <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-purple-600/10 blur-[100px] rounded-full" />
          <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-widest px-4 py-2 rounded-full mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500" />
            </span>
            The Prompt Delivery Platform
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-none mb-8">
            <span className="bg-gradient-to-b from-white via-white to-zinc-500 bg-clip-text text-transparent">
              Turn Prompts
            </span>
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-blue-400 bg-clip-text text-transparent">
              Into Revenue.
            </span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            AI content creators use PromptHub to share prompts on beautiful branded pages, 
            gate them behind emails or payments, and track every click.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link
              href="/login"
              className="w-full sm:w-auto rounded-full bg-indigo-600 px-10 py-4 text-lg font-bold text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 hover:-translate-y-0.5 transition-all active:scale-95"
            >
              Start Free Today →
            </Link>
            <a
              href="#how-it-works"
              className="w-full sm:w-auto rounded-full border border-zinc-700 px-10 py-4 text-lg font-semibold text-zinc-300 hover:border-zinc-500 hover:text-white transition-all active:scale-95"
            >
              See How It Works
            </a>
          </div>

          {/* ── DASHBOARD MOCKUP ── */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-indigo-500/10 to-transparent blur-2xl -z-10 rounded-3xl" />
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900/80 backdrop-blur p-1 shadow-2xl">
              {/* Window bar */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b border-zinc-800">
                <div className="w-3 h-3 rounded-full bg-red-500/70" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
                <div className="w-3 h-3 rounded-full bg-green-500/70" />
                <div className="flex-1 mx-4 h-6 bg-zinc-800 rounded-lg flex items-center justify-center">
                  <span className="text-xs text-zinc-500 font-mono">milan.prompthub.app</span>
                </div>
              </div>

              {/* Prompt cards grid */}
              <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {MOCK_PROMPTS.map((p, i) => (
                  <div key={i} className="rounded-2xl bg-zinc-800/60 border border-zinc-700/50 p-4 text-left hover:border-zinc-600 transition-colors">
                    <div className="aspect-video bg-zinc-700/50 rounded-xl mb-3 flex items-center justify-center text-2xl">
                      {p.type === 'Image' ? '🖼️' : p.type === 'Video' ? '🎬' : '📝'}
                    </div>
                    <p className="text-sm font-semibold text-white mb-2 leading-snug">{p.title}</p>
                    <div className="flex gap-1.5 flex-wrap mb-3">
                      <span className="text-xs bg-zinc-700 text-zinc-300 px-2 py-0.5 rounded-full">{p.tool}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${
                        p.gate === 'Free' ? 'bg-emerald-400/10 text-emerald-400 border-emerald-500/20' :
                        p.gate === 'Email Gate' ? 'bg-blue-400/10 text-blue-400 border-blue-500/20' :
                        'bg-amber-400/10 text-amber-400 border-amber-500/20'
                      }`}>{p.gate}</span>
                    </div>
                    <div className="flex justify-between text-xs text-zinc-500">
                      <span>👁 {p.views}</span>
                      <span>📋 {p.copies}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── TRUSTED TOOLS ──────────────────────────────────── */}
      <div className="py-12 border-y border-zinc-900">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-zinc-600 mb-8">Works with every AI tool</p>
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-14 px-6">
          {AI_TOOLS.map(tool => (
            <span key={tool} className="text-sm font-bold text-zinc-600 hover:text-zinc-400 transition-colors cursor-default">{tool}</span>
          ))}
        </div>
      </div>

      {/* ─── HOW IT WORKS ───────────────────────────────────── */}
      <section id="how-it-works" className="py-28 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">The Process</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Live in 4 simple steps</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {STEPS.map((step, i) => (
              <div key={i} className="group flex gap-6 p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-all">
                <div className="flex-shrink-0">
                  <span className="text-5xl font-extrabold bg-gradient-to-b from-indigo-400 to-indigo-700 bg-clip-text text-transparent leading-none">
                    {step.num}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2 group-hover:text-indigo-400 transition-colors">{step.title}</h3>
                  <p className="text-zinc-400 leading-relaxed text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ───────────────────────────────────────── */}
      <section id="features" className="py-28 px-6 bg-gradient-to-b from-transparent to-zinc-900/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Built for the Modern Creator</h2>
            <p className="text-zinc-400 max-w-xl mx-auto">Everything you need to turn your prompt engineering into a professional brand — nothing you don't.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <div key={i} className={`group p-8 rounded-3xl bg-gradient-to-br ${f.gradient} border ${f.border} hover:-translate-y-1 transition-all duration-300 cursor-default`}>
                <div className="text-4xl mb-5">{f.icon}</div>
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-300 transition-colors">{f.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── STATS ──────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '10k+', label: 'Prompts Delivered' },
            { value: '4.2k', label: 'Email Captures' },
            { value: '$0', label: 'To Start' },
            { value: '2 min', label: 'Setup Time' },
          ].map((s, i) => (
            <div key={i} className="text-center p-8 rounded-3xl bg-zinc-900/50 border border-zinc-800">
              <p className="text-4xl md:text-5xl font-extrabold text-indigo-400 mb-2">{s.value}</p>
              <p className="text-sm text-zinc-500 font-medium">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TESTIMONIALS ───────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Testimonials</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white">Creators love PromptHub</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="p-8 rounded-3xl bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 transition-all flex flex-col gap-6">
                <div className="flex text-amber-400 gap-1 text-sm">{'★★★★★'}</div>
                <p className="text-zinc-300 leading-relaxed flex-1">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: t.color }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{t.name}</p>
                    <p className="text-zinc-500 text-xs">{t.handle}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ────────────────────────────────────────── */}
      <section id="pricing" className="py-28 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-indigo-400 font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Simple, transparent pricing</h2>
            <p className="text-zinc-400">Start free. Upgrade when you're ready to grow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {PRICING.map((plan, i) => (
              <div key={i} className={`relative p-8 rounded-3xl border flex flex-col ${
                plan.highlighted
                  ? 'bg-indigo-600 border-indigo-500 shadow-2xl shadow-indigo-500/30 scale-105'
                  : 'bg-zinc-900/50 border-zinc-800'
              }`}>
                {plan.highlighted && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white text-indigo-900 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <p className={`text-sm font-semibold uppercase tracking-widest mb-2 ${plan.highlighted ? 'text-indigo-200' : 'text-zinc-400'}`}>{plan.name}</p>
                  <div className="flex items-end gap-1 mb-2">
                    <span className={`text-5xl font-extrabold ${plan.highlighted ? 'text-white' : 'text-white'}`}>{plan.price}</span>
                    <span className={`text-sm pb-1.5 ${plan.highlighted ? 'text-indigo-200' : 'text-zinc-500'}`}>/{plan.period}</span>
                  </div>
                  <p className={`text-sm ${plan.highlighted ? 'text-indigo-200' : 'text-zinc-500'}`}>{plan.desc}</p>
                </div>
                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-2.5 text-sm ${plan.highlighted ? 'text-indigo-100' : 'text-zinc-300'}`}>
                      <svg className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? 'text-white' : 'text-indigo-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/login"
                  className={`w-full text-center rounded-full py-3.5 font-bold text-sm transition-all active:scale-95 ${
                    plan.highlighted
                      ? 'bg-white text-indigo-700 hover:bg-zinc-100 shadow-lg'
                      : 'bg-zinc-800 border border-zinc-700 text-white hover:bg-zinc-700'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ──────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full -z-10" />
          <h2 className="text-4xl md:text-7xl font-extrabold text-white mb-8 tracking-tight">
            Your prompts deserve<br />
            <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">a better home.</span>
          </h2>
          <p className="text-zinc-400 text-lg md:text-xl mb-12 max-w-xl mx-auto">
            Join thousands of AI creators who've stopped leaving money on the table.
          </p>
          <Link
            href="/login"
            className="inline-block rounded-full bg-indigo-600 px-12 py-5 text-xl font-bold text-white shadow-2xl shadow-indigo-500/40 hover:bg-indigo-500 hover:-translate-y-1 transition-all active:scale-95"
          >
            Start Building Free
          </Link>
          <p className="mt-6 text-zinc-600 text-sm">No credit card required. Free forever plan available.</p>
        </div>
      </section>

      {/* ─── FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-zinc-900 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-700 rounded-lg flex items-center justify-center font-extrabold text-white text-xs">P</div>
            <span className="text-base font-bold">Prompt<span className="text-indigo-400">Hub</span></span>
          </div>
          <div className="flex gap-8 text-sm text-zinc-600">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Twitter</a>
            <a href="https://github.com/Prashant8Khatiwada/prompthub" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
          </div>
          <p className="text-sm text-zinc-700">© {new Date().getFullYear()} PromptHub. Built for creators.</p>
        </div>
      </footer>
    </div>
  )
}
