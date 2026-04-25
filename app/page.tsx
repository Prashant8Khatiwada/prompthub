import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <div className="max-w-2xl w-full py-16 text-center bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl px-8">
        <div className="mb-6 inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full">
          ✨ Prompt Delivery Platform
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-6xl mb-4">
          Prompt<span className="text-indigo-500">Hub</span>
        </h1>
        <p className="text-lg leading-8 text-zinc-400 mb-10">
          The premium prompt delivery platform for elite AI content creators.
          Share your prompts with a branded, mobile-first page.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/login"
            id="creator-login-btn"
            className="rounded-full bg-indigo-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 transition-all active:scale-95"
          >
            Creator Login →
          </Link>
          <a
            href="https://github.com/Prashant8Khatiwada/prompthub"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            View on GitHub
          </a>
        </div>
      </div>
      <footer className="mt-10 text-zinc-600 text-sm">
        © {new Date().getFullYear()} PromptHub
      </footer>
    </div>
  )
}
