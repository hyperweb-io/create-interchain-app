import { useChain } from '@interchain-kit/react';
import { useInstantiateContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.react';
import { MsgInstantiateContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx';
import { Coin, DeliverTxResponse, StdFee } from '@interchainjs/react/types';
import { defaultContext } from '@tanstack/react-query';

import { toUint8Array } from '@/utils';
import { useCustomSigningClient } from '../common';

interface InstantiateTxParams {
  address: string;
  codeId: number;
  initMsg: object;
  label: string;
  admin: string;
  funds: Coin[];
  onTxSucceed?: (txInfo: DeliverTxResponse) => void;
  onTxFailed?: () => void;
}

export const useInstantiateTx = (chainName: string) => {
  const { address } = useChain(chainName);
  const { data: signingClient } = useCustomSigningClient();
  const { mutate: instantiateContract, isLoading } = useInstantiateContract({
    clientResolver: signingClient,
    options: {
      context: defaultContext,
    },
  });

  const instantiateTx = async ({
    address,
    codeId,
    initMsg,
    label,
    admin,
    funds,
    onTxSucceed = () => { },
    onTxFailed = () => { },
  }: InstantiateTxParams) => {
    const fee: StdFee = { amount: [], gas: '300000' };

    const message = MsgInstantiateContract.fromPartial({
      sender: address,
      codeId: BigInt(codeId),
      admin,
      funds,
      label,
      msg: toUint8Array(initMsg),
    });

    instantiateContract(
      {
        signerAddress: address,
        message,
        fee,
        memo: 'Instantiate Contract',
      },
      {
        onSuccess: (res) => {
          if (res.code !== 0) {
            throw new Error(res.rawLog || 'Failed to instantiate contract');
          }
          onTxSucceed(res);
        },
        onError: (error) => {
          console.error('Failed to instantiate contract:', error);
          onTxFailed();
        },
      }
    );
  };

  return { instantiateTx, isLoading };
};
