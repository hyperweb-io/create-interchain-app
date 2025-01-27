import { useChain } from '@interchain-kit/react';
import {
  useRpcEndpoint,
} from '@interchainjs/react/react-query';
import { UseQueryOptions } from '@tanstack/react-query';
import { HttpEndpoint } from '@interchainjs/types';
export const useQueryHooks = (
  chainName: string,
  options?: UseQueryOptions<string | HttpEndpoint, Error>
) => {
  const { getRpcEndpoint } = useChain(chainName);

  const rpcEndpointQuery = useRpcEndpoint({
    getter: getRpcEndpoint,
    options: {
      staleTime: Infinity,
      queryKeyHashFn: (queryKey) => {
        return JSON.stringify([...queryKey, chainName]);
      },
      ...options,
    },
  });

  const isReady = Boolean(rpcEndpointQuery.data);
  const isFetching = rpcEndpointQuery.isFetching || rpcEndpointQuery.isFetching;

  return {
    isReady,
    isFetching,
    rpcEndpoint: rpcEndpointQuery.data,
  };
};
