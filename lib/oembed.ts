export async function fetchInstagramOEmbed(url: string): Promise<string | null> {
  try {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN
    if (!token) return null
    const endpoint = `https://graph.facebook.com/v18.0/instagram_oembed?url=${encodeURIComponent(url)}&access_token=${token}`
    const res = await fetch(endpoint, { next: { revalidate: 3600 } })
    if (!res.ok) return null
    const data = await res.json()
    return data.html ?? null
  } catch {
    return null
  }
}
