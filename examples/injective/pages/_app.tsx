import '../styles/globals.css';
import '@interchain-ui/react/styles';

import type { AppProps } from 'next/app';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { ChainProvider } from '@interchain-kit/react';
import { defaultAssetList, defaultChain } from '../config/defaults';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';
import { defaultSignerOptions } from '@interchainjs/injective/defaults';
import {
  Box,
  ThemeProvider,
  Toaster,
  useTheme,
  useColorModeValue,
} from '@interchain-ui/react';
import { defaultRpcEndpoint } from '@/config';
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function CreateInterchainApp({ Component, pageProps }: AppProps) {
  const { themeClass } = useTheme();

  return (
    <ThemeProvider>
      <ChainProvider
        // @ts-ignore
        chains={[defaultChain!]}
        // @ts-ignore
        assetLists={[defaultAssetList!]}
        wallets={[keplrWallet, leapWallet]}
        signerOptions={{
          signing: (chain) => {
            if (chain === 'injective') {
              return {
                signerOptions: defaultSignerOptions.Cosmos,
                broadcast: {
                  checkTx: true,
                  deliverTx: true,
                },
              };
            }
          },
        }}
        endpointOptions={{
          endpoints: {
            injective: {
              rpc: [defaultRpcEndpoint],
            },
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <Box
            className={themeClass}
            minHeight="100dvh"
            backgroundColor={useColorModeValue('$white', '$background')}
          >
            {/* TODO fix type error */}
            {/* @ts-ignore */}
            <Component {...pageProps} />
          </Box>
        </QueryClientProvider>
      </ChainProvider>

      <Toaster position={'top-right'} closeButton={true} />
    </ThemeProvider>
  );
}

export default CreateInterchainApp;
