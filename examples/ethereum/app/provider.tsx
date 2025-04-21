'use client'

import './globals.css'
import "@interchain-ui/react/styles";
import { ThemeProvider } from "@interchain-ui/react";
import { ChainProvider } from "@interchain-kit/react";
import { BaseWallet } from "@interchain-kit/core";
import { metaMaskExtension } from '@interchain-kit/metamask-extension'

const _wallets: BaseWallet[] = [
  // metaMaskExtension
];

export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      {/* <ChainProvider
        chains={[]}
        wallets={_wallets}
        assetLists={[]}
        signerOptions={{}}
      > */}
      {children}
      {/* </ChainProvider> */}
    </ThemeProvider>
  )
}
