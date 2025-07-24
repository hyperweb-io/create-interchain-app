import { useQuery } from '@tanstack/react-query';
import { useGetSmartContractState } from '@interchainjs/react/cosmwasm/wasm/v1/query.rpc.react';
import { defaultContext } from '@tanstack/react-query';

import { useChainStore } from '@/contexts';
import { fromUint8Array, toUint8Array } from '@/utils';
import { useRpcEndpoint } from '../common';

export const useQueryContract = ({
  contractAddress,
  queryMsg,
  enabled = true,
}: {
  contractAddress: string;
  queryMsg: string;
  enabled?: boolean;
}) => {
  const { selectedChain } = useChainStore();
  const { data: rpcEndpoint } = useRpcEndpoint(selectedChain);

  const { data, refetch, error, isFetching } = useGetSmartContractState({
    request: {
      address: contractAddress,
      queryData: queryMsg ? toUint8Array(JSON.parse(queryMsg)) : new Uint8Array(),
    },
    options: {
      enabled: !!rpcEndpoint && !!contractAddress && !!queryMsg && enabled,
      select: ({ data }) => fromUint8Array(data),
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
  });

  return { data, refetch, error, isFetching };
};
