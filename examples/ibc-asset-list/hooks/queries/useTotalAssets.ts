import { Coin } from '@interchainjs/cosmos-types/types';
import { useChain } from '@interchain-kit/react';
import { UseQueryResult } from '@tanstack/react-query';
import BigNumber from 'bignumber.js';
import { useEffect, useMemo } from 'react';
import { useChainUtils } from '../useChainUtils';
import { usePrices } from './usePrices';
import { useGetAllBalances } from 'interchain-react/cosmos/bank/v1beta1/query.rpc.func'
import { defaultContext } from '@tanstack/react-query';
import { useGetDelegatorDelegations } from 'interchain-react/cosmos/staking/v1beta1/query.rpc.func';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const getPagination = (limit: bigint) => ({
  limit,
  key: new Uint8Array(),
  offset: 0n,
  countTotal: true,
  reverse: false,
});

export const useTotalAssets = (chainName: string) => {
  const { address, rpcEndpoint } = useChain(chainName);

  const allBalancesQuery: UseQueryResult<Coin[]> =
    useGetAllBalances({
      clientResolver: rpcEndpoint,
      request: {
        address: address || '',
        pagination: getPagination(100n),
        resolveDenom: false
      },
      options: {
        context: defaultContext,
        enabled: !!rpcEndpoint,
        select: ({ balances }) => balances || [],
      },
    });

  const delegationsQuery: UseQueryResult<Coin[]> =
    useGetDelegatorDelegations({
      request: {
        delegatorAddr: address || '',
        pagination: getPagination(100n),
      },
      options: {
        context: defaultContext,
        enabled: !!rpcEndpoint,
        select: ({ delegationResponses }) =>
          delegationResponses.map(({ balance }) => balance) || [],
      },
    });

  const pricesQuery = usePrices(chainName);

  const dataQueries = {
    prices: pricesQuery,
    allBalances: allBalancesQuery,
    delegations: delegationsQuery,
  };

  const queriesToReset = [dataQueries.allBalances, dataQueries.delegations];
  const queriesToRefetch = [dataQueries.allBalances];

  useEffect(() => {
    queriesToReset.forEach((query) => query.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainName]);

  const queries = Object.values(dataQueries);
  const isInitialFetching = queries.some(({ isFetching }) => isFetching);
  const isRefetching = queries.some(({ isRefetching }) => isRefetching);
  const isLoading = delegationsQuery.isFetching || allBalancesQuery.isFetching || isInitialFetching || isRefetching;

  type AllQueries = typeof dataQueries;

  type QueriesData = {
    [Key in keyof AllQueries]: NonNullable<AllQueries[Key]['data']>;
  };

  const { calcCoinDollarValue } = useChainUtils(chainName);

  const zero = new BigNumber(0);

  const data = useMemo(() => {
    if (isLoading) return;

    const queriesData = Object.fromEntries(
      Object.entries(dataQueries).map(([key, query]) => [key, query.data])
    ) as QueriesData;

    const {
      allBalances,
      prices = {},
    } = queriesData;

    const balancesTotal = allBalances
      ?.filter(({ denom }) => !denom.startsWith('gamm') && prices[denom])
      .map((coin) => calcCoinDollarValue(prices, coin))
      .reduce((total, cur) => total.plus(cur), zero)
      .toString();

    const total = [
      balancesTotal
    ]
      .reduce((total, cur) => total.plus(cur || 0), zero)
      .decimalPlaces(2)
      .toString();

    return {
      total,
      prices,
      allBalances,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const refetch = () => {
    queriesToRefetch.forEach((query) => query.refetch());
  };

  return { data, isLoading, refetch };
};
