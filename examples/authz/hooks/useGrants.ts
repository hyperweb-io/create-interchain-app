import { useEffect, useMemo, useRef } from 'react';
import { useChain } from '@interchain-kit/react';
import { defaultContext } from '@tanstack/react-query';

import { prettyGrants } from '@/utils';
import {
  useGetGranteeGrants,
  useGetGranterGrants,
} from '@interchainjs/react/cosmos/authz/v1beta1/query.rpc.react';

export const useGrants = (chainName: string) => {
  const { address } = useChain(chainName);
  const prevAddressRef = useRef(address);

  const granterGrantsQuery = useGetGranterGrants({
    request: {
      granter: address || '',
    },
    options: {
      context: defaultContext,
      enabled: !!address,
      select: (data) => data?.grants,
    },
  });

  const granteeGrantsQuery = useGetGranteeGrants({
    request: {
      grantee: address || '',
    },
    options: {
      context: defaultContext,
      enabled: !!address,
      select: (data) => data?.grants,
    },
  });

  const dataQueries = {
    granterGrants: granterGrantsQuery,
    granteeGrants: granteeGrantsQuery,
  };

  const queriesToRefetch = [
    dataQueries.granteeGrants,
    dataQueries.granterGrants,
  ];

  const refetch = () => {
    queriesToRefetch.forEach((query) => query.refetch());
  };

  useEffect(() => {
    if (prevAddressRef.current !== address) {
      refetch();
      prevAddressRef.current = address;
    }
  }, [address]);

  const isInitialFetching = Object.values(dataQueries).some(
    ({ isLoading }) => isLoading
  );

  const isRefetching = Object.values(dataQueries).some(
    ({ isRefetching }) => isRefetching
  );

  const isLoading = isInitialFetching || isRefetching;

  const isError = false;

  type DataQueries = typeof dataQueries;

  type QueriesData = {
    [Key in keyof DataQueries]: NonNullable<DataQueries[Key]['data']>;
  };

  const data = useMemo(() => {
    if (isLoading) return;

    const queriesData = Object.fromEntries(
      Object.entries(dataQueries).map(([key, query]) => [key, query.data])
    ) as QueriesData;

    const { granteeGrants, granterGrants } = queriesData;

    return {
      granteeGrants: prettyGrants(granteeGrants, 'granter'),
      granterGrants: prettyGrants(granterGrants, 'grantee'),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return { data, isLoading, isError, refetch };
};
