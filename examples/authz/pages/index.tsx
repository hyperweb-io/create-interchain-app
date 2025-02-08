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
import { useSigningClient } from '@/hooks';
export default function Home() {
  const [selectedChain, setSelectedChain] = useState<string>();
  const { setChainName } = useAuthzContext();
  const queryClient = useQueryClient();

  const { rpcEndpoint, status } = useChain(selectedChain ?? defaultChainName);

  const { data: client, isSuccess: isSigningClientSuccess } = useSigningClient(
    selectedChain ?? defaultChainName,
    {
      walletStatus: status,
    }
  );

  useEffect(() => {
    if (isSigningClientSuccess) {
      queryClient.setQueryData([DEFAULT_SIGNING_CLIENT_QUERY_KEY], client);
    }

    if (isSigningClientSuccess && rpcEndpoint) {
      queryClient.setQueryData([DEFAULT_RPC_CLIENT_QUERY_KEY], rpcEndpoint);
    }
  }, [isSigningClientSuccess, rpcEndpoint, client, queryClient]);

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
