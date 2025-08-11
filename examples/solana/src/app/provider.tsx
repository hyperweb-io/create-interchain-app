'use client';

import { ChainProvider, InterchainWalletModal } from "@interchain-kit/react";
import { assetLists, chains } from "chain-registry";
import { phantomWallet } from "@interchain-kit/phantom-extension";
import "@interchain-kit/react/styles.css";

export default function Provider({ children }: { children: React.ReactNode }) {
  const chainNames: string[] = [
    "solana",
  ];
  const _chains = [
    ...chains.filter((c) => chainNames.includes(c.chainName)),
  ];
  console.log('_chains', _chains)
  const _assetLists = [
    ...assetLists.filter((a) => chainNames.includes(a.chainName)),
  ];
  console.log('_assetLists', _assetLists)
  return (
    <ChainProvider
      chains={_chains}
      assetLists={_assetLists}
      wallets={[phantomWallet]}
      walletModal={() => (
        <InterchainWalletModal
          modalThemeProviderProps={{ defaultTheme: "light" }}
        />
      )}
    >
      {children}
    </ChainProvider>
  );
}