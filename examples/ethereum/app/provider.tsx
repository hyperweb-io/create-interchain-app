'use client'

import './globals.css'
import "@interchain-ui/react/styles";
import { ThemeProvider } from "@interchain-ui/react";

export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
