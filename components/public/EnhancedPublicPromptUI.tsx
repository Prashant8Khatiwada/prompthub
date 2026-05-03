'use client'

import { useState, useEffect, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, Globe, ArrowLeft, Sparkles, FileText, Image as ImageIcon, Video, Code, Music, ChevronRight, Grid3x3 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
  </svg>
)

import PromptGate from './PromptGate'
import RelatedPrompts from './RelatedPrompts'
import AdPopup from './AdPopup'
import type { AdPlacementData } from './AdBanner'
import type { InstagramUser, InstagramMedia } from '@/lib/instagram'
import type { Creator, Prompt, Category } from '@/types'



interface RelatedPromptType {
  id: string
  title: string
  slug: string
  ai_tool: string
  output_type: string
  thumbnail_url: string | null
}

interface Props {
  creator: Creator
  prompt: Prompt
  igUser: InstagramUser | null
  igMedia: InstagramMedia | null
  igFeed: InstagramMedia[]
  relatedData: RelatedPromptType[]
  adAbovePrompt?: React.ReactNode
  adBelowPrompt?: React.ReactNode
  adPopupPlacements?: AdPlacementData[]
  oEmbedHtml?: string | null
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

export default function EnhancedPublicPromptUI({
  creator,
  prompt: initialPrompt,
  igUser,
  igMedia,
  relatedData,
  adAbovePrompt,
  adBelowPrompt,
  adPopupPlacements,
  oEmbedHtml
}: Props) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'profile'>('prompt')
  const [currentSlug, setCurrentSlug] = useState(initialPrompt.slug)
  const [showDebug, setShowDebug] = useState(false)
  const supabase = createClient()

  // ─── Query for the Active Prompt ───
  const { data: currentPrompt, isLoading: isPromptLoading } = useQuery({
    queryKey: ['public-prompt', creator.id, currentSlug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('slug', currentSlug)
        .eq('creator_id', creator.id)
        .eq('status', 'published')
        .single()
      
      if (error || !data) throw new Error(error?.message || 'Prompt not found')
      return data as Prompt
    },
    initialData: currentSlug === initialPrompt.slug ? initialPrompt : undefined,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })

  // ─── Query for Related Prompts (Updates when currentPrompt changes) ───
  const { data: dynamicRelatedData } = useQuery({
    queryKey: ['related-prompts', creator.id, currentPrompt?.id],
    queryFn: async () => {
      if (!currentPrompt?.id) return []
      const { data, error } = await supabase
        .from('prompts')
        .select('id, title, slug, ai_tool, output_type, thumbnail_url')
        .eq('creator_id', creator.id)
        .eq('status', 'published')
        .neq('id', currentPrompt.id) // Exclude current prompt
        .limit(6)
      
      return (data || []) as RelatedPromptType[]
    },
    initialData: currentPrompt?.id === initialPrompt.id ? relatedData : undefined,
    enabled: !!currentPrompt?.id,
    staleTime: 1000 * 60 * 5,
  })

  // Use the filtered list for rendering
  const finalRelatedData = useMemo(() => {
    return (dynamicRelatedData || []).filter(p => p.id !== currentPrompt?.id)
  }, [dynamicRelatedData, currentPrompt?.id])

