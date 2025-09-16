import '../styles/globals.css';
import '@interchain-ui/react/styles';

import type { AppProps } from 'next/app';
import { ChainProvider } from '@interchain-kit/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Box, Toaster } from '@interchain-ui/react';

import { wallets } from '../config/wallets';
import { chains, assetLists } from '../config/chains';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  },
});

function CosmWasmTsCodegenApp({ Component, pageProps }: AppProps) {
  return (
    <ChainProvider chains={chains} assetLists={assetLists} wallets={wallets}>
      {/* @ts-ignore */}
      <QueryClientProvider client={queryClient}>
        <Box>
          <Component {...pageProps} />
          <Toaster position="top-right" closeButton={true} />
        </Box>
      </QueryClientProvider>
    </ChainProvider>
  );
}

export default CosmWasmTsCodegenApp;