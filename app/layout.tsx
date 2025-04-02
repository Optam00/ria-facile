import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'RIA Facile - comprendre et appliquer le règlement IA (AI act, IA act, RIA)',
  description: 'RIA Facile propose plusieurs outils pour vous aider dans votre mise en conformité : outil de consultation du RIA, quiz, actualités, etc.',
  openGraph: {
    title: 'RIA Facile - comprendre et appliquer le règlement IA (AI act, IA act, RIA)',
    description: 'RIA Facile propose plusieurs outils pour vous aider dans votre mise en conformité : outil de consultation du RIA, quiz, actualités, etc.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>{children}</body>
    </html>
  )
} 