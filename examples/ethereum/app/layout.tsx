import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Ethereum - InterchainJS Demo',
  description: 'Created with InterchainJS, Interchain-Kit',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
