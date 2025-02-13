import { useChain } from '@interchain-kit/react';
import { useQuery } from '@tanstack/react-query';
import {
  createGetContractsByCreator,
  createGetContractInfo,
} from '@interchainjs/react/cosmwasm/wasm/v1/query.rpc.func';
import { RpcResolver } from '@interchainjs/react/helper-func-types';

import { useChainStore } from '@/contexts';

import { useRpcEndpoint } from '../common';

export type WasmContractInfo = Awaited<
  ReturnType<typeof fetchWasmContracts>
>[number];

type Contracts = {
  wasmContracts: WasmContractInfo[];
};

export const useMyContracts = () => {
  const { selectedChain } = useChainStore();
  const { address } = useChain(selectedChain);
  const { data: rpcEndpoint } = useRpcEndpoint(selectedChain);

  return useQuery<Contracts>({
    queryKey: ['myContracts', selectedChain, address],
    queryFn: async () => {
      const contracts: Contracts = {
        wasmContracts: [],
      };

      if (address && rpcEndpoint) {
        contracts.wasmContracts = await fetchWasmContracts(
          rpcEndpoint,
          address,
        );
      }

      return contracts;
    },
    enabled: !!address && !!rpcEndpoint,
  });
};

const fetchWasmContracts = async (client: RpcResolver, address: string) => {
  const getContractsByCreator = createGetContractsByCreator(client);
  const getContractInfo = createGetContractInfo(client);

  try {
    const { contractAddresses } = await getContractsByCreator({
      creatorAddress: address,
      pagination: {
        limit: 1000n,
        reverse: true,
        countTotal: false,
        key: new Uint8Array(),
        offset: 0n,
      },
    });

    const contracts = await Promise.all(
      contractAddresses.map((address) => getContractInfo({ address })),
    );

    return contracts;
  } catch (error) {
    console.error('Error fetching WASM contracts:', error);
    return [];
  }
};
