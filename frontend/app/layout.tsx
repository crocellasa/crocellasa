import './globals.css'
import type { Metadata } from 'next'
import { DM_Serif_Display } from 'next/font/google'

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
      <body className={`${dmSerif.variable} font-sans antialiased bg-alcova-ivory`}>
        {children}
      </body>
    </html>
  )
}
