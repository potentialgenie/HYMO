import React from "react"
import type { Metadata } from 'next'
import { Archivo, Orbitron } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { LanguageProvider } from '@/lib/language-context'
import './globals.css'

const archivo = Archivo({ 
  subsets: ["latin"],
  variable: '--font-archivo',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
});
const orbitronFallback = Orbitron({ 
  subsets: ["latin"],
  variable: '--font-monday-pro',
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'HYMO | Race Like a PRO - Esport Setups Tuned by Champions',
  description: 'Professional racing game setups tuned by esports champions. Get the edge you need to dominate the competition.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/favicon.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/favicon.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/favicon.png',
        type: 'image/svg+xml',
      },
    ],
    apple: '/favicon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${archivo.variable} ${orbitronFallback.variable} font-sans antialiased`}>
        <LanguageProvider>
          {children}
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
