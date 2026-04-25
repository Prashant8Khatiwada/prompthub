'use client'

import { useState } from 'react'
import type { Prompt } from '@/types'
import CopyButton from './CopyButton'
import { trackEmailSubmit } from '@/lib/analytics'

interface Props {
  prompt: Prompt
}

export default function PromptGate({ prompt }: Props) {
  const [unlockedContent, setUnlockedContent] = useState<string | null>(
    prompt.gate_type === 'open' ? prompt.content : null
  )
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)

  // OPEN gate — show immediately
  if (prompt.gate_type === 'open') {
    return (
      <div className="space-y-4">
        <PromptContent content={prompt.content} />
        <CopyButton content={prompt.content} promptId={prompt.id} slug={prompt.slug} />
      </div>
    )
  }

  // EMAIL gate — unlocked after email submit
  if (prompt.gate_type === 'email') {
    if (unlockedContent) {
      return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Prompt unlocked!
          </div>
          <PromptContent content={unlockedContent} />
          <CopyButton content={unlockedContent} promptId={prompt.id} slug={prompt.slug} />
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Blurred preview */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
          <div className="p-5 font-mono text-sm text-zinc-300 leading-relaxed blur-sm select-none pointer-events-none">
            {prompt.content.slice(0, 120)}...
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent flex flex-col items-center justify-end pb-6 px-4">
            <p className="text-white font-semibold text-base mb-1">Unlock this prompt for free</p>
            <p className="text-zinc-400 text-sm">Enter your email to get instant access</p>
          </div>
        </div>

        {/* Email form */}
        <form
          id="email-unlock-form"
          onSubmit={async (e) => {
            e.preventDefault()
            setLoading(true)
            setError(null)
            try {
              const res = await fetch('/api/email-capture', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, prompt_id: prompt.id }),
              })
              const data = await res.json()
              if (!res.ok) {
                setError('Something went wrong. Try again.')
              } else {
                trackEmailSubmit(prompt.id)
                setUnlockedContent(data.content)
              }
            } catch {
              setError('Network error. Please try again.')
            } finally {
              setLoading(false)
            }
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <input
            type="email"
            id="email-input"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:border-transparent text-sm"
            style={{ ['--tw-ring-color' as string]: 'var(--brand, #6366f1)' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-60 whitespace-nowrap"
            style={{ background: 'var(--brand, #6366f1)' }}
          >
            {loading ? 'Unlocking…' : '🔓 Unlock Free Prompt'}
          </button>
        </form>
        {error && <p className="text-red-400 text-sm">{error}</p>}
      </div>
    )
  }

  // PAYMENT gate — stub (coming soon)
  return (
    <div className="space-y-4">
      {/* Blurred preview */}
      <div className="relative rounded-2xl overflow-hidden border border-zinc-800">
        <div className="p-5 font-mono text-sm text-zinc-300 leading-relaxed blur-sm select-none pointer-events-none">
          {prompt.content.slice(0, 120)}...
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/80 to-transparent flex flex-col items-center justify-end pb-6 px-4">
          <p className="text-white font-semibold text-base mb-1">
            Unlock for ${prompt.price?.toFixed(2) ?? '—'}
          </p>
          <p className="text-zinc-400 text-sm">One-time purchase • Instant access</p>
        </div>
      </div>

      <button
        id="payment-unlock-btn"
        onClick={() => {
          setShowToast(true)
          setTimeout(() => setShowToast(false), 3000)
        }}
        className="w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-sm text-white transition-all duration-200 active:scale-95"
        style={{ background: 'var(--brand, #6366f1)' }}
      >
        💳 Unlock for ${prompt.price?.toFixed(2) ?? '—'}
      </button>

      {showToast && (
        <div className="fixed bottom-6 right-6 bg-zinc-800 border border-zinc-700 text-white text-sm px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-bottom-2 duration-300 z-50">
          <span>🚧</span>
          <span>Payments coming soon!</span>
        </div>
      )}
    </div>
  )
}

function PromptContent({ content }: { content: string }) {
  return (
    <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-zinc-800 bg-zinc-900/80">
        <div className="w-3 h-3 rounded-full bg-zinc-700" />
        <div className="w-3 h-3 rounded-full bg-zinc-700" />
        <div className="w-3 h-3 rounded-full bg-zinc-700" />
        <span className="ml-2 text-xs text-zinc-500">prompt.txt</span>
      </div>
      <pre className="p-5 font-mono text-sm text-zinc-200 leading-relaxed whitespace-pre-wrap break-words">
        {content}
      </pre>
    </div>
  )
}
