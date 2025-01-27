import '../styles/globals.css';
import '@interchain-ui/react/styles';

import { OverlaysManager, ThemeProvider, Toaster, useTheme } from '@interchain-ui/react';
import type { AppProps } from 'next/app';
import { ChainProvider } from '@interchain-kit/react';

import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { keplrWallet } from "@interchain-kit/keplr-extension";
import { leapWallet } from "@interchain-kit/leap-extension";
import { chains, assetLists } from '@chain-registry/v2';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function CreateCosmosApp({ Component, pageProps }: AppProps) {
  const { themeClass } = useTheme();

  return (
    <ThemeProvider>
      <ChainProvider
        chains={chains}
        assetLists={assetLists}
        wallets={[keplrWallet, leapWallet]}
        signerOptions={{}}
        endpointOptions={{
          endpoints: {
            'osmosis': {
              rpc: ['https://rpc.osmosis.zone'],
            },
          },
        }}
      >
        <QueryClientProvider client={queryClient}>
          <main id="main" className={themeClass}>
            <Component {...pageProps} />
          </main>
        </QueryClientProvider>
      </ChainProvider>

      <Toaster position={'top-right'} closeButton={true} />
      <OverlaysManager />
    </ThemeProvider>
  );
}

export default CreateCosmosApp;
