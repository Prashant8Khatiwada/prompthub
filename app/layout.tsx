import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: { default: 'PromptHub', template: '%s | PromptHub' },
  description: 'The branded prompt-delivery platform for AI content creators.',
  metadataBase: new URL(`https://${(process.env.NEXT_PUBLIC_BASE_DOMAIN || 'localhost:3000').replace(/^https?:\/\//, '')}`),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-zinc-950 text-zinc-50 antialiased">
        {children}
      </body>
    </html>
  )
}
