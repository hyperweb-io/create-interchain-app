import { useChain } from '@interchain-kit/react';
import { isDeliverTxSuccess, StdFee } from '@cosmjs/stargate';
import { useToast, type CustomToast } from './useToast';
import { useQuery } from '@tanstack/react-query';

import { SigningClient } from '@interchainjs/cosmos/signing-client';
import {
  AminoGenericOfflineSigner,
  DirectGenericOfflineSigner,
} from '@interchainjs/cosmos/types/wallet';

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

export const useSigningClient = (chainName: string) => {
  const { getSigningClient } = useChain(chainName);

  return useQuery(
    ['signingClient', chainName],
    async () => {
      const client = await getSigningClient();
      return client;
    },
    {
      enabled: !!chainName,
    }
  );
};