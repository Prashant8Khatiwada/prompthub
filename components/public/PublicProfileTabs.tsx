'use client'

import { useState } from 'react'
import { LayoutGrid, Instagram as InstagramIcon } from 'lucide-react'

interface Props {
  promptContent: React.ReactNode
  instagramContent: React.ReactNode
  hasInstagram: boolean
}

export default function PublicProfileTabs({ promptContent, instagramContent, hasInstagram }: Props) {
  const [activeTab, setActiveTab] = useState<'prompt' | 'instagram'>('prompt')

  if (!hasInstagram) return <>{promptContent}</>

  return (
    <div className="w-full">
      {/* Tab Switcher */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-100 mb-8">
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'prompt' 
                ? 'border-indigo-600 text-indigo-600' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Prompt Details
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all border-b-2 ${
              activeTab === 'instagram' 
                ? 'border-[#ee2a7b] text-[#ee2a7b]' 
                : 'border-transparent text-zinc-400 hover:text-zinc-600'
            }`}
          >
            <InstagramIcon className="w-4 h-4" />
            Instagram Profile
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {activeTab === 'prompt' ? promptContent : instagramContent}
      </div>
    </div>
  )
}
