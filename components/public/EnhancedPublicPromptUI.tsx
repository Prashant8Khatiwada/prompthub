'use client'

import { useState } from 'react'
import { LayoutGrid } from 'lucide-react'
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
  adAboveGate?: React.ReactNode
  adBelowGate?: React.ReactNode
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
  adAboveGate,
  adBelowGate,
  oEmbedHtml
}: Props) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'profile'>('prompt')
  const [currentPrompt, setCurrentPrompt] = useState<Prompt>(initialPrompt)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const handlePromptClick = async (clickedPrompt: RelatedPromptType) => {
    setIsLoading(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
    // Update URL without reload
    window.history.pushState(null, '', `/${creator.subdomain}/${clickedPrompt.slug}`)
    
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
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-screen-xl mx-auto px-4 pt-8 md:pt-16">
        {/* Main Shadowed Box */}
        <div className="max-w-2xl mx-auto bg-zinc-900 rounded-[32px] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] overflow-hidden border border-zinc-800/50">
          
          {/* 1. Instagram Profile Header */}
          {igUser && (
            <div className="bg-zinc-950">
              <InstagramProfile
                user={igUser}
                creator={creator}
              />
            </div>
          )}

          {/* 2. Tabs Switcher */}
          <div className="flex border-b border-zinc-800 bg-zinc-900 sticky top-0 z-20">
            <button
              onClick={() => setActiveTab('prompt')}
              className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'prompt'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-400'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              Prompt
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex-1 flex items-center justify-center gap-2 py-5 text-sm font-bold transition-all border-b-2 ${
                activeTab === 'profile'
                  ? 'border-white text-white'
                  : 'border-transparent text-zinc-500 hover:text-zinc-400'
              }`}
            >
              <InstagramIcon className="w-4 h-4" />
              Profile
            </button>
          </div>

          {/* 3. Tab Content */}
          <div className="relative">
            {activeTab === 'prompt' ? (
              <div className={`animate-in fade-in slide-in-from-bottom-4 duration-500 transition-opacity ${isLoading ? 'opacity-50' : 'opacity-100'}`}>
                {/* Prompt Section First */}
                <div className="px-6 py-10 md:px-12 text-white">
                  <h1 className="text-3xl font-extrabold tracking-tight text-white mb-4 leading-tight">
                    {currentPrompt.title}
                  </h1>
                  <div className="flex flex-wrap gap-2 mb-6">
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shadow-sm"
                      style={{ background: `${toolColor}11`, color: toolColor, border: `1px solid ${toolColor}33` }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: toolColor }} />
                      AI Tool: {currentPrompt.ai_tool}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 shadow-sm">
                      Output Type: {currentPrompt.output_type}
                    </span>
                  </div>
                  {currentPrompt.description && (
                    <p className="text-zinc-400 text-base leading-relaxed mb-8">{currentPrompt.description}</p>
                  )}

                  {/* Gate */}
                  <PromptGate prompt={currentPrompt} key={currentPrompt.id} />
                  
                  {adAboveGate && <div className="mt-8">{adAboveGate}</div>}
                </div>

                {/* Related Prompts Section */}
                <div className="px-6 pb-12 bg-zinc-950/30 pt-8 border-t border-zinc-800">
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
    </div>
  )
}
