import { useEffect } from "react";
import {
  Box,
  ClipboardCopyText,
  Stack,
  useColorModeValue,
} from "@interchain-ui/react";
import { WalletState } from "@interchain-kit/core";
import { useChain } from "@interchain-kit/react";
import { chains } from "@chain-registry/v2";
import { ChainSelect } from "./Chain";
import { Warning } from "./Warning";
import { User } from "./User";
import {
  ButtonConnect,
  ButtonConnected,
  ButtonConnecting,
  ButtonDisconnected,
  ButtonError,
  ButtonNotExist,
  ButtonRejected,
} from "./Connect";

export const CHAIN_NAME = "cosmoshub";
export const CHAIN_NAME_STORAGE_KEY = "selected-chain";

export type WalletProps = {
  chainName?: string;
  onChainChange?: (chainName?: string) => void;
};

export function Wallet({
  chainName = CHAIN_NAME,
  onChainChange = () => { },
}: WalletProps) {
  const {
    chain,
    status,
    wallet,
    username,
    address,
    message,
    connect,
    openView,
  } = useChain(chainName);

  const ConnectButton = {
    [WalletState.Connected]: <ButtonConnected onClick={openView} />,
    [WalletState.Connecting]: <ButtonConnecting />,
    [WalletState.Disconnected]: <ButtonDisconnected onClick={connect} />,
    // [WalletState.Error]: <ButtonError onClick={openView} />,
    [WalletState.Rejected]: <ButtonRejected onClick={connect} />,
    // [WalletState.NotExist]: <ButtonNotExist onClick={openView} />,
  }[status] || <ButtonConnect onClick={connect} />;

  function handleChainChange(chainName?: string) {
    if (chainName) {
      onChainChange(chainName);
      localStorage.setItem(CHAIN_NAME_STORAGE_KEY, chainName!);
    }
  }

  useEffect(() => {
    const selected = localStorage.getItem(CHAIN_NAME_STORAGE_KEY);
    if (selected && selected !== chainName) {
      onChainChange(selected);
    }
  }, []);

  return (
    <Box py="$16">
      <Box mx="auto" maxWidth="28rem" attributes={{ mb: "$12" }}>
        <ChainSelect
          chains={chains}
          chainName={chain.chainName}
          onChange={handleChainChange}
        />
      </Box>
      <Stack
        direction="vertical"
        attributes={{
          mx: "auto",
          px: "$8",
          py: "$15",
          maxWidth: "21rem",
          borderRadius: "$lg",
          justifyContent: "center",
          backgroundColor: useColorModeValue("$white", "$blackAlpha500"),
          boxShadow: useColorModeValue(
            "0 0 2px #dfdfdf, 0 0 6px -2px #d3d3d3",
            "0 0 2px #363636, 0 0 8px -2px #4f4f4f",
          ),
        }}
      >
        {username ? <User name={username} /> : null}
        {address
          ? <ClipboardCopyText text={address} truncate="middle" />
          : null}
        <Box
          my="$8"
          flex="1"
          width="full"
          display="flex"
          height="$16"
          overflow="hidden"
          justifyContent="center"
          px={{ mobile: "$8", tablet: "$10" }}
        >
          {ConnectButton}
        </Box>

        {message &&
          [WalletState.Rejected].includes(status)
          ? <Warning text={`${wallet?.info?.prettyName}: ${message}`} />
          : null}
      </Stack>
    </Box>
  );
}
