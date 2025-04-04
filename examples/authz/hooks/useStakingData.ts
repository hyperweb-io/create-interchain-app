import { useEffect, useMemo } from 'react';
import BigNumber from 'bignumber.js';

import { usePrices } from './usePrices';
import { getCoin, getExponent } from '@/configs';
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
import { useAuthzContext } from '@/context';
import { useQueryHooks } from './useQueryHooks';
import { useGetBalance } from '@interchainjs/react/cosmos/bank/v1beta1/query.rpc.react';
import {
  useGetDelegatorDelegations,
  useGetDelegatorValidators,
  useGetParams as useGetStakingParams,
  useGetPool,
  useGetValidators,
} from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react';
import {
  useGetDelegationTotalRewards,
  useGetParams as useGetDistributionParams,
} from '@interchainjs/react/cosmos/distribution/v1beta1/query.rpc.react';
import { useGetAnnualProvisions } from '@interchainjs/react/cosmos/mint/v1beta1/query.rpc.react';
import {
  BondStatus,
  bondStatusToJSON,
} from '@interchainjs/react/cosmos/staking/v1beta1/staking';
import { defaultContext } from '@tanstack/react-query';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export const useStakingData = (chainName: string) => {
  const { permission } = useAuthzContext();

  const address = permission?.granter;

  const coin = getCoin(chainName);
  const exp = getExponent(chainName);

  const {
    isReady: isQueryHooksReady,
    isFetching: isQueryHooksFetching,
  } = useQueryHooks(chainName, {
    context: defaultContext,
  });

  const balanceQuery = useGetBalance({
    request: {
      address: address || '',
      denom: coin.base,
    },
    options: {
      context: defaultContext,
      enabled: isQueryHooksReady && !!address,
      select: ({ balance }) => shiftDigits(balance?.amount || '0', -exp),
    },
  });

  const myValidatorsQuery = useGetDelegatorValidators({
    request: {
      delegatorAddr: address || '',
    },
    options: {
      context: defaultContext,
      enabled: isQueryHooksReady && !!address,
      select: ({ validators }) => parseValidators(validators),
    },
  });

  const rewardsQuery = useGetDelegationTotalRewards({
    request: {
      delegatorAddress: address || '',
    },
    options: {
      context: defaultContext,
      enabled: isQueryHooksReady && !!address,
      select: (data) => parseRewards(data, coin.base, -exp),
    },
  });

  const validatorsQuery = useGetValidators({
    request: {
      status: bondStatusToJSON(BondStatus.BOND_STATUS_BONDED),
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
      enabled: isQueryHooksReady,
      select: ({ validators }) => {
        const sorted = validators.sort((a, b) =>
          new BigNumber(b.tokens).minus(a.tokens).toNumber()
        );
        return parseValidators(sorted);
      },
    },
  });

  const delegationsQuery = useGetDelegatorDelegations({
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
      enabled: isQueryHooksReady && !!address,
      select: ({ delegationResponses }) =>
        parseDelegations(delegationResponses, -exp),
    },
  });

  const unbondingDaysQuery = useGetStakingParams<string>({
    request: {},
    options: {
      context: defaultContext,
      enabled: isQueryHooksReady,
      select: ({ params }) => parseUnbondingDays(params),
    },
  });

  const annualProvisionsQuery = useGetAnnualProvisions({
    request: {},
    options: {
      context: defaultContext,
      enabled: isQueryHooksReady,
      select: parseAnnualProvisions,
      retry: false,
    },
  });

  const poolQuery = useGetPool({
    request: {},
    options: {
      context: defaultContext,
      enabled: isQueryHooksReady,
      select: ({ pool }) => pool,
    },
  });

  const communityTaxQuery = useGetDistributionParams({
    request: {},
    options: {
      context: defaultContext,
      enabled: isQueryHooksReady,
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

  const isLoading = isQueryHooksFetching || isInitialFetching || isRefetching;

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

    const extendedAllValidators = extendValidators({
      validators: allValidators,
      delegations,
      rewards: rewards?.byValidators,
      chainMetadata,
    });

    const extendedMyValidators = extendValidators({
      validators: myValidators,
      delegations,
      rewards: rewards?.byValidators,
      chainMetadata,
    });

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
