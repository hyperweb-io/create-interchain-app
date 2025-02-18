import { useGetBalance } from 'injective-react/cosmos/bank/v1beta1/query.rpc.react';
import { defaultRpcEndpoint as rpcEndpoint } from '@/config';
import BigNumber from 'bignumber.js';
import { defaultAssetList } from '@/config';
import { defaultContext } from '@tanstack/react-query';

export default function useBalance({ address }: { address: string }) {
  const coin = defaultAssetList?.assets[0];

  const denom = coin!.base!;

  const COIN_DISPLAY_EXPONENT = coin!.denomUnits.find(
    (unit) => unit.denom === coin!.display
  )?.exponent as number;

  const {
    data: balance,
    isSuccess: isBalanceLoaded,
    isLoading: isFetchingBalance,
    refetch: refetchBalance,
  } = useGetBalance({
    request: {
      address: address || '',
      denom,
    },
    options: {
      context: defaultContext,
      enabled: !!address,
      select: ({ balance }) =>
        new BigNumber(balance?.amount ?? 0).multipliedBy(
          10 ** -COIN_DISPLAY_EXPONENT
        ),
      staleTime: 0,
    },
    clientResolver: rpcEndpoint,
  });

  return {
    balance,
    isBalanceLoaded,
    isFetchingBalance,
    refetchBalance,
  };
}
