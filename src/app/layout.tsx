import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Toko Aki CRM',
  description: 'Sistem manajemen pelanggan Toko Aki',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  )
}
