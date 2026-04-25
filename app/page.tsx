export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)]">
      <div className="max-w-2xl px-6 py-12 text-center bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
          Prompt<span className="text-indigo-500">Hub</span>
        </h1>
        <p className="mt-6 text-xl leading-8 text-zinc-400">
          The premium prompt delivery platform for elite AI content creators. 
          Monetize your expertise with custom-branded prompt pages.
        </p>
        <div className="flex items-center justify-center mt-10 gap-x-6">
          <a
            href="/login"
            className="rounded-full bg-indigo-600 px-8 py-4 text-lg font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all active:scale-95"
          >
            Creator Login
          </a>
          <a href="https://github.com/Prashant8Khatiwada/prompthub" target="_blank" className="text-lg font-semibold leading-6 text-zinc-300 hover:text-white transition-colors">
            Learn more <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      
      <footer className="mt-12 text-zinc-600 text-sm">
        © {new Date().getFullYear()} PromptHub. All rights reserved.
      </footer>
    </div>
  )
}
