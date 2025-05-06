// TODO fix type issues
// @ts-nocheck

import { useEffect, useState } from 'react';
import { Divider } from '@interchain-ui/react';
import { useQueryClient } from '@tanstack/react-query';
import {
  DEFAULT_SIGNING_CLIENT_QUERY_KEY,
  DEFAULT_RPC_CLIENT_QUERY_KEY,
} from '@interchainjs/react/react-query';

import { useAuthzContext } from '@/context';
import { Layout, Wallet, AuthzSection } from '@/components';
import { useChain } from '@interchain-kit/react';
import { defaultChainName } from '@/configs';
export default function Home() {
  const [selectedChain, setSelectedChain] = useState<string>();
  const { setChainName } = useAuthzContext();
  const queryClient = useQueryClient();

  const {
    rpcEndpoint,
    status,
    signingClient: client,
    isSigningClientLoading,
  } = useChain(selectedChain ?? defaultChainName);

  useEffect(() => {
    if (!isSigningClientLoading) {
      queryClient.setQueryData([DEFAULT_SIGNING_CLIENT_QUERY_KEY], client);
    }

    if (rpcEndpoint) {
      queryClient.setQueryData([DEFAULT_RPC_CLIENT_QUERY_KEY], rpcEndpoint);
    }
  }, [isSigningClientLoading, rpcEndpoint, client, queryClient]);

  return (
    <Layout>
      <Wallet
        chainName={selectedChain}
        isMultiChain
        onChainChange={(chainName) => {
          setSelectedChain(chainName);
          setChainName(chainName);
        }}
      />
      <Divider height="0.1px" mt="$12" mb="$17" />
      {selectedChain && <AuthzSection chainName={selectedChain} />}
    </Layout>
  );
}
