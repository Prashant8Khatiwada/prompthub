'use client'

import type { InstagramUser } from '@/lib/instagram'
import type { Creator } from '@/types'
import { CheckCircle2, MoreHorizontal } from 'lucide-react'

interface Props {
  user: InstagramUser
  creator: Creator
}

export default function InstagramProfile({ user, creator }: Props) {
  // Use creator data as fallback for missing fields in Basic Display API
  const bio = user.biography || creator.bio || 'AI Creator | Prompt Engineer | Visual Artist 🎨'
  const profilePic = user.profile_picture_url || creator.avatar_url
  const followers = user.followers_count || 12400 // Still mock followers if none found
  const follows = user.follows_count || 482

  const formatCount = (count: number) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M'
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K'
    return count.toString()
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-12 border-b border-zinc-100 bg-white">
      <div className="flex flex-col md:flex-row gap-10 items-center md:items-start">
        {/* Avatar */}
        <div className="relative group">
          <div className="w-28 h-28 md:w-44 md:h-44 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-fuchsia-600 p-[3px] shadow-lg transition-transform hover:scale-105 duration-300">
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-[3px]">
              <div className="w-full h-full rounded-full bg-zinc-50 flex items-center justify-center text-5xl font-bold text-zinc-300 overflow-hidden">
                {profilePic ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img src={profilePic} alt={user.username} className="w-full h-full object-cover" />
                ) : (
                  user.username[0].toUpperCase()
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 flex flex-col gap-5 text-center md:text-left w-full">
          <div className="flex flex-col md:flex-row items-center gap-5">
            <h1 className="text-2xl font-light text-zinc-900 flex items-center gap-2">
              {user.username}
              <CheckCircle2 className="w-5 h-5 text-sky-500 fill-current" />
            </h1>
            <div className="flex gap-2">
              <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold py-2 px-8 rounded-lg text-sm shadow-md transition-all active:scale-95">
                Follow
              </button>
              <button className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-bold py-2 px-6 rounded-lg text-sm transition-all active:scale-95">
                Message
              </button>
              <button className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 p-2 rounded-lg transition-colors">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center md:justify-start gap-10 py-2 border-y border-zinc-50 md:border-none">
            <div className="text-base">
              <span className="font-bold text-zinc-900">{user.media_count}</span> <span className="text-zinc-500">posts</span>
            </div>
            <div className="text-base">
              <span className="font-bold text-zinc-900">{formatCount(followers)}</span> <span className="text-zinc-500">followers</span>
            </div>
            <div className="text-base">
              <span className="font-bold text-zinc-900">{formatCount(follows)}</span> <span className="text-zinc-500">following</span>
            </div>
          </div>

          {/* Bio */}
          <div className="flex flex-col gap-1">
            <span className="font-bold text-sm text-zinc-900">{user.username}</span>
            <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed max-w-md">
              {bio}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
