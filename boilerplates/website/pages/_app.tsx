import "../styles/globals.css";
import "@interchain-ui/react/styles";

import type { AppProps } from "next/app";
import {
  Box,
  ThemeProvider,
  useColorModeValue,
  useTheme,
} from "@interchain-ui/react";

function CreateInterchainApp({ Component, pageProps }: AppProps) {
  const { themeClass } = useTheme();

  return (
    <ThemeProvider>
      <Box
        className={themeClass}
        minHeight="100dvh"
        backgroundColor={useColorModeValue("$white", "$background")}
      >
        {/* @ts-ignore */}
        <Component {...pageProps} />
      </Box>
    </ThemeProvider>
  );
}

export default CreateInterchainApp;
