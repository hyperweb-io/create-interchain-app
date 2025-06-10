import { ReactNoSSR } from '@interchain-ui/react-no-ssr';
import { Voting } from '@/components';
import { useChainStore } from '@/contexts';
import { useChain } from '@interchain-kit/react';
import { Box, Text } from '@interchain-ui/react';

export default function GovernancePage() {
  const { selectedChain } = useChainStore();
  const { chain } = useChain(selectedChain);

  if (chain && chain.chainType !== 'cosmos') {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <Text fontWeight="$semibold" fontSize="$xl" textAlign="center">
          Governance functionality is not available for {chain.chainType} chains
        </Text>
      </Box>
    );
  }

  return (
    <ReactNoSSR>
      <Voting chainName={selectedChain} />
    </ReactNoSSR>
  );
}
