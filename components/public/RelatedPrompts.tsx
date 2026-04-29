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
    <section className="max-w-2xl mx-auto px-4 py-12 border-t border-zinc-100 mt-12">
      <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-6 text-center">
        More from this creator
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {prompts.map((p) => (
          <Link
            key={p.id}
            href={`/${subdomain}/${p.slug}`}
            className="group flex flex-col gap-3 transition-all duration-300"
          >
            {/* Thumbnail */}
            <div className="aspect-[4/5] bg-zinc-50 relative rounded-xl overflow-hidden border border-zinc-100 shadow-sm group-hover:shadow-md transition-all group-hover:-translate-y-1">
              {p.thumbnail_url ? (
                <Image
                  src={p.thumbnail_url}
                  alt={p.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-4xl">
                  {OUTPUT_ICONS[p.output_type] ?? '✨'}
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
            </div>

            {/* Info */}
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-zinc-900 line-clamp-2 leading-tight group-hover:text-sky-600 transition-colors">{p.title}</p>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{p.ai_tool}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-200" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">{p.output_type}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
