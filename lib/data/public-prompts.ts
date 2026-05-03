import { unstable_cache } from 'next/cache'
import { adminClient } from '@/lib/supabase/admin'

export const getCachedCreator = (subdomain: string) => 
  unstable_cache(
    async () => {
      const { data, error } = await adminClient
        .from('creators')
        .select('*')
        .eq('subdomain', subdomain)
        .single()
      if (error || !data) return null
      return data
    },
    ['creator', subdomain],
    { revalidate: 3600, tags: [`creator-${subdomain}`] }
  )()

export const getCachedPrompt = (creatorId: string, slug: string) => 
  unstable_cache(
    async () => {
      const { data, error } = await adminClient
        .from('prompts')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('slug', slug)
        .eq('status', 'published')
        .single()
      if (error || !data) return null
      return data
    },
    ['prompt', creatorId, slug],
    { revalidate: 3600, tags: [`prompt-${creatorId}-${slug}`] }
  )()

export const getCachedRelatedPrompts = (creatorId: string, currentPromptId: string) => 
  unstable_cache(
    async () => {
      const { data } = await adminClient
        .from('prompts')
        .select('id,title,slug,ai_tool,output_type,thumbnail_url')
        .eq('creator_id', creatorId)
        .eq('status', 'published')
        .neq('id', currentPromptId)
        .limit(3)
      return data || []
    },
    ['related-prompts', creatorId, currentPromptId],
    { revalidate: 3600 }
  )()
