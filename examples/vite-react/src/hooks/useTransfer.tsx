import { useMutation } from '@tanstack/react-query';
import { useToast, Link } from '@chakra-ui/react';
import { createSend } from 'interchainjs/cosmos/bank/v1beta1/tx.rpc.func';
import { DENOM, DECIMAL } from '../utils/constants';
import { keplrWallet } from '@interchain-kit/keplr-extension';
import { chain as cosmoshubChain } from '@chain-registry/v2/mainnet/cosmoshub';

export const useTransfer = (address: string, walletManager: any, refetchBalance: () => void) => {
  const toast = useToast();

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
        cosmoshubChain.chainName
      );
      const txSend = createSend(signingClient);
      const res = await txSend(address, message, fee, '');
      // 等待链上确认
      await new Promise((resolve) => setTimeout(resolve, 6000));
      return (res as any).hash;
    },
    onSuccess: (txHash) => {
      toast({
        title: 'Transfer successful',
        description: (
          <Link
            href={`https://www.mintscan.io/cosmos/txs/${txHash}`}
            isExternal
            color="white"
          >
            <u>View transaction details</u>
          </Link>
        ),
        status: 'success',
        duration: null,
        isClosable: true,
      });
      refetchBalance();
    },
    onError: (error: Error) => {
      console.error('Error transferring funds:', error);
      toast({
        title: 'Transfer failed',
        description: error.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    },
  });

  return { ...transferMutation, isMutating: transferMutation.status === 'pending' };
};