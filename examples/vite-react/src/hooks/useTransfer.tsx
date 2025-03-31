import { useMutation } from '@tanstack/react-query';
import { Link, toast, Text } from '@interchain-ui/react';
import { createSend } from 'interchainjs/cosmos/bank/v1beta1/tx.rpc.func';
import { DENOM, DECIMAL } from '../utils/constants';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { chain } from '@chain-registry/v2/mainnet/cosmoshub';

export const useTransfer = (address: string, walletManager: any, refetchBalance: () => void) => {
  const transferMutation = useMutation({
    mutationFn: async (data: { recipient: string; amount: string }) => {
      if (!window.keplr || !address) throw new Error('Keplr not connected');
      const amount = Math.floor(Number(data.amount) * Math.pow(10, DECIMAL));
      const fee = {
        amount: [{ denom: DENOM, amount: '5000' }],
        gas: '200000',
      };

      const message = {
        fromAddress: address,
        toAddress: data.recipient,
        amount: [
          {
            denom: DENOM,
            amount: amount.toString(),
          },
        ],
      };

      const signingClient = await walletManager?.getSigningClient(
        keplrWallet.info?.name as string,
        chain.chainName
      );
      const txSend = createSend(signingClient);
      const res = await txSend(address, message, fee, '');
      await new Promise((resolve) => setTimeout(resolve, 6000));
      return (res as any).hash;
    },
    onSuccess: (txHash) => {
      toast.success(
        <Link
          href={`https://www.mintscan.io/cosmos/txs/${txHash}`}
          target='_blank'
        >
          <u>View transaction details</u>
        </Link>
      )
      refetchBalance();
    },
    onError: (error: Error) => {
      console.error('Error transferring funds:', error);
      toast.error(
        <Text>
          {error.message}
        </Text>
      )
    },
  });

  return { ...transferMutation, isMutating: transferMutation.status === 'pending' };
};