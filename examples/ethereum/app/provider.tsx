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

export const HOLESKY_TESTNET = {
  chainId: "0x4268", // 17000 | 0x4268
  chainName: "Holesky testnet",
  rpcUrls: ["https://1rpc.io/holesky"],
  nativeCurrency: {
    name: "Holesky ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://holesky.etherscan.io"],
};

export const BSC_TESTNET = {
  chainId: "97",
  chainName: "Binance Smart Chain Testnet",
  rpcUrls: ["https://data-seed-prebsc-1-s1.binance.org:8545"],
  nativeCurrency: {
    name: "BSC Testnet",
    symbol: "tBNB",
    decimals: 18,
  },
  blockExplorerUrls: ["https://testnet.bscscan.com"],
};

export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.log('chain', chain)
  return (
    <ThemeProvider themeMode='light'>
      <ChainProvider
        chains={[chain,
          // @ts-ignore
          HOLESKY_TESTNET,
          // @ts-ignore
          BSC_TESTNET
        ]}
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
