import { Coin } from '@interchainjs/cosmos-types/types';
import { useChain } from '@interchain-kit/react';
import { UseQueryResult } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useGetBalance } from 'interchain-react/cosmos/bank/v1beta1/query.rpc.func';
import { defaultContext } from '@tanstack/react-query';

export const useBalance = (chainName: string, enabled: boolean = true,
  displayDenom?: string
) => {
  const { address, assetList, rpcEndpoint } = useChain(chainName);
  let denom = assetList?.assets[0].base!;
  for (const asset of assetList?.assets || []) {
    if (asset.display.toLowerCase() === displayDenom?.toLowerCase()) {
      denom = asset.base;
      break;
    }
  }

  const balanceQuery: UseQueryResult<Coin | undefined> =
    useGetBalance({
      clientResolver: rpcEndpoint,
      request: {
        denom,
        address: address || '',
      },
      options: {
        context: defaultContext,
        enabled: !!rpcEndpoint && enabled,
        select: ({ balance }) => balance,
      },
    });

  useEffect(() => {
    return () => {
      balanceQuery.remove()
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    balance: balanceQuery.data,
    isLoading: balanceQuery.isFetching // || !!balanceQueries.find(item => item.isFetching),
  };
};
