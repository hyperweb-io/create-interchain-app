import '@interchain-ui/react/styles';
import '../styles/globals.css';

import type { AppProps } from 'next/app';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import { ChainProvider } from '@interchain-kit/react';
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { leapWallet } from "@interchain-kit/leap-extension";
import { chains, assetLists } from '@chain-registry/v2';

import {
  Box,
  Toaster,
  useTheme,
  useColorModeValue,
  ThemeProvider,
  OverlaysManager,
} from '@interchain-ui/react';

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
        chains={chains}
        // @ts-ignore
        assetLists={assetLists}
        wallets={[keplrWallet, leapWallet]}
        signerOptions={{}}
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
            <Toaster position="top-right" closeButton={true} />
          </Box>
          {/* <ReactQueryDevtools /> */}
        </QueryClientProvider>
      </ChainProvider>
      <OverlaysManager />
    </ThemeProvider>
  );
}

export default CreateInterchainApp;
