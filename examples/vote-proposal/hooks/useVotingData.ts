import { useEffect, useMemo, useState } from 'react';
import { useChain } from '@interchain-kit/react';
import { useQueries } from '@tanstack/react-query';
import { ProposalStatus } from 'interchainjs/cosmos/gov/v1beta1/gov';
import { Proposal as ProposalV1 } from 'interchainjs/cosmos/gov/v1/gov';
import { getTitle, paginate, parseQuorum } from '@/utils';
import { useGetVote } from '@interchainjs/react/cosmos/gov/v1/query.rpc.react';
import { defaultContext } from '@tanstack/react-query';
import { useGetProposals } from '@interchainjs/react/cosmos/gov/v1/query.rpc.react';
import { useGetPool } from '@interchainjs/react/cosmos/staking/v1beta1/query.rpc.react';
import { useGetParams } from '@interchainjs/react/cosmos/gov/v1/query.rpc.react';

(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

export interface Votes {
  [key: string]: number;
}

export function processProposals(proposals: ProposalV1[]) {
  const sorted = proposals.sort(
    (a, b) => Number(b.id) - Number(a.id)
  );

  proposals.forEach((proposal) => {
    // @ts-ignore
    if (!proposal.content?.title && proposal.content?.value) {
      // @ts-ignore
      proposal.content.title = getTitle(proposal.content?.value);
    }
  });

  return sorted.filter(
    ({ status }) => status === ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
  ).concat(sorted.filter(
    ({ status }) => status !== ProposalStatus.PROPOSAL_STATUS_VOTING_PERIOD
  ));
};

export function useVotingData(chainName: string) {
  const [isLoading, setIsLoading] = useState(false);
  const { address, rpcEndpoint } = useChain(chainName);

  const proposalsQuery = useGetProposals({
    clientResolver: rpcEndpoint,
    request: {
      voter: '',
      depositor: '',
      pagination: paginate(50n, true),
      proposalStatus: ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED,
    },
    options: {
      context: defaultContext,
      enabled: !!rpcEndpoint,
      staleTime: Infinity,
      select: ({ proposals }) => processProposals(proposals),
    },
  });

  const bondedTokensQuery = useGetPool({
    clientResolver: rpcEndpoint,
    options: {
      context: defaultContext,
      enabled: !!rpcEndpoint,
      staleTime: Infinity,
      select: ({ pool }) => pool?.bondedTokens,
    },
  });

  const quorumQuery = useGetParams({
    clientResolver: rpcEndpoint,
    request: { paramsType: 'tallying' },
    options: {
      context: defaultContext,
      enabled: !!rpcEndpoint,
      staleTime: Infinity,
      select: ({ tallyParams }) => parseQuorum(tallyParams?.quorum as any),
    },
  });

  const votedProposalsQuery = useGetProposals({
    clientResolver: rpcEndpoint,
    request: {
      voter: address || '/', // use '/' to differentiate from proposalsQuery
      depositor: '',
      pagination: paginate(50n, true),
      proposalStatus: ProposalStatus.PROPOSAL_STATUS_UNSPECIFIED,
    },
    options: {
      context: defaultContext,
      enabled: !!rpcEndpoint && Boolean(address),
      select: ({ proposals }) => proposals,
      keepPreviousData: true,
    },
  });

  const votesQueries =
    useQueries({
      queries: (votedProposalsQuery.data || []).map(({ id }) => ({
        queryKey: ['voteQuery', id, address],
        queryFn: () => {
          return useGetVote({
            request: {
              proposalId: id,
              voter: address || '',
            },
            options: {
              context: defaultContext,
              enabled: Boolean(id) && Boolean(address),
              keepPreviousData: true,
            },
          }).data
        },
        enabled: Boolean(id) && Boolean(address) && Boolean(votedProposalsQuery.data),
        keepPreviousData: true,
      })),
    });

  const singleQueries = {
    quorum: quorumQuery,
    proposals: proposalsQuery,
    bondedTokens: bondedTokensQuery,
    votedProposals: votedProposalsQuery,
  };

  const staticQueries = [
    singleQueries.quorum,
    singleQueries.proposals,
    singleQueries.bondedTokens,
  ];

  const dynamicQueries = [singleQueries.votedProposals];

  useEffect(() => {
    staticQueries.forEach((query) => query.remove());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chainName]);

  const isStaticQueriesFetching = staticQueries.some(
    ({ isFetching }) => isFetching
  );

  const isDynamicQueriesFetching =
    singleQueries.votedProposals.isFetching ||
    votesQueries.some(({ isFetching }) => isFetching);

  const isFetching = proposalsQuery.isFetching || votedProposalsQuery.isFetching || bondedTokensQuery.isFetching || quorumQuery.isFetching

  const loading =
    isFetching || isStaticQueriesFetching || isDynamicQueriesFetching

  useEffect(() => {
    // no loading when refetching
    if (isFetching || isStaticQueriesFetching) setIsLoading(true);
    if (!loading) setIsLoading(false);
  }, [isStaticQueriesFetching, loading]);

  type SingleQueries = typeof singleQueries;

  type SingleQueriesData = {
    [Key in keyof SingleQueries]: NonNullable<SingleQueries[Key]['data']>;
  };

  const singleQueriesData = useMemo(() => {
    if (isStaticQueriesFetching || !proposalsQuery.isFetched || !votedProposalsQuery.isFetched) return;

    return Object.fromEntries(
      Object.entries(singleQueries).map(([key, query]) => [key, query.data])
    ) as SingleQueriesData;
  }, [isStaticQueriesFetching, proposalsQuery.isFetched, votedProposalsQuery.isFetched]);

  const votes = useMemo(() => {
    const votesEntries = votesQueries
      .map((query) => query.data)
      .map((data) => [data?.vote?.proposalId, data?.vote?.options[0].option]);

    return Object.fromEntries(votesEntries) as Votes;
  }, [votesQueries]);

  const refetch = () => {
    votesQueries.forEach((query) => query.remove());
    dynamicQueries.forEach((query) => query.refetch());
  };

  return { data: { ...singleQueriesData, votes }, isLoading, refetch };
}