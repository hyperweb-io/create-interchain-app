import { useChain } from '@interchain-kit/react';
import { createRpcQueryHooks } from 'interchain-query';
import { useRpcEndpoint, useRpcClient } from 'interchainjs/react-query'
import { defaultContext } from '@tanstack/react-query';

export const useQueryHooks = (chainName: string, extraKey?: string) => {
  const { getRpcEndpoint } = useChain(chainName);

  const rpcEndpointQuery = useRpcEndpoint({
    getter: getRpcEndpoint,
    options: {
      context: defaultContext,
      staleTime: Infinity,
      queryKeyHashFn: (queryKey) => {
        const key = [...queryKey, chainName];
        return JSON.stringify(extraKey ? [...key, extraKey] : key);
      },
    },
  });

  const rpcClientQuery = useRpcClient({
    clientResolver: {
      rpcEndpoint: rpcEndpointQuery.data || '',
    },
    options: {
      context: defaultContext,
      enabled: Boolean(rpcEndpointQuery.data),
      staleTime: Infinity,
      queryKeyHashFn: (queryKey) => {
        return JSON.stringify(extraKey ? [...queryKey, extraKey] : queryKey);
      },
    },
  });

  const { cosmos } = createRpcQueryHooks({
    rpc: rpcClientQuery.data,
  });

  const isReady = Boolean(rpcClientQuery.data);
  const isFetching = rpcEndpointQuery.isFetching || rpcClientQuery.isFetching;

  return {
    cosmos,
    isReady,
    isFetching,
    rpcEndpoint: rpcEndpointQuery.data,
  };
};
