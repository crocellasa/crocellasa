import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

export const metadata: Metadata = {
  title: 'Alcova Landolina - Guest Portal',
  description: 'Your home away from home in Florence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased bg-subtle-gradient text-mono-900 min-h-screen selection:bg-mono-200`}>
        {children}
      </body>
    </html>
  )
}
