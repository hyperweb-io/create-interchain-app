import type { Metadata } from 'next'
import "@interchain-ui/react/styles";
// import '../styles/globals.css'
import Provider from './provider'

export const metadata: Metadata = {
  title: 'Ethereum Demo - InterchainJS',
  description: 'Created with InterchainJS, Interchain-Kit',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <Provider>
          {children}
        </Provider>
      </body>
    </html>
  )
}
