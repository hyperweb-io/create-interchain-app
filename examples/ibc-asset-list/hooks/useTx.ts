import { StdFee } from '@interchainjs/cosmos-types/types';
import { isDeliverTxSuccess } from '@interchainjs/cosmos/utils/asserts';
import { toast, ToastShape } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';
import { assetLists } from '@chain-registry/v2';
import {
  toConverters,
  toEncoders,
} from '@interchainjs/cosmos/utils';
import { MsgTransfer } from 'interchainjs/ibc/applications/transfer/v1/tx';
import { TxRaw } from '@interchainjs/cosmos-types/cosmos/tx/v1beta1/tx'

interface Msg {
  typeUrl: string;
  value: any;
}

interface TxOptions {
  fee?: StdFee | null;
  toast?: ToastShape;
  onSuccess?: () => void;
}

export enum TxStatus {
  Failed = 'Transaction Failed',
  Successful = 'Transaction Successful',
  Broadcasting = 'Transaction Broadcasting',
}

const txRaw = TxRaw;

export const useTx = (chainName: string) => {
  const { address, getSigningClient } =
    useChain(chainName);

  const tx = async (msgs: Msg[], options: TxOptions) => {
    if (!address) {
      return toast.error('Wallet not connected', {
        description: 'Please connect the wallet',
      });
    }

    let signed: TxRaw;
    let client: Awaited<ReturnType<typeof getSigningClient>>;

    const assetList = assetLists.find((asset) => asset.chainName === chainName);
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
      client.addEncoders(toEncoders(MsgTransfer))
      client.addConverters(toConverters(MsgTransfer))
      signed = await client.sign(address, msgs, fee, '');
    } catch (e: any) {
      console.error(e);

      return toast.error(TxStatus.Failed, {
        description: e?.message || 'An unexpected error has occured',
      });
    }

    if (client && signed) {
      const promise = client.broadcastTx(
        Uint8Array.from(txRaw.encode(signed).finish()), {}
      );

      toast.promise(promise, {
        loading: 'Waiting for transaction to be included in the block',
        success: (data: any) => {
          if (isDeliverTxSuccess(data)) {
            if (options.onSuccess) options.onSuccess();
            return options.toast?.title || TxStatus.Successful;
          } else {
            console.error(data);
            return {
              message: TxStatus.Failed,
              toastType: 'error',
            };
          }
        },
        error: (error: Error) => {
          if (error?.message) {
            console.error(error?.message);
          }
          return TxStatus.Failed;
        },
      });
    }
  };

  return { tx };
};
