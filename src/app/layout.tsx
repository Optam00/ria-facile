import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RIA facile - Quiz sur le Règlement sur l\'IA',
  description: 'Entrainez-vous pour mieux maîtriser le règlement sur l\'IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  )
}
