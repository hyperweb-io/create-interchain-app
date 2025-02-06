// TODO fix type issues
// @ts-nocheck

import { useChain } from '@interchain-kit/react';
import { Box, Spinner, Text } from '@interchain-ui/react';

import { useStakingData } from '@/hooks';
import Overview from './Overview';
import { WalletState } from '@interchain-kit/core';

export const ClaimRewardsSection = ({ chainName }: { chainName: string }) => {
  const { status } = useChain(chainName);
  const { data, isLoading, refetch } = useStakingData(chainName);

  return (
    <Box mt="$16" mb="$26">
      {status !== WalletState.Connected ? (
        <Box
          height="$28"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontWeight="$semibold" fontSize="$xl">
            Please connect the wallet
          </Text>
        </Box>
      ) : isLoading || !data ? (
        <Box
          height="$28"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="$7xl" />
        </Box>
      ) : (
        <Overview
          balance={data.balance}
          rewards={data.rewards}
          staked={data.totalDelegated}
          updateData={refetch}
          chainName={chainName}
          prices={data.prices}
        />
      )}
    </Box>
  );
};
