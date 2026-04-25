import Image from 'next/image'
import Link from 'next/link'

interface RelatedPrompt {
  id: string
  title: string
  slug: string
  ai_tool: string
  output_type: string
  thumbnail_url: string | null
}

interface Props {
  prompts: RelatedPrompt[]
  subdomain: string
}

const OUTPUT_ICONS: Record<string, string> = {
  image: '🖼️',
  video: '🎬',
  text: '📝',
  code: '💻',
  audio: '🎧',
}

export default function RelatedPrompts({ prompts, subdomain }: Props) {
  if (!prompts.length) return null

  return (
    <section className="max-w-2xl mx-auto px-4 py-10 border-t border-zinc-800 mt-8">
      <h2 className="text-base font-semibold text-zinc-400 uppercase tracking-widest mb-5">
        More from this creator
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {prompts.map((p) => (
          <Link
            key={p.id}
            href={`/${subdomain}/${p.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-zinc-900 border border-zinc-800 hover:border-zinc-600 transition-all duration-200 hover:-translate-y-0.5"
          >
            {/* Thumbnail */}
            <div className="aspect-video bg-zinc-800 relative">
              {p.thumbnail_url ? (
                <Image
                  src={p.thumbnail_url}
                  alt={p.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-3xl">
                  {OUTPUT_ICONS[p.output_type] ?? '✨'}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-3">
              <p className="text-sm font-medium text-white line-clamp-2 leading-snug">{p.title}</p>
              <div className="flex gap-1.5 mt-2">
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{p.ai_tool}</span>
                <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-full">{p.output_type}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
