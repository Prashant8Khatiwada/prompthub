'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { InstagramUser, InstagramMedia } from '@/lib/instagram'
import type { Creator, Category, Prompt } from '@/types'
import InstagramProfile from './InstagramProfile'
import { Sparkles, FileText, Image as ImageIcon, Video, Code, Music, ChevronRight, Grid3x3, LayoutGrid } from 'lucide-react'
import AdBanner, { AdPlacementData } from './AdBanner'

interface PromptWithCategory extends Prompt {
  categories?: { name: string } | null
}

interface Props {
  creator: Creator
  igUser: InstagramUser | null
  igFeed: InstagramMedia[]
  categories: Category[]
  prompts: PromptWithCategory[]
  adPlacements?: AdPlacementData[]
}

const AI_TOOL_COLORS: Record<string, string> = {
  Midjourney: '#1b6ef3',
  ChatGPT: '#10a37f',
  Claude: '#c96442',
  Gemini: '#4285f4',
  Runway: '#7c3aed',
  Pika: '#ec4899',
  Kling: '#f59e0b',
  Veo: '#06b6d4',
  Other: '#6366f1',
}

const OUTPUT_ICONS: Record<string, React.ReactNode> = {
  image: <ImageIcon className="w-3.5 h-3.5" />,
  video: <Video className="w-3.5 h-3.5" />,
  text: <FileText className="w-3.5 h-3.5" />,
  code: <Code className="w-3.5 h-3.5" />,
  audio: <Music className="w-3.5 h-3.5" />,
}

const GATE_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Free', color: '#10a37f' },
  email: { label: 'Email', color: '#f59e0b' },
  payment: { label: 'Paid', color: '#6366f1' },
}

