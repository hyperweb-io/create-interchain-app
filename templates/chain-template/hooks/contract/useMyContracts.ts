import { useChain } from '@interchain-kit/react';
import { useGetContractsByCreator } from '@interchainjs/react/cosmwasm/wasm/v1/query.rpc.react';
import { defaultContext } from '@tanstack/react-query';

import { useChainStore } from '@/contexts';
import { useRpcEndpoint } from '../common';

export type WasmContractInfo = {
  address: string;
  contractInfo: {
    label: string;
    codeId: bigint;
    admin: string;
    creator: string;
    created?: {
      blockHeight: bigint;
      txIndex: bigint;
    };
    ibc_port_id?: string;
    extension?: any;
  };
};

type Contracts = {
  wasmContracts: WasmContractInfo[];
};

export const useMyContracts = () => {
  const { selectedChain } = useChainStore();
  const { address } = useChain(selectedChain);
  const { data: rpcEndpoint } = useRpcEndpoint(selectedChain);

  const { data, isLoading } = useGetContractsByCreator({
    request: {
      creatorAddress: address || '',
      pagination: {
        limit: 1000n,
        reverse: true,
        countTotal: false,
        key: new Uint8Array(),
        offset: 0n,
      },
    },
    options: {
      enabled: !!address && !!rpcEndpoint,
      select: ({ contractAddresses }) => {
        const contracts: Contracts = {
          wasmContracts: contractAddresses.map((address) => ({
            address,
            contractInfo: {
              label: 'Contract', // Placeholder - full implementation would fetch this
              codeId: 0n,
              admin: '',
              creator: '',
            },
          })),
        };
        return contracts;
      },
      context: defaultContext,
    },
    clientResolver: rpcEndpoint,
  });

  return { data, isLoading };
};
