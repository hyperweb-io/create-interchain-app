import { useChain } from '@interchain-kit/react';
import { defaultContext, useQuery } from '@tanstack/react-query';

import { DEFAULT_SIGNING_CLIENT_QUERY_KEY } from 'injective-react/react-query';
import { WalletState } from '@interchain-kit/core';

export enum TxStatus {
  Failed = 'Transaction Failed',
  Successful = 'Transaction Successful',
  Broadcasting = 'Transaction Broadcasting',
}

export const useSigningClient = (
  chainName: string,
  options: {
    walletStatus?: WalletState;
  }
) => {
  const { getSigningClient } = useChain(chainName);

  return useQuery(
    [DEFAULT_SIGNING_CLIENT_QUERY_KEY, chainName],
    async () => {
      const client = await getSigningClient();
      return client;
    },
    {
      enabled:
        !!chainName &&
        (!options || options?.walletStatus === WalletState.Connected),
      context: defaultContext,
    }
  );
};
