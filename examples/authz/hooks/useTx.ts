import { useChain } from '@interchain-kit/react';
import { StdFee } from '@cosmjs/stargate';
import { type CustomToast } from './useToast';
import { defaultContext, useQuery } from '@tanstack/react-query';


import { DEFAULT_SIGNING_CLIENT_QUERY_KEY } from '@interchainjs/react/react-query';
import { WalletState } from '@interchain-kit/core';

interface Msg {
  typeUrl: string;
  value: any;
}

interface TxOptions {
  fee?: StdFee | null;
  toast?: Partial<CustomToast>;
  onSuccess?: () => void;
}

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
