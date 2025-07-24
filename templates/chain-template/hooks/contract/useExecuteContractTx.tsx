import { useChain } from '@interchain-kit/react';
import { useExecuteContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.react';
import { MsgExecuteContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx';
import { Coin, StdFee } from '@interchainjs/react/types';
import { defaultContext } from '@tanstack/react-query';

import { toUint8Array } from '@/utils';
import { useCustomSigningClient } from '../common';

interface ExecuteTxParams {
  address: string;
  contractAddress: string;
  fee: StdFee;
  msg: object;
  funds: Coin[];
  onTxSucceed?: () => void;
  onTxFailed?: () => void;
}

export const useExecuteContractTx = (chainName: string) => {
  const { address } = useChain(chainName);
  const { data: signingClient } = useCustomSigningClient();
  const { mutate: executeContract, isLoading } = useExecuteContract({
    clientResolver: signingClient,
    options: {
      context: defaultContext,
    },
  });

  const executeTx = async ({
    address,
    contractAddress,
    fee,
    funds,
    msg,
    onTxFailed = () => { },
    onTxSucceed = () => { },
  }: ExecuteTxParams) => {
    const message = MsgExecuteContract.fromPartial({
      sender: address,
      contract: contractAddress,
      msg: toUint8Array(msg),
      funds,
    });

    executeContract(
      {
        signerAddress: address,
        message,
        fee,
        memo: 'Execute Contract',
      },
      {
        onSuccess: (res) => {
          if (res.code !== 0) {
            throw new Error(res.rawLog || 'Failed to execute contract');
          }
          onTxSucceed();
        },
        onError: (error) => {
          console.error('Failed to execute contract:', error);
          onTxFailed();
        },
      }
    );
  };

  return { executeTx, isLoading };
};
