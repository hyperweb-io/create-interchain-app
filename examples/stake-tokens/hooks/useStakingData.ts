import { useEffect, useMemo } from 'react';
import { useChain } from '@interchain-kit/react';
import BigNumber from 'bignumber.js';
import { bondStatusToJSON, BondStatus } from 'interchainjs/cosmos/staking/v1beta1/staking'
import { useRpcClient, useRpcEndpoint } from 'interchainjs/react-query'
import { defaultContext } from '@tanstack/react-query';
import { useGetBalance } from '@interchainjs/react/cosmos/bank/v1beta1/query.rpc.react'
import { useGetDelegatorValidators } from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react'
import { useGetValidators } from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react'
import { useGetDelegationTotalRewards } from '@interchainjs/react/cosmos/distribution/v1beta1/query.rpc.react'
import { useGetDelegatorDelegations } from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react'
import { useGetParams } from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react'
import { useGetAnnualProvisions } from '@interchainjs/react/cosmos/mint/v1beta1/query.rpc.react'
import { useGetPool } from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react'
import { useGetParams as useGetParamsDistribution } from '@interchainjs/react/cosmos/distribution/v1beta1/query.rpc.react'

import { usePrices } from './usePrices';
import { getCoin, getExponent } from '@/config';
import {
  shiftDigits,
  calcTotalDelegation,
  extendValidators,
  parseAnnualProvisions,
  parseDelegations,
  parseRewards,
  parseUnbondingDays,
  parseValidators,
} from '@/utils';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const useStakingData = (chainName: string) => {
  const { address, getRpcEndpoint, rpcEndpoint } = useChain(chainName);

  const coin = getCoin(chainName);
  const exp = getExponent(chainName);

  const rpcEndpointQuery = useRpcEndpoint({
    getter: getRpcEndpoint,
    options: {
      context: defaultContext,
      enabled: !!address,
      staleTime: Infinity,
      queryKeyHashFn: (queryKey) => {
        return JSON.stringify([...queryKey, chainName]);
      },
    },
  });

  const rpcClientQuery = useRpcClient({
    clientResolver: {
      rpcEndpoint: rpcEndpointQuery.data,
    },
    options: {
      context: defaultContext,
      enabled: !!address && !!rpcEndpointQuery.data,
      staleTime: Infinity,
    },
  });

  const isDataQueryEnabled = !!address && !!rpcClientQuery.data;

  const balanceQuery = useGetBalance({
    clientResolver: rpcEndpoint,
    request: {
      address: address || '',
      denom: coin.base,
    },
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ balance }) => shiftDigits(balance?.amount || '0', -exp),
    },
  });

  const myValidatorsQuery = useGetDelegatorValidators({
    clientResolver: rpcEndpoint,
    request: {
      delegatorAddr: address || '',
      pagination: undefined,
    },
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ validators }) => parseValidators(validators),
    },
  });

  const rewardsQuery =
    useGetDelegationTotalRewards({
      clientResolver: rpcEndpoint,
      request: {
        delegatorAddress: address || '',
      },
      options: {
        context: defaultContext,
        enabled: isDataQueryEnabled,
        select: (data) => parseRewards(data, coin.base, -exp),
      },
    });

  const validatorsQuery = useGetValidators({
    clientResolver: rpcEndpoint,
    request: {
      status: bondStatusToJSON(
        BondStatus.BOND_STATUS_BONDED
      ),
      pagination: {
        key: new Uint8Array(),
        offset: 0n,
        limit: 200n,
        countTotal: true,
        reverse: false,
      },
    },
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ validators }) => {
        const sorted = validators.sort((a, b) =>
          new BigNumber(b.tokens).minus(a.tokens).toNumber()
        );
        return parseValidators(sorted);
      },
    },
  });

  const delegationsQuery = useGetDelegatorDelegations({
    clientResolver: rpcEndpoint,
    request: {
      delegatorAddr: address || '',
      pagination: {
        key: new Uint8Array(),
        offset: 0n,
        limit: 100n,
        countTotal: true,
        reverse: false,
      },
    },
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ delegationResponses }) =>
        parseDelegations(delegationResponses, -exp),
    },
  });

  const unbondingDaysQuery = useGetParams({
    clientResolver: rpcEndpoint,
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ params }) => parseUnbondingDays(params),
    },
  });

  const annualProvisionsQuery = useGetAnnualProvisions({
    clientResolver: rpcEndpoint,
    request: {},
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: parseAnnualProvisions,
      retry: false,
    },
  });

  const poolQuery = useGetPool({
    clientResolver: rpcEndpoint,
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ pool }) => pool,
    },
  });

  const communityTaxQuery = useGetParamsDistribution({
    clientResolver: rpcEndpoint,
    options: {
      context: defaultContext,
      enabled: isDataQueryEnabled,
      select: ({ params }) => shiftDigits(params?.communityTax || '0', -18),
    },
  });

  const pricesQuery = usePrices();

  const allQueries = {
    balance: balanceQuery,
    myValidators: myValidatorsQuery,
    rewards: rewardsQuery,
    allValidators: validatorsQuery,
    delegations: delegationsQuery,
    unbondingDays: unbondingDaysQuery,
    annualProvisions: annualProvisionsQuery,
    pool: poolQuery,
    communityTax: communityTaxQuery,
    prices: pricesQuery,
  };

  const queriesWithUnchangingKeys = [
    allQueries.unbondingDays,
    allQueries.annualProvisions,
    allQueries.pool,
    allQueries.communityTax,
    allQueries.allValidators,
  ];

  const updatableQueriesAfterMutation = [
    allQueries.balance,
    allQueries.myValidators,
    allQueries.rewards,
    allQueries.allValidators,
    allQueries.delegations,
  ];

  useEffect(() => {
    queriesWithUnchangingKeys.forEach((query) => query.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainName]);

  const isInitialFetching = Object.values(allQueries).some(
    ({ isLoading }) => isLoading
  );

  const isRefetching = Object.values(allQueries).some(
    ({ isRefetching }) => isRefetching
  );

  const isLoading = isInitialFetching || isRefetching;

  type AllQueries = typeof allQueries;

  type QueriesData = {
    [Key in keyof AllQueries]: NonNullable<AllQueries[Key]['data']>;
  };

  const data = useMemo(() => {
    if (isLoading) return;

    const queriesData = Object.fromEntries(
      Object.entries(allQueries).map(([key, query]) => [key, query.data])
    ) as QueriesData;

    const {
      allValidators,
      delegations,
      rewards,
      myValidators,
      annualProvisions,
      communityTax,
      pool,
    } = queriesData;

    const chainMetadata = { annualProvisions, communityTax, pool };

    const extendedAllValidators = extendValidators(
      allValidators,
      delegations,
      rewards?.byValidators,
      chainMetadata
    );

    const extendedMyValidators = extendValidators(
      myValidators,
      delegations,
      rewards?.byValidators,
      chainMetadata
    );

    const totalDelegated = calcTotalDelegation(delegations);

    return {
      ...queriesData,
      allValidators: extendedAllValidators,
      myValidators: extendedMyValidators,
      totalDelegated,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  const refetch = () => {
    updatableQueriesAfterMutation.forEach((query) => query.refetch());
  };

  return { data, isLoading, refetch };
};
