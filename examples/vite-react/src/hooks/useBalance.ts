import { useQuery } from '@tanstack/react-query';
import { toast } from '@interchain-ui/react';
import { createGetBalance } from 'interchainjs/cosmos/bank/v1beta1/query.rpc.func';
import { DENOM, DECIMAL, RPC_ENDPOINT } from '../utils/constants';

export const useBalance = (address: string, walletManager: any) => {
  const { data, refetch } = useQuery({
    queryKey: ['balance', address],
    queryFn: async () => {
      if (!address) return null;
      try {
        const balanceQuery = createGetBalance(RPC_ENDPOINT);
        const { balance: atomBalance } = await balanceQuery({
          address,
          denom: DENOM,
        });
        return Number(atomBalance?.amount || 0) / Math.pow(10, DECIMAL);
      } catch (error: any) {
        console.error('Error fetching balance:', error);
        toast.error(error.message)
        return null;
      }
    },
    enabled: !!address && !!walletManager,
    staleTime: 10000,
    refetchInterval: 30000,
  });

  return { balance: data, refetchBalance: refetch };
};