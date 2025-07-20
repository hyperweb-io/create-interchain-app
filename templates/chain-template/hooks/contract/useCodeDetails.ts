import { useQuery } from '@tanstack/react-query';
import { useGetCode } from '@interchainjs/react/cosmwasm/wasm/v1/query.rpc.react';
import { defaultContext } from '@tanstack/react-query';

import { prettyCodeInfo } from '@/utils';
import { useChainStore } from '@/contexts';
import { useRpcEndpoint } from '../common';

export const useCodeDetails = (codeId: number, enabled: boolean = true) => {
  const { selectedChain } = useChainStore();
  const { data: rpcEndpoint } = useRpcEndpoint(selectedChain);

  const { data, refetch } = useGetCode({
    request: {
      codeId: BigInt(codeId),
    },
    options: {
      enabled: !!rpcEndpoint && enabled,
      retry: false,
      cacheTime: 0,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      select: ({ codeInfo }) => codeInfo && prettyCodeInfo(codeInfo),
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
  });

  return { data, refetch };
};
