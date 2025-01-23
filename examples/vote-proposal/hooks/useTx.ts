import { cosmos } from 'interchain-query';
import { useChain } from '@interchain-kit/react';
import { assetLists } from '@chain-registry/v2'
import { DeliverTxResponse, StdFee } from '@interchainjs/cosmos-types/types'
import { isDeliverTxSuccess } from '@interchainjs/cosmos/utils/asserts'
import { toEncoders } from '@interchainjs/cosmos/utils'
import { MsgVote } from 'interchainjs/cosmos/gov/v1beta1/tx'

export type Msg = {
  typeUrl: string;
  value: { [key: string]: any };
}

export type TxOptions = {
  fee?: StdFee;
}

export class TxError extends Error {
  constructor(message: string = 'Tx Error', options?: ErrorOptions) {
    super(message, options);
    this.name = 'TxError';
  }
}

export class TxResult {
  error?: TxError
  response?: DeliverTxResponse

  constructor({ error, response }: Pick<TxResult, 'error' | 'response'>) {
    this.error = error;
    this.response = response;
  }

  get errorMsg() {
    return this.isOutOfGas
      ? `Out of gas. gasWanted: ${this.response?.gasWanted} gasUsed: ${this.response?.gasUsed}`
      : this.error?.message || 'Vote Failed';
  }

  get isSuccess() {
    return this.response && isDeliverTxSuccess(this.response);
  }

  get isOutOfGas() {
    return this.response && this.response.gasUsed > this.response.gasWanted;
  }
}

export function useTx(chainName: string) {
  const {
    address,
    getSigningClient,
    // estimateFee // no estimateFee in interchain-kit
  } = useChain(chainName);
  const assetList = assetLists.find((asset) => asset.chainName === chainName);
  const denom = assetList?.assets[0].base!
  const denomUnit = assetList?.assets[0].denomUnits[0]
  console.log('denom', denom)

  async function tx(msgs: Msg[], options: TxOptions = {}) {
    if (!address) {
      return new TxResult({ error: new TxError('Wallet not connected') });
    }

    try {
      const txRaw = cosmos.tx.v1beta1.TxRaw;
      const fee = {
        amount: [
          {
            denom: denomUnit?.denom!,
            amount: (BigInt(10 ** (denomUnit?.exponent || 6)) / 100n).toString()
          }
        ],
        gas: '200000'
      }
      const client = await getSigningClient();
      client.addEncoders(toEncoders(MsgVote))
      console.log('msgs', msgs)
      const signed = await client.sign(address, msgs, fee, '');

      if (!client) return new TxResult({ error: new TxError('Invalid stargate client') });
      if (!signed) return new TxResult({ error: new TxError('Invalid transaction') });

      const response = await client.broadcastTx(Uint8Array.from(txRaw.encode(signed).finish()), {});
      // Types of property 'gasUsed' are incompatible.
      //   Type 'bigint' is not assignable to type 'number'.
      // @ts-ignore
      return isDeliverTxSuccess(response) ? new TxResult({ response }) : new TxResult({ response, error: new TxError(response.rawLog) });
    } catch (e: any) {
      return new TxResult({ error: new TxError(e.message || 'Tx Error') });
    }
  }

  return { tx };
}