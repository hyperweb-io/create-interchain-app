import React from 'react';
import { Text, Box } from '@interchain-ui/react';
import { useChain } from '@interchain-kit/react';

import AssetsOverview from './AssetsOverview';
import { useAssets } from '@/hooks';

interface AssetListSectionProps {
  chainName: string;
  children?: React.ReactNode;
}

export const AssetListSection = ({ chainName }: AssetListSectionProps) => {
  const { address, chain } = useChain(chainName);
  const { data, isLoading, refetch } = useAssets(chainName);

  if (chain && chain.chainType !== 'cosmos') {
    return (
      <Box maxWidth="768px" marginX="auto" marginBottom="60px">
        <Text
          fontSize="$xl"
          fontWeight="$semibold"
          attributes={{ marginBottom: '$10' }}
        >
          My assets
        </Text>

        <Box
          height="160px"
          bg="$cardBg"
          borderRadius="$md"
          p="$6"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="$md" color="$textSecondary" textAlign="center">
            Asset list functionality is not available for {chain.chainType} chains
          </Text>
        </Box>
      </Box>
    );
  }

  if (!address) {
    return (
      <Box maxWidth="768px" marginX="auto" marginBottom="60px">
        <Text
          fontSize="$xl"
          fontWeight="$semibold"
          attributes={{ marginBottom: '$10' }}
        >
          My assets
        </Text>

        <Box
          height="160px"
          bg="$cardBg"
          borderRadius="$md"
          p="$6"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Text fontSize="$md" color="$textSecondary">
            Connect the wallet to see the assets
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box maxWidth="$containerMd" marginX="auto" marginBottom="$17">
      <AssetsOverview
        isLoading={isLoading || !data}
        assets={data?.assets ?? []}
        prices={data?.prices ?? {}}
        selectedChainName={chainName}
        refetch={refetch}
      />
    </Box>
  );
};
