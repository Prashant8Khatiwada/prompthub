import type { Metadata } from 'next'
import './globals.css'

import { PRODUCTION_DOMAIN } from '@/lib/constants'

export const metadata: Metadata = {
  title: { default: 'Creatopedia', template: '%s | Creatopedia' },
  description: 'The branded prompt-delivery platform for AI content creators.',
  metadataBase: new URL(`https://${PRODUCTION_DOMAIN}`),
}

import QueryProvider from '@/components/providers/QueryProvider'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}
