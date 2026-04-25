'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Creator } from '@/types'

interface Props {
  defaultValues: Creator
}

export default function SettingsForm({ defaultValues }: Props) {
  const [formData, setFormData] = useState<Partial<Creator>>(defaultValues)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [uploading, setUploading] = useState(false)
  const router = useRouter()

  async function handleAvatarUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    const body = new FormData()
    body.append('file', file)

    try {
      const res = await fetch('/api/upload', { method: 'POST', body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Upload failed')
      setFormData(prev => ({ ...prev, avatar_url: data.url }))
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      // Pick only the fields we want to save
      const payload = {
        name: formData.name,
        handle: formData.handle,
        bio: formData.bio,
        brand_color: formData.brand_color,
        avatar_url: formData.avatar_url,
        instagram_url: formData.instagram_url,
        tiktok_url: formData.tiktok_url,
      }

      const res = await fetch('/api/creator', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()
      if (!res.ok) {
        if (data.error?.fieldErrors) {
          const firstError = Object.values(data.error.fieldErrors)[0] as string[]
          throw new Error(firstError[0])
        }
        throw new Error(data.error || 'Failed to save settings')
      }

      setSuccess(true)
      router.refresh()
      setTimeout(() => setSuccess(false), 3000)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-12 animate-in fade-in duration-500">
      {/* ── PROFILE SECTION ─────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Public Profile</h2>

        <div className="flex items-center gap-8 bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full bg-zinc-800 border-2 border-zinc-700 overflow-hidden">
              {formData.avatar_url ? (
                <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-3xl font-bold">
                  {formData.name?.charAt(0)}
                </div>
              )}
            </div>
            <label className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-full">
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">{uploading ? '...' : 'Change'}</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
          <div className="space-y-1">
            <h3 className="text-white font-bold">{formData.name}</h3>
            <p className="text-zinc-500 text-sm">{formData.handle}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Full Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Handle</label>
            <input
              type="text"
              value={formData.handle || ''}
              onChange={e => setFormData(prev => ({ ...prev, handle: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Bio</label>
          <textarea
            rows={3}
            value={formData.bio || ''}
            onChange={e => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
            placeholder="Tell your audience about yourself..."
          />
        </div>
      </section>

      {/* ── BRANDING SECTION ───────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Branding</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Brand Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={formData.brand_color || '#6366f1'}
                  onChange={e => setFormData(prev => ({ ...prev, brand_color: e.target.value }))}
                  className="w-12 h-12 rounded-lg bg-transparent border-none cursor-pointer p-0 overflow-hidden"
                />
                <code className="text-sm text-zinc-300 uppercase bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800">
                  {formData.brand_color}
                </code>
              </div>
            </div>
            <div className="p-4 bg-zinc-900/30 rounded-2xl border border-dashed border-zinc-800 text-xs text-zinc-500 leading-relaxed">
              This color will be used for your buttons, icons, and highlights on your public profile and prompt pages.
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Preview</label>
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex items-center justify-center">
              <div className="w-full max-w-[200px] bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="aspect-square bg-zinc-800" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-3/4 bg-zinc-800 rounded" />
                  <div
                    className="h-8 w-full rounded-lg"
                    style={{ background: formData.brand_color }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIALS ────────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Social Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">Instagram URL</label>
            <input
              type="url"
              value={formData.instagram_url || ''}
              onChange={e => setFormData(prev => ({ ...prev, instagram_url: e.target.value }))}
              placeholder="https://instagram.com/yourname"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider ml-1">TikTok URL</label>
            <input
              type="url"
              value={formData.tiktok_url || ''}
              onChange={e => setFormData(prev => ({ ...prev, tiktok_url: e.target.value }))}
              placeholder="https://tiktok.com/@yourname"
              className="w-full px-4 py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            />
          </div>
        </div>
      </section>

      {/* ── SUBDOMAIN ─────────────────────────────────────── */}
      <section className="space-y-6">
        <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Platform</h2>
        <div className="p-6 bg-zinc-900/50 rounded-3xl border border-zinc-800">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Your Personal Hub URL</p>
            <p className="text-lg font-mono text-white pt-1">
              {formData.subdomain}<span className="text-zinc-600">.prompthub.app</span>
            </p>
          </div>
          <p className="mt-4 text-xs text-zinc-500 flex items-center gap-2">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Subdomain cannot be changed manually. Contact support to update.
          </p>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="pt-8 border-t border-zinc-800 flex items-center justify-between">
        <div className="flex-1">
          {error && <p className="text-red-400 text-sm font-medium">{error}</p>}
          {success && <p className="text-emerald-400 text-sm font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Settings saved successfully!
          </p>}
        </div>
        <button
          type="submit"
          disabled={loading || uploading}
          className="px-8 py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center gap-2 shadow-xl shadow-white/5"
        >
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </footer>
    </form>
  )
}
