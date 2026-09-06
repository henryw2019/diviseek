import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const geist = localFont({
  src: [
    { path: './fonts/geist-latin-400.woff2', weight: '400' },
    { path: './fonts/geist-latin-500.woff2', weight: '500' },
    { path: './fonts/geist-latin-600.woff2', weight: '600' },
    { path: './fonts/geist-latin-700.woff2', weight: '700' },
  ],
  variable: '--font-geist',
})

const notoSerif = localFont({
  src: [
    { path: './fonts/noto-serif-latin-400.woff2', weight: '400' },
    { path: './fonts/noto-serif-latin-600.woff2', weight: '600' },
    { path: './fonts/noto-serif-latin-700.woff2', weight: '700' },
  ],
  variable: '--font-noto-serif',
})

export const metadata: Metadata = {
  title: 'DiviSeek 寻息 · 股息追踪',
  description: '寻息而生，复利而行 — 专注股息投资的追踪与学习应用',
  generator: 'v0.app',
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0f172a',
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className={`${geist.variable} ${notoSerif.variable} bg-background`}>
      <body className="font-sans antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  )
}
