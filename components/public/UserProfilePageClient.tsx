'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import type { InstagramUser, InstagramMedia } from '@/lib/instagram'
import type { Creator, Category, Prompt } from '@/types'
import InstagramProfile from './InstagramProfile'
import { Sparkles, FileText, Image as ImageIcon, Video, Code, Music, ChevronRight, Grid3x3, LayoutGrid, Globe, Camera, ArrowLeft } from 'lucide-react'
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
  Midjourney: '#3b82f6',
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

const InstagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

export default function UserProfilePageClient({ creator, igUser, categories, prompts, adPlacements = [] }: Props) {
  const [activeTab, setActiveTab] = useState<'creation' | 'profile'>('creation')
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
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      const cleanBaseDomain = baseDomain.replace(/^https?:\/\//, '')

      // If we are on the main domain (or localhost), we use /subdomain/slug
      if (hostname === cleanBaseDomain || hostname === 'localhost' || hostname === '127.0.0.1') {
        return `/${creator.subdomain}/${slug}`
      }

      // If we are already on a subdomain (e.g. milan.prompthub.app), we just use /slug
      return `/${slug}`
    }

    // Fallback for SSR
    return `/${creator.subdomain}/${slug}`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans select-none relative overflow-hidden">
      {/* ─── Hero Cover & Header Section (Aligned with Attached Reference Image) ─── */}
      <div className="relative w-full overflow-hidden select-none">
        {/* Cover Image Background */}
        <div className="relative h-[220px] md:h-[280px] w-full bg-zinc-900 select-none">
          {/* Back button on top left corner */}
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back()
              } else {
                window.location.href = '/'
              }
            }}
            className="absolute top-4 left-4 z-30 px-3.5 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-md border border-white/10 hover:border-white/20 text-white rounded-full flex items-center gap-2 text-xs font-mono tracking-wider transition-all duration-300 shadow-xl select-none"
          >
            <ArrowLeft className="w-4 h-4 text-white" />
            <span className="hidden sm:inline">Back</span>
          </button>
          {/* Cover image with glass overlay/tint */}
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"
            alt="Cover"
            className="w-full h-full object-cover select-none opacity-40 hover:scale-105 transition-all duration-700"
          />
        </div>

        {/* Profile Details overlapping cover image */}
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center -mt-14 md:-mt-20 relative z-20 pb-8 select-none">
          {/* Large Avatar */}
          <div className="relative group select-none flex flex-col items-center">
            <div className="relative w-28 h-28 md:w-36 md:h-36 rounded-full p-[3px] bg-gradient-to-tr from-[#3b82f6] via-[#a855f7] to-[#ec4899] shadow-2xl hover:scale-105 transition-transform duration-500 select-none">
              <div className="w-full h-full rounded-full bg-zinc-950 p-1">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover border border-white/10 select-none"
                  />
                ) : igUser?.profile_picture_url ? (
                  <img
                    src={igUser.profile_picture_url}
                    alt={creator.name}
                    className="w-full h-full rounded-full object-cover border border-white/10 select-none"
                  />
                ) : (
                  <div
                    className="w-full h-full rounded-full flex items-center justify-center text-3xl md:text-4xl font-black font-sans tracking-tight select-none"
                    style={{ background: `${creator.brand_color || '#6366f1'}22`, color: creator.brand_color || '#6366f1' }}
                  >
                    {creator.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
            </div>

            {/* Premium Theme Verification Pill/Badge */}
            <div className="absolute bottom-1 right-2 w-5 h-5 md:w-6 md:h-6 rounded-full bg-blue-500 flex items-center justify-center border-2 border-zinc-950 shadow-lg">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Name & Bio from Screenshot Layout */}
          <div className="mt-5 flex flex-col items-center gap-1 select-none">
            <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight select-none">
              {creator.name}
            </h1>
            <span className="text-xs sm:text-sm font-mono text-white/50 tracking-wide font-light">
              {creator.handle || `@${creator.subdomain}`}
            </span>
            {creator.bio && (
              <p className="text-zinc-400 text-sm md:text-base leading-relaxed max-w-md mt-2 font-light select-none">
                {creator.bio}
              </p>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 mt-6">
            <a
              href={creator.instagram_url || `https://instagram.com/${creator.handle?.replace('@', '') || creator.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-white text-zinc-950 font-bold text-xs rounded-full shadow-lg hover:bg-white/90 active:scale-95 transition-all duration-300 flex items-center gap-2 select-none"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-zinc-950" />
              <span>Follow</span>
            </a>
            {/* Platform/Website link if available */}
            <a
              href={creator.tiktok_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-zinc-900/60 border border-white/10 hover:border-white/25 text-white text-xs font-mono rounded-full font-bold tracking-wide transition-all duration-300 flex items-center gap-2 backdrop-blur-md select-none"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Platform</span>
            </a>
          </div>

          {/* Followers / Following / Posts Counts at the bottom exactly like reference image */}
          <div className="w-full max-w-sm mx-auto flex items-center justify-between mt-8 pt-6 border-t border-white/5 font-mono select-none">
            <div className="flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider font-light">Followers</span>
              <span className="text-sm md:text-lg font-black text-white mt-1">
                {igUser?.followers_count ? `${(igUser.followers_count / 1000).toFixed(1)}k` : '252k'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider font-light">Following</span>
              <span className="text-sm md:text-lg font-black text-white mt-1">
                {igUser?.follows_count ?? '378'}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] text-white/40 uppercase tracking-wider font-light">Posts</span>
              <span className="text-sm md:text-lg font-black text-white mt-1">
                {igUser?.media_count ?? '115'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {/* ─── Glass Tabs Controller ─── */}
        {/* <div className="mt-6 mb-10 max-w-sm mx-auto p-1.5 bg-zinc-900/40 backdrop-blur-md border border-white/5 rounded-2xl flex items-center gap-1 select-none">
          <button
            onClick={() => setActiveTab('creation')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-mono uppercase tracking-widest transition-all duration-300 font-bold ${activeTab === 'creation'
              ? 'bg-white text-zinc-950 shadow-md scale-100'
              : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Creation</span>
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-mono uppercase tracking-widest transition-all duration-300 font-bold ${activeTab === 'profile'
              ? 'bg-white text-zinc-950 shadow-md scale-100'
              : 'text-white/40 hover:text-white hover:bg-white/5'
              }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Profile</span>
          </button>
        </div> */}

        {/* ─── Creator Page Ad Placement ─── */}
        {adPlacements.some(p => p.position === 'creator_page') && (
          <div className="mb-12 max-w-4xl mx-auto">
            <AdBanner placements={adPlacements} position="creator_page" creatorId={creator.id} />
          </div>
        )}

        {/* ─── CREATION TAB CONTENT ─── */}
        {activeTab === 'creation' && (
          <div className="space-y-12 animate-in fade-in duration-500">
            {/* Categories Pills Bar */}
            {activeCategoryIds.length > 0 && (
              <div className="flex flex-wrap items-center justify-center gap-2 max-w-3xl mx-auto select-none">
                <button
                  onClick={() => setActiveCategory(null)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 border ${activeCategory === null
                    ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold'
                    : 'bg-zinc-900/40 border-white/5 text-white/40 hover:text-white hover:border-white/15'
                    }`}
                >
                  All ({prompts.length})
                </button>
                {activeCategoryIds.map(cat => {
                  const count = prompts.filter(p => p.category_id === cat.id).length
                  const isActive = activeCategory === cat.id
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCategory(isActive ? null : cat.id)}
                      className={`px-5 py-2.5 rounded-xl text-xs font-mono tracking-wider transition-all duration-300 border ${isActive
                        ? 'bg-blue-600/10 border-blue-500/50 text-blue-400 font-bold'
                        : 'bg-zinc-900/40 border-white/5 text-white/40 hover:text-white hover:border-white/15'
                        }`}
                    >
                      {cat.icon && <span className="mr-1.5">{cat.icon}</span>}
                      {cat.name} ({count})
                    </button>
                  )
                })}
              </div>
            )}

            {/* Prompt Cards Grid (2 CARDS PER ROW ON MOBILE SCREEN) */}
            {filteredPrompts.length === 0 ? (
              <div className="py-24 text-center text-zinc-600">
                <Grid3x3 className="w-10 h-10 mx-auto mb-4 opacity-30" />
                <p className="text-sm">No prompts in this category yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-500">
                {filteredPrompts.map(prompt => {
                  const toolColor = AI_TOOL_COLORS[prompt.ai_tool] ?? '#6366f1'
                  const gate = GATE_LABELS[prompt.gate_type] ?? GATE_LABELS.open
                  const href = promptUrl(prompt.slug)

                  return (
                    <Link
                      href={href}
                      key={prompt.id}
                      className="group relative h-[320px] sm:h-[440px] rounded-[32px] sm:rounded-[36px] overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer select-none flex flex-col justify-between p-4 sm:p-7 bg-zinc-900/30 backdrop-blur-xl hover:scale-[1.02] shadow-2xl"
                    >
                      {/* Background immersive image with darker glass overlay */}
                      <div className="absolute inset-0 z-0 select-none">
                        {prompt.thumbnail_url ? (
                          <img
                            src={prompt.thumbnail_url}
                            alt={prompt.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-55 group-hover:opacity-70"
                          />
                        ) : (
                          <div className="w-full h-full bg-zinc-950 flex items-center justify-center opacity-40">
                            <Sparkles className="w-10 h-10 text-white/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/45 to-transparent z-10" />
                      </div>

                      {/* Badges on top */}
                      <div className="relative z-10 flex justify-between items-start">
                        <span
                          className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-mono uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border bg-zinc-900/70 border-white/10 text-white/90 backdrop-blur-md"
                        >
                          <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: toolColor }} />
                          {prompt.ai_tool}
                        </span>

                        <div className="flex gap-1 sm:gap-2">
                          {prompt.content_type === 'pdf' && (
                            <span className="text-[8px] sm:text-[9px] font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 bg-pink-600/20 text-pink-300 border border-pink-500/30 rounded-full font-mono uppercase tracking-wide">
                              PDF
                            </span>
                          )}
                          <span
                            className="text-[8px] sm:text-[9px] font-bold px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-mono uppercase tracking-wide"
                            style={{ background: `${gate.color}22`, color: gate.color, border: `1px solid ${gate.color}44` }}
                          >
                            {gate.label}
                          </span>
                        </div>
                      </div>

                      {/* Content text grouped at bottom */}
                      <div className="relative z-10 flex flex-col justify-end h-full w-full space-y-2 sm:space-y-4">
                        <div className="space-y-1 sm:space-y-2 select-none">
                          <h3 className="text-base sm:text-2xl font-bold tracking-tight text-white/95 leading-tight select-none line-clamp-2">
                            {prompt.title}
                          </h3>
                          {prompt.description && (
                            <p className="text-[10px] sm:text-xs text-white/45 leading-relaxed line-clamp-2 font-light hidden sm:block">
                              {prompt.description}
                            </p>
                          )}
                        </div>

                        {/* Card footer */}
                        <div className="w-full flex items-center justify-between border-t border-white/10 pt-2 sm:pt-4 select-none">
                          <div className="flex items-center gap-2">
                            <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] text-zinc-500 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 font-mono">
                              {OUTPUT_ICONS[prompt.output_type] || <FileText className="w-3.5 h-3.5" />}
                              {prompt.output_type}
                            </span>
                          </div>

                          <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white text-zinc-950 font-sans font-bold text-xs shadow-lg group-hover:scale-105 transition-all duration-500 hover:bg-white/90 flex-shrink-0 select-none">
                            <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-950" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* ─── PROFILE TAB CONTENT ─── */}
        {activeTab === 'profile' && (
          <div className="max-w-4xl mx-auto animate-in fade-in duration-500 select-none">
            {igUser ? (
              <div className="rounded-3xl overflow-hidden border border-white/5 bg-zinc-900/30 backdrop-blur-xl p-2 select-none">
                <InstagramProfile
                  user={igUser}
                  creator={creator}
                />
              </div>
            ) : (
              <div className="py-24 flex flex-col items-center justify-center border border-white/5 rounded-3xl bg-zinc-900/30 backdrop-blur-xl max-w-2xl mx-auto p-8 text-center space-y-4 select-none">
                <Camera className="w-12 h-12 text-zinc-700 animate-pulse" />
                <h3 className="text-lg font-bold text-white tracking-tight">Instagram profile not connected yet</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed max-w-xs">
                  Connect your Instagram account to show it directly on your public creator profile.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
