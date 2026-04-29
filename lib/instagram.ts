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
  account_type: string
  media_count: number
  biography?: string
  followers_count?: number
  follows_count?: number
  profile_picture_url?: string
  full_name?: string
  website?: string
}

export async function fetchInstagramUser(): Promise<InstagramUser | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return null

  try {
    // Note: Basic Display API has limited fields. 
    // We try to fetch what we can. 
    const res = await fetch(`https://graph.instagram.com/me?fields=id,username,account_type,media_count,biography,followers_count,follows_count,profile_picture_url,name,website&access_token=${token}`)
    if (!res.ok) return null
    const data = await res.json()
    
    // Since Basic Display API doesn't provide bio/followers, we might need to mock them 
    // or use a different endpoint if available. 
    // For now, we return the data and handle missing fields in UI.
    return data as InstagramUser
  } catch (error) {
    console.error('Error fetching Instagram user:', error)
    return null
  }
}

export async function fetchInstagramFeed(limit: number = 3): Promise<InstagramMedia[]> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return []

  try {
    const res = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&limit=${limit}&access_token=${token}`)
    if (!res.ok) return []
    const data = await res.json()
    return data.data || []
  } catch (error) {
    console.error('Error fetching Instagram feed:', error)
    return []
  }
}

export async function fetchInstagramMedia(url: string): Promise<InstagramMedia | null> {
  const token = process.env.INSTAGRAM_ACCESS_TOKEN
  if (!token) return null

  try {
    const match = url.match(/(?:\/(?:p|reels|reel)\/)([A-Za-z0-9_-]+)/)
    if (!match) return null
    const shortcode = match[1]

    const res = await fetch(`https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp,username,like_count,comments_count&access_token=${token}`)
    
    if (!res.ok) return null
    
    const data = await res.json()
    const media = data.data as InstagramMedia[]
    const found = media.find(m => m.permalink.includes(shortcode))
    
    return found || null
  } catch (error) {
    console.error('Error fetching Instagram media:', error)
    return null
  }
}
