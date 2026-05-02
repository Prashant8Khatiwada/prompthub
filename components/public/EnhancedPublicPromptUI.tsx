'use client'

import { useState, useEffect } from 'react'
import { LayoutGrid, Camera, Globe, ArrowLeft } from 'lucide-react'
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
import InstagramProfile from './InstagramProfile'
import InstagramPost from './InstagramPost'
import InstagramFeed from './InstagramFeed'
import PromptGate from './PromptGate'
import RelatedPrompts from './RelatedPrompts'
import AdPopup from './AdPopup'
import type { AdPlacementData } from './AdBanner'
import type { InstagramUser, InstagramMedia } from '@/lib/instagram'
import type { Creator, Prompt } from '@/types'

import VideoEmbed from './VideoEmbed'

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

export default function EnhancedPublicPromptUI({
  creator,
  prompt: initialPrompt,
  igUser,
  igMedia,
  igFeed,
  relatedData,
  adAbovePrompt,
  adBelowPrompt,
  adPopupPlacements,
  oEmbedHtml
}: Props) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'profile'>('prompt')
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(initialPrompt)
  const [isLoading, setIsLoading] = useState(false)
  const [showDebug, setShowDebug] = useState(false)
  const supabase = createClient()

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

  const handlePromptClick = async (clickedPrompt: RelatedPromptType) => {
    setIsLoading(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Update URL without reload
    const newPath = (() => {
      const hostname = window.location.hostname
      const baseDomain = process.env.NEXT_PUBLIC_BASE_DOMAIN?.replace(/^https?:\/\//, '') || 'prompthub.app'
      if (hostname === baseDomain || hostname === 'localhost' || hostname === '127.0.0.1') {
        return `/${creator.subdomain}/${clickedPrompt.slug}`
      }
      return `/${clickedPrompt.slug}`
    })()
    window.history.pushState(null, '', newPath)

    try {
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('slug', clickedPrompt.slug)
        .single()

      if (data && !error) {
        setCurrentPrompt(data as Prompt)
      }
    } catch (e) {
      console.error('Failed to fetch new prompt', e)
    } finally {
      setIsLoading(false)
    }
  }

  const toolColor = AI_TOOL_COLORS[currentPrompt.ai_tool] ?? '#6366f1'

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 text-white select-none relative overflow-hidden">
      {/* ─── Hero Cover & Header Section ─── */}
      <div className="relative w-full overflow-hidden select-none mb-4 animate-in fade-in duration-500">
        {/* Cover Image Background */}
        <div className="relative h-[200px] md:h-[260px] w-full bg-zinc-900 select-none">
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
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent z-10" />
          <img
            src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1600&q=80"
            alt="Cover"
            className="w-full h-full object-cover select-none opacity-30 hover:scale-105 transition-all duration-700"
          />
        </div>

        {/* Profile Details overlapping cover image */}
        <div className="max-w-4xl mx-auto px-6 flex flex-col items-center text-center -mt-12 md:-mt-16 relative z-20 pb-4 select-none">
          {/* Large Avatar */}
          <div className="relative group select-none flex flex-col items-center">
            <div className="relative w-24 h-24 md:w-32 md:h-32 rounded-full p-[3px] bg-gradient-to-tr from-[#3b82f6] via-[#a855f7] to-[#ec4899] shadow-2xl hover:scale-105 transition-transform duration-500 select-none">
              <div className="w-full h-full rounded-full bg-zinc-950 p-1">
                {creator.avatar_url ? (
                  <img
                    src={creator.avatar_url}
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
            <div className="absolute bottom-1 right-2 w-4 h-4 md:w-5 md:h-5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-zinc-950 shadow-lg">
              <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
            </div>
          </div>

          {/* Name & Bio details */}
          <div className="mt-4 flex flex-col items-center gap-1 select-none">
            <h1 className="text-2xl md:text-4xl font-black text-white tracking-tight select-none leading-none">
              {creator.name}
            </h1>
            <span className="text-[11px] md:text-xs font-mono text-white/50 tracking-wide font-light">
              {creator.handle || `@${creator.subdomain}`}
            </span>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 mt-5">
            <a
              href={creator.instagram_url || `https://instagram.com/${creator.handle?.replace('@', '') || creator.subdomain}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-white text-zinc-950 font-bold text-xs rounded-full shadow-lg hover:bg-white/90 active:scale-95 transition-all duration-300 flex items-center gap-2 select-none"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-zinc-950" />
              <span>Follow</span>
            </a>
            <a
              href={creator.tiktok_url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-zinc-900/60 border border-white/10 hover:border-white/25 text-white text-xs font-mono rounded-full font-bold tracking-wide transition-all duration-300 flex items-center gap-2 backdrop-blur-md select-none"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span>Platform</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Glassmorphic Wrapper */}
      <div className="max-w-4xl mx-auto px-4 pt-4 md:pt-8 animate-in fade-in duration-500">
        <div className="max-w-2xl mx-auto bg-zinc-900/40 backdrop-blur-md rounded-[32px] md:rounded-[40px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5">

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
              <Camera className="w-4 h-4" />
              Instagram Grid
            </button>
          </div>

          {/* Tab Content */}
          <div className="relative select-none">
            {activeTab === 'prompt' ? (
              <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                <div className="px-5 py-8 md:px-12 text-white">
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

                  {/* Embedding Section moved below prompt details */}
                  {(igMedia || oEmbedHtml || currentPrompt.video_url) && (
                    <div className="mt-8 mb-6 animate-in fade-in duration-700">
                      {igMedia ? (
                        <div className="flex justify-center">
                          <InstagramPost media={igMedia} />
                        </div>
                      ) : (
                        <VideoEmbed
                          html={oEmbedHtml || null}
                          url={currentPrompt.video_url || ''}
                          fallbackThumbnail={currentPrompt.thumbnail_url}
                        />
                      )}
                    </div>
                  )}

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
                        prompts={relatedData}
                        subdomain={creator.subdomain}
                        onPromptClick={handlePromptClick}
                      />
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 bg-zinc-950 min-h-[400px]">
                {igUser && (
                  <InstagramFeed
                    feed={igFeed}
                    excludeId={igMedia?.id}
                  />
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
                  isLoading,
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
