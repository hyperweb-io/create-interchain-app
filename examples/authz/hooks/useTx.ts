import { useChain } from '@interchain-kit/react';
import { defaultContext, useQuery } from '@tanstack/react-query';

import { DEFAULT_SIGNING_CLIENT_QUERY_KEY } from '@interchainjs/react/react-query';
import { WalletState } from '@interchain-kit/core';

export enum TxStatus {
  Failed = 'Transaction Failed',
  Successful = 'Transaction Successful',
  Broadcasting = 'Transaction Broadcasting',
}

/**
 * Get the signing client for the chain
 * This is a hook that returns the signing client for the chain
 * @param chainName - The name of the chain
 * @param options - The options for the signing client
 * @param options.walletStatus - The current status of the wallet, only connected wallets are enabled
 * @returns The signing client for the chain
 */
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
