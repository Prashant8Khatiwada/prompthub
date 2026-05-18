export const SUPABASE_STORAGE_URL = 'https://slbywxgigzuodyrmhdsg.supabase.co/storage/v1/object/public'
export const CDN_URL = 'https://cdn.creatopedia.tech'

const STORAGE_BUCKETS = ['prompts', 'avatars', 'images', 'banners', 'assets']
const INSTAGRAM_HOSTNAMES = ['cdninstagram.com', 'scontent.cdninstagram.com', 'instagram.com']

function isSupabaseStorageUrl(url: string): boolean {
  return url?.startsWith(SUPABASE_STORAGE_URL)
}

function isInstagramUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return INSTAGRAM_HOSTNAMES.some(h => parsed.hostname.includes(h) || parsed.hostname.startsWith(h))
  } catch {
    return false
  }
}

function isExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.hostname !== 'slbywxgigzuodyrmhdsg.supabase.co'
  } catch {
    return false
  }
}

const URL_FIELDS = new Set([
  'thumbnail_url',
  'share_image_url',
  'video_url',
  'pdf_url',
  'image_url',
  'banner_url',
  'logo_url',
  'media_url',
])

export function toCdnUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (isInstagramUrl(url)) return url
  if (isSupabaseStorageUrl(url)) {
    const path = url.replace(SUPABASE_STORAGE_URL + '/', '')
    return `${CDN_URL}/${path}`
  }
  return url
}

export function transformCdnUrls<T extends Record<string, unknown> | unknown[]>(
  data: T
): T {
  if (Array.isArray(data)) {
    return data.map(item => {
      if (item && typeof item === 'object') {
        return transformCdnUrls(item as Record<string, unknown>) as typeof item
      }
      return item
    }) as T
  }

  if (typeof data !== 'object' || data === null) {
    return data
  }

  const result: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      result[key] = value
    } else if (URL_FIELDS.has(key) && typeof value === 'string') {
      result[key] = toCdnUrl(value)
    } else if (Array.isArray(value)) {
      result[key] = value
    } else if (typeof value === 'object') {
      result[key] = value
    } else {
      result[key] = value
    }
  }

  return result as T
}