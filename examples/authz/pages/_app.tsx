// TODO fix type issues
// @ts-nocheck

import '@interchain-ui/react/styles';
import '@interchain-ui/react/globalStyles';
import 'react-calendar/dist/Calendar.css';

import React from 'react';
import type { AppProps } from 'next/app';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { SignerOptions, wallets } from 'interchain-kit';
import { ChainProvider } from '@interchain-kit/react';
import { chains, assetLists } from '@chain-registry/v2';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { leapWallet } from '@interchain-kit/leap-extension';

import {
  Box,
  Toaster,
  useTheme,
  useColorModeValue,
  ThemeProvider,
} from '@interchain-ui/react';
import { AuthzProvider } from '@/context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  },
});

function CreateInterchainApp({ Component, pageProps }: AppProps) {
  const { themeClass } = useTheme();

  return (
    <ThemeProvider>
      <ChainProvider
        chains={chains}
        assetLists={assetLists}
        wallets={[keplrWallet, leapWallet]}
        signerOptions={{
          signing: (chain) => {
            if (chain === 'juno') {
              return {
                preferredSignType: 'direct',
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
            osmosis: {
              rpc: ['https://rpc.osmosis.zone'],
            },
            juno: {
              rpc: ['https://juno-rpc.stakeandrelax.net/'],
            },
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <AuthzProvider>
            <Box
              className={themeClass}
              minHeight="100dvh"
              backgroundColor={useColorModeValue('$white', '$background')}
            >
              {/* TODO fix type error */}
              {/* @ts-ignore */}
              <Component {...pageProps} />
              <Toaster position="top-right" closeButton={true} />
            </Box>
          </AuthzProvider>
          {/* <ReactQueryDevtools /> */}
        </QueryClientProvider>
      </ChainProvider>
    </ThemeProvider>
  );
}

export default CreateInterchainApp;
