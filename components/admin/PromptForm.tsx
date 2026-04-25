'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Prompt, PromptCategory } from '@/types'

const AI_TOOLS = ['Midjourney', 'Claude', 'ChatGPT', 'Gemini', 'Runway', 'Pika', 'Kling', 'Veo', 'Other'] as const
const OUTPUT_TYPES = ['image', 'video', 'text', 'code', 'audio'] as const
const GATE_TYPES = ['open', 'email', 'payment'] as const
const CATEGORIES: PromptCategory[] = [
  'Video Generation', 'Image Creation', 'Brand & Logo', 'Education', 'Scriptwriting', 'Photo Editing', 'Other',
]

function toSlug(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

interface Props {
  defaultValues?: Partial<Prompt>
  promptId?: string
}

type FieldErrors = Record<string, string[]>

const inputCls = 'w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all text-sm'
const labelCls = 'block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2'

export default function PromptForm({ defaultValues, promptId }: Props) {
  const router = useRouter()
  const isEdit = !!promptId

  const [title, setTitle] = useState(defaultValues?.title ?? '')
  const [category, setCategory] = useState<PromptCategory>(defaultValues?.category ?? 'Video Generation')
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [content, setContent] = useState(defaultValues?.content ?? '')
  const [aiTool, setAiTool] = useState<typeof AI_TOOLS[number]>(defaultValues?.ai_tool ?? 'Midjourney')
  const [outputType, setOutputType] = useState<typeof OUTPUT_TYPES[number]>(defaultValues?.output_type ?? 'image')
  const [gateType, setGateType] = useState<typeof GATE_TYPES[number]>(defaultValues?.gate_type ?? 'open')
  const [price, setPrice] = useState<string>(defaultValues?.price?.toString() ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [videoUrl, setVideoUrl] = useState(defaultValues?.video_url ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(defaultValues?.thumbnail_url ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(defaultValues?.status ?? 'draft')
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)

  // Auto-generate slug from title unless manually edited


  async function handleThumbnailUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: fd })
    const data = await res.json()
    setUploading(false)
    if (data.url) {
      setThumbnailUrl(data.url)
    } else {
      setServerError(data.error ?? 'Upload failed')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setServerError(null)

    const body = {
      title,
      category,
      description: description || null,
      content,
      ai_tool: aiTool,
      output_type: outputType,
      gate_type: gateType,
      price: gateType === 'payment' && price ? parseFloat(price) : null,
      slug,
      video_url: videoUrl || null,
      thumbnail_url: thumbnailUrl || null,
      status,
    }

    const url = isEdit ? `/api/prompts/${promptId}` : '/api/prompts'
    const method = isEdit ? 'PATCH' : 'POST'

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      if (data.error?.fieldErrors) {
        setErrors(data.error.fieldErrors)
      } else {
        setServerError(data.error ?? 'An error occurred')
      }
      return
    }

    router.push('/admin/prompts')
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {serverError && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-4 rounded-xl">
          {serverError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className={labelCls}>Title *</label>
        <input
          type="text"
          value={title}
          onChange={e => {
            const newTitle = e.target.value
            setTitle(newTitle)
            if (!slugManuallyEdited) {
              setSlug(toSlug(newTitle))
            }
          }}
          placeholder="Cinematic Neon City Reel"
          className={inputCls}
          required
        />
        {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title[0]}</p>}
      </div>

      {/* Category */}
      <div>
        <label className={labelCls}>Category *</label>
        <select
          value={category}
          onChange={e => setCategory(e.target.value as PromptCategory)}
          className={inputCls}
          required
        >
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        {errors.category && <p className="text-red-400 text-xs mt-1">{errors.category[0]}</p>}
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description</label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Short description shown as subtitle on the prompt page..."
          rows={2}
          className={inputCls + ' resize-none'}
        />
      </div>

      {/* Content */}
      <div>
        <label className={labelCls}>Prompt Content *</label>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Paste the full AI prompt here..."
          rows={6}
          className={inputCls + ' resize-y font-mono'}
          required
        />
        {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content[0]}</p>}
      </div>

      {/* AI Tool + Output Type row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div>
          <label className={labelCls}>AI Tool *</label>
          <select value={aiTool} onChange={e => setAiTool(e.target.value as typeof AI_TOOLS[number])} className={inputCls}>
            {AI_TOOLS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls}>Output Type *</label>
          <select value={outputType} onChange={e => setOutputType(e.target.value as typeof OUTPUT_TYPES[number])} className={inputCls}>
            {OUTPUT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Gate Type */}
      <div>
        <label className={labelCls}>Gate Type *</label>
        <div className="flex gap-3 flex-wrap">
          {GATE_TYPES.map(g => (
            <button
              key={g}
              type="button"
              onClick={() => setGateType(g)}
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${
                gateType === g
                  ? 'bg-indigo-600 border-indigo-500 text-white'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-white'
              }`}
            >
              {g === 'open' ? '🔓 Open' : g === 'email' ? '📧 Email Gate' : '💳 Payment'}
            </button>
          ))}
        </div>
        {gateType === 'payment' && (
          <div className="mt-4">
            <label className={labelCls}>Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="4.99"
              min="0.50"
              step="0.01"
              className={inputCls + ' max-w-xs'}
            />
            {errors.price && <p className="text-red-400 text-xs mt-1">{errors.price[0]}</p>}
          </div>
        )}
      </div>

      {/* Slug */}
      <div>
        <label className={labelCls}>Slug *</label>
        <div className="flex items-center">
          <span className="px-4 py-3 bg-zinc-900 border border-r-0 border-zinc-700 rounded-l-xl text-zinc-500 text-sm">
            /milan/
          </span>
          <input
            type="text"
            value={slug}
            onChange={e => { setSlug(e.target.value); setSlugManuallyEdited(true) }}
            placeholder="cinematic-neon-city"
            className={inputCls + ' rounded-l-none'}
          />
        </div>
        {errors.slug && <p className="text-red-400 text-xs mt-1">{errors.slug[0]}</p>}
      </div>

      {/* Instagram/TikTok Video URL */}
      <div>
        <label className={labelCls}>Instagram / TikTok Reel URL</label>
        <input
          type="url"
          value={videoUrl}
          onChange={e => setVideoUrl(e.target.value)}
          placeholder="https://www.instagram.com/reel/..."
          className={inputCls}
        />
        {errors.video_url && <p className="text-red-400 text-xs mt-1">{errors.video_url[0]}</p>}
      </div>

      {/* Thumbnail */}
      <div>
        <label className={labelCls}>Thumbnail Image</label>
        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleThumbnailUpload}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 transition-all cursor-pointer"
            />
            <p className="text-zinc-600 text-xs mt-1">JPEG, PNG or WebP. Max 5MB.</p>
            {uploading && <p className="text-indigo-400 text-xs mt-1">Uploading…</p>}
            {thumbnailUrl && !uploading && (
              <p className="text-emerald-400 text-xs mt-1 truncate">✓ {thumbnailUrl}</p>
            )}
          </div>
          {thumbnailUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumbnailUrl} alt="Thumbnail" className="w-20 h-14 object-cover rounded-lg border border-zinc-700 flex-shrink-0" />
          )}
        </div>
      </div>

      {/* Status + Submit */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 pt-4 border-t border-zinc-800">
        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-zinc-400">Status:</label>
          <button
            type="button"
            onClick={() => setStatus(s => s === 'draft' ? 'published' : 'draft')}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              status === 'published' ? 'bg-indigo-600' : 'bg-zinc-700'
            }`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              status === 'published' ? 'translate-x-6' : 'translate-x-1'
            }`} />
          </button>
          <span className={`text-sm font-semibold ${status === 'published' ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>

        <div className="flex gap-3 sm:ml-auto">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 rounded-xl border border-zinc-700 text-sm font-semibold text-zinc-400 hover:text-white hover:border-zinc-600 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving || uploading}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-500/20"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Prompt'}
          </button>
        </div>
      </div>
    </form>
  )
}
