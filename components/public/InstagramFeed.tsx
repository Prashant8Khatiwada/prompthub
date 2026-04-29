'use client'

import { useState } from 'react'
import type { InstagramMedia } from '@/lib/instagram'
import InstagramPost from './InstagramPost'
import { ChevronDown } from 'lucide-react'

interface Props {
  feed: InstagramMedia[]
  excludeId?: string
}

export default function InstagramFeed({ feed, excludeId }: Props) {
  const [visibleCount, setVisibleCount] = useState(3)
  
  const filteredFeed = feed.filter(m => m.id !== excludeId)
  const visiblePosts = filteredFeed.slice(0, visibleCount)
  const hasMore = visibleCount < filteredFeed.length

  if (filteredFeed.length === 0) return null

  return (
    <div className="flex flex-col items-center gap-12 w-full px-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
        {visiblePosts.map(post => (
          <div key={post.id} className="flex justify-center">
            <InstagramPost media={post} />
          </div>
        ))}
      </div>
      
      {hasMore && (
        <button
          onClick={() => setVisibleCount(prev => prev + 3)}
          className="flex items-center gap-2 px-8 py-3 rounded-full border border-zinc-200 text-zinc-900 font-bold text-sm hover:bg-zinc-50 transition-all active:scale-95 shadow-sm"
        >
          Show More
          <ChevronDown className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
