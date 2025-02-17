import { useChain } from '@interchain-kit/react';
import { createRpcQueryHooks } from 'osmo-query';
import { useRpcClient } from 'interchain-react/react-query';
import { useRpcEndpoint } from 'interchain-react/react-query'
import { defaultContext } from '@tanstack/react-query';

export const useQueryHooks = (chainName: string, extraKey?: string) => {
  const { address, getRpcEndpoint } = useChain(chainName);

  const rpcEndpointQuery = useRpcEndpoint({
    getter: getRpcEndpoint,
    options: {
      context: defaultContext,
      enabled: !!address,
      staleTime: Infinity,
      queryKeyHashFn: (queryKey) => {
        const key = [...queryKey, chainName];
        return JSON.stringify(extraKey ? [...key, extraKey] : key);
      },
    },
  });

  const rpcClientQuery = useRpcClient({
    // rpcEndpoint: rpcEndpointQuery.data || '',
    clientResolver: {
      rpcEndpoint: rpcEndpointQuery.data,
    },
    options: {
      context: defaultContext,
      enabled: !!address && !!rpcEndpointQuery.data,
      staleTime: Infinity,
      queryKeyHashFn: (queryKey) => {
        return JSON.stringify(extraKey ? [...queryKey, extraKey] : queryKey);
      },
    },
  });

  const { cosmos: cosmosQuery, osmosis: osmosisQuery } = createRpcQueryHooks({
    rpc: rpcClientQuery.data,
  });

  const isReady = !!address && !!rpcClientQuery.data;
  const isFetching = rpcEndpointQuery.isFetching || rpcClientQuery.isFetching;

  return { cosmosQuery, osmosisQuery, isReady, isFetching };
};
