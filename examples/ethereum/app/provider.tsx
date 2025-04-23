'use client'

import './globals.css'
import "@interchain-ui/react/styles";
import { ThemeProvider } from "@interchain-ui/react";
import { ChainProvider } from "@interchain-kit/react";
import { metaMaskWallet } from '@interchain-kit/metamask-extension'
import { assetList, chain } from '@chain-registry/v2/mainnet/ethereum'

const _wallets = [
  metaMaskWallet,
];

export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ThemeProvider>
      <ChainProvider
        chains={[chain]}
        // @ts-ignore
        wallets={_wallets}
        assetLists={[assetList]}
        signerOptions={{}}
      >
        {children}
      </ChainProvider>
    </ThemeProvider>
  )
}
