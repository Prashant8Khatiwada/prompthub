'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Link as LinkIcon, Sparkles, Loader2 as LoaderIcon } from 'lucide-react'
import type { Prompt, Category } from '@/types'
import InstagramPostPicker, { type InstagramPost } from './InstagramPostPicker'

const AI_TOOLS = ['Midjourney', 'Claude', 'ChatGPT', 'Gemini', 'Runway', 'Pika', 'Kling', 'Veo', 'Other'] as const
const OUTPUT_TYPES = ['image', 'video', 'text', 'code', 'audio'] as const
const GATE_TYPES = ['open', 'email', 'payment'] as const

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
  const [categoryId, setCategoryId] = useState<string>(defaultValues?.category_id ?? '')
  const [categories, setCategories] = useState<Category[]>([])
  const [description, setDescription] = useState(defaultValues?.description ?? '')
  const [content, setContent] = useState(defaultValues?.content ?? '')
  const [aiTool, setAiTool] = useState<typeof AI_TOOLS[number]>(defaultValues?.ai_tool ?? 'Midjourney')
  const [outputType, setOutputType] = useState<typeof OUTPUT_TYPES[number]>(defaultValues?.output_type ?? 'image')
  const [gateType, setGateType] = useState<typeof GATE_TYPES[number]>(defaultValues?.gate_type ?? 'open')
  const [price, setPrice] = useState<string>(defaultValues?.price?.toString() ?? '')
  const [slug, setSlug] = useState(defaultValues?.slug ?? '')
  const [videoUrl, setVideoUrl] = useState(defaultValues?.video_url ?? '')
  const [embedHtml, setEmbedHtml] = useState(defaultValues?.embed_html ?? '')
  const [thumbnailUrl, setThumbnailUrl] = useState(defaultValues?.thumbnail_url ?? '')
  const [status, setStatus] = useState<'draft' | 'published'>(defaultValues?.status ?? 'published')
  const [featured, setFeatured] = useState(defaultValues?.featured ?? false)
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(!!defaultValues?.slug)
  const [contentType, setContentType] = useState<'prompt' | 'pdf'>(defaultValues?.content_type ?? 'prompt')
  const [pdfUrl, setPdfUrl] = useState(defaultValues?.pdf_url ?? '')
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const [isPickerOpen, setIsPickerOpen] = useState(false)
  const [isAutoFilling, setIsAutoFilling] = useState(false)

  useEffect(() => {
    async function fetchCategories() {
      const res = await fetch('/api/categories')
      const data = await res.json()
      if (res.ok) {
        setCategories(data)
        if (!categoryId && data.length > 0) {
          setCategoryId(data[0].id)
        }
      }
    }
    fetchCategories()
  }, [])

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

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPdf(true)
    const fd = new FormData()
    fd.append('file', file)
    const res = await fetch('/api/upload/pdf', { method: 'POST', body: fd })
    const data = await res.json()
    setUploadingPdf(false)
    if (data.url) {
      setPdfUrl(data.url)
      if (content === '') setContent('See attached PDF for instructions.')
    } else {
      setServerError(data.error ?? 'Upload failed')
    }
  }

  async function handlePostSelect(post: InstagramPost) {
    setIsPickerOpen(false)
    setIsAutoFilling(true)

    // 1. Set basic info
    setVideoUrl(post.permalink)
    setThumbnailUrl(post.media_type === 'VIDEO' ? (post.thumbnail_url || post.media_url) : post.media_url)

    // 2. Set title if empty or from caption
    if (post.caption) {
      const firstLine = post.caption.split('\n')[0].trim().substring(0, 60)
      if (title === '' || title === 'Untitled Prompt') {
        setTitle(firstLine)
        if (!slugManuallyEdited) {
          setSlug(toSlug(firstLine))
        }
      }
    }

    // 3. Fetch oEmbed
    try {
      const res = await fetch(`/api/instagram/oembed?url=${encodeURIComponent(post.permalink)}`)
      const data = await res.json()
      if (data.html) {
        setEmbedHtml(data.html)
      }
    } catch (err) {
      console.error('Failed to fetch oEmbed', err)
    } finally {
      setIsAutoFilling(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setErrors({})
    setServerError(null)

    const body = {
      title,
      slug,
      category_id: categoryId,
      description: description || null,
      content: contentType === 'prompt' ? content : (content || 'PDF Document'),
      content_type: contentType,
      pdf_url: contentType === 'pdf' ? pdfUrl : null,
      ai_tool: aiTool,
      output_type: outputType,
      gate_type: gateType,
      price: gateType === 'payment' ? parseFloat(price) : null,
      video_url: videoUrl || null,
      embed_html: embedHtml || null,
      thumbnail_url: thumbnailUrl || null,
      status,
      is_featured: featured,
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
          value={categoryId}
          onChange={e => setCategoryId(e.target.value)}
          className={inputCls}
          required
        >
          {categories.length === 0 && <option value="">No categories available</option>}
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        {errors.category_id && <p className="text-red-400 text-xs mt-1">{errors.category_id[0]}</p>}
        {categories.length === 0 && (
          <p className="text-amber-500 text-[10px] mt-1 uppercase font-bold">
            Go to <Link href="/admin/categories" className="underline">Categories</Link> to create one first.
          </p>
        )}
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

      {/* Content Type & Content */}
      <div className="space-y-4 border border-zinc-800 rounded-2xl p-6 bg-zinc-900/30">
        <div>
          <label className={labelCls}>Content Type</label>
          <div className="flex gap-3 bg-zinc-900 p-1 rounded-xl w-fit border border-zinc-800">
            <button
              type="button"
              onClick={() => setContentType('prompt')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${contentType === 'prompt' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              📝 Text Prompt
            </button>
            <button
              type="button"
              onClick={() => setContentType('pdf')}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${contentType === 'pdf' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
                }`}
            >
              📄 PDF Document
            </button>
          </div>
        </div>

        {contentType === 'prompt' ? (
          <div>
            <label className={labelCls}>Prompt Content *</label>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Paste the full AI prompt here..."
              rows={6}
              className={inputCls + ' resize-y font-mono'}
              required={contentType === 'prompt'}
            />
            {errors.content && <p className="text-red-400 text-xs mt-1">{errors.content[0]}</p>}
          </div>
        ) : (
          <div>
            <label className={labelCls}>PDF File *</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handlePdfUpload}
              className="block w-full text-sm text-zinc-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-500 transition-all cursor-pointer"
            />
            <p className="text-zinc-600 text-xs mt-1">Max 20MB. PDF only.</p>
            {uploadingPdf && <p className="text-indigo-400 text-xs mt-1">Uploading PDF…</p>}
            {pdfUrl && !uploadingPdf && (
              <p className="text-emerald-400 text-xs mt-1 truncate">✓ PDF Uploaded: {pdfUrl.split('/').pop()}</p>
            )}
            {errors.pdf_url && <p className="text-red-400 text-xs mt-1">{errors.pdf_url[0]}</p>}
            {/* Hidden content field for DB constraints */}
            <input type="hidden" value={content} />
          </div>
        )}
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
              className={`px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all ${gateType === g
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
            /{toSlug(title)}/
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

      {/* Video / Embed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className={labelCls}>Media Integration</label>
          <button
            type="button"
            onClick={() => setIsPickerOpen(true)}
            disabled={isAutoFilling}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold transition-all active:scale-95 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {isAutoFilling ? (
              <LoaderIcon className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            {isAutoFilling ? 'Auto-filling...' : 'Select from Instagram'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 rounded-2xl bg-zinc-900/30 border border-zinc-800">
          <div className={isAutoFilling ? 'animate-pulse' : ''}>
            <label className={labelCls}>Instagram / TikTok Reel URL</label>
            <input
              type="url"
              value={videoUrl}
              onChange={e => setVideoUrl(e.target.value)}
              placeholder="https://www.instagram.com/reel/..."
              className={inputCls}
            />
            <p className="text-[10px] text-zinc-500 mt-1">Direct link to the Reel or Post.</p>
          </div>
          <div className={isAutoFilling ? 'animate-pulse' : ''}>
            <label className={labelCls}>Manual Embed Code</label>
            <textarea
              value={embedHtml}
              onChange={e => setEmbedHtml(e.target.value)}
              placeholder="Paste <blockquote>...</blockquote> code here"
              rows={1}
              className={inputCls + ' resize-none'}
            />
            <p className="text-[10px] text-zinc-500 mt-1">Standard Instagram/TikTok embed HTML.</p>
          </div>
        </div>
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
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${status === 'published' ? 'bg-indigo-600' : 'bg-zinc-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${status === 'published' ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-semibold ${status === 'published' ? 'text-emerald-400' : 'text-zinc-500'}`}>
            {status === 'published' ? 'Published' : 'Draft'}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm font-semibold text-zinc-400">Featured:</label>
          <button
            type="button"
            onClick={() => setFeatured(!featured)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${featured ? 'bg-amber-500' : 'bg-zinc-700'}`}
          >
            <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${featured ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <span className={`text-sm font-semibold ${featured ? 'text-amber-400' : 'text-zinc-500'}`}>
            {featured ? '★ Featured' : 'Standard'}
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
            disabled={saving || uploading || uploadingPdf || categories.length === 0}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 shadow-lg shadow-indigo-500/20"
          >
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Prompt'}
          </button>
        </div>
      </div>
      <InstagramPostPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        onSelect={handlePostSelect}
      />
    </form>
  )
}
