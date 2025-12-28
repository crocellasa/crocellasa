import './globals.css'
import { Inter, DM_Serif_Display } from 'next/font/google'
import type { Metadata } from 'next'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
})

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-serif',
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
      <body className={`${inter.variable} ${dmSerif.variable} font-sans antialiased bg-brand-ivory text-brand-midnight min-h-screen selection:bg-brand-brass/20`}>
        {children}
      </body>
    </html>
  )
}
