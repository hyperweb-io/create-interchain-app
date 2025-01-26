import { cosmos } from 'interchain-query';
import { useChain } from '@interchain-kit/react';
import { StdFee } from '@interchainjs/cosmos-types/types';
import { isDeliverTxSuccess } from '@interchainjs/cosmos/utils/asserts'
import { useToast, type CustomToast } from './useToast';
import { assetLists } from '@chain-registry/v2';
import { toEncoders, toConverters } from '@interchainjs/cosmos/utils'
import { MsgDelegate, MsgUndelegate, MsgBeginRedelegate } from 'interchainjs/cosmos/staking/v1beta1/tx'
import { MsgWithdrawDelegatorReward } from 'interchainjs/cosmos/distribution/v1beta1/tx'

const txRaw = cosmos.tx.v1beta1.TxRaw;

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

export const useTx = (chainName: string) => {
  const { address, getSigningClient,
    // estimateFee 
  } =
    useChain(chainName);

  const { toast } = useToast();

  const tx = async (msgs: Msg[], options: TxOptions) => {
    if (!address) {
      toast({
        type: 'error',
        title: 'Wallet not connected',
        description: 'Please connect the wallet',
      });
      return;
    }

    let signed: Parameters<typeof txRaw.encode>['0'];
    let client: Awaited<ReturnType<typeof getSigningClient>>;
    const assetList = assetLists.find((asset) => asset.chainName === chainName);
    const denom = assetList?.assets[0].base!
    const denomUnit = assetList?.assets[0].denomUnits[0]

    try {
      let fee = {
        amount: [
          {
            denom: denomUnit?.denom!,
            amount: (BigInt(10 ** (denomUnit?.exponent || 6)) / 10n).toString()
          }
        ],
        gas: '800000'
      }
      client = await getSigningClient();
      client.addEncoders(toEncoders(MsgDelegate, MsgUndelegate, MsgBeginRedelegate, MsgWithdrawDelegatorReward))
      client.addConverters(toConverters(MsgDelegate, MsgUndelegate, MsgBeginRedelegate, MsgWithdrawDelegatorReward))
      signed = await client.sign(address, msgs, fee, '');
    } catch (e: any) {
      console.error(e);
      toast({
        title: TxStatus.Failed,
        description: e?.message || 'An unexpected error has occured',
        type: 'error',
      });
      return;
    }

    let broadcastToastId: string | number;

    broadcastToastId = toast({
      title: TxStatus.Broadcasting,
      description: 'Waiting for transaction to be included in the block',
      type: 'loading',
      duration: 999999,
    });

    if (client && signed) {
      await client
        .broadcastTx(Uint8Array.from(txRaw.encode(signed).finish()), {})
        .then((res: any) => {
          if (isDeliverTxSuccess(res)) {
            if (options.onSuccess) options.onSuccess();

            toast({
              title: options.toast?.title || TxStatus.Successful,
              type: options.toast?.type || 'success',
              description: options.toast?.description,
            });
          } else {
            toast({
              title: TxStatus.Failed,
              description: res?.rawLog,
              type: 'error',
              duration: 10000,
            });
          }
        })
        .catch((err) => {
          toast({
            title: TxStatus.Failed,
            description: err?.message,
            type: 'error',
            duration: 10000,
          });
        })
        .finally(() => toast.close(broadcastToastId));
    } else {
      toast.close(broadcastToastId);
    }
  };

  return { tx };
};