  const [libraryPrompts, setLibraryPrompts] = useState<Prompt[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  const postCount = igUser?.media_count ?? 28
  const followerCount = igUser?.followers_count
    ? igUser.followers_count >= 1000000
      ? (igUser.followers_count / 1000000).toFixed(1) + 'M'
      : igUser.followers_count >= 1000
        ? (igUser.followers_count / 1000).toFixed(1) + 'k'
        : igUser.followers_count
    : '12.5k'
  const followingCount = igUser?.follows_count
    ? igUser.follows_count >= 1000
      ? (igUser.follows_count / 1000).toFixed(1) + 'k'
      : igUser.follows_count
    : '1.1k'

  useEffect(() => {
    async function fetchLibrary() {
      try {
        const { data: promptsData, error: pError } = await supabase
          .from('prompts')
          .select('*, categories(name)')
          .eq('creator_id', creator.id)
          .eq('status', 'published')
          .order('created_at', { ascending: false })

        if (promptsData && !pError) {
          setLibraryPrompts(promptsData as unknown as Prompt[])

          const categoryIds = [
            ...new Set(promptsData.map((p) => p.category_id).filter(Boolean)),
          ]

          if (categoryIds.length > 0) {
            const { data: catData, error: catError } = await supabase
              .from('categories')
              .select('*')
              .in('id', categoryIds)
              .order('name')

            if (catData && !catError) {
              setCategories(catData)
            }
          }
        }
      } catch (e) {
        console.error('Failed to fetch prompt library', e)
      }
    }

    if (creator?.id) {
      fetchLibrary()
    }
  }, [creator.id, supabase])

  const activeCategoryIds = useMemo(() => {
    const ids = new Set(libraryPrompts.map(p => p.category_id).filter(Boolean))
    return categories.filter(c => ids.has(c.id))
  }, [categories, libraryPrompts])

  const filteredLibraryPrompts = useMemo(() => {
    if (!activeCategory) return libraryPrompts
    return libraryPrompts.filter(p => p.category_id === activeCategory)
  }, [libraryPrompts, activeCategory])

  const handleLibraryPromptClick = async (clickedPrompt: Prompt | RelatedPromptType) => {
    setActiveTab('prompt')
    handlePromptClick(clickedPrompt)
  }

  useEffect(() => {
    // Enable debug mode if ?debug=true is in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      if (params.get('debug') === 'true') {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setShowDebug(true)
      }
    }
  }, [])

  const handlePromptClick = (clickedPrompt: RelatedPromptType) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    
    // Update state to trigger useQuery
    setCurrentSlug(clickedPrompt.slug)

    // Update URL without reload
    const newPath = (() => {
      const hostname = window.location.hostname
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN?.replace(/^https?:\/\//, '') || 'creatopedia.tech'
      const isSubdomain = hostname.startsWith(`${creator.subdomain}.`)
      if (hostname === baseDomain || hostname === 'localhost' || hostname === '127.0.0.1' || !isSubdomain) {
        return `/${creator.subdomain}/${clickedPrompt.slug}`
      }
      return `/${clickedPrompt.slug}`
    })()
    window.history.pushState(null, '', newPath)
  }

  if (!currentPrompt) return null

  const toolColor = AI_TOOL_COLORS[currentPrompt.ai_tool.split(',')[0].trim()] ?? '#6366f1'

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 text-white select-none relative overflow-hidden">
      {/* ─── Hero Cover & Header Section ─── */}
      <div className="relative w-full overflow-hidden select-none mb-4 animate-in fade-in duration-500">
        {/* Cover Image Background */}
        <div className="relative h-[200px] md:h-[260px] w-full bg-zinc-900 select-none">
          {/* Top action buttons: Back and For Sponsors */}
          <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between select-none">
            <button
              onClick={() => {
                if (typeof window !== 'undefined' && window.history.length > 1) {
                  window.history.back()
                } else {
                  window.location.href = '/'
                }
              }}
              className="px-3.5 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-md border border-white/10 hover:border-white/20 text-white rounded-full flex items-center gap-2 text-xs font-mono tracking-wider transition-all duration-300 shadow-xl select-none"
            >
              <ArrowLeft className="w-4 h-4 text-white" />
              <span>Back</span>
            </button>
            <a
              href="https://creatopedia.tech/reach-us"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3.5 py-2.5 bg-zinc-900/60 hover:bg-zinc-800/80 backdrop-blur-md border border-white/10 hover:border-white/20 text-white rounded-full flex items-center gap-2 text-xs font-mono tracking-wider transition-all duration-300 shadow-xl select-none"
            >
              <Globe className="w-4 h-4 text-white" />
              <span>For Sponsors</span>
            </a>
          </div>
          <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"
            alt="Cover"
            className="w-full h-full object-cover select-none opacity-30 hover:scale-105 transition-all duration-700"
          />
        </div>

        {/* Profile Details overlapping cover image */}
        <div className="max-w-4xl mx-auto px-6 -mt-20 md:-mt-24 relative z-20 pb-4 select-none animate-in fade-in duration-500">
          <div className="w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 sm:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 hover:border-white/20 transition-all duration-500">
            {/* Left Column with Avatar, Name, and Info */}
            <div className="flex flex-row items-center gap-4 sm:gap-6 text-left w-full md:w-auto">
              {/* Large Avatar with Verification Badge */}
              <div className="relative group select-none shrink-0">
                <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full p-[3px] bg-linear-to-tr from-[#3b82f6] via-[#a855f7] to-[#ec4899] shadow-2xl hover:scale-105 transition-transform duration-500 select-none">
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
                        className="w-full h-full rounded-full flex items-center justify-center text-2xl md:text-3xl font-black font-sans tracking-tight select-none"
                        style={{ background: `${creator.brand_color || '#6366f1'}22`, color: creator.brand_color || '#6366f1' }}
                      >
                        {creator.name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Verification Badge */}
                <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-zinc-950 shadow-lg">
                  <svg className="w-2.5 h-2.5 text-white fill-current" viewBox="0 0 24 24">
                    <path d="M12 0L14.59 4.36L19.5 5.5L16.5 10L17.91 14.86L13.5 13.14L9.09 14.86L10.5 10L7.5 5.5L12.41 4.36L12 0ZM11.19 12.83L14.71 8.33L13.43 7.33L10.96 10.49L9.5 9.03L8.43 10.11L11.19 12.83Z" />
                  </svg>
                </div>
              </div>

              {/* Name and stats */}
              <div className="flex flex-col gap-2 sm:gap-3 select-none flex-1">
                <div>
                  <div className="flex items-center justify-start gap-2">
                    <h1 className="text-xl md:text-3xl font-black text-white tracking-tight select-none leading-tight">
                      {creator.name}
                    </h1>
                  </div>
                  <span className="text-[11px] md:text-xs font-mono text-white/50 tracking-wide font-light">
                    {creator.handle || `@${creator.subdomain}`}
                  </span>
                  {igUser?.biography && (
                    <p className="text-xs font-sans text-white/70 mt-1 md:max-w-md line-clamp-2 select-none leading-relaxed">
                      {igUser.biography}
                    </p>
                  )}
                </div>

                {/* Followers, Following and Post Stats */}
                <div className="flex items-center justify-start gap-3 sm:gap-4 text-[11px] sm:text-xs font-sans text-white/80">
                  <div>
                    <span className="font-black text-white">{postCount}</span> <span className="text-white/40">Posts</span>
                  </div>
                  <span className="text-white/10 font-thin">|</span>
                  <div>
                    <span className="font-black text-white">{followerCount}</span> <span className="text-white/40">Followers</span>
                  </div>
                  <span className="text-white/10 font-thin">|</span>
                  <div>
                    <span className="font-black text-white">{followingCount}</span> <span className="text-white/40">Following</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right flex end for Action Buttons */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-start md:justify-end mt-2 md:mt-0">
              <a
                href={creator.instagram_url || `https://instagram.com/${creator.handle?.replace('@', '') || creator.subdomain}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial px-5 py-2.5 bg-white text-zinc-950 font-bold text-xs rounded-full shadow-lg hover:bg-white/90 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2 select-none"
              >
                <InstagramIcon className="w-3.5 h-3.5 text-zinc-950" />
                <span>Follow</span>
              </a>
              <a
                href={creator.tiktok_url || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 md:flex-initial px-5 py-2.5 bg-zinc-900/60 border border-white/10 hover:border-white/25 text-white text-xs font-mono rounded-full font-bold tracking-wide transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-md select-none"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Profile</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Wrapper */}
      <div className="max-w-4xl mx-auto px-6 pt-4 md:pt-8 animate-in fade-in duration-500">
        <div className="w-full bg-zinc-900/40 backdrop-blur-md rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5">

          {/* Tabs Switcher */}
          <div className="flex border-b border-white/5 bg-zinc-900/40 sticky top-0 z-20 backdrop-blur-md select-none">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs md:text-sm font-bold transition-all border-b-2 ${activeTab === 'prompt'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-400'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Prompt Detail
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs md:text-sm font-bold transition-all border-b-2 ${activeTab === 'profile'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-zinc-500 hover:text-zinc-400'
                }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Prompt Library
            </button>
          </div>

          {/* Tab Content */}
          <div className="relative select-none">
            {activeTab === 'prompt' ? (
              <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 transition-opacity ${isPromptLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="px-5 py-8 md:px-12 text-white">
                  {/* Media Section — clean inline video/image, no social chrome */}
                  {(() => {
                    const mediaUrl = igMedia?.media_url || currentPrompt.video_url || null
                    const isVideo = igMedia?.media_type === 'VIDEO' || (mediaUrl && !igMedia && /\.(mp4|mov|webm)/i.test(mediaUrl))
                    const thumbUrl = igMedia?.thumbnail_url || currentPrompt.thumbnail_url || null

                    if (!mediaUrl && !thumbUrl) return null

                    return (
                      <div className="mb-8 animate-in fade-in duration-700 w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900/40">
                        {isVideo && mediaUrl ? (
                          <video
                            src={mediaUrl}
                            poster={thumbUrl ?? undefined}
                            controls
                            playsInline
                            className="w-full max-h-[520px] object-contain bg-black"
                          />
                        ) : (
                          <img
                            src={mediaUrl || thumbUrl!}
                            alt={currentPrompt.title}
                            className="w-full max-h-[520px] object-contain bg-black"
                          />
                        )}
                      </div>
                    )
                  })()}

                  {adAbovePrompt && <div className="mb-6">{adAbovePrompt}</div>}

                  <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-4 leading-tight">
                    {currentPrompt.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span
                      className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-full border bg-zinc-900/60 border-white/10 text-white/90 backdrop-blur-md"
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: toolColor }} />
                      AI Tool: {currentPrompt.ai_tool}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider px-3 py-1.5 rounded-full border bg-zinc-900/60 border-white/10 text-white/70">
                      Output: {currentPrompt.output_type}
                    </span>
                  </div>
                  {currentPrompt.description && (
                    <p className="text-zinc-400 text-sm md:text-base leading-relaxed mb-8 font-light">{currentPrompt.description}</p>
                  )}

                  {/* Gate component with premium dynamic forms */}
                  <PromptGate prompt={currentPrompt} key={currentPrompt.id} />

                  {adBelowPrompt && <div className="mt-8">{adBelowPrompt}</div>}
                </div>

                {adPopupPlacements && adPopupPlacements.length > 0 && (
                  <AdPopup placements={adPopupPlacements} promptId={currentPrompt.id} creatorId={creator.id} />
                )}

                {/* Related Prompts Section */}
                <div className="px-4 sm:px-6 pb-12 bg-zinc-950/40 pt-8 border-t border-white/5">
                  <div className="max-w-2xl mx-auto">
                    {relatedData && relatedData.length > 0 && (
                      <RelatedPrompts
                        prompts={finalRelatedData}
                        subdomain={creator.subdomain}
                        onPromptClick={handlePromptClick}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-zinc-950 min-h-[400px] p-4 sm:p-6 space-y-6 sm:space-y-8 select-none">
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
                      All ({libraryPrompts.length})
                    </button>
                    {activeCategoryIds.map(cat => {
                      const count = libraryPrompts.filter(p => p.category_id === cat.id).length
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

                {/* Prompt Cards Grid */}
                {filteredLibraryPrompts.length === 0 ? (
                  <div className="py-24 text-center text-zinc-600">
                    <Grid3x3 className="w-10 h-10 mx-auto mb-4 opacity-30" />
                    <p className="text-sm">No prompts in this category yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 animate-in fade-in duration-500">
                    {filteredLibraryPrompts.map(p => {
                      const toolColor = AI_TOOL_COLORS[p.ai_tool.split(',')[0].trim()] ?? '#6366f1'
                      const gate = GATE_LABELS[p.gate_type] ?? GATE_LABELS.open

                      return (
                        <div
                          onClick={() => handleLibraryPromptClick(p)}
                          key={p.id}
                          className="group relative h-[320px] sm:h-[440px] rounded-[32px] sm:rounded-[36px] lg:rounded-2xl overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-500 cursor-pointer select-none flex flex-col justify-between p-4 sm:p-7 bg-zinc-900/30 backdrop-blur-xl hover:scale-[1.02] shadow-2xl"
                        >
                          {/* Background immersive image with darker glass overlay */}
                          <div className="absolute inset-0 z-0 select-none">
                            {p.thumbnail_url ? (
                              <img
                                src={p.thumbnail_url}
                                alt={p.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700 opacity-55 group-hover:opacity-70"
                              />
                            ) : (
                              <div className="w-full h-full bg-zinc-950 flex items-center justify-center opacity-40">
                                <Sparkles className="w-10 h-10 text-white/20" />
                              </div>
                            )}
                            <div className="absolute inset-0 bg-linear-to-t from-zinc-950 via-zinc-950/45 to-transparent z-10" />
                          </div>

                          {/* Badges on top */}
                          <div className="relative z-10 flex justify-between items-start">
                            <span
                              className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] font-mono uppercase tracking-widest px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border bg-zinc-900/70 border-white/10 text-white/90 backdrop-blur-md"
                            >
                              <span className="w-1 h-1 rounded-full animate-pulse" style={{ background: toolColor }} />
                              {p.ai_tool}
                            </span>

                            <div className="flex gap-1 sm:gap-2">
                              {p.content_type === 'pdf' && (
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
                                {p.title}
                              </h3>
                              {p.description && (
                                <p className="text-[10px] sm:text-xs text-white/45 leading-relaxed line-clamp-2 font-light hidden sm:block">
                                  {p.description}
                                </p>
                              )}
                            </div>

                            {/* Card footer */}
                            <div className="w-full flex items-center justify-between border-t border-white/10 pt-2 sm:pt-4 select-none">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center gap-1 text-[8px] sm:text-[10px] text-zinc-500 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-zinc-800/80 border border-zinc-700/60 font-mono">
                                  {OUTPUT_ICONS[p.output_type] || <FileText className="w-3.5 h-3.5" />}
                                  {p.output_type}
                                </span>
                              </div>

                              <div className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white text-zinc-950 font-sans font-bold text-xs shadow-lg group-hover:scale-105 transition-all duration-500 hover:bg-white/90 shrink-0 select-none">
                                <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-950" />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDebug && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/90 border-t border-red-500/50 p-6 z-[9999] text-[10px] font-mono overflow-auto max-h-[40vh] shadow-2xl backdrop-blur-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-red-400 font-bold text-xs uppercase tracking-widest">Debug Console</h3>
            <button onClick={() => setShowDebug(false)} className="text-zinc-500 hover:text-white">Close</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-zinc-500 mb-1 border-b border-zinc-800 pb-1">Prompt Metadata</p>
              <pre className="text-zinc-300">
                {JSON.stringify({
                  id: currentPrompt.id,
                  title: currentPrompt.title,
                  gate_type: currentPrompt.gate_type,
                  has_content: !!currentPrompt.content,
                  content_type: currentPrompt.content_type,
                  video_url: currentPrompt.video_url,
                  thumbnail_url: currentPrompt.thumbnail_url
                }, null, 2)}
              </pre>
            </div>
            <div>
              <p className="text-zinc-500 mb-1 border-b border-zinc-800 pb-1">Render Context</p>
              <pre className="text-zinc-300">
                {JSON.stringify({
                  activeTab,
                  isLoading: isPromptLoading,
                  hasIgUser: !!igUser,
                  hasIgMedia: !!igMedia,
                  hasOEmbed: !!oEmbedHtml
                }, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
