import type { AppProps } from 'next/app';
import { ChainProvider } from '@interchain-kit/react';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import {
  Box,
  ThemeProvider,
  Toaster,
  useTheme,
  useColorModeValue,
} from '@interchain-ui/react';
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { chains, assetLists } from '@chain-registry/v2';
import { keplrWallet } from "@interchain-kit/keplr-extension";
import { leapWallet } from "@interchain-kit/leap-extension";

import '../styles/globals.css';
import '@interchain-ui/react/styles';
// import '@interchain-ui/react/globalStyles';

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
          </Box>
        </QueryClientProvider>
      </ChainProvider>

      <Toaster position={'top-right'} closeButton={true} />
    </ThemeProvider>
  );
}

export default CreateInterchainApp;
