import { createInstantiateContract } from '@interchainjs/react/cosmwasm/wasm/v1/tx.rpc.func';
import { Coin, DeliverTxResponse, StdFee } from '@interchainjs/react/types';

import { toUint8Array } from '@/utils';

import { useHandleTx } from './useHandleTx';
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
  const { data: signingClient } = useCustomSigningClient();
  const handleTx = useHandleTx(chainName);

  const instantiateTx = async ({
    address,
    codeId,
    initMsg,
    label,
    admin,
    funds,
    onTxSucceed,
    onTxFailed,
  }: InstantiateTxParams) => {
    const fee: StdFee = { amount: [], gas: '300000' };

    await handleTx<DeliverTxResponse>({
      txFunction: async () => {
        const instantiateContract = createInstantiateContract(signingClient);
        const res = await instantiateContract(
          address,
          {
            sender: address,
            codeId: BigInt(codeId),
            admin,
            funds,
            label,
            msg: toUint8Array(initMsg),
          },
          fee,
          '',
        );
        return res;
      },
      successMessage: 'Instantiate Success',
      onTxSucceed,
      onTxFailed,
    });
  };

  return { instantiateTx };
};