export default function UserProfilePageClient({ creator, igUser, categories, prompts, adPlacements = [] }: Props) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Map category id → category
  const categoryMap = useMemo(() => {
    const m: Record<string, Category> = {}
    categories.forEach(c => { m[c.id] = c })
    return m
  }, [categories])

  // Derive which category ids actually have published prompts
  const activeCategoryIds = useMemo(() => {
    const ids = new Set(prompts.map(p => p.category_id).filter(Boolean))
    return categories.filter(c => ids.has(c.id))
  }, [categories, prompts])

  const filteredPrompts = useMemo(() => {
    if (!activeCategory) return prompts
    return prompts.filter(p => p.category_id === activeCategory)
  }, [prompts, activeCategory])

  const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN || 'prompthub.app'

  const promptUrl = (slug: string) => {
    // If we're on localhost, use path-based routing for easier testing
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname === 'localhost' || hostname === '127.0.0.1') {
        return `/${creator.subdomain}/${slug}`
      }
    }
    
    const cleanBaseDomain = baseDomain.replace(/^https?:\/\//, '')
    return `https://${creator.subdomain}.${cleanBaseDomain}/${slug}`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <div className="max-w-5xl mx-auto px-4 pb-20">

        {/* ─── Instagram Profile Section ─── */}
        <section className="pt-6">
          {igUser ? (
            <div className="rounded-2xl overflow-hidden border border-white/5 bg-zinc-900/50 backdrop-blur">
              <InstagramProfile
                user={igUser}
                creator={creator}
              />
            </div>
          ) : (
            /* Fallback profile card when no IG connected */
            <div className="rounded-2xl border border-white/5 bg-zinc-900/50 p-6 md:p-10 flex gap-6 md:gap-10 items-start">
              {/* Avatar */}
              <div
                className="w-20 h-20 md:w-28 md:h-28 rounded-full flex-shrink-0 flex items-center justify-center text-3xl font-bold shadow-xl ring-2 ring-white/10"
                style={{ background: `${creator.brand_color}22`, color: creator.brand_color }}
              >
                {creator.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex flex-col gap-3 flex-1">
                <h1 className="text-2xl md:text-3xl font-bold text-white">{creator.name}</h1>
                <p className="text-zinc-400 text-sm">@{creator.handle}</p>
                {creator.bio && (
                  <p className="text-zinc-300 text-sm leading-relaxed max-w-lg">{creator.bio}</p>
                )}
                <div className="flex items-center gap-3 mt-1">
                  {creator.instagram_url && (
                    <a
                      href={creator.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-700 hover:border-zinc-500"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                      Instagram
                    </a>
                  )}
                  {creator.tiktok_url && (
                    <a
                      href={creator.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-zinc-700 hover:border-zinc-500"
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.73a4.85 4.85 0 01-1.01-.04z" />
                      </svg>
                      TikTok
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* ─── Divider ─── */}
        <div className="mt-10 mb-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-white/5" />
          <div className="flex items-center gap-2 text-zinc-500">
            <LayoutGrid className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-widest">Prompts</span>
          </div>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* ─── Creator Page Ad Placement ─── */}
        {adPlacements.some(p => p.position === 'creator_page') && (
          <div className="mb-8">
            <AdBanner placements={adPlacements} position="creator_page" creatorId={creator.id} />
          </div>
        )}

        {/* ─── Category Filter Pills ─── */}
        {activeCategoryIds.length > 0 && (
          <section className="mb-8">
            <div className="flex flex-wrap gap-2">
              <button
                id="category-filter-all"
                onClick={() => setActiveCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${activeCategory === null
                  ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                  : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white'
                  }`}
              >
                All
                <span className="ml-2 text-xs opacity-60">{prompts.length}</span>
              </button>
              {activeCategoryIds.map(cat => {
                const count = prompts.filter(p => p.category_id === cat.id).length
                const isActive = activeCategory === cat.id
                return (
                  <button
                    key={cat.id}
                    id={`category-filter-${cat.slug}`}
                    onClick={() => setActiveCategory(isActive ? null : cat.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${isActive
                      ? 'bg-white text-black border-white shadow-lg shadow-white/10'
                      : 'bg-transparent text-zinc-400 border-zinc-700 hover:border-zinc-500 hover:text-white'
                      }`}
                  >
                    {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                    {cat.name}
                    <span className="ml-2 text-xs opacity-60">{count}</span>
                  </button>
                )
              })}
            </div>
          </section>
        )}

        {/* ─── Prompt Grid ─── */}
        <section>
          {filteredPrompts.length === 0 ? (
            <div className="py-24 text-center text-zinc-600">
              <Grid3x3 className="w-10 h-10 mx-auto mb-4 opacity-30" />
              <p className="text-sm">No prompts in this category yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPrompts.map(prompt => {
                const toolColor = AI_TOOL_COLORS[prompt.ai_tool] ?? '#6366f1'
                const gate = GATE_LABELS[prompt.gate_type] ?? GATE_LABELS.open
                const cat = categoryMap[prompt.category_id]
                const href = promptUrl(prompt.slug)

                return (
                  <a
                    key={prompt.id}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/5 bg-zinc-900/60 hover:bg-zinc-900 hover:border-white/10 transition-all duration-300 hover:shadow-xl hover:shadow-black/40 hover:-translate-y-0.5"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-video overflow-hidden bg-zinc-800">
                      {prompt.thumbnail_url ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                          src={prompt.thumbnail_url}
                          alt={prompt.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ background: `${toolColor}11` }}
                        >
                          <Sparkles className="w-8 h-8 opacity-20" style={{ color: toolColor }} />
                        </div>
                      )}

                      {/* Gate badge */}
                      <div
                        className="absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: `${gate.color}22`, color: gate.color, border: `1px solid ${gate.color}44` }}
                      >
                        {gate.label}
                      </div>

                      {/* PDF badge */}
                      {prompt.content_type === 'pdf' && (
                        <div className="absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900/80 text-zinc-300 border border-zinc-700">
                          PDF
                        </div>
                      )}
                    </div>

                    {/* Body */}
                    <div className="flex flex-col gap-2.5 p-4 flex-1">
                      {/* Tool + Output row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full"
                          style={{ background: `${toolColor}18`, color: toolColor, border: `1px solid ${toolColor}30` }}
                        >
                          <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: toolColor }} />
                          {prompt.ai_tool}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-800 border border-zinc-700">
                          {OUTPUT_ICONS[prompt.output_type]}
                          {prompt.output_type}
                        </span>
                        {/* {cat && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500 px-2 py-0.5 rounded-full bg-zinc-800/50 border border-zinc-800">
                            {cat.icon && <span>{cat.icon}</span>}
                            {cat.name}
                          </span>
                        )} */}
                      </div>

                      {/* Title */}
                      <h2 className="text-sm font-semibold text-white leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
                        {prompt.title}
                      </h2>

                      {/* Description */}
                      {prompt.description && (
                        <p className="text-xs text-zinc-500 leading-relaxed line-clamp-2">
                          {prompt.description}
                        </p>
                      )}

                      {/* CTA */}
                      <div className="mt-auto pt-2 flex items-center justify-between">
                        <span className="text-xs text-zinc-600">
                          {new Date(prompt.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-xs font-medium flex items-center gap-0.5 transition-all text-zinc-500 group-hover:text-white">
                          View
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
