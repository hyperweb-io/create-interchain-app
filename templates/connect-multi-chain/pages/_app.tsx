import '../styles/globals.css';
import '@interchain-ui/react/styles';

import type { AppProps } from 'next/app';
import { ChainProvider } from '@interchain-kit/react';
import { assetLists, chains } from "@chain-registry/v2";
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { leapWallet } from "@interchain-kit/leap-extension";
import {
  Box,
  ThemeProvider,
  useColorModeValue,
  useTheme,
} from '@interchain-ui/react';

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const { themeClass } = useTheme();

  return (
    <ThemeProvider>
      <ChainProvider
        // @ts-ignore
        chains={chains}
        // @ts-ignore
        assetLists={assetLists}
        wallets={[keplrWallet, leapWallet]}
        // @ts-ignore
        walletConnectOptions={{
          signClient: {
            projectId: 'a8510432ebb71e6948cfd6cde54b70f7',
            relayUrl: 'wss://relay.walletconnect.org',
            metadata: {
              name: 'Interchain Kit dApp',
              description: 'Interchain Kit dApp built by Create Interchain App',
              url: 'https://docs.cosmology.zone/interchain-kit/',
              icons: [],
            },
          },
        }}
        signerOptions={{}}
      >
        <Box
          className={themeClass}
          minHeight="100dvh"
          backgroundColor={useColorModeValue('$white', '$background')}
        >
          {/* @ts-ignore */}
          <Component {...pageProps} />
        </Box>
      </ChainProvider>
    </ThemeProvider>
  );
}

export default CreateCosmosApp;
