'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Prompt } from '@/types'

// Dynamically import PdfViewer with SSR disabled since it relies on window
const PdfViewer = dynamic(() => import('./PdfViewer'), { ssr: false })
import CopyButton from './CopyButton'
import { trackEmailSubmit } from '@/lib/analytics'
import { Download, FileText } from 'lucide-react'

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
        <PromptContent prompt={prompt} content={prompt.content} />
      </div>
    )
  }

  // EMAIL gate — unlocked after email submit
  if (prompt.gate_type === 'email') {
    if (unlockedContent) {
      return (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
          <PromptContent prompt={prompt} content={unlockedContent} />
        </div>
      )
    }

    return (
      <div className="space-y-4">
        {/* Blurred preview */}
        <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 shadow-sm">
          <div className="p-6 font-mono text-sm text-zinc-400 leading-relaxed blur-md select-none pointer-events-none">
            {prompt.content.slice(0, 150)}...
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/40 flex flex-col items-center justify-end pb-8 px-4">
            <p className="text-zinc-900 font-extrabold text-lg mb-1">Unlock this prompt for free</p>
            <p className="text-zinc-500 text-sm">Enter your email to get instant access</p>
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
            className="flex-1 px-4 py-3.5 rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:border-transparent text-sm shadow-sm"
            style={{ ['--tw-ring-color' as string]: 'var(--brand, #6366f1)' }}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3.5 rounded-xl font-bold text-sm text-white transition-all duration-200 active:scale-95 disabled:opacity-60 whitespace-nowrap shadow-md hover:shadow-lg"
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
      <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-50 shadow-sm">
        <div className="p-6 font-mono text-sm text-zinc-400 leading-relaxed blur-md select-none pointer-events-none">
          {prompt.content.slice(0, 150)}...
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/95 to-white/40 flex flex-col items-center justify-end pb-8 px-4">
          <p className="text-zinc-900 font-extrabold text-lg mb-1">
            Unlock for ${prompt.price?.toFixed(2) ?? '—'}
          </p>
          <p className="text-zinc-500 text-sm">One-time purchase • Instant access</p>
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

function PdfPlaceholder({ prompt }: { prompt: Prompt }) {
  const [fileSize, setFileSize] = useState<string | null>(null)

  const filename = prompt.pdf_url
    ? decodeURIComponent(prompt.pdf_url.split('/').pop()?.split('?')[0] ?? `${prompt.title}.pdf`)
    : `${prompt.title}.pdf`

  useEffect(() => {
    if (!prompt.pdf_url) return
    fetch(prompt.pdf_url, { method: 'HEAD' })
      .then((res: Response) => {
        const bytes = parseInt(res.headers.get('content-length') ?? '0', 10)
        if (bytes > 0) {
          setFileSize(bytes >= 1048576
            ? `${(bytes / 1048576).toFixed(1)} MB`
            : `${Math.round(bytes / 1024)} KB`)
        }
      })
      .catch(() => null)
  }, [prompt.pdf_url])

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-zinc-700/60">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/70" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <div className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
            prompt.pdf
          </span>
        </div>
        <a
          href={prompt.pdf_url || '#'}
          download
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-bold transition-all active:scale-95 shadow"
          style={{ background: 'var(--brand, #6366f1)' }}
        >
          <Download className="w-3 h-3" />
          Download PDF
        </a>
      </div>

      {/* Body */}
      <div
        className="relative px-6 py-12 flex flex-col items-center justify-center text-center"
        style={{
          background: 'linear-gradient(135deg, #18181b 0%, #1e1e2a 50%, #18181b 100%)',
        }}
      >
        {/* Decorative blur blob */}
        <div
          className="absolute inset-0 opacity-20 blur-3xl pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 50%, var(--brand, #6366f1) 0%, transparent 70%)',
          }}
        />

        {/* PDF Icon Card */}
        <div className="relative mb-6">
          <div
            className="w-20 h-24 rounded-xl flex flex-col items-end justify-start shadow-2xl overflow-hidden border border-zinc-700/60"
            style={{ background: 'linear-gradient(145deg, #27272a, #1c1c22)' }}
          >
            {/* Corner fold */}
            <div
              className="w-6 h-6 rounded-bl-lg"
              style={{
                background: 'linear-gradient(225deg, #3f3f46 50%, transparent 50%)',
              }}
            />
            {/* PDF label */}
            <div className="flex-1 w-full flex items-center justify-center">
              <span
                className="text-xs font-extrabold tracking-widest uppercase"
                style={{ color: 'var(--brand, #6366f1)' }}
              >
                PDF
              </span>
            </div>
            {/* Bottom stripe */}
            <div
              className="w-full h-1.5 opacity-70"
              style={{ background: 'var(--brand, #6366f1)' }}
            />
          </div>
          {/* Glow under icon */}
          <div
            className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-16 h-4 blur-xl opacity-50 rounded-full"
            style={{ background: 'var(--brand, #6366f1)' }}
          />
        </div>

        {/* File Info */}
        <h3 className="relative text-zinc-100 font-bold text-base leading-tight max-w-[220px] line-clamp-2 mb-1">
          {filename}
        </h3>
        <div className="relative flex items-center gap-2 text-xs text-zinc-500 mb-8">
          <span>PDF Document</span>
          {fileSize && (
            <>
              <span className="w-1 h-1 rounded-full bg-zinc-700 inline-block" />
              <span>{fileSize}</span>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="relative flex gap-3 flex-wrap justify-center">
          <a
            href={prompt.pdf_url || '#'}
            download
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all active:scale-95 shadow-lg"
            style={{ background: 'var(--brand, #6366f1)' }}
          >
            <Download className="w-4 h-4" />
            Download
          </a>
          <a
            href={prompt.pdf_url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-semibold transition-colors border border-zinc-700"
          >
            <FileText className="w-4 h-4" />
            View
          </a>
        </div>
      </div>
    </div>
  )
}

function PromptContent({ prompt, content }: { prompt: Prompt; content: string }) {
  const isPdf = prompt.content_type === 'pdf'
  const [activeVariantIndex, setActiveVariantIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)

  if (isPdf) {
    return <PdfPlaceholder prompt={prompt} />
  }

  let variants: { subtitle: string; description: string }[] = []
  let isVariants = false

  try {
    if (content.startsWith('[') && content.endsWith(']')) {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed) && parsed.length > 0 && parsed.every(v => 'subtitle' in v && 'description' in v)) {
        variants = parsed
        isVariants = true
      }
    }
  } catch (e) {
    isVariants = false
  }

  const currentContent = isVariants ? (variants[activeVariantIndex]?.description || '') : content
  const hasMoreContent = currentContent.split('\n').length > 2 || currentContent.length > 120

  return (
    <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden shadow-2xl transition-shadow hover:shadow-md select-none">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-3 border-b border-zinc-800 bg-zinc-900/50 backdrop-blur-sm gap-3">
        <div className="flex items-center gap-1.5 justify-between w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-zinc-800" />
            <div className="w-3 h-3 rounded-full bg-zinc-800" />
            <div className="w-3 h-3 rounded-full bg-zinc-800" />
            <span className="ml-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
              prompt.txt
            </span>
          </div>
          {isVariants && (
            <div className="flex bg-zinc-950 p-0.5 border border-zinc-800 rounded-xl gap-0.5 select-none sm:ml-4 flex-nowrap overflow-x-auto max-w-full">
              {variants.map((v, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setActiveVariantIndex(idx)
                    setIsExpanded(false)
                  }}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                    activeVariantIndex === idx ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {v.subtitle || `Variant ${idx + 1}`}
                </button>
              ))}
            </div>
          )}
        </div>
        <CopyButton
          content={currentContent}
          promptId={prompt.id}
          slug={prompt.slug}
        />
      </div>
      
      <div className={`p-6 font-mono text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap break-words select-text ${!isExpanded ? 'line-clamp-2 overflow-hidden' : ''}`}>
        {currentContent}
      </div>

      {hasMoreContent && (
        <div className="px-6 pb-4 pt-1 flex justify-start">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 transition-colors select-none"
          >
            {isExpanded ? 'Show less' : 'Show more'}
          </button>
        </div>
      )}
    </div>
  )
}
