import { createExecuteContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.func';
import { Coin, StdFee } from '@interchainjs/react/types';

import { toUint8Array } from '@/utils';

import { useHandleTx } from './useHandleTx';
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
  const { data: signingClient } = useCustomSigningClient();
  const handleTx = useHandleTx(chainName);

  const executeTx = async ({
    address,
    contractAddress,
    fee,
    funds,
    msg,
    onTxFailed = () => {},
    onTxSucceed = () => {},
  }: ExecuteTxParams) => {
    await handleTx({
      txFunction: async () => {
        const executeContract = createExecuteContract(signingClient);
        const res = await executeContract(
          address,
          {
            sender: address,
            contract: contractAddress,
            msg: toUint8Array(msg),
            funds,
          },
          fee,
          '',
        );
        return res;
      },
      onTxSucceed,
      onTxFailed,
    });
  };

  return { executeTx };
};
