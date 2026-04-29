'use client'

import { useState } from 'react'
import { trackCopy } from '@/lib/analytics'

interface Props {
  content: string
  promptId: string
  slug: string
}

export default function CopyButton({ content, promptId, slug }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      trackCopy(promptId)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = content
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      trackCopy(promptId)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <button
      id="copy-prompt-btn"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95"
      style={{
        background: copied ? 'rgb(16 185 129)' : 'var(--brand, #6366f1)',
        color: 'white',
      }}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy Prompt
        </>
      )}
    </button>
  )
}
