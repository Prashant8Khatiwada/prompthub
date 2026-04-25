export type PlanTier = 'free' | 'creator' | 'pro'
export type GateType = 'open' | 'email' | 'payment'
export type PromptStatus = 'draft' | 'published'
export type OutputType = 'image' | 'video' | 'text' | 'code' | 'audio'
export type AiTool = 'Midjourney' | 'Claude' | 'ChatGPT' | 'Gemini' | 'Runway' | 'Pika' | 'Kling' | 'Veo' | 'Other'
export type PromptCategory = 'Video Generation' | 'Image Creation' | 'Brand & Logo' | 'Education' | 'Scriptwriting' | 'Photo Editing' | 'Other'

export interface Creator {
  id: string
  email: string
  name: string
  handle: string
  subdomain: string
  avatar_url: string | null
  brand_color: string
  bio: string | null
  instagram_url: string | null
  tiktok_url: string | null
  instagram_api_key?: string | null
  tiktok_api_key?: string | null
  stripe_id: string | null
  plan_tier: PlanTier
  created_at: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  image_url: string | null
  featured: boolean
  created_at: string
}

export interface Prompt {
  id: string
  creator_id: string
  title: string
  category_id: string
  description: string | null
  content: string
  video_url: string | null
  embed_html: string | null
  thumbnail_url: string | null
  ai_tool: AiTool
  output_type: OutputType
  gate_type: GateType
  price: number | null
  slug: string
  status: PromptStatus
  featured: boolean
  created_at: string
}

export interface Page {
  id: string
  prompt_id: string
  published_at: string
}

export interface EmailCapture {
  id: string
  prompt_id: string
  email: string
  captured_at: string
}
