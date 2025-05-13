'use client'

import './globals.css'
import "@interchain-ui/react/styles";
import { ThemeProvider } from "@interchain-ui/react";
import { ChainProvider } from "@interchain-kit/react";
import { metaMaskWallet } from '@interchain-kit/metamask-extension'
import { assetList, chain } from '@chain-registry/v2/mainnet/ethereum'
import { createAssetListFromEthereumChainInfo, createChainFromEthereumChainInfo } from '@/lib/eth-test-net';

for (const asset of assetList.assets) {
  if (asset.symbol === 'ETH') {
    asset.logoURIs = {
      png: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png',
      svg: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.svg'
    }
  }
}

const _wallets = [
  metaMaskWallet,
];

export const SEPOLIA_TESTNET = {
  chainId: "11155111", // 11155111(0xaa36a7)	
  chainName: "Sepolia",
  rpcUrls: ["https://1rpc.io/sepolia"],
  nativeCurrency: {
    name: "Sepolia ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
}
const sepoliaChain = createChainFromEthereumChainInfo(SEPOLIA_TESTNET)
const sepoliaAssetList = createAssetListFromEthereumChainInfo(SEPOLIA_TESTNET)

// reference: https://github.com/hyperweb-io/interchain-kit/blob/main/examples/react/src/main.tsx#L86
export const HOLESKY_TESTNET = {
  chainId: "17000", // 17000 | 0x4268
  chainName: "Holesky",
  rpcUrls: ["https://1rpc.io/holesky"],
  nativeCurrency: {
    name: "Holesky ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["https://holesky.etherscan.io"],
};

const holeskyChain = createChainFromEthereumChainInfo(HOLESKY_TESTNET)
const holeskyAssetList = createAssetListFromEthereumChainInfo(HOLESKY_TESTNET)

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

const bscChain = createChainFromEthereumChainInfo(BSC_TESTNET)
const bscAssetList = createAssetListFromEthereumChainInfo(BSC_TESTNET)


export default function Provider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  console.log('chain', chain)
  console.log('assetList', assetList)
  return (
    <ThemeProvider themeMode='light'>
      <ChainProvider
        chains={[
          chain, // chainid = 0x1
          holeskyChain,
          bscChain,
          sepoliaChain
        ]}
        // @ts-ignore
        wallets={_wallets}
        assetLists={[{
          ...assetList,
          ...sepoliaAssetList,
          ...holeskyAssetList,
          ...bscAssetList
        }]}
        signerOptions={{}}
      >
        {children}
      </ChainProvider>
    </ThemeProvider>
  )
}
