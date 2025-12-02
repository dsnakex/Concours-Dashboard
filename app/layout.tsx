import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Contest AI - Dashboard de Jeux-Concours',
  description: 'Optimisez vos participations aux jeux-concours avec l\'IA',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="bg-background text-text-primary antialiased">
        {children}
      </body>
    </html>
  )
}
