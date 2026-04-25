import { z } from 'zod'

export const promptSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  category_id: z.string().uuid('Category is required'),
  description: z.string().max(500).optional().nullable().or(z.literal('')),
  content: z.string().min(1, 'Prompt content is required'),
  ai_tool: z.enum(['Midjourney', 'Claude', 'ChatGPT', 'Gemini', 'Runway', 'Pika', 'Kling', 'Veo', 'Other']),
  output_type: z.enum(['image', 'video', 'text', 'code', 'audio']),
  gate_type: z.enum(['open', 'email', 'payment']),
  price: z.number().positive().optional().nullable(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, hyphens only'),
  video_url: z.string().url().optional().nullable().or(z.literal('')),
  embed_html: z.string().optional().nullable().or(z.literal('')),
  thumbnail_url: z.string().url().optional().nullable().or(z.literal('')),
  status: z.enum(['draft', 'published']),
  featured: z.boolean().default(false),
})

export const emailCaptureSchema = z.object({
  email: z.string().email('Valid email required'),
  prompt_id: z.string().uuid('Invalid prompt ID'),
})

export const creatorSettingsSchema = z.object({
  name: z.string().min(1, 'Name is required').max(60),
  handle: z.string().min(1).regex(/^@?[\w.]+$/).max(30),
  bio: z.string().max(300).optional().nullable(),
  brand_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  instagram_url: z.string().url().optional().nullable().or(z.literal('')),
  tiktok_url: z.string().url().optional().nullable().or(z.literal('')),
  instagram_api_key: z.string().optional().nullable().or(z.literal('')),
  tiktok_api_key: z.string().optional().nullable().or(z.literal('')),
})

export const categorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  description: z.string().max(200).optional().nullable(),
  icon: z.string().optional().nullable(),
  image_url: z.string().url().optional().nullable().or(z.literal('')),
  featured: z.boolean().default(false),
})
