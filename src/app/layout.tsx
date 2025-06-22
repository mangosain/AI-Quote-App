// app/layout.tsx
import './globals.css'
import { ReactNode } from 'react'

export const metadata = {
  title: 'AI Quote Generator',
  description: 'Get inspirational AI-generated quotes',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
