import Image from 'next/image';
import { useState } from 'react';
import { useChain, useWalletManager } from '@interchain-kit/react';
import { Box, Combobox, Skeleton, Stack, Text } from '@interchain-ui/react';

import { useStarshipChains, useDetectBreakpoints } from '@/hooks';
import { chainStore, useChainStore } from '@/contexts';

export const ChainDropdown = () => {
  const { selectedChain } = useChainStore();
  const { isMobile } = useDetectBreakpoints();
  const { chain } = useChain(selectedChain);
  console.log('chain', chain);
  const { addChains, getChainLogoUrl, chains } = useWalletManager();

  const [input, setInput] = useState<string>(chain?.prettyName ?? '');
  const [isChainsAdded, setIsChainsAdded] = useState(false);

  const { refetch } = useStarshipChains({
    onSuccess: (data) => {
      if (!data) return;
      addChains(data.v2.chains, data.v2.assets);
      setIsChainsAdded(true);
    },
  });

  const onOpenChange = (isOpen: boolean) => {
    if (isOpen && !isChainsAdded) refetch();
  };

  return (
    <Combobox
      onInputChange={(input) => {
        setInput(input);
      }}
      onOpenChange={onOpenChange}
      selectedKey={selectedChain}
      onSelectionChange={(key) => {
        const chainName = key as string | null;
        if (chainName) {
          chainStore.setSelectedChain(chainName);
        }
      }}
      inputAddonStart={
        <Box display="flex" justifyContent="center" alignItems="center" px="$4">
          {input === chain.prettyName ? (
            <Image
              src={getChainLogoUrl(selectedChain) ?? ''}
              alt={chain.prettyName ?? ''}
              width={24}
              height={24}
              style={{
                borderRadius: '50%',
              }}
            />
          ) : (
            <Skeleton width="24px" height="24px" borderRadius="$full" />
          )}
        </Box>
      }
      styleProps={{
        width: isMobile ? '130px' : '260px',
      }}
    >
      {chains.map((c) => (
        <Combobox.Item key={c.chainName} textValue={c.prettyName}>
          <Stack
            direction="horizontal"
            space={isMobile ? '$3' : '$4'}
            attributes={{ alignItems: 'center' }}
          >
            <Image
              src={getChainLogoUrl(c.chainName) ?? ''}
              alt={c.prettyName ?? ''}
              width={isMobile ? 18 : 24}
              height={isMobile ? 18 : 24}
              style={{
                borderRadius: '50%',
              }}
            />
            <Text fontSize={isMobile ? '12px' : '16px'} fontWeight="500">
              {c.prettyName}
            </Text>
          </Stack>
        </Combobox.Item>
      ))}
    </Combobox>
  );
};
