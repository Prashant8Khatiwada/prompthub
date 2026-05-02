import { adminClient } from '@/lib/supabase/admin'
import { decrypt } from '@/lib/crypto'

export interface InstagramMedia {
  id: string
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM'
  media_url: string
  permalink: string
  thumbnail_url?: string
  timestamp: string
  caption?: string
  username: string
  like_count?: number
  comments_count?: number
}

export interface InstagramUser {
  id: string
  username: string
  media_count: number
  biography?: string
  followers_count?: number
  follows_count?: number
  profile_picture_url?: string
  name?: string
  website?: string
}

// Memory caching for performance optimization and avoiding heap out of memory
const igUserCache = new Map<string, { data: InstagramUser | null; expiresAt: number }>()
const igFeedCache = new Map<string, { data: InstagramMedia[]; expiresAt: number }>()
const igMediaCache = new Map<string, { data: InstagramMedia | null; expiresAt: number }>()

const CACHE_TTL = 1000 * 60 * 5 // 5 minutes cache

async function getCreatorToken(creatorId: string) {
  console.log(`[Instagram] Fetching token for creator: ${creatorId}`)
  const { data, error } = await adminClient
    .from('creator_instagram_tokens')
    .select('*')
    .eq('creator_id', creatorId)
    .single()

  if (error) {
    console.log(`[Instagram] DB Error fetching token: ${error.message}`)
    return null
  }
  if (!data) {
    console.log(`[Instagram] No token found in DB for creator: ${creatorId}`)
    return null
  }

  try {
    const token = decrypt(data.encrypted_token, data.iv)
    if (!token) return null
    
    console.log(`[Instagram] Token decrypted successfully for IG ID: ${data.instagram_user_id}`)
    return { token, igId: data.instagram_user_id }
  } catch (e) {
    console.error('[Instagram] Decryption failed:', e)
    return null
  }
}

export async function fetchInstagramUser(creatorId?: string): Promise<InstagramUser | null> {
  if (!creatorId) return null

  // 1. Check in-memory cache
  const now = Date.now()
  const cached = igUserCache.get(creatorId)
  if (cached && cached.expiresAt > now) {
    console.log(`[Instagram] Returning cached user info for ${creatorId}`)
    return cached.data
  }

  const auth = await getCreatorToken(creatorId)
  if (!auth) {
    // Cache failures for a shorter time to avoid spamming the DB
    igUserCache.set(creatorId, { data: null, expiresAt: now + CACHE_TTL / 5 })
    return null
  }

  try {
    console.log(`[Instagram] Fetching user info from Graph API for ${auth.igId}...`)
    const res = await fetch(`https://graph.facebook.com/v19.0/${auth.igId}?fields=id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website&access_token=${auth.token}`)
    
    if (!res.ok) {
      const errData = await res.json()
      console.error(`[Instagram] API Error:`, errData)
      
      console.log(`[Instagram] Retrying with graph.instagram.com/me...`)
      const res2 = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count,biography,followers_count,follows_count,profile_picture_url,name,website&access_token=${auth.token}`)
      if (!res2.ok) {
        igUserCache.set(creatorId, { data: null, expiresAt: now + CACHE_TTL / 5 })
        return null
      }
      const data2 = await res2.json()
      igUserCache.set(creatorId, { data: data2 as InstagramUser, expiresAt: now + CACHE_TTL })
      return data2 as InstagramUser
    }
    
    const data = await res.json()
    igUserCache.set(creatorId, { data: data as InstagramUser, expiresAt: now + CACHE_TTL })
    return data as InstagramUser
  } catch (error) {
    console.error('[Instagram] Error fetching Instagram user:', error)
    igUserCache.set(creatorId, { data: null, expiresAt: now + CACHE_TTL / 5 })
    return null
  }
}

export async function fetchInstagramFeed(creatorId?: string, limit: number = 100): Promise<InstagramMedia[]> {
  if (!creatorId) return []

  // 1. Check in-memory cache
  const now = Date.now()
  const cached = igFeedCache.get(creatorId)
  if (cached && cached.expiresAt > now) {
    console.log(`[Instagram] Returning cached feed for ${creatorId}`)
    return cached.data
  }

  const auth = await getCreatorToken(creatorId)
  if (!auth) {
    igFeedCache.set(creatorId, { data: [], expiresAt: now + CACHE_TTL / 5 })
    return []
  }

  try {
    console.log(`[Instagram] Fetching feed for ${auth.igId}...`)
    const res = await fetch(`https://graph.facebook.com/v19.0/${auth.igId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&limit=${limit}&access_token=${auth.token}`)
    
    if (!res.ok) {
      const errData = await res.json()
      console.error(`[Instagram] Feed API Error:`, errData)
      
      const res2 = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&limit=${limit}&access_token=${auth.token}`)
      if (!res2.ok) {
        igFeedCache.set(creatorId, { data: [], expiresAt: now + CACHE_TTL / 5 })
        return []
      }
      const data2 = await res2.json()
      const dataOut = data2.data || []
      igFeedCache.set(creatorId, { data: dataOut, expiresAt: now + CACHE_TTL })
      return dataOut
    }
    
    const data = await res.json()
    const dataOut = data.data || []
    igFeedCache.set(creatorId, { data: dataOut, expiresAt: now + CACHE_TTL })
    return dataOut
  } catch (error) {
    console.error('[Instagram] Error fetching Instagram feed:', error)
    igFeedCache.set(creatorId, { data: [], expiresAt: now + CACHE_TTL / 5 })
    return []
  }
}

export async function fetchInstagramMedia(url: string, creatorId?: string): Promise<InstagramMedia | null> {
  if (!creatorId) return null

  const cacheKey = `${creatorId}:${url}`
  const now = Date.now()
  const cached = igMediaCache.get(cacheKey)
  if (cached && cached.expiresAt > now) {
    console.log(`[Instagram] Returning cached media for ${cacheKey}`)
    return cached.data
  }

  const auth = await getCreatorToken(creatorId)
  if (!auth) {
    igMediaCache.set(cacheKey, { data: null, expiresAt: now + CACHE_TTL / 5 })
    return null
  }

  try {
    const match = url.match(/(?:\/(?:p|reels|reel)\/)([A-Za-z0-9_-]+)/)
    if (!match) return null
    const shortcode = match[1]

    const res = await fetch(`https://graph.facebook.com/v19.0/${auth.igId}/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&access_token=${auth.token}`)
    
    if (!res.ok) {
      const res2 = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&access_token=${auth.token}`)
      if (!res2.ok) {
        igMediaCache.set(cacheKey, { data: null, expiresAt: now + CACHE_TTL / 5 })
        return null
      }
      const data2 = await res2.json()
      const media2 = data2.data as InstagramMedia[]
      const found = media2.find(m => m.permalink.includes(shortcode)) || null
      igMediaCache.set(cacheKey, { data: found, expiresAt: now + CACHE_TTL })
      return found
    }
    
    const data = await res.json()
    const media = data.data as InstagramMedia[]
    const found = media.find(m => m.permalink.includes(shortcode)) || null
    igMediaCache.set(cacheKey, { data: found, expiresAt: now + CACHE_TTL })
    return found
  } catch (error) {
    console.error('[Instagram] Error fetching Instagram media:', error)
    igMediaCache.set(cacheKey, { data: null, expiresAt: now + CACHE_TTL / 5 })
    return null
  }
}
